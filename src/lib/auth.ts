import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'crypto';

const COOKIE = 'davetiye_admin';

function adminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? 'admin';
}

function secret(): string {
  return process.env.ADMIN_SECRET ?? `davetiye:${adminPassword()}`;
}

/** Parolanın kendisini değil, ondan türetilen imzayı çereze yazarız. */
export function sessionToken(): string {
  return createHmac('sha256', secret()).update('admin-session').digest('hex');
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export function checkPassword(input: string): boolean {
  return safeEqual(input, adminPassword());
}

export function isAuthenticated(): boolean {
  const token = cookies().get(COOKIE)?.value;
  return !!token && safeEqual(token, sessionToken());
}

export const AUTH_COOKIE = COOKIE;
