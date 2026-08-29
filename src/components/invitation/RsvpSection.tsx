'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { formatDate } from '@/lib/format';
import type { Invitation } from '@/lib/types';

const COUNTS = ['1', '2', '3', '4', '5+'];

export default function RsvpSection({ invitation }: { invitation: Invitation }) {
  const [form, setForm] = useState({ name: '', phone: '', count: '1', note: '' });
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
    { id: 'name' as const, label: 'Ad Soyad', type: 'text', placeholder: 'Adınızı giriniz' },
    { id: 'phone' as const, label: 'Telefon', type: 'tel', placeholder: '05xx xxx xx xx' },
  ];

  return (
    <section
      id="rsvp"
      className="section-gap relative"
      style={{ background: 'linear-gradient(135deg, #1a0f08 0%, #2d1f12 50%, #1a110a 100%)' }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, rgba(201,168,76,0.06) 0%, transparent 70%)' }}
      />

      <div className="relative mx-auto max-w-lg px-6">
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="font-sans text-xs uppercase tracking-title" style={{ color: 'rgba(201,168,76,0.7)' }}>
            Katılım
          </p>
          <h2 className="mt-3 font-serif text-4xl font-light sm:text-5xl" style={{ color: '#E8D5A3' }}>
            Katılım Durumunuzu Bildirin
          </h2>
          {deadline && (
            <p className="mt-4 font-sans text-sm font-light" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Lütfen {deadline} tarihine kadar bildirim yapınız.
            </p>
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="done"
              className="text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
                style={{
                  background: 'rgba(201,168,76,0.12)',
                  border: '1px solid rgba(201,168,76,0.4)',
                }}
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.6, type: 'spring' }}
              >
                <motion.svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                  <motion.path
                    d="M8 17.5 L14.5 24 L26 11"
                    stroke="#E8D5A3"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  />
                </motion.svg>
              </motion.div>

              <h3 className="font-serif text-2xl font-light" style={{ color: '#E8D5A3' }}>
                Teşekkürler {form.name.split(' ')[0]}
              </h3>
              <p className="mt-3 font-sans text-sm font-light" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {attending
                  ? 'Katılımınızı aldık. Sizi görmek için sabırsızlanıyoruz.'
                  : 'Bildiriminiz alındı. Sizi özleyeceğiz.'}
              </p>

              <div className="mt-6 flex justify-center gap-2">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.span
                    key={i}
                    className="text-lg"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                  >
                    🌸
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={submit}
              className="space-y-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
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
                    className="field"
                  />
                </div>
              ))}

              {/* katılım durumu */}
              <div>
                <span className="field-label">Katılacak mısınız?</span>
                <div className="flex gap-3">
                  {[
                    { value: true, label: 'Katılıyorum' },
                    { value: false, label: 'Katılamıyorum' },
                  ].map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => setAttending(option.value)}
                      className="flex-1 rounded-2xl py-3 font-sans text-sm transition-all"
                      style={
                        attending === option.value
                          ? {
                              background: 'linear-gradient(135deg, #C9A84C, #E8D5A3)',
                              color: '#1a0f08',
                            }
                          : {
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(201,168,76,0.2)',
                              color: 'rgba(255,255,255,0.7)',
                            }
                      }
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {attending && (
                <div>
                  <span className="field-label">Kaç Kişi Geleceksiniz?</span>
                  <div className="flex gap-2">
                    {COUNTS.map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, count }))}
                        className="flex-1 rounded-xl py-3 font-sans text-sm transition-all"
                        style={
                          form.count === count
                            ? {
                                background: 'linear-gradient(135deg, #C9A84C, #E8D5A3)',
                                color: '#1a0f08',
                              }
                            : {
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(201,168,76,0.2)',
                                color: 'rgba(255,255,255,0.7)',
                              }
                        }
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="field-label" htmlFor="rsvp-note">
                  Notunuz (İsteğe Bağlı)
                </label>
                <textarea
                  id="rsvp-note"
                  rows={3}
                  placeholder="Bir mesaj bırakmak ister misiniz?"
                  value={form.note}
                  onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                  className="field resize-none"
                />
              </div>

              {error && (
                <p className="font-sans text-sm" style={{ color: '#f0a3a3' }}>
                  {error}
                </p>
              )}

              <button type="submit" disabled={sending} className="btn-gold w-full">
                {sending ? 'Gönderiliyor…' : 'Gönder'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
