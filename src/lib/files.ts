import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { blobToken } from './blob-token';
import { ConfigError } from './errors';

/**
 * Yüklenen dosyaların deposu.
 *
 * İki sürücü vardır ve seçim ortam değişkenine göre yapılır:
 *   • Blob belirteci varsa         → Vercel Blob (üretim)
 *   • yoksa                        → data/uploads (yerel geliştirme)
 *
 * Kayıtlarda dosyanın kendisi değil, yalnızca ADI/ANAHTARI saklanır; okuma
 * her zaman bu modülden geçer. Böylece fotoğraflar herkese açık bir adresle
 * değil, yetki denetiminden geçen API ucundan servis edilir.
 */

const UPLOAD_DIR = path.join(process.cwd(), 'data', 'uploads');

/**
 * İki ayrı isim alanı vardır ve bu ayrım bir güvenlik sınırıdır:
 *   • private → misafir fotoğrafları. Yalnızca yetki denetiminden geçen
 *     API ucundan okunur, adresi hiç dışarı verilmez.
 *   • public  → davetiyede görünen kapak/galeri/mühür görselleri. Herkese
 *     açık bir adresle servis edilir.
 * Genel uç yalnızca `public` alanını okur; sızan bir dosya adı özel bir
 * fotoğrafı açığa çıkaramaz.
 */
export type Space = 'private' | 'public';

/** Yüklenebilecek en büyük orijinal dosya. */
export const MAX_PHOTO_BYTES = 25 * 1024 * 1024;

export const usingBlob = Boolean(blobToken());

/**
 * Belirteç her çağrıya açıkça verilir. SDK varsayılan olarak yalnızca
 * `BLOB_READ_WRITE_TOKEN` adına bakar; depo başka bir adla bağlanmışsa
 * belirteci bulmuş olmamıza rağmen istekler kimliksiz gider.
 */
function token(): string {
  const value = blobToken();
  if (!value) throw new ConfigError('Blob deposu bağlı değil.');
  return value;
}

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
  'image/avif': 'avif',
};

export function isSupportedImage(mimeType: string): boolean {
  return mimeType in EXTENSIONS;
}

export function extensionFor(mimeType: string): string {
  return EXTENSIONS[mimeType] ?? 'jpg';
}

export function mimeForFile(fileName: string): string {
  const ext = path.extname(fileName).slice(1).toLowerCase();
  const found = Object.entries(EXTENSIONS).find(([, value]) => value === ext);
  return found?.[0] ?? 'application/octet-stream';
}

/**
 * Dosya adları her zaman yeniden üretilir; istemciden gelen ad hiç
 * kullanılmaz, böylece yol kaçışı (path traversal) mümkün olmaz.
 */
export function newFileName(mimeType: string, suffix = ''): string {
  return `${randomUUID()}${suffix}.${extensionFor(mimeType)}`;
}

/** Depodan gelen adın yalnızca dosya adı olduğunu garantiler. */
function resolveSafe(fileName: string, space: Space): string | null {
  const base = path.basename(fileName);
  if (!base || base !== fileName) return null;
  return path.join(UPLOAD_DIR, space, base);
}

export const key = (fileName: string, space: Space) => `${space}/${fileName}`;

/**
 * Bir adın bu uygulamanın ürettiği ada benzeyip benzemediğini söyler.
 *
 * Doğrudan tarayıcıdan yüklemede hedef yolu istemci seçer, bu yüzden sunucu
 * jetonu vermeden önce adın beklenen kalıpta olduğunu doğrular: rastgele bir
 * UUID, isteğe bağlı `-thumb` eki ve bilinen bir uzantı.
 */
export function isGeneratedName(fileName: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(-thumb)?\.[a-z]{3,4}$/.test(
    fileName,
  );
}

/**
 * Vercel'de dosya sistemi salt-okunurdur; Blob bağlanmamışsa yükleme
 * kaçınılmaz olarak başarısız olur. Bunu bir yazma hatası olarak bırakmak
 * kullanıcıya "görsel yüklenemedi" gibi sebebi gizleyen bir mesaj gösteriyordu.
 */
function assertWritable(): void {
  if (usingBlob) return;
  if (process.env.VERCEL) {
    throw new ConfigError(
      'Dosya deposu bağlı değil. Vercel projesinde Storage → Blob oluşturup projeye bağlayın, ' +
        'sonra yeniden dağıtın — depoyu bağlamak tek başına yetmez, mevcut dağıtım ' +
        'değişkeni görmez.',
    );
  }
}

