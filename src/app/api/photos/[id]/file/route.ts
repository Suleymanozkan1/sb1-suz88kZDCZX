import { withConfig } from '@/lib/route';
import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/guard';
import { mimeForFile, readFile } from '@/lib/files';
import { getInvitation, getPhoto } from '@/lib/store';

export const dynamic = 'force-dynamic';

type Params = { params: { id: string } };

/**
 * Fotoğraf dosyasını döndürür. `?size=thumb` galeri önizlemesini,
 * varsayılan olarak dokunulmamış orijinali (yüksek çözünürlük) verir.
 * `?download=1` tarayıcıyı indirmeye yönlendirir.
 */
async function handleGet(request: Request, { params }: Params) {
  const result = requireSession();
  if ('error' in result) return result.error;

  const photo = await getPhoto(params.id);
  if (!photo) return NextResponse.json({ error: 'Fotoğraf bulunamadı' }, { status: 404 });

  if (result.session.role !== 'admin') {
    const invitation = await getInvitation(photo.invitationId);
    if (invitation?.ownerId !== result.session.userId) {
      return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 });
    }
  }

  const url = new URL(request.url);
  const wantsThumb = url.searchParams.get('size') === 'thumb';
  const fileName = wantsThumb ? photo.thumbName : photo.fileName;

  const data = await readFile(fileName);
  if (!data) return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 404 });

  const headers = new Headers({
    'Content-Type': mimeForFile(fileName),
    'Content-Length': String(data.length),
    'Cache-Control': 'private, max-age=3600',
  });

  if (url.searchParams.get('download') === '1') {
    const stamp = photo.createdAt.slice(0, 10);
    const ext = fileName.split('.').pop();
    const short = photo.id.slice(0, 8);

    const who = photo.uploaderName
      ? `-${photo.uploaderName.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '')}`
      : '';
    const full = `dugun-${stamp}${who}-${short}.${ext}`;

    // HTTP başlıkları yalnızca ISO-8859-1 taşır; "Yıldız" gibi bir ad başlığa
    // doğrudan yazılırsa istek çöker. ASCII bir yedek ad ve RFC 5987 ile
    // kodlanmış tam ad birlikte gönderilir.
    const ascii = `dugun-${stamp}-${short}.${ext}`;
    headers.set(
      'Content-Disposition',
      `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(full)}`,
    );
  }

  return new NextResponse(new Uint8Array(data), { headers });
}

export const GET = withConfig(handleGet);
