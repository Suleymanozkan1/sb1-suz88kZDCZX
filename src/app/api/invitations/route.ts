import { withConfig } from '@/lib/route';
import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/guard';
import { createInvitation, getInvitationBySlug, listInvitations } from '@/lib/store';

export const dynamic = 'force-dynamic';

async function handleGet(request: Request) {
  const slug = new URL(request.url).searchParams.get('slug');

  // Slug ile tek davetiye herkese açıktır — davetiye sayfasının kaynağıdır.
  if (slug) {
    const invitation = await getInvitationBySlug(slug);
    if (!invitation) {
      return NextResponse.json({ error: 'Davetiye bulunamadı' }, { status: 404 });
    }
    return NextResponse.json(invitation);
  }

  // Listeleme oturum gerektirir: admin hepsini, kullanıcı yalnızca kendininkileri görür.
  const result = requireSession();
  if ('error' in result) return result.error;

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
