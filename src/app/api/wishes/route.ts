import { withConfig } from '@/lib/route';
import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/guard';
import {
  createWish,
  getInvitation,
  getInvitationBySlug,
  listWishes,
  listWishesForOwner,
} from '@/lib/store';

export const dynamic = 'force-dynamic';

/**
 * Dilek defteri.
 *
 * Yazma herkese açıktır (misafir davetiyeden yazar), okuma oturum ister.
 * Davetiyede yalnızca çiftin onayladığı dilekler görünür; onaylanmamışları
 * burada yalnızca sahibi ve admin görür.
 */
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
    return NextResponse.json(await listWishes(invitationId));
  }

  return NextResponse.json(
    result.session.role === 'admin'
      ? await listWishes()
      : await listWishesForOwner(result.session.userId),
  );
}

/** Misafir dileği — oturum gerektirmez, onaya düşer. */
async function handlePost(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });

  const invitation = await getInvitationBySlug(String(body.slug ?? ''));
  if (!invitation || !invitation.isActive) {
    return NextResponse.json({ error: 'Davetiye bulunamadı' }, { status: 404 });
  }

  const message = String(body.message ?? '').trim();
  if (!message) {
    return NextResponse.json({ error: 'Mesaj boş olamaz' }, { status: 400 });
  }

  const wish = await createWish({
    invitationId: invitation.id,
    invitationSlug: invitation.slug,
    name: String(body.name ?? '').trim().slice(0, 80),
    message: message.slice(0, 600),
  });

  // Misafire yalnızca sade bir onay döner; duvarın içeriği sızdırılmaz.
  return NextResponse.json({ ok: true, id: wish.id }, { status: 201 });
}

export const GET = withConfig(handleGet);
export const POST = withConfig(handlePost);
