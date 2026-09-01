'use client';

import { useEffect, useState } from 'react';
import { venueFor, type Venue } from '@/lib/settings';
import * as api from '@/lib/api';

/**
 * Sihirbazdaki salon seçimi.
 *
 * Adres çiftin YAZDIĞI bir şey değil: yanlış yazan bir çiftin misafirleri
 * yanlış yere gidiyor ve kimse fark etmiyordu. Yönetici salonları
 * tanımlıyor, çift aralarından seçiyor — ve hangi adresin davetiyede
 * görüneceğini seçerken görüyor.
 */
export default function VenuePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const [venues, setVenues] = useState<Venue[] | null>(null);

  useEffect(() => {
    api
      .getSettings()
      .then((s) => setVenues(s.venues))
      .catch(() => setVenues([]));
  }, []);

  if (venues === null) {
    return (
      <div>
        <span className="field-label">Salon *</span>
        <p className="mt-2 text-sm opacity-70">Yükleniyor…</p>
      </div>
    );
  }

  if (venues.length === 0) {
    return (
      <div>
        <span className="field-label">Salon *</span>
        <p className="mt-2 text-sm" style={{ color: '#e2a3a3' }}>
          Henüz salon tanımlanmadı. Yöneticiden salon eklemesini isteyin.
        </p>
      </div>
    );
  }

  const secili = venueFor(venues, value);

  return (
    <label className="block">
      <span className="field-label">Salon *</span>
      <select
        value={secili.id}
        onChange={(e) => onChange(e.target.value)}
        className="field"
      >
        {venues.map((v) => (
          <option key={v.id} value={v.id}>
            {v.venueName}
            {[v.district, v.city].filter(Boolean).length > 0 &&
              ` — ${[v.district, v.city].filter(Boolean).join(', ')}`}
          </option>
        ))}
      </select>
      <span className="mt-2 block text-xs" style={{ color: 'var(--c-on-dark-faint)' }}>
        {[secili.address, secili.district, secili.city].filter(Boolean).join(', ')}
      </span>
    </label>
  );
}
