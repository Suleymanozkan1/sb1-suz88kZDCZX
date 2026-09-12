/**
 * Veritabanı bağlantı dizesinin bulunması.
 *
 * Vercel'de Postgres'i hangi sağlayıcıdan bağladığınıza göre değişkenin adı
 * değişir: Neon `DATABASE_URL` ekler, eski Vercel Postgres `POSTGRES_URL`,
 * Supabase ve Prisma Postgres kendi adlarını kullanır. Tek bir ada bakmak,
 * veritabanı gerçekten bağlıyken uygulamanın onu görmemesine yol açıyordu —
 * dışarıdan bu, davetiyenin kaydedilip sonra "bulunamadı" olması gibi
 * görünüyor.
 *
 * Havuzlanmış (pooled) adres önce denenir: sunucusuz ortamda her istek yeni
 * bir bağlantı açtığı için doğrudan bağlantı sınırına çabuk çarpılır.
 */
const CANDIDATES = [
  'POSTGRES_URL',
  'DATABASE_URL',
  'POSTGRES_PRISMA_URL',
  'NEON_DATABASE_URL',
  'POSTGRES_URL_NON_POOLING',
  'DATABASE_URL_UNPOOLED',
] as const;

export function databaseUrl(): string | undefined {
  for (const name of CANDIDATES) {
    const value = process.env[name];
    if (value && /^postgres(ql)?:\/\//.test(value)) return value;
  }
  return undefined;
}

/** Hangi değişkenin kullanıldığı — kurulum teşhisinde gösterilir. */
export function databaseUrlSource(): string | undefined {
  for (const name of CANDIDATES) {
    const value = process.env[name];
    if (value && /^postgres(ql)?:\/\//.test(value)) return name;
  }
  return undefined;
}

export const DATABASE_URL_NAMES = CANDIDATES;
