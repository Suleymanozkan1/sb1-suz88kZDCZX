import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: string,
  keylen: number,
) => Promise<Buffer>;

const KEY_LENGTH = 64;

/** Parolayı rastgele bir tuzla scrypt'ten geçirir; "tuz:hash" döner. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derived = await scrypt(password, salt, KEY_LENGTH);
  return `${salt}:${derived.toString('hex')}`;
}

/** Girilen parolayı saklanan özetle sabit zamanlı karşılaştırır. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;

  const expected = Buffer.from(hash, 'hex');
  if (expected.length !== KEY_LENGTH) return false;

  const derived = await scrypt(password, salt, KEY_LENGTH);
  return timingSafeEqual(derived, expected);
}

/** Yeni hesaplar için okunabilir, rastgele bir parola üretir. */
export function generatePassword(): string {
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789';
  const bytes = randomBytes(12);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}

/** Parola kuralları — hem admin panelinde hem API'de aynı kural uygulanır. */
export function passwordProblem(password: string): string | null {
  if (typeof password !== 'string' || password.length < 6) {
    return 'Parola en az 6 karakter olmalıdır.';
  }
  if (password.length > 200) {
    return 'Parola çok uzun.';
  }
  return null;
}

/**
 * ADMIN_PASSWORD'ün parmak izi.
 *
 * Parolanın kendisi değil, yalnızca "bu ortam değeri daha önce uygulandı mı"
 * sorusunu yanıtlayan bir özet saklanır. Değer değişince iz de değişir ve
 * parola bir kez sıfırlanır; panelden yapılan değişiklikler ize dokunmadığı
 * için yeniden başlatmada ezilmez.
 */
export function seedFingerprint(value: string): string {
  return createHash('sha256').update(`seed:${value}`).digest('hex');
}
