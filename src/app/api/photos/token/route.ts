import { withConfig } from '@/lib/route';
import { NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { IMAGE_TYPES, MAX_PHOTO_BYTES, isGeneratedName, usingBlob } from '@/lib/files';
import { blobAuth, canMintClientToken } from '@/lib/blob-token';
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
  // Doğrudan yükleme istemci jetonu gerektirir; jeton yalnızca okuma-yazma
  // belirtecinden türetilebilir. OIDC kipinde dosya sunucu ucundan geçer.
  /*
     Blob bağlıysa dosya her hâlükârda doğrudan depoya gider — belirteç varsa
     istemci jetonuyla, yoksa (OIDC) imzalı adresle. İkisinde de dosya
     sunucuya uğramadığı için Vercel'in 4,5 MB istek sınırı devreye girmez.
     Sunucudan geçen yol yalnızca Blob'un hiç olmadığı yerel geliştirmede
     kalır ve orada da böyle bir sınır yoktur.
  */
  const mode = !usingBlob ? 'sunucu' : canMintClientToken() ? 'jeton' : 'imzali';

  return NextResponse.json({ mode, maxBytes: MAX_PHOTO_BYTES });
}

async function handlePost(request: Request) {
  const credentials = blobAuth();
  if (credentials?.mode !== 'token') {
    return NextResponse.json(
      { error: 'Doğrudan yükleme için Blob okuma-yazma belirteci gerekir' },
      { status: 503 },
    );
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
      token: credentials.token,
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
          // Misafir yüklemesi yalnızca fotoğraftır.
          allowedContentTypes: IMAGE_TYPES,
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
