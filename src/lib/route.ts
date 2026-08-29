import { NextResponse } from 'next/server';
import { isConfigError } from './errors';

/**
 * Yapılandırma hatalarını API sınırında okunabilir bir yanıta çevirir.
 *
 * Eksik bir ortam değişkeni her zaman yanlış yerde ortaya çıkıyordu: veritabanı
 * bağlı olmadığı için kaydedilemeyen davetiye "oluşturuldu" görünüp sonra
 * "bulunamadı" oluyor, depo bağlı olmadığı için yazılamayan dosya sebebi
 * söylenmeden "yüklenemedi" diyordu. Bu sarmalayıcı bu durumu 500 yerine 503
 * ve sorunun ne olduğunu söyleyen bir mesajla döndürür.
 */
export function withConfig<A extends unknown[]>(
  handler: (...args: A) => Promise<Response>,
): (...args: A) => Promise<Response> {
  return async (...args: A) => {
    try {
      return await handler(...args);
    } catch (err) {
      if (isConfigError(err)) {
        return NextResponse.json({ error: err.message }, { status: 503 });
      }
      throw err;
    }
  };
}