/**
 * Blob'un kendi hataları da çoğunlukla bir yapılandırma sorunudur: belirteç
 * eski bir depoya ait ya da depo silinmiş olur. Ham hata mesajı arayüze
 * "yüklenemedi" olarak düşüyordu; sebebi söylemek daha yararlı.
 */
function asConfigError(err: unknown): unknown {
  const message = err instanceof Error ? err.message : '';
  if (/store does not exist|not found|Access denied|unauthorized|forbidden/i.test(message)) {
    return new ConfigError(
      'Blob deposuna erişilemedi — belirteç artık var olmayan bir depoya ait olabilir. ' +
        'Vercel’de Storage → Blob bağlantısını kontrol edip yeniden dağıtın.',
    );
  }
  return err;
}

/* ─────────────────────────────────────────────────────────────── yazma */

/** Dosyayı yazar ve doğrudan servis edilebilir adresini döndürür. */
export async function saveFile(
  fileName: string,
  data: Buffer,
  space: Space = 'private',
): Promise<string> {
  assertWritable();

  if (usingBlob) {
    const { put } = await import('@vercel/blob');
    try {
      // addRandomSuffix kapalı: kayıttaki ad ile depodaki anahtar birebir aynı kalmalı.
      const blob = await put(key(fileName, space), data, {
        access: 'public',
        addRandomSuffix: false,
        contentType: mimeForFile(fileName),
        token: token(),
      });
      return blob.url;
    } catch (err) {
      throw asConfigError(err);
    }
  }

  const target = resolveSafe(fileName, space);
  if (!target) throw new Error('Geçersiz dosya adı');
  try {
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, data);
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === 'EROFS' || code === 'EACCES' || code === 'EPERM') {
      throw new ConfigError(
        'Dosya sistemi salt-okunur olduğu için yükleme kaydedilemedi. ' +
          'Kalıcı depolama için Vercel Blob bağlayıp yeniden dağıtın.',
      );
    }
    if (code === 'ENOSPC') {
      throw new ConfigError('Sunucuda yer kalmadı; yükleme kaydedilemedi.');
    }
    throw err;
  }
  return `/api/files/${fileName}`;
}

/**
 * Dosyanın depoda gerçekten durup durmadığını söyler.
 *
 * Tarayıcıdan doğrudan yüklemede kaydı oluşturan istek ile dosyayı yazan
 * istek ayrıdır; kayıt açılmadan önce dosyanın yerinde olduğu doğrulanır,
 * aksi hâlde galeride açılmayan satırlar birikir.
 */
export async function fileExists(
  fileName: string,
  space: Space = 'private',
): Promise<boolean> {
  if (usingBlob) {
    const { head } = await import('@vercel/blob');
    try {
      await head(key(fileName, space), { token: token() });
      return true;
    } catch {
      return false;
    }
  }

  const target = resolveSafe(fileName, space);
  if (!target) return false;
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

/* ─────────────────────────────────────────────────────────────── okuma */

export async function readFile(
  fileName: string,
  space: Space = 'private',
): Promise<Buffer | null> {
  if (usingBlob) {
    const { head } = await import('@vercel/blob');
    try {
      const meta = await head(key(fileName, space), { token: token() });
      const response = await fetch(meta.url);
      if (!response.ok) return null;
      return Buffer.from(await response.arrayBuffer());
    } catch {
      return null;
    }
  }

  const target = resolveSafe(fileName, space);
  if (!target) return null;
  try {
    return await fs.readFile(target);
  } catch {
    return null;
  }
}

/* ─────────────────────────────────────────────────────────────── silme */

export async function removeFiles(
  fileNames: string[],
  space: Space = 'private',
): Promise<void> {
  const unique = [...new Set(fileNames.filter(Boolean))];

  if (usingBlob) {
    const { del, head } = await import('@vercel/blob');
    await Promise.all(
      unique.map(async (name) => {
        try {
          const meta = await head(key(name, space), { token: token() });
          await del(meta.url, { token: token() });
        } catch {
          // Dosya zaten yoksa sorun değil.
        }
      }),
    );
    return;
  }

  await Promise.all(
    unique.map(async (name) => {
      const target = resolveSafe(name, space);
      if (!target) return;
      try {
        await fs.unlink(target);
      } catch {
        // Dosya zaten yoksa sorun değil.
      }
    }),
  );
}
