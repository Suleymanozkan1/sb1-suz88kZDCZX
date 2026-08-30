import { withConfig } from '@/lib/route';
import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/guard';
import { getVenue, saveVenue } from '@/lib/store';
import { EMPTY_VENUE } from '@/lib/venue';

export const dynamic = 'force-dynamic';

/**
 * Ortak mekân bilgisi.
 *
 * Okuma her oturumlu hesaba açıktır (çiftin panelinde bilgi olarak
 * gösterilir), yazma yalnızca yöneticiye. Çift kendi davetiyesinin mekân
 * alanlarını gövdeye koyarak da değiştiremez: store katmanı bu alanları
 * yazma yolunda düşürür.
 */
async function handleGet() {
  const result = requireSession();
  if ('error' in result) return result.error;
  return NextResponse.json(await getVenue());
}

async function handlePut(request: Request) {
  const result = requireSession();
  if ('error' in result) return result.error;

  if (result.session.role !== 'admin') {
    return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
  }

  const temiz: Record<string, string> = {};
  for (const alan of Object.keys(EMPTY_VENUE)) {
    if (alan in body) temiz[alan] = String((body as Record<string, unknown>)[alan] ?? '').trim();
  }

  if (!temiz.venueName && !(await getVenue()).venueName) {
    return NextResponse.json({ error: 'Mekân adı boş olamaz' }, { status: 400 });
  }

  return NextResponse.json(await saveVenue(temiz));
}

export const GET = withConfig(handleGet);
export const PUT = withConfig(handlePut);
