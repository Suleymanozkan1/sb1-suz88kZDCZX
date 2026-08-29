import { withConfig } from '@/lib/route';
import { NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { requireSession } from '@/lib/guard';
import { MAX_PHOTO_BYTES, isGeneratedName, usingBlob } from '@/lib/files';
import { blobToken } from '@/lib/blob-token';

export const dynamic = 'force-dynamic';

/**
 * Tarayıcıdan doğrudan Vercel Blob'a yükleme için kısa ömürlü jeton üretir.
 *
 * Dosya neden sunucudan geçmiyor: Vercel işlevlerinin istek gövdesi 4,5 MB
 * ile sınırlıdır. Telefonla çekilmiş bir fotoğraf bunu rahatça aşar, istek
 * daha işleve ulaşmadan reddedilir ve kullanıcıya sebebi belirsiz bir
 * "yüklenemedi" görünür. Doğrudan yüklemede dosya tarayıcıdan depoya gider,
 * sunucu yalnızca izin verir.
 *
 * Jeton dar tutulur: yalnızca bu uygulamanın ürettiği bir ada, yalnızca
 * `public/` alanına, yalnızca görsel türlerine ve boyut sınırına izin verir.
 * Üzerine yazma kapalıdır, yani var olan bir dosya değiştirilemez.
 */
async function handleGet() {
  return NextResponse.json({ direct: usingBlob, maxBytes: MAX_PHOTO_BYTES });
}

async function handlePost(request: Request) {
  const result = requireSession();
  if ('error' in result) return result.error;

  if (!usingBlob) {
    return NextResponse.json({ error: 'Blob deposu bağlı değil' }, { status: 503 });
  }

  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
  }

  try {
    const response = await handleUpload({
      request,
      body,
      // Depo başka bir adla bağlanmış olabilir; SDK'nın varsayılan arayışına
      // bırakmak yerine bulunan belirteç açıkça verilir.
      token: blobToken(),
      onBeforeGenerateToken: async (pathname) => {
        const [space, ...rest] = pathname.split('/');
        if (space !== 'public' || rest.length !== 1 || !isGeneratedName(rest[0])) {
          throw new Error('Geçersiz hedef');
        }
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/heic', 'image/heif'],
          maximumSizeInBytes: MAX_PHOTO_BYTES,
          addRandomSuffix: false,
          allowOverwrite: false,
        };
      },
    });
    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Yükleme izni verilemedi';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export const GET = withConfig(handleGet);
export const POST = withConfig(handlePost);
