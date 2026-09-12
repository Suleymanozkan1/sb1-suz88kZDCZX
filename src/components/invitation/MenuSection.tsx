'use client';

import { motion } from 'framer-motion';
import SectionHead from './SectionHead';
import type { Invitation } from '@/lib/types';

/**
 * Menü.
 *
 * Menünün ADI burada GÖRÜNMÜYOR. Misafir için "Menü-3" bir anlam
 * taşımıyor; o, işletmeyle çift arasındaki bir numara. Fiyat da yok:
 * davetiye misafire gidiyor, fiyat çiftle işletme arasındaki mesele.
 */
export default function MenuSection({ invitation, n }: { invitation: Invitation; n: number }) {
  const groups = invitation.menuGroups ?? [];
  if (!invitation.showMenu || groups.length === 0) return null;

  return (
    <section id="menu" className="section-gap relative">
      <div className="mx-auto max-w-5xl px-[var(--sp-md)]">
        <SectionHead
          n={n}
          label={invitation.menuSectionSubtitle || 'İkram'}
          title={invitation.menuSectionTitle || 'Menü'}
        />

        <div className="grid gap-x-[var(--sp-lg)] gap-y-[var(--sp-md)] sm:grid-cols-2">
          {groups.map((group, i) => (
            <motion.div
              key={`${group.title}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-120px' }}
              transition={{ duration: 1.0, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
            >
              {group.title && (
                <h3
                  className="t-label border-b pb-2"
                  style={{ color: 'var(--c-gold-deep)', borderColor: 'var(--c-rule)' }}
                >
                  {group.title}
                </h3>
              )}
              <ul className="mt-3 space-y-1.5">
                {group.items.map((item, k) => (
                  <li
                    key={`${item}-${k}`}
                    className="t-lead"
                    style={{ color: 'var(--c-on-light-soft)' }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
