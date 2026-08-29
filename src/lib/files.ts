import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

/**
 * Yüklenen dosyaların deposu.
 *
 * İki sürücü vardır ve seçim ortam değişkenine göre yapılır:
 *   • BLOB_READ_WRITE_TOKEN varsa  → Vercel Blob (üretim)
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

export const usingBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

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

const key = (fileName: string, space: Space) => `${space}/${fileName}`;

/* ─────────────────────────────────────────────────────────────── yazma */

/** Dosyayı yazar ve doğrudan servis edilebilir adresini döndürür. */
export async function saveFile(
  fileName: string,
  data: Buffer,
  space: Space = 'private',
): Promise<string> {
  if (usingBlob) {
    const { put } = await import('@vercel/blob');
    // addRandomSuffix kapalı: kayıttaki ad ile depodaki anahtar birebir aynı kalmalı.
    const blob = await put(key(fileName, space), data, {
      access: 'public',
      addRandomSuffix: false,
      contentType: mimeForFile(fileName),
    });
    return blob.url;
  }

  const target = resolveSafe(fileName, space);
  if (!target) throw new Error('Geçersiz dosya adı');
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, data);
  return `/api/files/${fileName}`;
}

/* ─────────────────────────────────────────────────────────────── okuma */

export async function readFile(
  fileName: string,
  space: Space = 'private',
): Promise<Buffer | null> {
  if (usingBlob) {
    const { head } = await import('@vercel/blob');
    try {
      const meta = await head(key(fileName, space));
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
          const meta = await head(key(name, space));
          await del(meta.url);
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
