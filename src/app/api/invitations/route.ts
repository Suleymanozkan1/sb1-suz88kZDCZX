import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { createInvitation, getInvitationBySlug, listInvitations } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get('slug');

  if (slug) {
    const invitation = await getInvitationBySlug(slug);
    if (!invitation) {
      return NextResponse.json({ error: 'Davetiye bulunamadı' }, { status: 404 });
    }
    return NextResponse.json(invitation);
  }

  return NextResponse.json(await listInvitations());
}

export async function POST(request: Request) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const body = await request.json();
  if (!body?.brideName?.trim() || !body?.groomName?.trim()) {
    return NextResponse.json(
      { error: 'Gelin ve damat adı zorunludur' },
      { status: 400 },
    );
  }

  return NextResponse.json(await createInvitation(body), { status: 201 });
}
