'use client';

import { upload, uploadPresigned } from '@vercel/blob/client';

/**
 * Yükleme, ortama göre iki yoldan birini kullanır.
 *
 *   • Blob bağlıysa  → dosya tarayıcıdan doğrudan depoya gider.
 *   • Bağlı değilse  → dosya sunucu ucuna gönderilir (yerel geliştirme).
 *
 * Doğrudan yolun sebebi boyut: Vercel işlevlerine gelen istek gövdesi 4,5 MB
 * ile sınırlıdır ve telefon fotoğrafları bunu düzenli olarak aşar. Sunucudan
 * geçen yolda böyle bir dosya işleve hiç ulaşmaz, yükleme sebebi görünmeden
 * başarısız olur.
 */

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
  'image/avif': 'avif',
};

export function extensionFor(mimeType: string): string {
  return EXTENSIONS[mimeType] ?? 'jpg';
}

/** Dosya adı istemcide üretilir; sunucu jetonu vermeden önce kalıbı doğrular. */
export function newFileName(mimeType: string, suffix = ''): string {
  const uuid =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(16).padStart(12, '0')}`.replace(
          /^(.{8})(.{4})(.{4})(.{4})(.{12})$/,
          '$1-$2-$3-$4-$5',
        );
  return `${uuid}${suffix}.${extensionFor(mimeType)}`;
}

/**
 * Sunucunun bildirdiği yükleme koşulları; sayfa başına bir kez sorulur.
 *
 * Üç yol var ve seçim depoya nasıl bağlanıldığına göre yapılır:
 *   • 'jeton'   — okuma-yazma belirteci var; istemci jetonuyla doğrudan depoya.
 *   • 'imzali'  — belirteç yok (OIDC); imzalı adresle yine doğrudan depoya.
 *   • 'sunucu'  — Blob hiç yok (yerel geliştirme); dosya sunucu ucundan geçer.
 *
 * İlk ikisinde dosya sunucuya hiç uğramaz, dolayısıyla Vercel'in 4,5 MB
 * istek gövdesi sınırı devreye girmez ve sınır 25 MB'dır.
 */
export type UploadMode = 'jeton' | 'imzali' | 'sunucu';

export interface UploadLimits {
  mode: UploadMode;
  maxBytes: number;
}

const FALLBACK: UploadLimits = { mode: 'sunucu', maxBytes: 25 * 1024 * 1024 };
const probes = new Map<string, Promise<UploadLimits>>();

export function uploadLimits(tokenUrl: string): Promise<UploadLimits> {
  let probe = probes.get(tokenUrl);
  if (!probe) {
    probe = fetch(tokenUrl, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : FALLBACK))
      .then((body) => ({
        mode: (body.mode as UploadMode) ?? FALLBACK.mode,
        maxBytes: Number(body.maxBytes) || FALLBACK.maxBytes,
      }))
      .catch(() => FALLBACK);
    probes.set(tokenUrl, probe);
  }
  return probe;
}

export function describeLimit(maxBytes: number): string {
  return `${Math.round(maxBytes / 1024 / 1024)} MB`;
}

/**
 * Deponun kabul ettiği erişim kipi.
 *
 * Vercel'de Blob deposu private olarak kurulabiliyor ve o durumda
 * `access: 'public'` yazma reddediliyor. Hangi tür kurulduğu istemciden
 * bilinemez; ilk yüklemede denenip sonuç saklanır.
 */
type Access = 'public' | 'private';
let storeAccess: Access | undefined;

function isAccessRejection(err: unknown): boolean {
  const message = err instanceof Error ? err.message : '';
  return /access|public|private/i.test(message);
}

/**
 * Dosyayı doğrudan Blob'a yükler ve depoda kullanılan adı döndürür.
 *
 * Dönen `url` her zaman uygulamanın kendi ucudur, deponun CDN adresi değil:
 * private bir depoda o adres dışarıya açık olmaz ve görsel açılmaz.
 */
export async function uploadDirect(
  file: File | Blob,
  options: {
    tokenUrl: string;
    /** İmzalı adres ucu; 'imzali' kipinde kullanılır. */
    presignedUrl: string;
    mode: 'jeton' | 'imzali';
    space: 'private' | 'public';
    fileName: string;
    clientPayload?: string;
  },
): Promise<{ fileName: string; url: string }> {
  const gonder = options.mode === 'imzali' ? uploadPresigned : upload;
  const ucAdresi = options.mode === 'imzali' ? options.presignedUrl : options.tokenUrl;
  const order: Access[] = storeAccess ? [storeAccess] : ['public', 'private'];
  let lastError: unknown;

  for (const access of order) {
    try {
      await gonder(`${options.space}/${options.fileName}`, file, {
        access,
        handleUploadUrl: ucAdresi,
        contentType: file.type || undefined,
        clientPayload: options.clientPayload,
        multipart: file.size > 8 * 1024 * 1024,
      });
      storeAccess = access;
      return { fileName: options.fileName, url: `/api/files/${options.fileName}` };
    } catch (err) {
      lastError = err;
      if (!isAccessRejection(err)) break;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Yüklenemedi');
}
