'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import ImageUploader from './ImageUploader';
import * as api from '@/lib/api';
import {
  CONJUNCTION_OPTIONS,
  DEFAULT_FAQ_ITEMS,
  DEFAULT_PROGRAM_ITEMS,
  DEFAULT_STORY_ITEMS,
  DESIGN_OPTIONS,
  READY_TEXTS,
  SEAL_OPTIONS,
  THEME_OPTIONS,
  emptyInvitation,
} from '@/lib/defaults';
import { slugify } from '@/lib/slug';
import type {
  FaqItem,
  Invitation,
  InvitationDesign,
  ProgramItem,
  SealType,
  StoryItem,
  ThemeId,
} from '@/lib/types';

const STEPS = [
  'Çift Bilgileri',
  'Düğün Bilgileri',
  'Davet Metni',
  'Manevi İçerik',
  'Mühür & Tuğra',
  'Mektup Tasarımı',
  'Fotoğraflar',
  'Ses Ayarları',
  'Tema',
  'Program',
  'SSS',
  'Hikayemiz',
] as const;

type Draft = Omit<Invitation, 'id' | 'createdAt' | 'updatedAt'>;

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="field"
      />
    </label>
  );
}

function Area({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <textarea
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="field resize-none"
      />
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-xl px-4 py-3 transition-all"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${checked ? 'rgba(201,168,76,0.45)' : 'rgba(201,168,76,0.15)'}`,
      }}
    >
      <span className="font-sans text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
        {label}
      </span>
      <span
        className="relative h-6 w-11 rounded-full transition-all"
        style={{ background: checked ? '#C9A84C' : 'rgba(255,255,255,0.12)' }}
      >
        <span
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all"
          style={{ left: checked ? 22 : 2 }}
        />
      </span>
    </button>
  );
}

function RowActions({ onRemove }: { onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="shrink-0 rounded-lg px-3 py-2 font-sans text-xs"
      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f0a3a3' }}
    >
      Sil
    </button>
  );
}

