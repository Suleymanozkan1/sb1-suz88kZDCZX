'use client';

import { useEffect, useState } from 'react';
import { Action, PanelSection, Row } from './ui';
import { IconArrow, IconCheck } from '@/components/invitation/Ornaments';
import * as api from '@/lib/api';
import { menuToText, type Menu } from '@/lib/settings';

/**
 * Menüler — yalnızca yönetici panelinde.
 *
 * İşletmenin basılı menü kartındaki menüler burada duruyor. Çift bunlardan
 * birini seçip kendi davetiyesinde üstünde oynayabiliyor; buradaki asıl
 * kayıt değişmiyor.
 *
 * Fiyat BİLEREK yok: davetiye misafire gidiyor, fiyat çiftle işletme
 * arasındaki mesele. Menünün adı da davetiyede görünmüyor.
 */
export default function MenuManager({ n }: { n: number }) {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [groups, setGroups] = useState('');
  const [yuklendi, setYuklendi] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    api
      .getSettings()
      .then((s) => setMenus(s.menus))
      .catch((err) => setError(err instanceof Error ? err.message : 'Menüler okunamadı'))
      .finally(() => setYuklendi(true));
  }, []);

  function temizle() {
    setId('');
    setName('');
    setGroups('');
  }

  function duzenle(menu: Menu) {
    setId(menu.id);
    setName(menu.name);
    setGroups(menuToText(menu.groups));
    setDone(false);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const s = await api.saveMenu({ id, name, groups });
      setMenus(s.menus);
      temizle();
      setDone(true);
      window.setTimeout(() => setDone(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kaydedilemedi');
    } finally {
      setBusy(false);
    }
  }

  async function sil(menuId: string) {
    if (!window.confirm('Menü silinecek. Bu menüyü seçmiş davetiyelerin içeriği yerinde kalır.'))
      return;
    try {
      setMenus((await api.deleteMenu(menuId)).menus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Silinemedi');
    }
  }

  return (
    <PanelSection
      n={n}
      label="Menüler"
      title={id ? 'Menüyü Düzenle' : 'Yeni Menü'}
      lead="Menünün adı yalnızca panelde görünür; davetiyede başlık yalnızca “Menü” olur."
    >
      {!yuklendi ? (
        <p className="t-body" style={{ color: 'var(--c-on-dark-faint)' }}>
          Yükleniyor…
        </p>
      ) : (
        <>
          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="field-label">Menü Adı *</span>
              <input
                value={name}
                placeholder="Menü 3"
                onChange={(e) => setName(e.target.value)}
                className="field"
              />
            </label>

            <label className="block">
              <span className="field-label">Menü İçeriği</span>
              <textarea
                rows={9}
                value={groups}
                onChange={(e) => setGroups(e.target.value)}
                placeholder={
                  'ORDÖVR TABAĞI | Amerikan salatası | Kısır | Haydari\nANA YEMEK | Et kavurma | Tereyağlı pirinç pilavı\nTATLI | Dondurmalı pasta veya 2 dilim baklava'
                }
                className="field resize-none"
              />
              <span className="mt-2 block text-xs" style={{ color: 'var(--c-on-dark-faint)' }}>
                Her satır bir grup: başlık | öğe | öğe | öğe
              </span>
            </label>

            {error && (
              <p className="t-body" style={{ color: '#e2a3a3' }}>
                {error}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4">
              <button type="submit" className="cta" disabled={busy}>
                {busy ? 'Kaydediliyor…' : id ? 'Kaydet' : 'Menü Ekle'}
                <IconArrow size={14} />
              </button>
              {id && <Action onClick={temizle}>Vazgeç</Action>}
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

          <div className="mt-[var(--sp-md)]">
            {menus.length === 0 ? (
              <p className="t-body" style={{ color: 'var(--c-on-dark-faint)' }}>
                Henüz menü yok.
              </p>
            ) : (
              menus.map((m, i) => (
                <Row key={m.id} index={i} last={i === menus.length - 1}>
                  <h3 className="t-lead" style={{ color: 'var(--c-on-dark)' }}>
                    {m.name}
                  </h3>
                  <p className="mt-2 text-sm" style={{ color: 'var(--c-on-dark-faint)' }}>
                    {m.groups
                      .slice(0, 4)
                      .map((g) => g.title)
                      .join(' · ')}
                    {m.groups.length > 0 && ` · ${m.groups.length} grup`}
                  </p>
                  <div className="mt-[var(--sp-sm)] flex flex-wrap gap-x-6 gap-y-3">
                    <Action onClick={() => duzenle(m)}>Düzenle</Action>
                    <Action onClick={() => sil(m.id)} danger>
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
