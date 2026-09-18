/** "Ayşe & Mehmet" → "ayse-mehmet" */
export function slugify(input: string): string {
  const map: Record<string, string> = {
    ç: 'c', Ç: 'c', ğ: 'g', Ğ: 'g', ı: 'i', İ: 'i',
    ö: 'o', Ö: 'o', ş: 's', Ş: 's', ü: 'u', Ü: 'u',
  };
  return input
    .split('')
    .map((ch) => map[ch] ?? ch)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/**
 * Türkçe başlık yazımı: "mehmeT" → "Mehmet", "AYŞE" → "Ayşe".
 *
 * Çiftler adlarını her türlü yazıyor; davetiyede adın CAPS LOCK ile
 * durması ürünü ucuzlatıyor. Türkçe yerel ayarı ŞART: yerelsiz
 * toLowerCase "IŞIK" → "ışık" yerine "ısık" üretiyor ve "istanbul" →
 * "Istanbul" çıkıyor. Kısa çizgi ve kesme sonrası yeni sözcük sayılır.
 */
export function trTitle(input: string): string {
  return input
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\s\-’'.]+/g, (word) =>
      word.charAt(0).toLocaleUpperCase('tr') + word.slice(1).toLocaleLowerCase('tr'),
    )
    .replace(/([-’'.])([^\s\-’'.])/g, (_, sep, ch) => sep + ch.toLocaleUpperCase('tr'));
}

/** Bağlantı adresindeki ay adları — WordPress'teki AY_SLUG ile birebir. */
const AYLAR = [
  'ocak', 'subat', 'mart', 'nisan', 'mayis', 'haziran',
  'temmuz', 'agustos', 'eylul', 'ekim', 'kasim', 'aralik',
];

/**
 * Bağlantı adresi: 31-eylul-2026-zehra-ahmet
 *
 * Tarih önde çünkü işletme yılda yüzlerce davetiye açıyor; adrese
 * bakınca hangi güne ait olduğu görünmeli. Gelin adı damattan önce.
 * Tarih yoksa yalnızca adlar kullanılır.
 */
export function buildSlug(bride: string, groom: string, date = ''): string {
  const parca: string[] = [];
  const m = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (m && AYLAR[Number(m[2]) - 1]) {
    parca.push(String(Number(m[3])), AYLAR[Number(m[2]) - 1], m[1]);
  }

  for (const ad of [bride, groom]) {
    const temiz = slugify(ad);
    if (temiz) parca.push(temiz);
  }

  return slugify(parca.join('-'));
}
