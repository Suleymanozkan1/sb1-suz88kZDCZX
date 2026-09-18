import { withConfig } from '@/lib/route';
import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/guard';
import { deleteWish, getInvitation, getWish, setWishApproved } from '@/lib/store';

export const dynamic = 'force-dynamic';

type Params = { params: { id: string } };

/** Dileğin, isteği yapan hesaba ait olup olmadığı. */
async function yetkili(
  id: string,
  session: { role: string; userId: string },
): Promise<{ hata: NextResponse } | { hata?: undefined }> {
  const wish = await getWish(id);
  if (!wish) return { hata: NextResponse.json({ error: 'Dilek bulunamadı' }, { status: 404 }) };

  if (session.role !== 'admin') {
    const invitation = await getInvitation(wish.invitationId);
    if (!invitation || invitation.ownerId !== session.userId) {
      return { hata: NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 }) };
    }
  }
  return {};
}

/** Onaylama / onayı geri alma. */
async function handlePut(request: Request, { params }: Params): Promise<Response> {
  const result = requireSession();
  if ('error' in result) return result.error;

  const izin = await yetkili(params.id, result.session);
  if (izin.hata) return izin.hata;

  const body = await request.json().catch(() => ({}));
  const updated = await setWishApproved(params.id, body?.approved !== false);
  return NextResponse.json(updated);
}

async function handleDelete(_request: Request, { params }: Params): Promise<Response> {
  const result = requireSession();
  if ('error' in result) return result.error;

  const izin = await yetkili(params.id, result.session);
  if (izin.hata) return izin.hata;

  await deleteWish(params.id);
  return NextResponse.json({ ok: true });
}

export const PUT = withConfig(handlePut);
export const DELETE = withConfig(handleDelete);
