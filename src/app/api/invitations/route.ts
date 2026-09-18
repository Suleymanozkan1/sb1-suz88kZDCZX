import { withConfig } from '@/lib/route';
import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/guard';
import { createInvitation, getInvitationBySlug, listInvitations } from '@/lib/store';

export const dynamic = 'force-dynamic';

/**
 * Davetiye okuma — her durumda oturum gerektirir.
 *
 * Slug ile tek davetiye eskiden herkese açıktı, ama buna gerek yok: davetiye
 * ve fotoğraf yükleme sayfaları kaydı sunucuda doğrudan depodan okur. Açık
 * bırakmak, slug deneyerek davetiye içeriğini toplamaya ve yayından
 * kaldırılmış (pasif) bir davetiyeyi okumaya izin veriyordu — sayfanın kendisi
 * onu gizlerken.
 */
async function handleGet(request: Request) {
  const result = requireSession();
  if ('error' in result) return result.error;

  const slug = new URL(request.url).searchParams.get('slug');
  if (slug) {
    const invitation = await getInvitationBySlug(slug);
    if (!invitation) {
      return NextResponse.json({ error: 'Davetiye bulunamadı' }, { status: 404 });
    }
    if (result.session.role !== 'admin' && invitation.ownerId !== result.session.userId) {
      return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 });
    }
    return NextResponse.json(invitation);
  }

  const rows = await listInvitations();
  return NextResponse.json(
    result.session.role === 'admin' ? rows : rows.filter((r) => r.ownerId === result.session.userId),
  );
}

async function handlePost(request: Request) {
  const result = requireSession();
  if ('error' in result) return result.error;

  const body = await request.json();
  if (!body?.brideName?.trim() || !body?.groomName?.trim()) {
    return NextResponse.json({ error: 'Gelin ve damat adı zorunludur' }, { status: 400 });
  }

  // Admin başka bir hesap adına davetiye açabilir; kullanıcı yalnızca kendi adına.
  const ownerId =
    result.session.role === 'admin' && typeof body.ownerId === 'string' && body.ownerId
      ? body.ownerId
      : result.session.userId;

  return NextResponse.json(await createInvitation(body, ownerId), { status: 201 });
}

export const GET = withConfig(handleGet);
export const POST = withConfig(handlePost);
