'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import SectionHead from './SectionHead';
import { Divider, IconArrow } from './Ornaments';
import { formatDate } from '@/lib/format';
import type { Invitation } from '@/lib/types';

const COUNTS = ['1', '2', '3', '4', '5+'];

/**
 * Katılım formu — sayfanın tek gerçek eylemi.
 *
 * Alanların kutusu yoktur; yalnızca alt kural vardır ve odaklanınca kural
 * altın rengine döner. Seçim düğmeleri de dolgu değil, alt çizgi ile
 * işaretlenir. Amaç: formun bir yönetim panelinden çok bir kart üzerine
 * el yazısıyla doldurulmuş gibi durması.
 */
export default function RsvpSection({ invitation }: { invitation: Invitation }) {
  const [form, setForm] = useState({ name: '', phone: '', count: '1', note: '', songRequest: '' });
  const [attending, setAttending] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const deadline = invitation.rsvpDeadline ? formatDate(invitation.rsvpDeadline) : '';

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSending(true);
    setError('');

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, attending, invitationSlug: invitation.slug }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? 'Gönderilemedi');
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu, lütfen tekrar deneyin.');
    } finally {
      setSending(false);
    }
  }

  const fields = [
    { id: 'name' as const, label: 'Ad Soyad', type: 'text', placeholder: 'Adınız' },
    { id: 'phone' as const, label: 'Telefon', type: 'tel', placeholder: '05xx xxx xx xx' },
  ];

  return (
    <section id="rsvp" className="section-gap relative pt-[36vh]">
      <div className="mx-auto max-w-2xl px-[var(--sp-md)]">
        <SectionHead
          n={7}
          label={invitation.rsvpSectionSubtitle || 'Katılım'}
          title={invitation.rsvpSectionTitle || 'Sizi Aramızda Görmek İsteriz'}
          lead={deadline ? `Lütfen ${deadline} tarihine kadar bildirim yapınız.` : undefined}
          align="center"
          tone="dark"
        />

        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="done"
              className="text-center"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.svg
                width="44"
                height="44"
                viewBox="0 0 44 44"
                className="mx-auto"
                style={{ color: 'var(--c-gold-light)' }}
                aria-hidden
              >
                <motion.path
                  d="M11 23 L19 31 L34 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.2, duration: 1.45, ease: [0.22, 1, 0.36, 1] }}
                />
              </motion.svg>

              <h3 className="t-display mt-[var(--sp-md)]" style={{ color: 'var(--c-on-dark)' }}>
                Teşekkürler{form.name ? `, ${form.name.split(' ')[0]}` : ''}
              </h3>
              <p className="t-body mt-4 measure mx-auto" style={{ color: 'var(--c-on-dark-soft)' }}>
                {attending
                  ? 'Katılımınızı aldık. Sizi görmek için sabırsızlanıyoruz.'
                  : 'Bildiriminiz alındı. Sizi özleyeceğiz.'}
              </p>

              <div className="mt-[var(--sp-md)]" style={{ color: 'var(--c-gold)' }}>
                <Divider />
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={submit}
              className="space-y-[var(--sp-md)]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.16 }}
            >
              {fields.map((field) => (
                <div key={field.id}>
                  <label className="field-label" htmlFor={`rsvp-${field.id}`}>
                    {field.label}
                  </label>
                  <input
                    id={`rsvp-${field.id}`}
                    type={field.type}
                    required
                    placeholder={field.placeholder}
                    value={form[field.id]}
                    onChange={(e) => setForm((f) => ({ ...f, [field.id]: e.target.value }))}
                    className="field t-lead"
                  />
                </div>
              ))}

              <div>
                <span className="field-label">Katılacak mısınız?</span>
                <div className="flex gap-[var(--sp-md)]">
                  {[
                    { value: true, label: 'Katılıyorum' },
                    { value: false, label: 'Katılamıyorum' },
                  ].map((option) => {
                    const active = attending === option.value;
                    return (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() => setAttending(option.value)}
                        className="relative pb-2 t-lead transition-colors duration-300"
                        style={{ color: active ? 'var(--c-gold-light)' : 'var(--c-on-dark-faint)' }}
                      >
                        {option.label}
                        <motion.span
                          className="absolute inset-x-0 bottom-0 h-px"
                          style={{ background: 'currentColor', transformOrigin: 'left' }}
                          animate={{ scaleX: active ? 1 : 0 }}
                          transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
                          aria-hidden
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <AnimatePresence>
                {attending && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <span className="field-label">Kaç Kişi Geleceksiniz?</span>
                    <div className="flex gap-[var(--sp-md)]">
                      {COUNTS.map((count) => {
                        const active = form.count === count;
                        return (
                          <button
                            key={count}
                            type="button"
                            onClick={() => setForm((f) => ({ ...f, count }))}
                            className="numerals relative pb-2 text-2xl transition-colors duration-300"
                            style={{
                              color: active ? 'var(--c-gold-light)' : 'var(--c-on-dark-faint)',
                            }}
                          >
                            {count}
                            <motion.span
                              className="absolute inset-x-0 bottom-0 h-px"
                              style={{ background: 'currentColor', transformOrigin: 'left' }}
                              animate={{ scaleX: active ? 1 : 0 }}
                              transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
                              aria-hidden
                            />
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/*
                Şarkı isteği yalnızca gelenlere sorulur: gelmeyecek birine
                DJ için şarkı sormak anlamsız.
              */}
              <AnimatePresence>
                {attending && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <label className="field-label" htmlFor="rsvp-song">
                      Çalmasını İstediğiniz Şarkı (İsteğe Bağlı)
                    </label>
                    <input
                      id="rsvp-song"
                      type="text"
                      placeholder="Şarkı ve sanatçı"
                      value={form.songRequest}
                      onChange={(e) => setForm((f) => ({ ...f, songRequest: e.target.value }))}
                      className="field t-lead"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="field-label" htmlFor="rsvp-note">
                  Notunuz (İsteğe Bağlı)
                </label>
                <textarea
                  id="rsvp-note"
                  rows={2}
                  placeholder="Bir dilek bırakmak ister misiniz?"
                  value={form.note}
                  onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                  className="field t-body resize-none"
                />
              </div>

              {error && (
                <p className="t-body" style={{ color: '#e2a3a3' }}>
                  {error}
                </p>
              )}

              <button type="submit" disabled={sending} className="cta nudge">
                {sending ? 'Gönderiliyor' : 'Gönder'}
                <IconArrow size={15} />
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
