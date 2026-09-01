import { NextResponse } from 'next/server';
import { withConfig } from '@/lib/route';
import { runLifecycle } from '@/lib/lifecycle';

export const dynamic = 'force-dynamic';

/**
 * Günlük bakım ucu — düğünü geçmiş davetiyeleri yayından kaldırır,
 * süresi dolanları siler.
 *
 * Vercel'de `vercel.json` içindeki cron günde bir kez çağırıyor. Uç
 * KORUMALI: davetiye silen bir adresin herkese açık olması, adresi
 * bilen birinin işletmenin bütün eski davetiyelerini erkenden
 * sildirebilmesi demekti.
 *
 * Vercel Cron kendi isteğine `Authorization: Bearer $CRON_SECRET`
 * başlığını ekliyor; başka bir barındırmada aynı başlıkla çağırmak
 * yeterli.
 */
async function handle(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return NextResponse.json(
      { error: 'CRON_SECRET tanımlı değil; bakım ucu kapalı.' },
      { status: 503 },
    );
  }

  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  return NextResponse.json(await runLifecycle());
}

export const GET = withConfig(handle);
export const POST = withConfig(handle);
