import type { MenuGroup } from './types';

/**
 * Yöneticiye ait genel ayarlar — salonlar, menüler, işletme bilgisi ve
 * davetiyenin ömrü. WordPress sürümündeki `Sahra_Settings`'in karşılığı;
 * iki tarafın alanları birebir aynı olmak zorunda.
 */

export interface Venue {
  id: string;
  venueName: string;
  address: string;
  district: string;
  city: string;
  mapUrl: string;
  /** Misafirin işine yarayacak bilgiler: otopark, ulaşım, çocuk alanı. */
  features: string[];
}

export interface Menu {
  id: string;
  /** Yalnızca panelde görünür; davetiyede başlık her zaman "Menü". */
  name: string;
  groups: MenuGroup[];
}

export interface Brand {
  instagram: string;
  instagramLabel: string;
}

/**
 * Davetiyenin ömrü — iki kademe, bilerek.
 *
 * Düğün bitince davetiye kimseye lazım değil: link elden ele dolaşmaya
 * devam ediyor ve çiftin adresi, telefonu, IBAN'ı süresiz açıkta kalıyor.
 * Ama misafir fotoğrafları çiftin düğün albümü — onları da aynı gün silmek,
 * albümünü indirmeyi unutan çiftin fotoğraflarını yok etmek olurdu.
 */
export interface Lifecycle {
  unpublishDays: number;
  deleteDays: number;
  deleteEnabled: boolean;
}

export interface Settings {
  venues: Venue[];
  menus: Menu[];
  brand: Brand;
  lifecycle: Lifecycle;
}

export const EMPTY_VENUE: Venue = {
  id: '',
  venueName: '',
  address: '',
  district: '',
  city: '',
  mapUrl: '',
  features: [],
};

export const DEFAULT_LIFECYCLE: Lifecycle = {
  unpublishDays: 1,
  deleteDays: 30,
  deleteEnabled: true,
};

/**
 * Eklentiyle gelen hazır menüler — işletmenin basılı menü kartından
 * birebir, FİYATSIZ. Fiyat çiftle işletme arasındaki mesele; davetiye
 * misafire gidiyor.
 */
const ORDOVR = 'ORDÖVR TABAĞI | Amerikan salatası | 2 adet yaprak sarması | Zerdeçallı arpa şehriye | Kısır | Haydari | Havuç tarator | Pembe sultan';
const SERPME = 'SERPMELER | Soslu ve sossuz patates cipsi tabağı | Kurudite bardağı';
const ICECEK = 'İÇECEKLER | Litrelik soft içecek ve su';
const ICECEK_SINIRSIZ = 'İÇECEKLER | Litrelik sınırsız soft içecek ve su';
const TATLI = 'TATLI | Dondurmalı pasta veya 2 dilim baklava';
const SALATA = 'SALATA | Mevsim salata';
const MEYVE = 'MEYVE | Mevsim meyveleri';
const ARA_SICAK = 'ARA SICAK | Su böreği / Paçanga böreği | Kalem böreği';

