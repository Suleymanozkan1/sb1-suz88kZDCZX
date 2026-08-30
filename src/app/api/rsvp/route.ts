import { withConfig } from '@/lib/route';
import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/guard';
import { createRsvp, deleteRsvp, getInvitationBySlug, listRsvps } from '@/lib/store';

export const dynamic = 'force-dynamic';

async function handleGet(request: Request) {
  const result = requireSession();
  if ('error' in result) return result.error;

  const slug = new URL(request.url).searchParams.get('slug') ?? undefined;
  const rows = await listRsvps(slug);

  if (result.session.role === 'admin') return NextResponse.json(rows);

  // Kullanıcı yalnızca kendi davetiyelerine gelen bildirimleri görür.
  const own = await Promise.all(
    rows.map(async (r) => {
      const invitation = await getInvitationBySlug(r.invitationSlug);
      return invitation?.ownerId === result.session.userId ? r : null;
    }),
  );
  return NextResponse.json(own.filter((r) => r !== null));
}

async function handlePost(request: Request) {
  const body = await request.json();

  if (!body?.name?.trim() || !body?.phone?.trim()) {
    return NextResponse.json({ error: 'Ad ve telefon zorunludur' }, { status: 400 });
  }

  // Davetiye gerçekten var ve yayında olmalı; aksi hâlde uydurma bir slug ile
  // hiç kimseye ait olmayan katılım kayıtları açılabiliyordu.
  const slug = String(body.invitationSlug ?? '');
  const invitation = await getInvitationBySlug(slug);
  if (!invitation || !invitation.isActive) {
    return NextResponse.json({ error: 'Davetiye bulunamadı' }, { status: 404 });
  }

  const rsvp = await createRsvp({
    invitationSlug: invitation.slug,
    name: String(body.name).slice(0, 120),
    phone: String(body.phone).slice(0, 40),
    count: String(body.count ?? '1'),
    note: String(body.note ?? '').slice(0, 1000),
    songRequest: String(body.songRequest ?? '').slice(0, 200),
    attending: body.attending !== false,
  });

  return NextResponse.json(rsvp, { status: 201 });
}

async function handleDelete(request: Request) {
  const result = requireSession();
  if ('error' in result) return result.error;

  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Kayıt bulunamadı' }, { status: 404 });

  if (result.session.role !== 'admin') {
    const rows = await listRsvps();
    const target = rows.find((r) => r.id === id);
    const invitation = target ? await getInvitationBySlug(target.invitationSlug) : null;
    if (!invitation || invitation.ownerId !== result.session.userId) {
      return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 });
    }
  }

  if (!(await deleteRsvp(id))) {
    return NextResponse.json({ error: 'Kayıt bulunamadı' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

export const GET = withConfig(handleGet);
export const POST = withConfig(handlePost);
export const DELETE = withConfig(handleDelete);
