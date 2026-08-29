import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/guard';
import { removeFiles } from '@/lib/files';
import { deletePhoto, getInvitation, getPhoto } from '@/lib/store';

export const dynamic = 'force-dynamic';

type Params = { params: { id: string } };

export async function DELETE(_request: Request, { params }: Params) {
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

  await deletePhoto(params.id);
  await removeFiles([photo.fileName, photo.thumbName].filter((n, i, a) => a.indexOf(n) === i));
  return NextResponse.json({ ok: true });
}