const HAZIR_MENULER: Array<[string, string[]]> = [
  ['Kokteyl Menü', [
    'ANA YEMEK | Su böreği | Amerikan salatası | Patates salatası | 2 adet yaprak sarması | Kısır | Pembe sultan | Havuç tarator',
    SERPME,
    'TATLI | Dondurmalı pasta',
    ICECEK,
  ]],
  ['Menü 1', [
    'ANA YEMEK | Tavuk kavurma / Şinitzel (roll ekmek eşliğinde) | Tereyağlı pirinç pilavı | Patates püresi | İçli köfte',
    TATLI, SERPME, ICECEK,
  ]],
  ['Menü 2', [
    'ANA YEMEK | Et kavurma (roll ekmek eşliğinde) | Tereyağlı pirinç pilavı | Patates püresi | İçli köfte',
    TATLI, SERPME, ICECEK,
  ]],
  ['Menü 3', [
    ORDOVR,
    'ANA YEMEK | Et kavurma (roll ekmek eşliğinde) | Tereyağlı pirinç pilavı | Patates püresi | İçli köfte',
    TATLI, 'SERPMELER | Soslu veya sossuz cips tabağı | Kurudite bardağı', ICECEK,
  ]],
  ['Menü 4', [
    ORDOVR,
    'ARA SICAK | Su böreği',
    'ANA YEMEK | Et kavurma | Tereyağlı pirinç pilavı | Patates püresi | İçli köfte',
    SALATA, TATLI, SERPME, ICECEK,
  ]],
  ['Menü 5', [
    ORDOVR, ARA_SICAK,
    'ANA YEMEK | Dana rosto veya dana bonfile | Tereyağlı pirinç pilavı | Patates püresi | İçli köfte | Roll ekmek',
    SALATA, TATLI, MEYVE, SERPME, ICECEK_SINIRSIZ,
  ]],
  ['Menü 6', [
    ORDOVR, ARA_SICAK,
    'ANA YEMEK | Fırın biftek | Tereyağlı pirinç pilavı | Kekik sos eşliğinde sebze türlüsü | Patates püresi | İçli köfte | Roll ekmek',
    SALATA, TATLI, MEYVE, SERPME, ICECEK_SINIRSIZ,
  ]],
  ['Menü 7', [
    ORDOVR, ARA_SICAK,
    'ANA YEMEK | Fırın kuzu tandır | Tereyağlı pirinç pilavı | Kekik sos eşliğinde sebze türlüsü | Patates püresi | İçli köfte | Roll ekmek',
    SALATA, TATLI, MEYVE, SERPME, ICECEK_SINIRSIZ,
  ]],
];

export function defaultMenus(): Menu[] {
  return HAZIR_MENULER.map(([name, satirlar], i) => ({
    id: `menu-${i + 1}`,
    name,
    groups: parseMenu(satirlar.join('\n')),
  }));
}

export function defaultSettings(): Settings {
  return {
    venues: [],
    menus: defaultMenus(),
    brand: { instagram: '', instagramLabel: '' },
    lifecycle: { ...DEFAULT_LIFECYCLE },
  };
}

/**
 * Menü metnini gruplara çevirir.
 *
 * Bir satır = bir grup: "ORDÖVR TABAĞI | Amerikan salatası | Kısır".
 * Program ve hikâye alanlarındaki dikey çubuk düzeniyle aynı; çift yeni
 * bir söz dizimi öğrenmiyor.
 */
export function parseMenu(text: string): MenuGroup[] {
  return text
    .split(/\r\n|\r|\n/)
    .map((satir) => satir.trim())
    .filter(Boolean)
    .slice(0, 40)
    .map((satir) => {
      const parcalar = satir.split('|').map((p) => p.trim());
      return { title: parcalar.shift() ?? '', items: parcalar.filter(Boolean).slice(0, 40) };
    })
    .filter((g) => g.title || g.items.length);
}

/** Grupları düzenlenebilir metne geri çevirir. */
export function menuToText(groups: MenuGroup[] | undefined): string {
  return (groups ?? []).map((g) => [g.title, ...g.items].join(' | ')).join('\n');
}

/** Çok satırlı metni temiz bir listeye çevirir. */
export function toLines(text: string): string[] {
  return text
    .split(/\r\n|\r|\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 60);
}

/** Çakışmayan, okunur kimlik: salon-1, salon-2 … */
export function nextId(prefix: string, mevcut: string[]): string {
  let i = mevcut.length + 1;
  let id = `${prefix}-${i}`;
  while (mevcut.includes(id)) {
    i += 1;
    id = `${prefix}-${i}`;
  }
  return id;
}

/**
 * Davetiyenin kullanacağı salon.
 *
 * Seçim yoksa ya da seçilen salon silinmişse İLK salona düşülür; hiç salon
 * yoksa boş iskelet döner.
 */
export function venueFor(venues: Venue[], venueId: string): Venue {
  return venues.find((v) => v.id === venueId) ?? venues[0] ?? { ...EMPTY_VENUE };
}
