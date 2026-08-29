import { withConfig } from '@/lib/route';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/guard';
import { generatePassword, passwordProblem } from '@/lib/password';
import { deleteUser, updateUser } from '@/lib/store';
import { removeFiles } from '@/lib/files';

export const dynamic = 'force-dynamic';

type Params = { params: { id: string } };

async function handlePut(request: Request, { params }: Params) {
  const result = requireAdmin();
  if ('error' in result) return result.error;

  const body = await request.json();

  // resetPassword: true → yeni parola üret ve tek seferliğine döndür.
  let password: string | undefined;
  if (body?.resetPassword) {
    password = String(body?.password ?? '').trim() || generatePassword();
    const problem = passwordProblem(password);
    if (problem) return NextResponse.json({ error: problem }, { status: 400 });
  }

  const user = await updateUser(params.id, {
    displayName: typeof body?.displayName === 'string' ? body.displayName : undefined,
    password,
  });

  if (!user) return NextResponse.json({ error: 'Hesap bulunamadı' }, { status: 404 });
  return NextResponse.json({ user, password });
}

async function handleDelete(_request: Request, { params }: Params) {
  const result = requireAdmin();
  if ('error' in result) return result.error;

  try {
    const { removed, files } = await deleteUser(params.id);
    if (!removed) return NextResponse.json({ error: 'Hesap bulunamadı' }, { status: 404 });

    await removeFiles(files);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Hesap silinemedi' },
      { status: 400 },
    );
  }
}

export const PUT = withConfig(handlePut);
export const DELETE = withConfig(handleDelete);
