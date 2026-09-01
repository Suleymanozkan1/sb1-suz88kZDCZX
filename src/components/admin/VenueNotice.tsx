'use client';

import { useEffect, useState } from 'react';
import * as api from '@/lib/api';
import type { Venue } from '@/lib/venue';

/**
 * Sihirbazdaki mekân bilgisi — okunur, düzenlenemez.
 *
 * Salon tüm davetiyelerde ortak olduğu için çifte sorulmuyor. Yine de
 * davetiyede hangi adresin görüneceğini burada göstermek gerekiyor: alanı
 * tamamen kaldırmak, çiftin adresin doğru olup olmadığını hiç görememesi
 * demekti.
 */
export default function VenueNotice() {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [hata, setHata] = useState(false);

  useEffect(() => {
    api
      .getVenue()
      .then(setVenue)
      .catch(() => setHata(true));
  }, []);

  if (hata) return null;

  const satirlar = venue
    ? [venue.venueName, venue.address, [venue.district, venue.city].filter(Boolean).join(', ')].filter(
        Boolean,
      )
    : [];

  return (
    <div className="rounded-sm border border-[color:var(--c-rule)] p-4">
      <p className="field-label">Mekân</p>

      {!venue ? (
        <p className="mt-2 text-sm opacity-70">Yükleniyor…</p>
      ) : satirlar.length > 0 ? (
        <div className="mt-2 space-y-0.5">
          {satirlar.map((satir) => (
            <p key={satir} className="text-sm">
              {satir}
            </p>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm opacity-70">Henüz belirlenmedi.</p>
      )}
    </div>
  );
}
