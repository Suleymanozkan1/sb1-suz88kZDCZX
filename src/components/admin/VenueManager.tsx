'use client';

import { useEffect, useState } from 'react';
import { Action, PanelSection, Row } from './ui';
import { IconArrow, IconCheck } from '@/components/invitation/Ornaments';
import * as api from '@/lib/api';
import { EMPTY_VENUE, type Venue } from '@/lib/settings';

/**
 * Salonlar — yalnızca yönetici panelinde.
 *
 * Adresi her çifte ayrı ayrı sormak bir hata kaynağıydı: bir çift yanlış
 * yazdığında yalnızca kendi misafirleri yanlış yere gidiyor, kimse fark
 * etmiyordu. Bir dönem tek ortak salon vardı; işletmenin birden fazla
 * salonu olunca o da yanlış oldu. Artık liste: yönetici tanımlıyor, çift
 * aralarından SEÇİYOR — yazmıyor.
 */
function Alan({
  label,
  value,
  onChange,
  placeholder,
  rows,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      {rows ? (
        <textarea
          rows={rows}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="field resize-none"
        />
      ) : (
        <input
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="field"
        />
      )}
      {hint && (
        <span className="mt-2 block text-xs" style={{ color: 'var(--c-on-dark-faint)' }}>
          {hint}
        </span>
      )}
    </label>
  );
}

type Taslak = Omit<Venue, 'features'> & { features: string };

const BOS: Taslak = { ...EMPTY_VENUE, features: '' };

export default function VenueManager({ n }: { n: number }) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [draft, setDraft] = useState<Taslak>(BOS);
  const [yuklendi, setYuklendi] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    api
      .getSettings()
      .then((s) => setVenues(s.venues))
      .catch((err) => setError(err instanceof Error ? err.message : 'Salonlar okunamadı'))
      .finally(() => setYuklendi(true));
  }, []);

  const set = (key: keyof Taslak, value: string) => setDraft((v) => ({ ...v, [key]: value }));

  function duzenle(venue: Venue) {
    setDraft({ ...venue, features: venue.features.join('\n') });
    setDone(false);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const s = await api.saveVenue(draft);
      setVenues(s.venues);
      setDraft(BOS);
      setDone(true);
      window.setTimeout(() => setDone(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kaydedilemedi');
    } finally {
      setBusy(false);
    }
  }

  async function sil(id: string) {
    if (!window.confirm('Salon silinecek. Bu salonu seçmiş davetiyeler ilk salona düşer.')) return;
    try {
      setVenues((await api.deleteVenue(id)).venues);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Silinemedi');
    }
  }

  return (
    <PanelSection
      n={n}
      label="Salonlar"
      title={draft.id ? 'Salonu Düzenle' : 'Yeni Salon'}
      lead="Çift, davetiyesini hazırlarken buradaki salonlardan birini seçer."
    >
      {!yuklendi ? (
        <p className="t-body" style={{ color: 'var(--c-on-dark-faint)' }}>
          Yükleniyor…
        </p>
      ) : (
        <>
          <form onSubmit={submit} className="space-y-4">
            <Alan
              label="Salon Adı *"
              value={draft.venueName}
              placeholder="Sahra Bahçe Düğün Salonu"
              onChange={(v) => set('venueName', v)}
            />
            <Alan
              label="Adres"
              value={draft.address}
              placeholder="Bağdat Caddesi No 120"
              onChange={(v) => set('address', v)}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Alan label="İlçe" value={draft.district} placeholder="Kadıköy" onChange={(v) => set('district', v)} />
              <Alan label="İl" value={draft.city} placeholder="İstanbul" onChange={(v) => set('city', v)} />
            </div>
            <Alan
              label="Google Maps Linki"
              value={draft.mapUrl}
              placeholder="https://maps.google.com/..."
              onChange={(v) => set('mapUrl', v)}
            />

            {/*
              Salonun özellikleri MİSAFİR için yazılır, işletme için değil.
              "Kapalı otopark", "Metroya 5 dk", "Çocuk oyun alanı" misafirin
              o akşam vereceği kararları etkiliyor; "1200 kişilik kapasite"
              etkilemiyor.
            */}
            <Alan
              label="Misafirin İşine Yarayacak Bilgiler"
              value={draft.features}
              rows={5}
              placeholder={'Kapalı otopark (ücretsiz)\nVale hizmeti\nMetroya 5 dk yürüme\nEngelli erişimi\nÇocuk oyun alanı ve palyaço'}
              hint="Her satır bir madde. Davetiyenin konum bölümünde liste olarak görünür."
              onChange={(v) => set('features', v)}
            />

            {error && (
              <p className="t-body" style={{ color: '#e2a3a3' }}>
                {error}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4">
              <button type="submit" className="cta" disabled={busy}>
                {busy ? 'Kaydediliyor…' : draft.id ? 'Kaydet' : 'Salon Ekle'}
                <IconArrow size={14} />
              </button>
              {draft.id && <Action onClick={() => setDraft(BOS)}>Vazgeç</Action>}
              {done && (
                <span className="flex items-center gap-2 t-body" style={{ color: 'var(--c-gold)' }} role="status">
                  <IconCheck size={14} />
                  Bu salonu kullanan davetiyelerde güncellendi
                </span>
              )}
            </div>
          </form>

          <div className="mt-[var(--sp-md)]">
            {venues.length === 0 ? (
              <p className="t-body" style={{ color: 'var(--c-on-dark-faint)' }}>
                Henüz salon yok. Yukarıdan ilk salonu ekleyin.
              </p>
            ) : (
              venues.map((v, i) => (
                <Row key={v.id} index={i} last={i === venues.length - 1}>
                  <h3 className="t-lead" style={{ color: 'var(--c-on-dark)' }}>
                    {v.venueName}
                  </h3>
                  <p className="mt-2 text-sm" style={{ color: 'var(--c-on-dark-faint)' }}>
                    {[v.address, v.district, v.city].filter(Boolean).join(', ')}
                    {v.features.length > 0 && ` · ${v.features.length} bilgi`}
                  </p>
                  <div className="mt-[var(--sp-sm)] flex flex-wrap gap-x-6 gap-y-3">
                    <Action onClick={() => duzenle(v)}>Düzenle</Action>
                    <Action onClick={() => sil(v.id)} danger>
                      Sil
                    </Action>
                  </div>
                </Row>
              ))
            )}
          </div>
        </>
      )}
    </PanelSection>
  );
}
