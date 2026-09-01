import { venueFor, type Settings, type Venue } from './settings';
import type { Invitation } from './types';

/**
 * Mekân — davetiyede DEĞİL, ayarda durur.
 *
 * Eskiden her davetiyenin kendi salon/adres alanları vardı ve çift bunları
 * sihirbazdan yazıyordu. Bu bir hata kaynağıydı: bir çift adresi yanlış
 * yazdığında yalnızca kendi misafirleri yanlış yere gidiyor ve kimse fark
 * etmiyordu. Sonra tek bir ortak salon oldu; işletmenin birden fazla salonu
 * olunca o da yanlış oldu. Şimdi çift, yöneticinin tanımladığı salonlar
 * arasından SEÇİYOR — yazmıyor.
 *
 * Alan adları davetiyedekilerle bilerek aynı; böylece değer okuma anında
 * davetiyenin üstüne yazılabiliyor ve hiçbir bölümün kodu değişmiyor.
 */

/** Davetiyenin üstüne yazılan mekân alanları. */
const VENUE_KEYS = ['venueName', 'address', 'district', 'city', 'mapUrl'] as const;

/** Davetiyenin mekân alanlarını, SEÇTİĞİ salondan doldurur. */
export function applyVenue<T extends Invitation>(invitation: T, settings: Settings): T {
  const salon = venueFor(settings.venues, invitation.venueId);
  const out = { ...invitation } as T;

  for (const key of VENUE_KEYS) {
    (out as Record<string, unknown>)[key] = salon[key];
  }
  out.venueFeatures = salon.features;
  // Salon silinmişse ilkine düşüldü; davetiye artık onu göstersin.
  out.venueId = salon.id || invitation.venueId;

  return out;
}

/** Çiftten gelen gövdeden mekân alanlarını düşürür. */
export function stripVenue<T extends Record<string, unknown>>(input: T): T {
  const kopya = { ...input };
  for (const alan of VENUE_KEYS) delete kopya[alan];
  delete kopya.venueFeatures;
  return kopya;
}

export type { Venue };
