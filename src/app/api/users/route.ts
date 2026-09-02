import { withConfig } from '@/lib/route';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/guard';
import { generatePassword, passwordProblem } from '@/lib/password';
import { createUser, listUsers } from '@/lib/store';

export const dynamic = 'force-dynamic';

async function handleGet() {
  const result = requireAdmin();
  if ('error' in result) return result.error;
  return NextResponse.json(await listUsers());
}

async function handlePost(request: Request) {
  const result = requireAdmin();
  if ('error' in result) return result.error;

  const body = await request.json();
  const username = String(body?.username ?? '').trim();
  if (!username) {
    return NextResponse.json({ error: 'Kullanıcı adı zorunludur' }, { status: 400 });
  }

  // Parola verilmezse okunabilir bir tane üretilir ve tek seferliğine geri döner.
  const password = String(body?.password ?? '').trim() || generatePassword();
  const problem = passwordProblem(password);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });

  try {
    const user = await createUser({
      username,
      displayName: String(body?.displayName ?? ''),
      password,
    });
    return NextResponse.json({ user, password }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Hesap oluşturulamadı' },
      { status: 400 },
    );
  }
}

export const GET = withConfig(handleGet);
export const POST = withConfig(handlePost);
