'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import Bridge from './Bridge';
import SectionHead from './SectionHead';
import type { Invitation } from '@/lib/types';

/**
 * Sık sorulanlar.
 *
 * Kutulu akordeon yerine kurallarla ayrılmış satırlar. Açma göstergesi
 * artı işareti değil, 45 derece dönen ince bir çizgi çifti — geometri
 * değişir, yalnızca renk değil.
 */
export default function FaqSection({ invitation }: { invitation: Invitation }) {
  const items = invitation.faqItems ?? [];
  const [open, setOpen] = useState<number | null>(0);

  if (items.length === 0) return null;

  return (
    <section id="faq" className="section-gap relative">
      <div className="mx-auto max-w-4xl px-[var(--sp-md)]">
        <SectionHead n={6} label="Merak Edilenler" title="Sık Sorulan Sorular" />

        <div>
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={`${item.q}-${i}`} className="relative">
                <span className="rule absolute inset-x-0 top-0" aria-hidden />

                <motion.button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="group flex w-full items-start justify-between gap-[var(--sp-sm)] py-[var(--sp-sm)] text-left"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.7, delay: i * 0.05 }}
                >
                  <span
                    className="t-h2 transition-opacity duration-300"
                    style={{ color: 'var(--c-on-light)', opacity: isOpen ? 1 : 0.75 }}
                  >
                    {item.q}
                  </span>

                  <span
                    className="relative mt-2 block h-4 w-4 shrink-0"
                    style={{ color: 'var(--c-gold-deep)' }}
                    aria-hidden
                  >
                    <span
                      className="absolute left-0 top-1/2 h-px w-full"
                      style={{ background: 'currentColor' }}
                    />
                    <motion.span
                      className="absolute left-1/2 top-0 h-full w-px"
                      style={{ background: 'currentColor' }}
                      animate={{ rotate: isOpen ? 90 : 0, opacity: isOpen ? 0 : 1 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </span>
                </motion.button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p
                        className="t-body measure pb-[var(--sp-sm)]"
                        style={{ color: 'var(--c-on-light-soft)' }}
                      >
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
          <span className="rule block" aria-hidden />
        </div>
      </div>

      {/* gündüz → akşam dönüşü bu boşlukta tamamlanır */}
      <Bridge height="72vh" />
    </section>
  );
}
