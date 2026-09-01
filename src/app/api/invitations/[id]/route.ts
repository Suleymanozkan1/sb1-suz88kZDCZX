import { removeFiles } from '@/lib/files';
import { withConfig } from '@/lib/route';
import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/guard';
import { deleteInvitation, getInvitation, getUser, transferInvitation, updateInvitation } from '@/lib/store';
import type { Session } from '@/lib/types';

export const dynamic = 'force-dynamic';

type Params = { params: { id: string } };

/** Admin her davetiyeye, kullanıcı yalnızca kendi davetiyesine erişebilir. */
async function canAccess(session: Session, invitationId: string): Promise<boolean> {
  if (session.role === 'admin') return true;
  const invitation = await getInvitation(invitationId);
  return invitation?.ownerId === session.userId;
}

async function handleGet(_request: Request, { params }: Params) {
  const result = requireSession();
  if ('error' in result) return result.error;

  const invitation = await getInvitation(params.id);
  if (!invitation) {
    return NextResponse.json({ error: 'Davetiye bulunamadı' }, { status: 404 });
  }
  if (result.session.role !== 'admin' && invitation.ownerId !== result.session.userId) {
    return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 });
  }

  return NextResponse.json(invitation);
}

async function handlePut(request: Request, { params }: Params) {
  const result = requireSession();
  if ('error' in result) return result.error;

  if (!(await canAccess(result.session, params.id))) {
    return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 });
  }

  const body = await request.json();

  const updated = await updateInvitation(params.id, body);
  if (!updated) {
    return NextResponse.json({ error: 'Davetiye bulunamadı' }, { status: 404 });
  }

  /*
   * Sahip devri — YALNIZCA admin. Gövdedeki ownerId'yi updateInvitation
   * bilerek yok sayıyor; devir ayrı ve denetimli bir işlem. Kullanıcının
   * kendi davetiyesini başkasına yazması ya da başkasınınkini üstüne
   * alması engellenmiş oluyor.
   */
  if (result.session.role === 'admin' && typeof body?.ownerId === 'string' && body.ownerId) {
    if (body.ownerId !== updated.ownerId) {
      const owner = await getUser(body.ownerId);
      if (!owner) {
        return NextResponse.json({ error: 'Seçilen hesap bulunamadı' }, { status: 400 });
      }
      const devredilen = await transferInvitation(params.id, body.ownerId);
      if (devredilen) return NextResponse.json(devredilen);
    }
  }

  return NextResponse.json(updated);
}

async function handleDelete(_request: Request, { params }: Params) {
  const result = requireSession();
  if ('error' in result) return result.error;

  // Silme yalnızca adminde: hesaplar iş bittiğinde admin tarafından temizlenir.
  if (result.session.role !== 'admin') {
    return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 });
  }

  const { removed, files } = await deleteInvitation(params.id);
  if (!removed) {
    return NextResponse.json({ error: 'Davetiye bulunamadı' }, { status: 404 });
  }

  // Kayıtlarla birlikte misafir fotoğraflarının dosyaları da depodan silinir.
  await removeFiles(files);
  return NextResponse.json({ ok: true });
}

export const GET = withConfig(handleGet);
export const PUT = withConfig(handlePut);
export const DELETE = withConfig(handleDelete);
