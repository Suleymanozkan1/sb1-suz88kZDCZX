/**
 * Hazır ses kataloğu.
 *
 * Dosyalar `public/muzik/` altında, depoda durur. Dışarıdan bağlanmıyorlar:
 * projedeki eski varsayılan adres (mixkit) bugün 403 döndüğü için müzik hiç
 * çalmıyordu. Parçalar `scripts/muzik_uret.py` ile üretilmiştir; telif
 * kısıtı yoktur ve kimsenin sunucusuna bağımlı değildir.
 */

export interface Track {
  id: string;
  url: string;
  label: string;
  description: string;
}

export const MUSIC_TRACKS: Track[] = [
  {
    id: 'piyano-sakin',
    url: '/muzik/piyano-sakin.mp3',
    label: 'Piyano — Sakin',
    description: 'Sıcak ve sade piyano; en çok tercih edilen doku.',
  },
  {
    id: 'arp-zarif',
    url: '/muzik/arp-zarif.mp3',
    label: 'Arp — Zarif',
    description: 'İnce, ışıltılı arpej. Daha hafif bir hava.',
  },
  {
    id: 'yayli-duygusal',
    url: '/muzik/yayli-duygusal.mp3',
    label: 'Yaylılar — Duygusal',
    description: 'Yaylı yastığı üzerine yavaş ezgi.',
  },
  {
    id: 'anadolu-ney',
    url: '/muzik/anadolu-ney.mp3',
    label: 'Ney & Kanun — Anadolu',
    description: 'Nihavend dokusunda kanun ve ney.',
  },
];

export const SEAL_SOUNDS: Track[] = [
  {
    id: 'muhur-kirilma',
    url: '/muzik/muhur-kirilma.mp3',
    label: 'Mühür Kırılması',
    description: 'Kısa çatlama ve ardından yumuşak çan.',
  },
];

export const ENVELOPE_SOUNDS: Track[] = [
  {
    id: 'zarf-acilma',
    url: '/muzik/zarf-acilma.mp3',
    label: 'Zarf Açılması',
    description: 'Hafif kâğıt hışırtısı.',
  },
];

export const DEFAULT_MUSIC_URL = MUSIC_TRACKS[0].url;

/** Bir adresin katalogdaki hazır parçalardan biri olup olmadığı. */
export function isPreset(url: string, list: Track[]): boolean {
  return list.some((t) => t.url === url);
}
