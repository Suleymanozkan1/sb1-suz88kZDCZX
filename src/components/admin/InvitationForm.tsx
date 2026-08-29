'use client';

import SoundPicker from './SoundPicker';
import { ENVELOPE_SOUNDS, MUSIC_TRACKS, SEAL_SOUNDS } from '@/lib/music';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import ImageUploader from './ImageUploader';
import { Divider, IconArrow, IconCheck, IconTrash } from '@/components/invitation/Ornaments';
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
  type InvitationDraft,
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

type Draft = InvitationDraft;

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
      className="relative flex w-full items-center justify-between py-[var(--sp-sm)] transition-all"
    >
      <span className="rule-dark absolute inset-x-0 top-0" aria-hidden />
      <span className="t-body" style={{ color: 'var(--c-on-dark)' }}>
        {label}
      </span>
      <span
        className="relative h-5 w-10 transition-colors duration-500"
        style={{ border: `1px solid ${checked ? 'var(--c-gold)' : 'rgba(226,205,151,0.25)'}` }}
      >
        <span
          className="absolute top-1/2 h-3 w-3 -translate-y-1/2 transition-all duration-500"
          style={{
            left: checked ? 22 : 3,
            background: checked ? 'var(--c-gold-light)' : 'rgba(226,205,151,0.4)',
          }}
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
      aria-label="Satırı sil"
      className="shrink-0 self-center transition-opacity duration-300 hover:opacity-100"
      style={{ color: '#e2a3a3', opacity: 0.65 }}
    >
      <IconTrash size={16} />
    </button>
  );
}

