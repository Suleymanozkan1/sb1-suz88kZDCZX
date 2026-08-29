import { NextResponse } from 'next/server';
import { AUTH_COOKIE, AUTH_COOKIE_MAX_AGE, encodeSession } from '@/lib/auth';
import { requireSession } from '@/lib/guard';
import { passwordProblem, verifyPassword } from '@/lib/password';
import { getUser, updateUser } from '@/lib/store';

export const dynamic = 'force-dynamic';

/**
 * Oturum sahibinin KENDİ parolasını değiştirmesi — hem admin hem çift hesabı.
 *
 * Mevcut parola sorulur: çerezi ele geçiren biri parolayı da değiştirip
 * hesabı tamamen devralamasın diye.
 */
export async function PUT(request: Request) {
  const result = requireSession();
  if ('error' in result) return result.error;

  const { currentPassword, newPassword } = await request.json();

  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
    return NextResponse.json({ error: 'Eksik alan' }, { status: 400 });
  }

  const problem = passwordProblem(newPassword);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });

  const user = await getUser(result.session.userId);
  if (!user) return NextResponse.json({ error: 'Hesap bulunamadı' }, { status: 404 });

  if (!(await verifyPassword(currentPassword, user.passwordHash))) {
    return NextResponse.json({ error: 'Mevcut parola hatalı' }, { status: 401 });
  }

  const updated = await updateUser(user.id, { password: newPassword });
  if (!updated) return NextResponse.json({ error: 'Parola değiştirilemedi' }, { status: 500 });

  // Oturum çerezi parolayı taşımaz ama tazelemek, süreyi baştan başlatır.
  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE, encodeSession({ ...user, ...updated } as typeof user), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: AUTH_COOKIE_MAX_AGE,
  });
  return response;
}
