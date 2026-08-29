import { NextResponse } from 'next/server';
import { AUTH_COOKIE, AUTH_COOKIE_MAX_AGE, currentSession, encodeSession } from '@/lib/auth';
import { isConfigError, verifyPassword } from '@/lib/password';
import { ensureAdmin, getUserByUsername } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ session: currentSession() });
}

export async function POST(request: Request) {
  const { username, password } = await request.json();

  if (typeof password !== 'string') {
    return NextResponse.json({ error: 'Kullanıcı adı ve parola gereklidir' }, { status: 400 });
  }

  // Kullanıcı adı verilmezse eski tek-hesap davranışı için admin denenir.
  const wanted = typeof username === 'string' && username.trim() ? username : 'admin';

  let user;
  try {
    await ensureAdmin();
    user = await getUserByUsername(wanted);
  } catch (err) {
    // Yapılandırma eksiğini "parola hatalı" diye göstermek yanlış yönlendirir.
    if (isConfigError(err)) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    throw err;
  }

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: 'Kullanıcı adı veya parola hatalı' }, { status: 401 });
  }

  const response = NextResponse.json({
    ok: true,
    session: { userId: user.id, username: user.username, displayName: user.displayName, role: user.role },
  });

  response.cookies.set(AUTH_COOKIE, encodeSession(user), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: AUTH_COOKIE_MAX_AGE,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(AUTH_COOKIE);
  return response;
}
