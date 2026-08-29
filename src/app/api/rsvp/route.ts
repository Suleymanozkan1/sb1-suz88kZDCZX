import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { createRsvp, deleteRsvp, listRsvps } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }
  const slug = new URL(request.url).searchParams.get('slug') ?? undefined;
  return NextResponse.json(await listRsvps(slug));
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!body?.name?.trim() || !body?.phone?.trim()) {
    return NextResponse.json({ error: 'Ad ve telefon zorunludur' }, { status: 400 });
  }

  const rsvp = await createRsvp({
    invitationSlug: String(body.invitationSlug ?? ''),
    name: String(body.name).slice(0, 120),
    phone: String(body.phone).slice(0, 40),
    count: String(body.count ?? '1'),
    note: String(body.note ?? '').slice(0, 1000),
    attending: body.attending !== false,
  });

  return NextResponse.json(rsvp, { status: 201 });
}

export async function DELETE(request: Request) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }
  const id = new URL(request.url).searchParams.get('id');
  if (!id || !(await deleteRsvp(id))) {
    return NextResponse.json({ error: 'Kayıt bulunamadı' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
