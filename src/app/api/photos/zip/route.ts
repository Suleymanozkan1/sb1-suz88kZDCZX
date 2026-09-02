import { withConfig } from '@/lib/route';
import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/guard';
import { readFile } from '@/lib/files';
import { getInvitation, listPhotos, listPhotosForOwner } from '@/lib/store';
import { zipStream, type ZipEntry } from '@/lib/zip';
import type { GuestPhoto } from '@/lib/types';

export const dynamic = 'force-dynamic';

/** Galerinin tamamını tek bir ZIP olarak, orijinal çözünürlükte indirir. */
async function handleGet(request: Request) {
  const result = requireSession();
  if ('error' in result) return result.error;

  const invitationId = new URL(request.url).searchParams.get('invitationId');
  let photos: GuestPhoto[];
  let label = 'galeri';

  if (invitationId) {
    const invitation = await getInvitation(invitationId);
    if (!invitation) {
      return NextResponse.json({ error: 'Davetiye bulunamadı' }, { status: 404 });
    }
    if (result.session.role !== 'admin' && invitation.ownerId !== result.session.userId) {
      return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 });
    }
    photos = await listPhotos(invitationId);
    label = invitation.slug;
  } else {
    photos =
      result.session.role === 'admin'
        ? await listPhotos()
        : await listPhotosForOwner(result.session.userId);
  }

  if (photos.length === 0) {
    return NextResponse.json({ error: 'İndirilecek fotoğraf yok' }, { status: 404 });
  }

  // Dosyalar akış ilerledikçe okunur; tüm galeri aynı anda belleğe alınmaz.
  async function* entries(): AsyncGenerator<ZipEntry> {
    for (const [index, photo] of photos.entries()) {
      const data = await readFile(photo.fileName);
      if (!data) continue;

      const who = photo.uploaderName
        ? photo.uploaderName.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '')
        : 'misafir';
      const ext = photo.fileName.split('.').pop() ?? 'jpg';

      yield {
        name: `${photo.invitationSlug}/${String(index + 1).padStart(4, '0')}-${who}.${ext}`,
        data: new Uint8Array(data),
        date: new Date(photo.createdAt),
      };
    }
  }

  return new NextResponse(zipStream(entries()), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${label}-fotograflar.zip"`,
      'Cache-Control': 'no-store',
    },
  });
}

export const GET = withConfig(handleGet);
