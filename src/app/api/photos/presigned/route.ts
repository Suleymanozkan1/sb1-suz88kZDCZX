import { withConfig } from '@/lib/route';
import { NextResponse } from 'next/server';
import {
  handleUploadPresigned,
  type HandleUploadPresignedBody,
} from '@vercel/blob/client';
import { issueSignedToken } from '@vercel/blob';
import { blobAuthOptions } from '@/lib/blob-token';
import { IMAGE_TYPES, MAX_PHOTO_BYTES, isGeneratedName, usingBlob } from '@/lib/files';
import { getInvitationBySlug } from '@/lib/store';

export const dynamic = 'force-dynamic';

/**
 * Misafir fotoğrafı için imzalı adres — masadaki QR bu akışa bağlı, oturum
 * gerektirmez. İmza yalnızca davetiye gerçekten varsa ve açıksa verilir;
 * hedef ad, tür ve boyut da imzada sınırlanır.
 */
async function handlePost(request: Request): Promise<Response> {
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
      getSignedToken: async (pathname, clientPayload) => {
        const invitation = await getInvitationBySlug(String(clientPayload ?? ''));
        if (!invitation || !invitation.isActive) throw new Error('Davetiye bulunamadı');

        const [space, ...rest] = pathname.split('/');
        if (space !== 'private' || rest.length !== 1 || !isGeneratedName(rest[0])) {
          throw new Error('Geçersiz hedef');
        }
        return {
          token: await issueSignedToken({
            ...blobAuthOptions(),
            pathname,
            operations: ['put'],
            allowedContentTypes: IMAGE_TYPES,
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
