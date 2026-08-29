import { withConfig } from '@/lib/route';
import { NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { MAX_PHOTO_BYTES, isGeneratedName, usingBlob } from '@/lib/files';
import { blobToken } from '@/lib/blob-token';
import { getInvitationBySlug } from '@/lib/store';

export const dynamic = 'force-dynamic';

/**
 * Misafir yüklemesi için doğrudan Blob jetonu — masadaki QR kod bu akışa
 * bağlıdır ve oturum gerektirmez.
 *
 * Jeton yalnızca davetiye gerçekten varsa ve açıksa verilir; hedef ad bu
 * uygulamanın ürettiği kalıba uymak zorundadır ve üzerine yazma kapalıdır.
 * Böylece jeton, dışarıdan gelen birinin depoyu keyfî olarak doldurmasına
 * ya da var olan bir fotoğrafı değiştirmesine izin vermez.
 */
async function handleGet() {
  return NextResponse.json({ direct: usingBlob, maxBytes: MAX_PHOTO_BYTES });
}

async function handlePost(request: Request) {
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
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const invitation = await getInvitationBySlug(String(clientPayload ?? ''));
        if (!invitation || !invitation.isActive) {
          throw new Error('Davetiye bulunamadı');
        }

        const [space, ...rest] = pathname.split('/');
        if (space !== 'private' || rest.length !== 1 || !isGeneratedName(rest[0])) {
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
