/**
 * Sitenin kendi adresi.
 *
 * Paylaşım kartı (og:image) ve mutlak bağlantılar için gerekir: Next,
 * göreli bir görsel adresini mutlak hale getirebilmek üzere `metadataBase`
 * ister. Tarayıcıda `window.location` yeterlidir ama bu değerler sunucuda,
 * istek gövdesi dışında üretildiği için ortamdan okunmalıdır.
 *
 * Sıra önemli: elle verilen adres her zaman kazanır. Vercel'in verdiği
 * dağıtım adresi (VERCEL_URL) her dağıtımda değişir, bu yüzden en sonda.
 */
function normalize(value: string): string {
  const trimmed = value.trim().replace(/\/+$/, '');
  return /^https?:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function siteUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ];

  for (const candidate of candidates) {
    if (candidate?.trim()) return normalize(candidate);
  }
  return 'http://localhost:3000';
}