export default function InvitationForm({ existing }: { existing?: Invitation }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);

  const [draft, setDraft] = useState<Draft>(() => {
    if (!existing) return emptyInvitation();
    const { id, createdAt, updatedAt, ...rest } = existing;
    return rest;
  });

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const previewSlug = useMemo(
    () => draft.slug || slugify(`${draft.groomName}-${draft.brideName}`) || 'davetiye',
    [draft.slug, draft.groomName, draft.brideName],
  );

  const canSave = draft.brideName.trim() !== '' && draft.groomName.trim() !== '';

  async function save() {
    if (!canSave) {
      setError('Gelin ve damat adı zorunludur.');
      setStep(0);
      return;
    }

    setSaving(true);
    setError('');
    try {
      if (existing) {
        await api.updateInvitation(existing.id, draft);
        router.push('/admin');
        router.refresh();
      } else {
        const created = await api.createInvitation(draft);
        setCreatedSlug(created.slug);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kaydedilemedi');
    } finally {
      setSaving(false);
    }
  }

  /* ------------------------------------------------------------ liste düzenleyiciler */

  function updateList<T>(key: keyof Draft, index: number, patch: Partial<T>) {
    const list = [...((draft[key] as unknown as T[]) ?? [])];
    list[index] = { ...list[index], ...patch };
    set(key, list as Draft[typeof key]);
  }

  function removeFromList(key: keyof Draft, index: number) {
    const list = [...((draft[key] as unknown as unknown[]) ?? [])];
    list.splice(index, 1);
    set(key, list as Draft[typeof key]);
  }

  function appendToList<T>(key: keyof Draft, item: T) {
    const list = [...((draft[key] as unknown as T[]) ?? []), item];
    set(key, list as Draft[typeof key]);
  }

  /* ------------------------------------------------------------------- adım panelleri */

  const panels: React.ReactNode[] = [
    /* 0 — Çift Bilgileri */
    <div key="couple" className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Gelin Adı *" value={draft.brideName} placeholder="Ayşe" onChange={(v) => set('brideName', v)} />
        <Field label="Damat Adı *" value={draft.groomName} placeholder="Mehmet" onChange={(v) => set('groomName', v)} />
        <Field label="Gelin Soyadı" value={draft.brideSurname} placeholder="Yılmaz" onChange={(v) => set('brideSurname', v)} />
        <Field label="Damat Soyadı" value={draft.groomSurname} placeholder="Kaya" onChange={(v) => set('groomSurname', v)} />
      </div>

      <div>
        <span className="field-label">Başlıkta Nasıl Gösterilsin?</span>
        <div className="grid gap-2 sm:grid-cols-2">
          {CONJUNCTION_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => set('conjunction', option.id)}
              className="rounded-xl px-4 py-3 text-left font-sans text-sm transition-all"
              style={{
                background: draft.conjunction === option.id ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${draft.conjunction === option.id ? 'rgba(201,168,76,0.5)' : 'rgba(201,168,76,0.15)'}`,
                color: 'rgba(255,255,255,0.8)',
              }}
            >
              <span className="block text-[10px] uppercase tracking-[0.2em]" style={{ color: '#9A7B2F' }}>
                Örnek
              </span>
              {option.example}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-card">
        <span className="field-label">Önizleme</span>
        <p className="font-serif text-2xl font-light gold-text">
          {draft.groomName || 'Damat'} {draft.conjunction} {draft.brideName || 'Gelin'}
        </p>
        <p className="mt-2 font-sans text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
          /davet/{previewSlug}
        </p>
      </div>

      <Field
        label="Bağlantı Adresi (slug)"
        value={draft.slug}
        placeholder={previewSlug}
        onChange={(v) => set('slug', v)}
      />
    </div>,

    /* 1 — Düğün Bilgileri */
    <div key="wedding" className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Düğün Tarihi *" type="date" value={draft.weddingDate} onChange={(v) => set('weddingDate', v)} />
        <Field label="Saat *" type="time" value={draft.weddingTime} onChange={(v) => set('weddingTime', v)} />
      </div>
      <Field label="Salon / Mekân Adı *" value={draft.venueName} placeholder="The Grand Ballroom" onChange={(v) => set('venueName', v)} />
      <Field label="Adres" value={draft.address} placeholder="Atatürk Cad. No:1" onChange={(v) => set('address', v)} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="İl *" value={draft.city} placeholder="İstanbul" onChange={(v) => set('city', v)} />
        <Field label="İlçe" value={draft.district} placeholder="Beşiktaş" onChange={(v) => set('district', v)} />
      </div>
      <Field label="Google Maps Linki" value={draft.mapUrl} placeholder="https://maps.google.com/..." onChange={(v) => set('mapUrl', v)} />
      <Field
        label="Katılım Bildirim Son Tarihi"
        type="date"
        value={draft.rsvpDeadline}
        onChange={(v) => set('rsvpDeadline', v)}
      />
    </div>,

    /* 2 — Davet Metni */
    <div key="text" className="space-y-4">
      <div>
        <span className="field-label">Hazır Metinler</span>
        <div className="space-y-2">
          {READY_TEXTS.map((ready) => (
            <button
              key={ready.label}
              type="button"
              onClick={() => set('invitationText', ready.text)}
              className="w-full rounded-xl p-4 text-left transition-all"
              style={{
                background: draft.invitationText === ready.text ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${draft.invitationText === ready.text ? 'rgba(201,168,76,0.45)' : 'rgba(201,168,76,0.15)'}`,
              }}
            >
              <span className="block font-sans text-[10px] uppercase tracking-[0.2em]" style={{ color: '#9A7B2F' }}>
                {ready.label}
              </span>
              <span className="mt-1 block font-serif text-sm font-light italic" style={{ color: 'rgba(255,255,255,0.75)' }}>
                {ready.text}
              </span>
            </button>
          ))}
        </div>
      </div>

      <Area
        label="Veya Kendi Metninizi Yazın"
        rows={5}
        value={draft.invitationText}
        placeholder="Davet metninizi buraya yazın..."
        onChange={(v) => set('invitationText', v)}
      />
    </div>,

    /* 3 — Manevi İçerik */
    <div key="religious" className="space-y-3">
      <Toggle label="Besmele Göster" checked={draft.showBesmele} onChange={(v) => set('showBesmele', v)} />
      <Toggle label="Ayet Göster" checked={draft.showAyet} onChange={(v) => set('showAyet', v)} />
      <Toggle label="Hadis Göster" checked={draft.showHadis} onChange={(v) => set('showHadis', v)} />
      <Area label="Dua Metni" value={draft.duaText} placeholder="İsteğe bağlı dua metni..." onChange={(v) => set('duaText', v)} />
      <Field
        label="Kaynak / Sure Bilgisi"
        value={draft.religiousSource}
        placeholder="Örn: Rum Suresi, 21. Ayet"
        onChange={(v) => set('religiousSource', v)}
      />
    </div>,

    /* 4 — Mühür & Tuğra */
    <div key="seal" className="space-y-4">
      <div>
        <span className="field-label">Mühür Modeli</span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SEAL_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => set('sealType', option.id as SealType)}
              className="rounded-xl px-4 py-3 font-sans text-sm transition-all"
              style={{
                background: draft.sealType === option.id ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${draft.sealType === option.id ? 'rgba(201,168,76,0.5)' : 'rgba(201,168,76,0.15)'}`,
                color: 'rgba(255,255,255,0.8)',
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <Field
        label="Monogram / Baş Harfler"
        value={draft.sealMonogram}
        placeholder="A & M"
        onChange={(v) => set('sealMonogram', v)}
      />

      <ImageUploader
        label="Tuğra / Özel Mühür Görseli (İsteğe Bağlı)"
        value={draft.sealImage}
        onChange={(v) => set('sealImage', v as string)}
      />
    </div>,

    /* 5 — Mektup Tasarımı */
    <div key="design" className="space-y-4">
      <div>
        <span className="field-label">Mektup Tasarımı</span>
        <div className="grid grid-cols-3 gap-2">
          {DESIGN_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => set('invitationDesign', option.id as InvitationDesign)}
              className="rounded-xl px-4 py-3 font-sans text-sm transition-all"
              style={{
                background: draft.invitationDesign === option.id ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${draft.invitationDesign === option.id ? 'rgba(201,168,76,0.5)' : 'rgba(201,168,76,0.15)'}`,
                color: 'rgba(255,255,255,0.8)',
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <ImageUploader
        label="Özel Mektup Görseli (İsteğe Bağlı)"
        value={draft.letterImage}
        onChange={(v) => set('letterImage', v as string)}
      />
    </div>,

    /* 6 — Fotoğraflar */
    <div key="photos" className="space-y-6">
      <ImageUploader
        label="Kapak Fotoğrafı (Giriş manzarası olarak kullanılır)"
        value={draft.coverImage}
        onChange={(v) => set('coverImage', v as string)}
      />
      <ImageUploader
        label="Galeri Fotoğrafları"
        multiple
        value={draft.galleryImages}
        onChange={(v) => set('galleryImages', v as string[])}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Galeri Alt Başlık" value={draft.gallerySectionSubtitle} placeholder="Anılar" onChange={(v) => set('gallerySectionSubtitle', v)} />
        <Field label="Galeri Başlık" value={draft.gallerySectionTitle} placeholder="Fotoğraf Galerisi" onChange={(v) => set('gallerySectionTitle', v)} />
      </div>
    </div>,

    /* 7 — Ses Ayarları */
    <div key="sound" className="space-y-4">
      <Toggle label="Ses Aktif" checked={draft.soundEnabled} onChange={(v) => set('soundEnabled', v)} />
      <Field
        label="Arka Plan Müziği"
        value={draft.backgroundMusicUrl}
        placeholder="Ses dosyası URL'si veya yolunu girin"
        onChange={(v) => set('backgroundMusicUrl', v)}
      />
      <label className="block">
        <span className="field-label">Ses Seviyesi — %{draft.soundVolume}</span>
        <input
          type="range"
          min={0}
          max={100}
          value={draft.soundVolume}
          onChange={(e) => set('soundVolume', Number(e.target.value))}
          className="w-full accent-[#C9A84C]"
        />
      </label>
    </div>,

    /* 8 — Tema */
    <div key="theme">
      <span className="field-label">Tema Seçin</span>
      <div className="grid gap-3 sm:grid-cols-2">
        {THEME_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => set('theme', option.id as ThemeId)}
            className="flex items-center gap-4 rounded-xl p-4 text-left transition-all"
            style={{
              background: draft.theme === option.id ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${draft.theme === option.id ? 'rgba(201,168,76,0.5)' : 'rgba(201,168,76,0.15)'}`,
            }}
          >
            <span
              className="h-10 w-10 shrink-0 rounded-full"
              style={{ background: option.bg, border: `2px solid ${option.accent}` }}
            />
            <span className="font-sans text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>,

    /* 9 — Program */
    <div key="program" className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="field-label mb-0">Düğün Programı</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => set('programItems', DEFAULT_PROGRAM_ITEMS)}
            className="rounded-lg px-3 py-1.5 font-sans text-xs"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.2)', color: 'rgba(255,255,255,0.6)' }}
          >
            Varsayılana Dön
          </button>
          <button
            type="button"
            onClick={() =>
              appendToList<ProgramItem>('programItems', { time: '', title: '', desc: '', icon: '◇' })
            }
            className="rounded-lg px-3 py-1.5 font-sans text-xs"
            style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', color: '#E8D5A3' }}
          >
            + Ekle
          </button>
        </div>
      </div>

      {draft.programItems.map((item, i) => (
        <div key={i} className="admin-card space-y-3">
          <div className="flex gap-3">
            <input
              type="time"
              value={item.time}
              onChange={(e) => updateList<ProgramItem>('programItems', i, { time: e.target.value })}
              className="field flex-1"
              aria-label="Saat"
            />
            <input
              value={item.icon}
              placeholder="◇"
              onChange={(e) => updateList<ProgramItem>('programItems', i, { icon: e.target.value })}
              className="field w-16 text-center"
              aria-label="İkon"
            />
            <RowActions onRemove={() => removeFromList('programItems', i)} />
          </div>
          <input
            value={item.title}
            placeholder="Nikah Töreni"
            onChange={(e) => updateList<ProgramItem>('programItems', i, { title: e.target.value })}
            className="field"
            aria-label="Başlık"
          />
          <input
            value={item.desc}
            placeholder="Kısa açıklama"
            onChange={(e) => updateList<ProgramItem>('programItems', i, { desc: e.target.value })}
            className="field"
            aria-label="Açıklama"
          />
        </div>
      ))}
    </div>,

    /* 10 — SSS */
    <div key="faq" className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="field-label mb-0">Sık Sorulan Sorular</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => set('faqItems', DEFAULT_FAQ_ITEMS)}
            className="rounded-lg px-3 py-1.5 font-sans text-xs"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.2)', color: 'rgba(255,255,255,0.6)' }}
          >
            Varsayılana Dön
          </button>
          <button
            type="button"
            onClick={() => appendToList<FaqItem>('faqItems', { q: '', a: '' })}
            className="rounded-lg px-3 py-1.5 font-sans text-xs"
            style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', color: '#E8D5A3' }}
          >
            + Ekle
          </button>
        </div>
      </div>

      {draft.faqItems.map((item, i) => (
        <div key={i} className="admin-card space-y-3">
          <div className="flex gap-3">
            <input
              value={item.q}
              placeholder="Çocuklar davetli mi?"
              onChange={(e) => updateList<FaqItem>('faqItems', i, { q: e.target.value })}
              className="field flex-1"
              aria-label="Soru"
            />
            <RowActions onRemove={() => removeFromList('faqItems', i)} />
          </div>
          <textarea
            rows={3}
            value={item.a}
            placeholder="Cevabınızı yazın..."
            onChange={(e) => updateList<FaqItem>('faqItems', i, { a: e.target.value })}
            className="field resize-none"
            aria-label="Cevap"
          />
        </div>
      ))}
    </div>,

    /* 11 — Hikayemiz */
    <div key="story" className="space-y-3">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Bölüm Alt Başlık" value={draft.storySectionSubtitle} placeholder="Bizim" onChange={(v) => set('storySectionSubtitle', v)} />
        <Field label="Bölüm Başlık" value={draft.storySectionTitle} placeholder="Hikayemiz" onChange={(v) => set('storySectionTitle', v)} />
      </div>

      <div className="flex items-center justify-between pt-2">
        <span className="field-label mb-0">Hikaye Zaman Tüneli</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => set('storyItems', DEFAULT_STORY_ITEMS)}
            className="rounded-lg px-3 py-1.5 font-sans text-xs"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.2)', color: 'rgba(255,255,255,0.6)' }}
          >
            Varsayılana Dön
          </button>
          <button
            type="button"
            onClick={() =>
              appendToList<StoryItem>('storyItems', {
                year: '',
                title: '',
                desc: '',
                icon: '✦',
                side: draft.storyItems.length % 2 === 0 ? 'left' : 'right',
              })
            }
            className="rounded-lg px-3 py-1.5 font-sans text-xs"
            style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', color: '#E8D5A3' }}
          >
            + Ekle
          </button>
        </div>
      </div>

      <p className="font-sans text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
        Her bir kartı düzenleyin. ♡ Düğün olarak işaretlediğiniz öğe vurgulanarak gösterilir.
      </p>

      {draft.storyItems.map((item, i) => (
        <div key={i} className="admin-card space-y-3">
          <div className="flex gap-3">
            <input
              value={item.year}
              placeholder="Yıl"
              onChange={(e) => updateList<StoryItem>('storyItems', i, { year: e.target.value })}
              className="field w-24"
              aria-label="Yıl"
            />
            <input
              value={item.icon}
              placeholder="✦"
              onChange={(e) => updateList<StoryItem>('storyItems', i, { icon: e.target.value })}
              className="field w-16 text-center"
              aria-label="İkon"
            />
            <select
              value={item.side}
              onChange={(e) =>
                updateList<StoryItem>('storyItems', i, { side: e.target.value as 'left' | 'right' })
              }
              className="field flex-1"
              aria-label="Konum"
            >
              <option value="left">Sol</option>
              <option value="right">Sağ</option>
            </select>
            <RowActions onRemove={() => removeFromList('storyItems', i)} />
          </div>
          <input
            value={item.title}
            placeholder="İlk Tanışma"
            onChange={(e) => updateList<StoryItem>('storyItems', i, { title: e.target.value })}
            className="field"
            aria-label="Başlık"
          />
          <textarea
            rows={2}
            value={item.desc}
            placeholder="Kısa hikaye açıklaması..."
            onChange={(e) => updateList<StoryItem>('storyItems', i, { desc: e.target.value })}
            className="field resize-none"
            aria-label="Açıklama"
          />
          <Toggle
            label="Düğün (öne çıkan)"
            checked={!!item.highlight}
            onChange={(v) => updateList<StoryItem>('storyItems', i, { highlight: v })}
          />
        </div>
      ))}
    </div>,
  ];

  /* ------------------------------------------------------------------ oluşturuldu ekranı */

  if (createdSlug) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-6 font-serif text-5xl" style={{ color: '#C9A84C' }}>
          ✦
        </motion.div>
        <h1 className="font-serif text-3xl font-light" style={{ color: '#E8D5A3' }}>
          Davetiye Oluşturuldu!
        </h1>
        <p className="mt-3 font-sans text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
          /davet/{createdSlug}
        </p>
        <div className="mt-8 flex gap-3">
          <Link href={`/davet/${createdSlug}`} target="_blank" className="btn-gold">
            Davetiyeyi Aç
          </Link>
          <Link href="/admin" className="btn-ghost">
            Panele Dön
          </Link>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------------- sihirbaz */

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <header className="mb-8">
        <Link href="/admin" className="font-sans text-xs uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.4)' }}>
          ← Geri
        </Link>
        <h1 className="mt-3 font-serif text-3xl font-light" style={{ color: '#E8D5A3' }}>
          {existing ? 'Davetiyeyi Düzenle' : 'Yeni Davetiye Oluştur'}
        </h1>
      </header>

      {/* adım göstergesi */}
      <div className="mb-8">
        <div className="mb-3 flex flex-wrap gap-1.5">
          {STEPS.map((name, i) => (
            <button
              key={name}
              type="button"
              onClick={() => setStep(i)}
              className="rounded-full px-3 py-1.5 font-sans text-[11px] transition-all"
              style={{
                background: i === step ? 'rgba(201,168,76,0.18)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${i === step ? 'rgba(201,168,76,0.5)' : 'rgba(201,168,76,0.12)'}`,
                color: i === step ? '#E8D5A3' : 'rgba(255,255,255,0.45)',
              }}
            >
              {i + 1}. {name}
            </button>
          ))}
        </div>
        <div className="h-[2px] w-full rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #9A7B2F, #E8D5A3)' }}
            animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {panels[step]}
        </motion.div>
      </AnimatePresence>

      {error && (
        <p className="mt-6 font-sans text-sm" style={{ color: '#f0a3a3' }}>
          {error}
        </p>
      )}

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="btn-ghost disabled:opacity-40"
        >
          ← Geri
        </button>

        <div className="flex gap-3">
          {existing && (
            <Link href={`/davet/${existing.slug}`} target="_blank" className="btn-ghost">
              Önizle
            </Link>
          )}

          {step < STEPS.length - 1 ? (
            <button type="button" onClick={() => setStep((s) => s + 1)} className="btn-gold">
              İleri →
            </button>
          ) : (
            <button type="button" onClick={save} disabled={saving} className="btn-gold">
              {saving ? 'Kaydediliyor…' : existing ? 'Kaydet' : 'Davetiyeyi Oluştur'}
            </button>
          )}
        </div>
      </div>

      {/* son adımda değilken de kaydedebilmek için */}
      {step < STEPS.length - 1 && (
        <div className="mt-4 text-right">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="font-sans text-xs uppercase tracking-[0.2em]"
            style={{ color: 'rgba(201,168,76,0.7)' }}
          >
            {saving ? 'Kaydediliyor…' : 'Şimdi Kaydet'}
          </button>
        </div>
      )}
    </div>
  );
}