export default function InvitationForm({
  existing,
  backHref = '/admin',
}: {
  existing?: Invitation;
  backHref?: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);

  const [draft, setDraft] = useState<Draft>(() => {
    if (!existing) return emptyInvitation();
    const { id, ownerId, createdAt, updatedAt, ...rest } = existing;
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
        router.push(backHref);
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
              className="px-4 py-3 text-left transition-all duration-300"
              style={{
                border: `1px solid ${draft.conjunction === option.id ? 'var(--c-gold)' : 'rgba(226,205,151,0.15)'}`,
                color: 'var(--c-on-dark)',
              }}
            >
              <span className="t-label block" style={{ color: 'var(--c-gold)' }}>
                Örnek
              </span>
              <span className="t-lead">{option.example}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="relative py-[var(--sp-sm)]">
        <span className="rule-dark absolute inset-x-0 top-0" aria-hidden />
        <span className="field-label">Önizleme</span>
        <p className="t-h2" style={{ color: 'var(--c-gold-light)' }}>
          {draft.groomName || 'Damat'} {draft.conjunction} {draft.brideName || 'Gelin'}
        </p>
        <p className="t-body mt-2" style={{ color: 'var(--c-on-dark-faint)' }}>
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
              className="w-full p-4 text-left transition-all duration-300"
              style={{
                border: `1px solid ${draft.invitationText === ready.text ? 'var(--c-gold)' : 'rgba(226,205,151,0.15)'}`,
              }}
            >
              <span className="t-label block" style={{ color: 'var(--c-gold)' }}>
                {ready.label}
              </span>
              <span className="t-body mt-2 block italic" style={{ color: 'var(--c-on-dark-soft)' }}>
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
              className="px-4 py-3 font-sans text-sm transition-all duration-300"
              style={{
                border: `1px solid ${draft.sealType === option.id ? 'var(--c-gold)' : 'rgba(226,205,151,0.15)'}`,
                color: draft.sealType === option.id ? 'var(--c-gold-light)' : 'var(--c-on-dark-soft)',
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
              className="px-4 py-3 font-sans text-sm transition-all duration-300"
              style={{
                border: `1px solid ${draft.invitationDesign === option.id ? 'var(--c-gold)' : 'rgba(226,205,151,0.15)'}`,
                color: draft.invitationDesign === option.id ? 'var(--c-gold-light)' : 'var(--c-on-dark-soft)',
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
      <SoundPicker
        label="Arka Plan Müziği"
        hint="Davetiye açıldığında çalar. Seçmeden önce dinleyebilirsiniz."
        presets={MUSIC_TRACKS}
        value={draft.backgroundMusicUrl}
        onChange={(v) => set('backgroundMusicUrl', v)}
        allowNone
      />
      <SoundPicker
        label="Mühür Kırılma Sesi"
        hint="Mühür kırılırken bir kez çalar."
        presets={SEAL_SOUNDS}
        value={draft.sealBreakSound}
        onChange={(v) => set('sealBreakSound', v)}
        allowNone
      />
      <SoundPicker
        label="Zarf Açılma Sesi"
        presets={ENVELOPE_SOUNDS}
        value={draft.envelopeOpenSound}
        onChange={(v) => set('envelopeOpenSound', v)}
        allowNone
      />
      <label className="block">
        <span className="field-label">Ses Seviyesi — %{draft.soundVolume}</span>
        <input
          type="range"
          min={0}
          max={100}
          value={draft.soundVolume}
          onChange={(e) => set('soundVolume', Number(e.target.value))}
          className="w-full accent-[color:var(--c-gold)]"
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
            className="flex items-center gap-4 p-4 text-left transition-all duration-300"
            style={{
              border: `1px solid ${draft.theme === option.id ? 'var(--c-gold)' : 'rgba(226,205,151,0.15)'}`,
            }}
          >
            <span
              className="h-9 w-9 shrink-0"
              style={{ background: option.bg, border: `1px solid ${option.accent}` }}
            />
            <span className="t-body" style={{ color: 'var(--c-on-dark)' }}>
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
            className="link-underline"
            style={{ color: 'var(--c-on-dark-faint)' }}
          >
            Varsayılana Dön
          </button>
          <button
            type="button"
            onClick={() =>
              appendToList<ProgramItem>('programItems', { time: '', title: '', desc: '', icon: '◇' })
            }
            className="link-underline"
            style={{ color: 'var(--c-gold-light)' }}
          >
            + Ekle
          </button>
        </div>
      </div>

      {draft.programItems.map((item, i) => (
        <div key={i} className="relative space-y-3 py-[var(--sp-sm)]">
          <span className="rule-dark absolute inset-x-0 top-0" aria-hidden />
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
            className="link-underline"
            style={{ color: 'var(--c-on-dark-faint)' }}
          >
            Varsayılana Dön
          </button>
          <button
            type="button"
            onClick={() => appendToList<FaqItem>('faqItems', { q: '', a: '' })}
            className="link-underline"
            style={{ color: 'var(--c-gold-light)' }}
          >
            + Ekle
          </button>
        </div>
      </div>

      {draft.faqItems.map((item, i) => (
        <div key={i} className="relative space-y-3 py-[var(--sp-sm)]">
          <span className="rule-dark absolute inset-x-0 top-0" aria-hidden />
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
            className="link-underline"
            style={{ color: 'var(--c-on-dark-faint)' }}
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
            className="link-underline"
            style={{ color: 'var(--c-gold-light)' }}
          >
            + Ekle
          </button>
        </div>
      </div>

      <p className="t-body" style={{ color: 'var(--c-on-dark-faint)' }}>
        Her bir kartı düzenleyin. ♡ Düğün olarak işaretlediğiniz öğe vurgulanarak gösterilir.
      </p>

      {draft.storyItems.map((item, i) => (
        <div key={i} className="relative space-y-3 py-[var(--sp-sm)]">
          <span className="rule-dark absolute inset-x-0 top-0" aria-hidden />
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
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-[var(--sp-md)] text-center">
        <motion.span
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ color: 'var(--c-gold)' }}
        >
          <IconCheck size={34} />
        </motion.span>

        <h1 className="t-display mt-[var(--sp-md)]" style={{ color: 'var(--c-on-dark)' }}>
          Davetiye Oluşturuldu
        </h1>
        <p className="t-body mt-3" style={{ color: 'var(--c-on-dark-faint)' }}>
          /davet/{createdSlug}
        </p>

        <div className="mt-[var(--sp-md)]" style={{ color: 'var(--c-gold)' }}>
          <Divider />
        </div>

        <div className="mt-[var(--sp-md)] flex flex-wrap items-center justify-center gap-[var(--sp-md)]">
          <Link href={`/davet/${createdSlug}`} target="_blank" className="cta nudge">
            Davetiyeyi Aç
            <IconArrow size={14} />
          </Link>
          {/* Çift hesabı /admin'e gidince geri sekerdi — kendi paneline döner. */}
          <Link href={backHref} className="link-underline" style={{ color: 'var(--c-on-dark-soft)' }}>
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
        <Link href={backHref} className="link-underline" style={{ color: 'var(--c-on-dark-faint)' }}>
          ← Geri
        </Link>
        <p className="t-label mt-[var(--sp-md)]" style={{ color: 'var(--c-gold)' }}>
          Davetiye Sihirbazı
        </p>
        <h1 className="t-display mt-3" style={{ color: 'var(--c-on-dark)' }}>
          {existing ? 'Davetiyeyi Düzenle' : 'Yeni Davetiye'}
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
              className="px-3 py-1.5 font-sans text-[11px] transition-all duration-300"
              style={{
                border: `1px solid ${i === step ? 'var(--c-gold)' : 'transparent'}`,
                color:
                  i === step
                    ? 'var(--c-gold-light)'
                    : i < step
                      ? 'var(--c-on-dark-soft)'
                      : 'var(--c-on-dark-faint)',
              }}
            >
              <span className="inline-flex items-center gap-1.5">
                {i < step ? <IconCheck size={11} /> : <span className="numerals">{i + 1}.</span>}
                {name}
              </span>
            </button>
          ))}
        </div>
        <div className="h-px w-full" style={{ background: 'var(--c-rule-dark)' }}>
          <motion.div
            className="h-full"
            style={{ background: 'linear-gradient(90deg, var(--c-gold-deep), var(--c-gold-light))' }}
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
        <p className="t-body mt-[var(--sp-md)]" style={{ color: '#e2a3a3' }}>
          {error}
        </p>
      )}

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="link-underline disabled:opacity-30"
          style={{ color: 'var(--c-on-dark-soft)' }}
        >
          ← Geri
        </button>

        <div className="flex gap-3">
          {existing && (
            <Link
              href={`/davet/${existing.slug}`}
              target="_blank"
              className="link-underline"
              style={{ color: 'var(--c-on-dark-soft)' }}
            >
              Önizle
            </Link>
          )}

          {step < STEPS.length - 1 ? (
            <button type="button" onClick={() => setStep((s) => s + 1)} className="cta nudge">
              İleri
              <IconArrow size={14} />
            </button>
          ) : (
            <button type="button" onClick={save} disabled={saving} className="cta nudge">
              {saving ? 'Kaydediliyor' : existing ? 'Kaydet' : 'Davetiyeyi Oluştur'}
              <IconArrow size={14} />
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
            className="link-underline"
            style={{ color: 'var(--c-gold)' }}
          >
            {saving ? 'Kaydediliyor' : 'Şimdi Kaydet'}
          </button>
        </div>
      )}
    </div>
  );
}
