import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/guard';
import { MAX_PHOTO_BYTES, isSupportedImage, newFileName, saveFile } from '@/lib/files';

export const dynamic = 'force-dynamic';

/**
 * Yönetici görsel yükleme (kapak, galeri, mühür, mektup).
 *
 * Bu görseller davetiyede HERKESE görünür, bu yüzden `public` alanına yazılır
 * ve doğrudan servis edilebilir bir adres döner. Kayıtta base64 yerine bu
 * adres saklanır — aksi hâlde her davetiye satırı megabaytlarca büyür ve
 * sayfa yüklemesi yavaşlar.
 */
export async function POST(request: Request) {
  const result = requireSession();
  if ('error' in result) return result.error;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Geçersiz yükleme' }, { status: 400 });
  }

  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Dosya seçilmedi' }, { status: 400 });
  }
  if (!isSupportedImage(file.type)) {
    return NextResponse.json({ error: 'Yalnızca görsel yükleyebilirsiniz' }, { status: 400 });
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return NextResponse.json(
      { error: `Görsel ${Math.round(MAX_PHOTO_BYTES / 1024 / 1024)} MB sınırını aşıyor` },
      { status: 413 },
    );
  }

  const url = await saveFile(
    newFileName(file.type),
    Buffer.from(await file.arrayBuffer()),
    'public',
  );
  return NextResponse.json({ url }, { status: 201 });
}
