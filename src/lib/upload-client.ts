'use client';

import { upload } from '@vercel/blob/client';

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

/** Sunucunun doğrudan yüklemeyi destekleyip desteklemediği; sayfa başına bir kez sorulur. */
const probes = new Map<string, Promise<boolean>>();

export function supportsDirectUpload(tokenUrl: string): Promise<boolean> {
  let probe = probes.get(tokenUrl);
  if (!probe) {
    probe = fetch(tokenUrl, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { direct: false }))
      .then((body) => Boolean(body.direct))
      .catch(() => false);
    probes.set(tokenUrl, probe);
  }
  return probe;
}

/**
 * Dosyayı doğrudan Blob'a yükler ve depoda kullanılan adı döndürür.
 * `url` yalnızca herkese açık görsellerde anlamlıdır; misafir fotoğrafları
 * her zaman yetki denetimli uçtan servis edilir.
 */
export async function uploadDirect(
  file: File | Blob,
  options: {
    tokenUrl: string;
    space: 'private' | 'public';
    fileName: string;
    clientPayload?: string;
  },
): Promise<{ fileName: string; url: string }> {
  const blob = await upload(`${options.space}/${options.fileName}`, file, {
    access: 'public',
    handleUploadUrl: options.tokenUrl,
    contentType: file.type || undefined,
    clientPayload: options.clientPayload,
    multipart: file.size > 8 * 1024 * 1024,
  });
  return { fileName: options.fileName, url: blob.url };
}
