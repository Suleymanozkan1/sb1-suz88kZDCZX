import { withConfig } from '@/lib/route';
import { NextResponse } from 'next/server';
import { usingBlob } from '@/lib/files';
import { blobTokenSource } from '@/lib/blob-token';
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

  /**
   * Engelleyen eksikle yalnızca iyileştirme önerisi aynı listede durunca
   * çalışan bir kurulum bozukmuş gibi okunuyor. İkisi ayrı sayılır.
   */
  const issues: { level: 'engel' | 'oneri'; message: string }[] = [];

  if (!adminPassword) {
    issues.push({
      level: 'engel',
      message: 'ADMIN_PASSWORD tanımlı değil — giriş yapılamaz.',
    });
  }
  if (!database) {
    issues.push({
      level: 'engel',
      message:
        'Postgres bağlı değil — kayıtlar kalıcı olmaz. Vercel’de Storage → Neon ' +
        '(ya da Supabase / Prisma Postgres) bağlayın; Upstash Redis’tir, Postgres vermez.',
    });
  }
  if (!blob) {
    issues.push({
      level: 'engel',
      message:
        'Blob deposu bağlı değil — görsel yüklenemez. Depoyu bağladıysanız yeniden ' +
        'dağıtın: bağlamak tek başına yetmez, mevcut dağıtım değişkeni görmez.',
    });
  }
  if (!adminSecret) {
    issues.push({
      level: 'oneri',
      message:
        'ADMIN_SECRET tanımlı değil. Site çalışır; ancak oturum anahtarı ' +
        'ADMIN_PASSWORD’den türetildiği için o değişkeni değiştirdiğinizde herkesin ' +
        'oturumu kapanır. Rastgele uzun bir değer eklemeniz önerilir.',
    });
  }

  return NextResponse.json({
    ok: issues.every((issue) => issue.level !== 'engel'),
    storage: {
      database,
      blob,
      databaseVariable: databaseUrlSource() ?? null,
      blobVariable: blobTokenSource() ?? null,
    },
    auth: { adminPassword, adminSecret },
    issues,
  });
}

export const GET = withConfig(handleGet);
