'use client';

import { motion } from 'framer-motion';
import { SectionNumber } from './Ornaments';

/**
 * Bölüm başlığı.
 *
 * Varsayılan hizalama SOLA yaslıdır: dokuz bölümün dokuzunu da ortalamak
 * sayfayı tek ritimli hale getirir. Ortalanmış varyant yalnızca dönüm
 * noktalarında (mektup, katılım) kullanılır.
 */
export default function SectionHead({
  n,
  label,
  title,
  lead,
  align = 'left',
  tone = 'light',
}: {
  n: number;
  label: string;
  title: React.ReactNode;
  lead?: string;
  align?: 'left' | 'center';
  tone?: 'light' | 'dark';
}) {
  const centered = align === 'center';
  const accent = tone === 'dark' ? 'var(--c-gold-light)' : 'var(--c-gold-deep)';
  const heading = tone === 'dark' ? 'var(--c-on-dark)' : 'var(--c-on-light)';
  const soft = tone === 'dark' ? 'var(--c-on-dark-soft)' : 'var(--c-on-light-soft)';

  return (
    <motion.header
      className={`mb-[var(--sp-lg)] ${centered ? 'text-center' : ''}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className={`flex items-baseline gap-4 ${centered ? 'justify-center' : ''}`}
        style={{ color: accent }}
      >
        <SectionNumber n={n} className="text-sm opacity-60" />
        <span className="t-label">{label}</span>
        {!centered && <span className="rule ml-2 hidden flex-1 sm:block" />}
      </div>

      <h2 className="t-display mt-5" style={{ color: heading }}>
        {title}
      </h2>

      {lead && (
        <p
          className={`t-body mt-6 measure ${centered ? 'mx-auto' : ''}`}
          style={{ color: soft }}
        >
          {lead}
        </p>
      )}
    </motion.header>
  );
}
