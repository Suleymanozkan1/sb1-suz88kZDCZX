import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/guard';
import {
  MAX_PHOTO_BYTES,
  isSupportedImage,
  newFileName,
  savePhotoFile,
} from '@/lib/photoFiles';
import {
  createPhoto,
  getInvitation,
  getInvitationBySlug,
  listPhotos,
  listPhotosForOwner,
} from '@/lib/store';

export const dynamic = 'force-dynamic';

/** Galeri listesi: admin hepsini, kullanıcı yalnızca kendi davetiyelerininkini görür. */
export async function GET(request: Request) {
  const result = requireSession();
  if ('error' in result) return result.error;

  const invitationId = new URL(request.url).searchParams.get('invitationId');

  if (invitationId) {
    const invitation = await getInvitation(invitationId);
    if (!invitation) {
      return NextResponse.json({ error: 'Davetiye bulunamadı' }, { status: 404 });
    }
    if (result.session.role !== 'admin' && invitation.ownerId !== result.session.userId) {
      return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 });
    }
    return NextResponse.json(await listPhotos(invitationId));
  }

  return NextResponse.json(
    result.session.role === 'admin'
      ? await listPhotos()
      : await listPhotosForOwner(result.session.userId),
  );
}

/**
 * Misafir yüklemesi — oturum gerektirmez. Masadaki QR kod bu uca bağlıdır.
 * `file` orijinali (yüksek çözünürlük), `thumb` galeri önizlemesidir.
 */
export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Geçersiz yükleme' }, { status: 400 });
  }

  const slug = String(form.get('slug') ?? '');
  const invitation = await getInvitationBySlug(slug);
  if (!invitation || !invitation.isActive) {
    return NextResponse.json({ error: 'Davetiye bulunamadı' }, { status: 404 });
  }

  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Fotoğraf seçilmedi' }, { status: 400 });
  }
  if (!isSupportedImage(file.type)) {
    return NextResponse.json({ error: 'Yalnızca fotoğraf yükleyebilirsiniz' }, { status: 400 });
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return NextResponse.json(
      { error: `Fotoğraf ${Math.round(MAX_PHOTO_BYTES / 1024 / 1024)} MB sınırını aşıyor` },
      { status: 413 },
    );
  }

  const original = Buffer.from(await file.arrayBuffer());
  const fileName = newFileName(file.type);
  await savePhotoFile(fileName, original);

  // Önizleme istemcide üretilir; gelmezse orijinal hem tam boy hem önizleme olur.
  const thumb = form.get('thumb');
  let thumbName = fileName;
  if (thumb instanceof File && thumb.size > 0 && isSupportedImage(thumb.type)) {
    thumbName = newFileName(thumb.type, '-thumb');
    await savePhotoFile(thumbName, Buffer.from(await thumb.arrayBuffer()));
  }

  const photo = await createPhoto({
    invitationId: invitation.id,
    invitationSlug: invitation.slug,
    uploaderName: String(form.get('uploaderName') ?? '').slice(0, 120),
    note: String(form.get('note') ?? '').slice(0, 500),
    fileName,
    thumbName,
    mimeType: file.type,
    size: file.size,
    width: Number(form.get('width') ?? 0) || 0,
    height: Number(form.get('height') ?? 0) || 0,
  });

  // Misafire fotoğrafın kendisini geri sızdırmamak için sade bir yanıt döner.
  return NextResponse.json({ ok: true, id: photo.id }, { status: 201 });
}
