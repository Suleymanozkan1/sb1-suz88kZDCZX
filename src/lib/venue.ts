import type { Invitation } from './types';

/**
 * Mekân — tüm davetiyelerde ortak, yalnızca yönetici değiştirir.
 *
 * Eskiden her davetiyenin kendi salon/adres alanları vardı ve çift bunları
 * sihirbazdan düzenleyebiliyordu. Tek bir mekânda çalışan bir işletme için
 * bu hem gereksiz bir soru hem de bir hata kaynağıydı: bir çift adresi yanlış
 * yazdığında yalnızca kendi misafirleri yanlış yere gidiyordu.
 *
 * Alan adları davetiyedekilerle bilerek aynı tutuldu; böylece değer okuma
 * anında davetiyenin üstüne yazılabiliyor ve hiçbir bölümün kodu değişmiyor.
 */
export type Venue = Pick<Invitation, 'venueName' | 'address' | 'district' | 'city' | 'mapUrl'>;

export const EMPTY_VENUE: Venue = {
  venueName: '',
  address: '',
  district: '',
  city: '',
  mapUrl: '',
};

/** Davetiyenin mekân alanlarını ortak ayarla değiştirir. */
export function applyVenue<T extends Invitation>(invitation: T, venue: Venue): T {
  return { ...invitation, ...venue };
}

/** Çiftten gelen gövdeden mekân alanlarını düşürür. */
export function stripVenue<T extends Record<string, unknown>>(input: T): T {
  const kopya = { ...input };
  for (const alan of Object.keys(EMPTY_VENUE)) delete kopya[alan];
  return kopya;
}
