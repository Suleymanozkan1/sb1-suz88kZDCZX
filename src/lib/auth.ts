import { cookies } from 'next/headers';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import type { Session, User } from './types';

const globalKey = globalThis as unknown as { __davetiyeKey?: string };

const COOKIE = 'davetiye_session';
const MAX_AGE = 60 * 60 * 12;

/**
 * Oturum çerezini imzalayan anahtar.
 *
 * ADMIN_SECRET verilmemişse ADMIN_PASSWORD'den türetilir — sabit bir
 * varsayılana DÜŞMEZ, aksi hâlde herkesin bildiği bir anahtarla imzalanmış
 * çerezler kabul edilirdi.
 */
function secret(): string {
  const explicit = process.env.ADMIN_SECRET;
  if (explicit) return explicit;

  const derived = process.env.ADMIN_PASSWORD;
  if (derived) return `davetiye:${derived}`;

  // Hiçbiri yoksa her süreç için rastgele bir anahtar üretilir: oturumlar
  // açılmaz ama tahmin edilebilir bir imza da oluşmaz.
  globalKey.__davetiyeKey ??= randomBytes(32).toString('hex');
  return globalKey.__davetiyeKey;
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('hex');
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

/**
 * Çerez değeri "<base64 yük>.<imza>" biçimindedir. Yük yalnızca oturum
 * kimliğini taşır; imza doğrulanmadan hiçbir alanına güvenilmez.
 */
export function encodeSession(user: User): string {
  const payload: Session = {
    userId: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
  };
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  return `${encoded}.${sign(encoded)}`;
}

function decodeSession(value: string | undefined): Session | null {
  if (!value) return null;

  const [encoded, signature] = value.split('.');
  if (!encoded || !signature || !safeEqual(signature, sign(encoded))) return null;

  try {
    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    if (typeof parsed?.userId !== 'string') return null;
    if (parsed.role !== 'admin' && parsed.role !== 'user') return null;
    return parsed as Session;
  } catch {
    return null;
  }
}

/** Geçerli isteğin oturumu; imza doğrulanamazsa null. */
export function currentSession(): Session | null {
  return decodeSession(cookies().get(COOKIE)?.value);
}

export function isAdmin(): boolean {
  return currentSession()?.role === 'admin';
}

export function isAuthenticated(): boolean {
  return currentSession() !== null;
}

export const AUTH_COOKIE = COOKIE;
export const AUTH_COOKIE_MAX_AGE = MAX_AGE;
