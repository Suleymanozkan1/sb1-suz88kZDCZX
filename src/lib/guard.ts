import { NextResponse } from 'next/server';
import { currentSession } from './auth';
import type { Session } from './types';

/** API rotalarında oturum zorunluluğu. */
export function requireSession(): { session: Session } | { error: NextResponse } {
  const session = currentSession();
  if (!session) {
    return { error: NextResponse.json({ error: 'Yetkisiz' }, { status: 401 }) };
  }
  return { session };
}

/** API rotalarında admin zorunluluğu. */
export function requireAdmin(): { session: Session } | { error: NextResponse } {
  const result = requireSession();
  if ('error' in result) return result;
  if (result.session.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 }) };
  }
  return result;
}
