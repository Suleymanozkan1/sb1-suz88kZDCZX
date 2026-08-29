import { withConfig } from '@/lib/route';
import { NextResponse } from 'next/server';
import { usingBlob } from '@/lib/files';
import { databaseUrlSource } from '@/lib/database-url';
import { usingDatabase } from '@/lib/store';

export const dynamic = 'force-dynamic';

/**
 * Kurulum teşhisi.
 *
 * Yalnızca "yapılandırıldı mı" sorusunu yanıtlar; hiçbir değer, sayı ya da
 * kimlik döndürmez. Amaç, bir dağıtımın ortam değişkenlerini gerçekten görüp
 * görmediğini tek istekte anlaşılır kılmak — aksi hâlde eksik yapılandırma
 * kendini "parola hatalı" gibi ilgisiz bir hata olarak gösteriyor.
 */
async function handleGet() {
  const database = usingDatabase;
  const blob = usingBlob;
  const adminPassword = Boolean(process.env.ADMIN_PASSWORD);
  const adminSecret = Boolean(process.env.ADMIN_SECRET);

  const issues: string[] = [];
  if (!adminPassword) {
    issues.push('ADMIN_PASSWORD tanımlı değil — giriş yapılamaz.');
  }
  if (!adminSecret) {
    issues.push('ADMIN_SECRET tanımlı değil — oturumlar ADMIN_PASSWORD’den türetiliyor.');
  }
  if (!database) {
    issues.push(
      'Postgres bağlı değil — veriler kalıcı olmayacak. Vercel’de Storage → Neon ' +
        '(ya da Supabase / Prisma Postgres) bağlayın; Upstash Redis’tir, Postgres vermez.',
    );
  }
  if (!blob) {
    issues.push('BLOB_READ_WRITE_TOKEN tanımlı değil — yüklenen dosyalar kalıcı olmayacak.');
  }

  return NextResponse.json({
    ok: issues.length === 0,
    storage: { database, blob, databaseVariable: databaseUrlSource() ?? null },
    auth: { adminPassword, adminSecret },
    issues,
  });
}

export const GET = withConfig(handleGet);
