import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { deleteInvitation, getInvitation, updateInvitation } from '@/lib/store';

export const dynamic = 'force-dynamic';

type Params = { params: { id: string } };

export async function GET(_request: Request, { params }: Params) {
  const invitation = await getInvitation(params.id);
  if (!invitation) {
    return NextResponse.json({ error: 'Davetiye bulunamadı' }, { status: 404 });
  }
  return NextResponse.json(invitation);
}

export async function PUT(request: Request, { params }: Params) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const updated = await updateInvitation(params.id, await request.json());
  if (!updated) {
    return NextResponse.json({ error: 'Davetiye bulunamadı' }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const removed = await deleteInvitation(params.id);
  if (!removed) {
    return NextResponse.json({ error: 'Davetiye bulunamadı' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
