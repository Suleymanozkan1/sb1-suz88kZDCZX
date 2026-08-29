import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

/**
 * Misafir fotoğrafları JSON içinde değil, diskte tutulur: orijinal dosya hiç
 * dokunulmadan saklanır ve galeriden yüksek çözünürlüklü olarak indirilir.
 * Küçük önizleme, yükleme sırasında misafirin tarayıcısında üretilir.
 */

const UPLOAD_DIR = path.join(process.cwd(), 'data', 'uploads');

/** Yüklenebilecek en büyük orijinal dosya. */
export const MAX_PHOTO_BYTES = 25 * 1024 * 1024;

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
 * Dosya adlarını her zaman yeniden üretiriz; istemciden gelen ad hiç
 * kullanılmaz, böylece yol kaçışı (path traversal) mümkün olmaz.
 */
export function newFileName(mimeType: string, suffix = ''): string {
  return `${randomUUID()}${suffix}.${extensionFor(mimeType)}`;
}

/** Depodan gelen adın yalnızca dosya adı olduğunu garantiler. */
function resolveSafe(fileName: string): string | null {
  const base = path.basename(fileName);
  if (!base || base !== fileName) return null;
  return path.join(UPLOAD_DIR, base);
}

export async function savePhotoFile(fileName: string, data: Buffer): Promise<void> {
  const target = resolveSafe(fileName);
  if (!target) throw new Error('Geçersiz dosya adı');
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(target, data);
}

export async function readPhotoFile(fileName: string): Promise<Buffer | null> {
  const target = resolveSafe(fileName);
  if (!target) return null;
  try {
    return await fs.readFile(target);
  } catch {
    return null;
  }
}

export async function removePhotoFiles(fileNames: string[]): Promise<void> {
  await Promise.all(
    fileNames.map(async (name) => {
      const target = resolveSafe(name);
      if (!target) return;
      try {
        await fs.unlink(target);
      } catch {
        // Dosya zaten yoksa sorun değil.
      }
    }),
  );
}
