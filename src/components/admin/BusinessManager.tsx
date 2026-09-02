'use client';

import { useEffect, useState } from 'react';
import { PanelSection } from './ui';
import { IconArrow, IconCheck } from '@/components/invitation/Ornaments';
import * as api from '@/lib/api';
import { DEFAULT_LIFECYCLE, type Brand, type Lifecycle } from '@/lib/settings';

/**
 * İşletme ayarları — yalnızca yönetici.
 *
 * İki şey: işletmenin kendi Instagram hesabı (her davetiyenin etiketleme
 * bölümünde görünür) ve davetiyenin ömrü.
 */
export default function BusinessManager({ n }: { n: number }) {
  const [brand, setBrand] = useState<Brand>({ instagram: '', instagramLabel: '' });
  const [life, setLife] = useState<Lifecycle>(DEFAULT_LIFECYCLE);
  const [yuklendi, setYuklendi] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    api
      .getSettings()
      .then((s) => {
        setBrand(s.brand);
        setLife(s.lifecycle);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Ayarlar okunamadı'))
      .finally(() => setYuklendi(true));
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.saveBrand(brand);
      const s = await api.saveLifecycle(life);
      setLife(s.lifecycle);
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
      label="İşletme"
      title="Hesabımız & Davetiye Ömrü"
      lead="Instagram hesabınız her davetiyenin etiketleme bölümünde görünür."
    >
      {!yuklendi ? (
        <p className="t-body" style={{ color: 'var(--c-on-dark-faint)' }}>
          Yükleniyor…
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="field-label">Görünecek Ad</span>
              <input
                value={brand.instagramLabel}
                placeholder="@sahradavet"
                onChange={(e) => setBrand((b) => ({ ...b, instagramLabel: e.target.value }))}
                className="field"
              />
            </label>
            <label className="block">
              <span className="field-label">Instagram Adresi</span>
              <input
                type="url"
                value={brand.instagram}
                placeholder="https://instagram.com/sahradavet"
                onChange={(e) => setBrand((b) => ({ ...b, instagram: e.target.value }))}
                className="field"
              />
            </label>
          </div>

          {/*
            İki kademe, bilerek. Düğün bitince davetiye kimseye lazım değil:
            link elden ele dolaşmaya devam ediyor ve çiftin adresi, telefonu,
            IBAN'ı süresiz açıkta kalıyordu. Ama misafir fotoğrafları çiftin
            düğün albümü — onları da aynı gün silmek, albümünü indirmeyi
            unutan çiftin fotoğraflarını yok etmekti.
          */}
          <div className="pt-[var(--sp-sm)]">
            <span className="rule-dark mb-[var(--sp-sm)] block" aria-hidden />
            <span className="field-label">Davetiye Ne Kadar Açık Kalsın?</span>
            <p className="t-body mb-4" style={{ color: 'var(--c-on-dark-faint)' }}>
              Önce link kapanır, veriler panelde durur. Kalıcı silme çok daha sonra.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="field-label">Düğünden Kaç Gün Sonra Yayından Kalksın?</span>
                <input
                  type="number"
                  min={0}
                  max={365}
                  value={life.unpublishDays}
                  onChange={(e) => setLife((l) => ({ ...l, unpublishDays: Number(e.target.value) }))}
                  className="field"
                />
                <span className="mt-2 block text-xs" style={{ color: 'var(--c-on-dark-faint)' }}>
                  1 = düğünün ertesi günü. 0 = düğün günü.
                </span>
              </label>

              <label className="block">
                <span className="field-label">Yayından Kalktıktan Kaç Gün Sonra Silinsin?</span>
                <input
                  type="number"
                  min={1}
                  max={3650}
                  value={life.deleteDays}
                  onChange={(e) => setLife((l) => ({ ...l, deleteDays: Number(e.target.value) }))}
                  className="field"
                />
                <span className="mt-2 block text-xs" style={{ color: 'var(--c-on-dark-faint)' }}>
                  Davetiye, misafir fotoğrafları, katılımlar ve dilekler kalıcı silinir.
                </span>
              </label>
            </div>

            <label className="mt-4 flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={life.deleteEnabled}
                onChange={(e) => setLife((l) => ({ ...l, deleteEnabled: e.target.checked }))}
              />
              <span className="t-body" style={{ color: 'var(--c-on-dark)' }}>
                Kalıcı silme açık
              </span>
            </label>
          </div>

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
                Kaydedildi
              </span>
            )}
          </div>
        </form>
      )}
    </PanelSection>
  );
}
