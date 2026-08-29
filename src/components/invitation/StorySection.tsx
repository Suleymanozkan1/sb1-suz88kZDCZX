'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import SectionHead from './SectionHead';
import type { Invitation, StoryItem } from '@/lib/types';

/**
 * Hikâye satırı.
 *
 * Kart yok: her giriş bir üst kural, büyük bir yıl rakamı ve metinden
 * ibaret. Kartı kaldırmak satırların nefes almasını sağlar ve sayfayı
 * "bileşen kataloğu" olmaktan çıkarır.
 */
function Entry({ item, index, total }: { item: StoryItem; index: number; total: number }) {
  const right = item.side === 'right';

  return (
    <motion.article
      className="relative grid gap-x-[var(--sp-md)] gap-y-3 py-[var(--sp-md)] sm:grid-cols-12"
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.9, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="rule absolute inset-x-0 top-0" aria-hidden />

      {/* yıl — satırın çapası, büyük ve eski stil rakamlarla */}
      <div className={`sm:col-span-3 ${right ? 'sm:order-2 sm:text-right' : ''}`}>
        <span
          className="numerals block leading-none"
          style={{
            color: item.highlight ? 'var(--c-gold-deep)' : 'var(--c-on-light-faint)',
            fontSize: 'clamp(1.5rem, 2.8vw, 2.1rem)',
          }}
        >
          {item.year}
        </span>
      </div>

      <div className={`sm:col-span-8 ${right ? 'sm:order-1 sm:col-start-2 sm:text-right' : 'sm:col-start-5'}`}>
        <h3 className="t-h2" style={{ color: 'var(--c-on-light)' }}>
          {item.title}
          {item.highlight && (
            <span className="ml-3 align-middle" style={{ color: 'var(--c-gold-deep)' }} aria-hidden>
              <svg width="14" height="14" viewBox="0 0 10 10" className="inline">
                <path d="M5 0 10 5 5 10 0 5Z" fill="currentColor" />
              </svg>
            </span>
          )}
        </h3>
        <p
          className={`t-body mt-3 measure ${right ? 'sm:ml-auto' : ''}`}
          style={{ color: 'var(--c-on-light-soft)' }}
        >
          {item.desc}
        </p>
      </div>

      {index === total - 1 && <span className="rule absolute inset-x-0 bottom-0" aria-hidden />}
    </motion.article>
  );
}

export default function StorySection({ invitation }: { invitation: Invitation }) {
  const items = invitation.storyItems ?? [];
  const ref = useRef<HTMLElement>(null);

  // Sağdaki dikey çizgi bölüm boyunca çizilir — okuyucunun ilerlemesini gösterir.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 80%', 'end 60%'] });
  const drawn = useTransform(scrollYProgress, [0, 1], [0, 1]);

  if (items.length === 0) return null;

  return (
    <section ref={ref} id="story" className="section-gap relative">
      <div className="mx-auto max-w-5xl px-[var(--sp-md)]">
        <SectionHead
          n={1}
          label={invitation.storySectionSubtitle || 'Bizim'}
          title={invitation.storySectionTitle || 'Hikayemiz'}
        />

        <div className="relative">
          {/* kaydırdıkça çizilen ince omurga */}
          <motion.span
            className="absolute -left-[var(--sp-sm)] top-0 hidden w-px sm:block"
            style={{
              height: '100%',
              background: 'var(--c-rule)',
              scaleY: drawn,
              transformOrigin: 'top',
            }}
            aria-hidden
          />
          {items.map((item, i) => (
            <Entry key={`${item.title}-${i}`} item={item} index={i} total={items.length} />
          ))}
        </div>
      </div>
    </section>
  );
}
