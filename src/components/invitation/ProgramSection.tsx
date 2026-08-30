'use client';

import { motion } from 'framer-motion';
import SectionHead from './SectionHead';
import { ICONS, resolveIcon } from './Ornaments';
import type { Invitation } from '@/lib/types';

/**
 * Günün akışı.
 *
 * Saatler bir cetvel gibi solda hizalanır; her satır ince bir kuralla
 * ayrılır. Kart, gölge ve cam efekti yok — akış listesi bir tarife gibi
 * okunmalı, bir kontrol paneli gibi değil.
 */
export default function ProgramSection({ invitation }: { invitation: Invitation }) {
  const items = invitation.programItems ?? [];
  if (items.length === 0) return null;

  return (
    <section id="program" className="section-gap relative">
      <div className="mx-auto max-w-4xl px-[var(--sp-md)]">
        <SectionHead n={3} label="Akış" title="Günün Programı" />

        <div>
          {items.map((item, i) => {
            const Icon = ICONS[resolveIcon(item.icon, i)];
            return (
              <motion.div
                key={`${item.title}-${i}`}
                className="group relative grid grid-cols-[auto_1fr] items-baseline gap-x-[var(--sp-sm)] gap-y-1 py-[var(--sp-sm)] sm:grid-cols-[7rem_auto_1fr] sm:gap-x-[var(--sp-md)]"
                initial={{ opacity: 0, x: -18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.8, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="rule absolute inset-x-0 top-0" aria-hidden />

                <span
                  className="numerals col-span-2 text-lg sm:col-span-1 sm:text-xl"
                  style={{ color: 'var(--c-gold-deep)' }}
                >
                  {item.time}
                </span>

                <span
                  className="hidden self-center transition-transform duration-500 group-hover:-translate-y-0.5 sm:block"
                  style={{ color: 'var(--c-gold-deep)' }}
                >
                  <Icon size={20} />
                </span>

                <div>
                  <h3 className="t-h2" style={{ color: 'var(--c-on-light)' }}>
                    {item.title}
                  </h3>
                  {item.desc && (
                    <p className="t-body mt-1 measure" style={{ color: 'var(--c-on-light-soft)' }}>
                      {item.desc}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
          <span className="rule block" aria-hidden />
        </div>
      </div>
    </section>
  );
}
