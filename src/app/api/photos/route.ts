import { withConfig } from '@/lib/route';
import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/guard';
import {
  MAX_PHOTO_BYTES,
  fileExists,
  isGeneratedName,
  isSupportedImage,
  newFileName,
  saveFile,
} from '@/lib/files';
import { isConfigError } from '@/lib/errors';
import {
  createPhoto,
  getInvitation,
  getInvitationBySlug,
  listPhotos,
  listPhotosForOwner,
} from '@/lib/store';

export const dynamic = 'force-dynamic';

/** Galeri listesi: admin hepsini, kullanıcı yalnızca kendi davetiyelerininkini görür. */
async function handleGet(request: Request) {
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
async function handlePost(request: Request) {
  // Dosya doğrudan depoya yüklendiyse gövde JSON'dur ve yalnızca kaydı taşır.
  if (request.headers.get('content-type')?.includes('application/json')) {
    return createFromUploadedFiles(request);
  }

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

  const fileName = newFileName(file.type);
  let thumbName = fileName;
  try {
    await saveFile(fileName, Buffer.from(await file.arrayBuffer()));

    // Önizleme istemcide üretilir; gelmezse orijinal hem tam boy hem önizleme olur.
    const thumb = form.get('thumb');
    if (thumb instanceof File && thumb.size > 0 && isSupportedImage(thumb.type)) {
      thumbName = newFileName(thumb.type, '-thumb');
      await saveFile(thumbName, Buffer.from(await thumb.arrayBuffer()));
    }
  } catch (err) {
    if (isConfigError(err)) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    throw err;
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

/**
 * Dosyalar tarayıcıdan doğrudan depoya yüklendiğinde çağrılır; burada
 * yalnızca kayıt açılır.
 *
 * Kayıt açılmadan önce dosyanın depoda gerçekten durduğu doğrulanır —
 * aksi hâlde uydurma bir adla galeride açılmayan satırlar oluşturulabilirdi.
 */
async function createFromUploadedFiles(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Geçersiz yükleme' }, { status: 400 });
  }

  const invitation = await getInvitationBySlug(String(body.slug ?? ''));
  if (!invitation || !invitation.isActive) {
    return NextResponse.json({ error: 'Davetiye bulunamadı' }, { status: 404 });
  }

  const fileName = String(body.fileName ?? '');
  const thumbName = String(body.thumbName ?? '') || fileName;
  if (!isGeneratedName(fileName) || !isGeneratedName(thumbName)) {
    return NextResponse.json({ error: 'Geçersiz dosya adı' }, { status: 400 });
  }
  if (!(await fileExists(fileName))) {
    return NextResponse.json({ error: 'Fotoğraf depoya ulaşmadı' }, { status: 400 });
  }

  const mimeType = String(body.mimeType ?? '');
  if (!isSupportedImage(mimeType)) {
    return NextResponse.json({ error: 'Yalnızca fotoğraf yükleyebilirsiniz' }, { status: 400 });
  }

  const photo = await createPhoto({
    invitationId: invitation.id,
    invitationSlug: invitation.slug,
    uploaderName: String(body.uploaderName ?? '').slice(0, 120),
    note: String(body.note ?? '').slice(0, 500),
    fileName,
    thumbName: (await fileExists(thumbName)) ? thumbName : fileName,
    mimeType,
    size: Number(body.size ?? 0) || 0,
    width: Number(body.width ?? 0) || 0,
    height: Number(body.height ?? 0) || 0,
  });

  return NextResponse.json({ ok: true, id: photo.id }, { status: 201 });
}

export const GET = withConfig(handleGet);
export const POST = withConfig(handlePost);
