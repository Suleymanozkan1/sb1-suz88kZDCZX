/**
 * Bağlantı adreslerinin güvenli olduğunun garantisi.
 *
 * Davetiyedeki bazı adresleri çift kendisi giriyor: harita bağlantısı,
 * sosyal hesaplar, hediye listesi. Bunlar doğrudan `href` olarak basılıyor ve
 * React href değerlerini süzmez — `javascript:` ya da `data:` bir adres
 * oraya yazılabilir.
 *
 * Bugün bu adresler yeni sekmede açıldığı için tarayıcılar böyle bir
 * navigasyonu zaten engelliyor; yani bilinen bir sömürü yok. Ama koruma o
 * durumda tasarımın değil tarayıcının kararına bağlı kalıyor: target
 * kaldırılırsa ya da farklı davranan bir tarayıcı gelirse koruma da gider.
 * Burada şema açıkça sınırlanır.
 */
const IZINLI = new Set(['http:', 'https:', 'mailto:', 'tel:']);

export function safeUrl(raw: string | undefined | null): string | undefined {
  const value = raw?.trim();
  if (!value) return undefined;

  // Şemasız yazılan adresler (ornek.com/yol) https kabul edilir.
  const aday = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value) ? value : `https://${value}`;

  try {
    const url = new URL(aday);
    return IZINLI.has(url.protocol) ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}
