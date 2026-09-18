import { withConfig } from '@/lib/route';
import { NextResponse } from 'next/server';
import {
  handleUploadPresigned,
  type HandleUploadPresignedBody,
} from '@vercel/blob/client';
import { issueSignedToken } from '@vercel/blob';
import { requireSession } from '@/lib/guard';
import { blobAuthOptions } from '@/lib/blob-token';
import { AUDIO_TYPES, IMAGE_TYPES, MAX_PHOTO_BYTES, isGeneratedName, usingBlob } from '@/lib/files';

export const dynamic = 'force-dynamic';

/**
 * Tarayıcıdan doğrudan yükleme — imzalı adres yoluyla.
 *
 * Neden bu uç var: dosyayı sunucudan geçirmek Vercel'in 4,5 MB istek gövdesi
 * sınırına takılıyor, yani 25 MB'lık bir fotoğraf işleve hiç ulaşamıyor.
 * İstemci jetonu üretmek ise okuma-yazma belirteci istiyor; deposu OIDC ile
 * bağlı olanlarda öyle bir belirteç yok. `issueSignedToken` her iki kimlik
 * yolunda da çalışıyor, dolayısıyla imzalı adres her kurulumda dosyayı
 * doğrudan depoya gönderebiliyor ve sınır 25 MB'a çıkıyor.
 */
async function handlePost(request: Request): Promise<Response> {
  const result = requireSession();
  if ('error' in result) return result.error;

  if (!usingBlob) {
    return NextResponse.json({ error: 'Blob deposu bağlı değil' }, { status: 503 });
  }

  let body: HandleUploadPresignedBody;
  try {
    body = (await request.json()) as HandleUploadPresignedBody;
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
  }

  try {
    const response = await handleUploadPresigned({
      request,
      body,
      getSignedToken: async (pathname) => {
        const [space, ...rest] = pathname.split('/');
        if (space !== 'public' || rest.length !== 1 || !isGeneratedName(rest[0])) {
          throw new Error('Geçersiz hedef');
        }
        return {
          token: await issueSignedToken({
            ...blobAuthOptions(),
            pathname,
            operations: ['put'],
            allowedContentTypes: [...IMAGE_TYPES, ...AUDIO_TYPES],
            maximumSizeInBytes: MAX_PHOTO_BYTES,
          }),
        };
      },
    });
    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Yükleme izni verilemedi';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export const POST = withConfig(handlePost);
