'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import SectionHead from './SectionHead';
import { Divider, IconArrow, IconCheck } from './Ornaments';
import type { Invitation, Wish } from '@/lib/types';

/**
 * Dilek defteri.
 *
 * Misafir davetiyeden mesaj bırakır; mesaj çift onaylayana kadar
 * yayımlanmaz. Onay şart: adresi bilen herkes yazabildiği için denetimsiz
 * bir duvar, davetiyenin ortasında istenmeyen içerik demek olurdu.
 * Bu yüzden gönderen kişiye "onaylandıktan sonra görünecek" denir; yoksa
 * mesajının kaybolduğunu sanır.
 */
export default function WishesSection({
  invitation,
  wishes,
}: {
  invitation: Invitation;
  wishes: Wish[];
}) {
  const [form, setForm] = useState({ name: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  if (!invitation.wishesEnabled) return null;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.message.trim()) return;

    setSending(true);
    setError('');
    try {
      const response = await fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, slug: invitation.slug }),
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

  return (
    <section id="wishes" className="section-gap relative">
      <div className="mx-auto max-w-3xl px-[var(--sp-md)]">
        <SectionHead
          n={9}
          label={invitation.wishesSubtitle || 'Dilekler'}
          title={invitation.wishesTitle || 'Dilek Defteri'}
          align="center"
          tone="dark"
        />

        {wishes.length > 0 && (
          <div className="mb-[var(--sp-lg)] columns-1 gap-[var(--sp-md)] sm:columns-2">
            {wishes.map((wish, i) => (
              <motion.figure
                key={wish.id}
                className="mb-[var(--sp-md)] break-inside-avoid px-5 py-[var(--sp-sm)]"
                style={{ border: '1px solid rgba(176, 141, 63, 0.2)' }}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7, delay: Math.min(i, 6) * 0.05 }}
              >
                <blockquote
                  className="t-body italic"
                  style={{ color: 'var(--c-on-dark-soft)' }}
                >
                  “{wish.message}”
                </blockquote>
                {wish.name && (
                  <figcaption
                    className="t-label mt-3"
                    style={{ color: 'var(--c-gold-light)' }}
                  >
                    {wish.name}
                  </figcaption>
                )}
              </motion.figure>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="done"
              className="text-center"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <span style={{ color: 'var(--c-gold-light)' }}>
                <IconCheck size={22} />
              </span>
              <p className="t-body measure mx-auto mt-4" style={{ color: 'var(--c-on-dark-soft)' }}>
                Dileğiniz iletildi. Çift onayladıktan sonra bu sayfada görünecek.
              </p>
              <div className="mt-[var(--sp-md)]" style={{ color: 'var(--c-gold)' }}>
                <Divider />
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={submit}
              className="mx-auto max-w-xl space-y-[var(--sp-sm)]"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.8 }}
            >
              <div>
                <label className="field-label" htmlFor="wish-name">
                  Adınız (İsteğe Bağlı)
                </label>
                <input
                  id="wish-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="field t-lead"
                  placeholder="Adınız"
                />
              </div>

              <div>
                <label className="field-label" htmlFor="wish-message">
                  Dileğiniz
                </label>
                <textarea
                  id="wish-message"
                  required
                  rows={4}
                  maxLength={600}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  className="field t-lead resize-none"
                  placeholder="Güzel dilekleriniz…"
                />
              </div>

              {error && (
                <p className="t-body" style={{ color: '#e2a3a3' }}>
                  {error}
                </p>
              )}

              <button type="submit" disabled={sending} className="cta nudge">
                {sending ? 'Gönderiliyor' : 'Dileğimi Bırak'}
                <IconArrow size={14} />
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
