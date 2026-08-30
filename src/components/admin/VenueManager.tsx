'use client';

import { useEffect, useState } from 'react';
import { PanelSection } from './ui';
import { IconArrow, IconCheck } from '@/components/invitation/Ornaments';
import * as api from '@/lib/api';
import { EMPTY_VENUE, type Venue } from '@/lib/venue';

/**
 * Ortak mekân — yalnızca yönetici panelinde.
 *
 * Tek salonda çalışan bir işletmede her çifte adresi ayrı ayrı sormak hem
 * gereksiz hem riskliydi: bir çift yanlış yazdığında yalnızca kendi
 * misafirleri yanlış yere gidiyor, kimse fark etmiyordu. Adres artık tek
 * yerde duruyor ve buradan değiştirilince yayındaki bütün davetiyelerde
 * aynı anda güncelleniyor.
 */
function Alan({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="field"
      />
    </label>
  );
}

export default function VenueManager({ n }: { n: number }) {
  const [venue, setVenue] = useState<Venue>(EMPTY_VENUE);
  const [yuklendi, setYuklendi] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    api
      .getVenue()
      .then(setVenue)
      .catch((err) => setError(err instanceof Error ? err.message : 'Mekân okunamadı'))
      .finally(() => setYuklendi(true));
  }, []);

  const set = (key: keyof Venue, value: string) => setVenue((v) => ({ ...v, [key]: value }));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      setVenue(await api.saveVenue(venue));
      setDone(true);
      window.setTimeout(() => setDone(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kaydedilemedi');
    } finally {
      setBusy(false);
    }
  }

  return (
    <PanelSection
      n={n}
      label="Mekân"
      title="Düğün Salonu"
      lead="Buradaki bilgi tüm davetiyelerde görünür; çift hesapları değiştiremez."
    >
      {!yuklendi ? (
        <p className="t-body" style={{ color: 'var(--c-on-dark-faint)' }}>
          Yükleniyor…
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Alan
            label="Salon / Mekân Adı *"
            value={venue.venueName}
            placeholder="Sahra Bahçe Düğün Salonu"
            onChange={(v) => set('venueName', v)}
          />
          <Alan
            label="Adres"
            value={venue.address}
            placeholder="Bağdat Caddesi No 120"
            onChange={(v) => set('address', v)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Alan
              label="İlçe"
              value={venue.district}
              placeholder="Kadıköy"
              onChange={(v) => set('district', v)}
            />
            <Alan
              label="İl"
              value={venue.city}
              placeholder="İstanbul"
              onChange={(v) => set('city', v)}
            />
          </div>
          <Alan
            label="Google Maps Linki"
            value={venue.mapUrl}
            placeholder="https://maps.google.com/..."
            onChange={(v) => set('mapUrl', v)}
          />

          {error && (
            <p className="t-body" style={{ color: '#e2a3a3' }}>
              {error}
            </p>
          )}

          <div className="flex items-center gap-4">
            <button type="submit" className="cta" disabled={busy}>
              {busy ? 'Kaydediliyor…' : 'Kaydet'}
              <IconArrow size={14} />
            </button>
            {done && (
              <span
                className="flex items-center gap-2 t-body"
                style={{ color: 'var(--c-gold)' }}
                role="status"
              >
                <IconCheck size={14} />
                Tüm davetiyelerde güncellendi
              </span>
            )}
          </div>
        </form>
      )}
    </PanelSection>
  );
}
