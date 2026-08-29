import { NextResponse } from 'next/server';
import { mimeForFile, readFile } from '@/lib/files';

export const dynamic = 'force-dynamic';

/**
 * Davetiyede görünen görselleri servis eder — giriş gerektirmez.
 *
 * Yalnızca `public` alanını okur. Misafir fotoğrafları `private` alanında
 * durduğu için bu uçtan erişilemez; onların tek kapısı yetki denetimi yapan
 * /api/photos/[id]/file ucudur.
 *
 * Vercel'de görseller doğrudan Blob adresinden servis edilir ve bu uç
 * kullanılmaz; yerel geliştirmede diskten okur.
 */
export async function GET(_request: Request, { params }: { params: { name: string } }) {
  const data = await readFile(params.name, 'public');
  if (!data) return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 404 });

  return new NextResponse(new Uint8Array(data), {
    headers: {
      'Content-Type': mimeForFile(params.name),
      'Content-Length': String(data.length),
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
