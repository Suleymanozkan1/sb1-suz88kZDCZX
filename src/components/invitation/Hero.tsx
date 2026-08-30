'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Countdown from './Countdown';
import { CornerFlourish, IconArrow } from './Ornaments';
import { formatDate, formatWeekday, targetDate } from '@/lib/format';
import type { Invitation } from '@/lib/types';

const RISE = {
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
};

/**
 * Açılış perdesi.
 *
 * Ortalanmış yığın yerine sola yaslı editoryal kompozisyon: isimler iki
 * satıra bölünür, bağlaç ikisinin arasına italik ve kaydırılmış olarak
 * oturur. Tip ölçeği kasıtlı olarak "biraz fazla büyük" — premium cesurdur.
 */
export default function Hero({ invitation }: { invitation: Invitation }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '22%']);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const conjunction = invitation.conjunction || '&';
  const groom = invitation.groomName || 'Damat';
  const bride = invitation.brideName || 'Gelin';

  const meta = [
    formatDate(invitation.weddingDate),
    formatWeekday(invitation.weddingDate),
    invitation.weddingTime,
    invitation.city,
  ].filter(Boolean);

  return (
    <section
      ref={ref}
      id="hero"
      className="relative flex min-h-[100svh] items-center overflow-hidden"
    >
      {/* atmosfer: iki yumuşak ışık lekesi, hareketleri fark edilmeyecek kadar yavaş */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <motion.div
          className="absolute rounded-full blur-3xl"
          style={{
            top: '8%',
            left: '-6%',
            width: 'min(46rem, 90vw)',
            height: 'min(46rem, 90vw)',
            background: 'radial-gradient(circle, rgba(176,141,63,0.11), transparent 68%)',
          }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute rounded-full blur-3xl"
          style={{
            bottom: '4%',
            right: '-10%',
            width: 'min(34rem, 80vw)',
            height: 'min(34rem, 80vw)',
            background: 'radial-gradient(circle, rgba(226,205,151,0.07), transparent 70%)',
          }}
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 21, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* dört köşe filigranı — sayfayı basılı bir kart gibi çerçeveler */}
      <div style={{ color: 'var(--c-gold)' }} aria-hidden>
        <CornerFlourish corner="tl" className="pointer-events-none absolute left-8 top-8 hidden sm:block" />
        <CornerFlourish corner="tr" className="pointer-events-none absolute right-8 top-8 hidden sm:block" />
        <CornerFlourish corner="br" className="pointer-events-none absolute bottom-8 right-8 hidden sm:block" />
        <CornerFlourish corner="bl" className="pointer-events-none absolute bottom-8 left-8 hidden sm:block" />
      </div>

      <motion.div
        style={{ y, opacity: fade }}
        className="relative z-20 mx-auto w-full max-w-6xl px-[var(--sp-md)]"
      >
        <motion.p
          className="t-label"
          style={{ color: 'var(--c-gold)' }}
          {...RISE}
          transition={{ delay: 0.3, duration: 1.45, ease: [0.22, 1, 0.36, 1] }}
        >
          Düğünümüze Davetlisiniz
        </motion.p>

        {/* isimler — iki satır, aralarında kaydırılmış italik bağlaç */}
        <h1 className="mt-[var(--sp-sm)]">
          <motion.span
            className="t-hero block"
            style={{ color: 'var(--c-on-dark)' }}
            {...RISE}
            transition={{ delay: 0.5, duration: 1.74, ease: [0.22, 1, 0.36, 1] }}
          >
            {groom}
          </motion.span>

          <motion.span
            className="t-display block italic"
            style={{
              color: 'var(--c-gold)',
              marginLeft: 'clamp(1.25rem, 5vw, 4.5rem)',
              marginTop: 'clamp(-0.75rem, -1.5vw, -0.25rem)',
              marginBottom: 'clamp(-0.75rem, -1.5vw, -0.25rem)',
            }}
            {...RISE}
            transition={{ delay: 0.75, duration: 1.74, ease: [0.22, 1, 0.36, 1] }}
          >
            {conjunction}
          </motion.span>

          <motion.span
            className="t-hero block"
            style={{ color: 'var(--c-on-dark)', marginLeft: 'clamp(0.5rem, 2.6vw, 2.5rem)' }}
            {...RISE}
            transition={{ delay: 0.95, duration: 1.74, ease: [0.22, 1, 0.36, 1] }}
          >
            {bride}
          </motion.span>
        </h1>

        {/* künye satırı — eski stil rakamlarla, ince kurallarla ayrılmış */}
        <motion.div
          className="mt-[var(--sp-md)] flex flex-wrap items-center gap-x-5 gap-y-2"
          {...RISE}
          transition={{ delay: 1.25, duration: 1.45 }}
        >
          {meta.map((item, i) => (
            <span key={item} className="flex items-center gap-5">
              {i > 0 && (
                <span
                  className="hidden h-3 w-px sm:block"
                  style={{ background: 'var(--c-rule-dark)' }}
                  aria-hidden
                />
              )}
              <span
                className="numerals text-sm sm:text-base"
                style={{ color: 'var(--c-on-dark-soft)' }}
              >
                {item}
              </span>
            </span>
          ))}
        </motion.div>

        <div className="mt-[var(--sp-md)]">
          <Countdown targetDate={targetDate(invitation.weddingDate, invitation.weddingTime)} />
        </div>

        <motion.div
          className="mt-[var(--sp-md)] flex flex-wrap items-center gap-x-8 gap-y-4"
          {...RISE}
          transition={{ delay: 1.9, duration: 1.45 }}
        >
          <a href="#rsvp" className="cta nudge">
            Katılım Durumunu Belirt
            <IconArrow size={15} />
          </a>
          <a
            href="#details"
            className="link-underline"
            style={{ color: 'var(--c-on-dark-soft)' }}
          >
            Detayları Gör
          </a>
        </motion.div>
      </motion.div>

      {/* kaydırma daveti — sola hizalı, ince ve sessiz */}
      {/* kaydırma daveti — kompozisyonla aynı sol kenara hizalı */}
      <motion.div
        className="absolute bottom-[var(--sp-sm)] left-1/2 z-20 flex w-full max-w-6xl -translate-x-1/2 items-center gap-3 px-[var(--sp-md)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.4, duration: 1.45 }}
      >
        <span className="t-label" style={{ color: 'var(--c-on-dark-faint)' }}>
          Kaydır
        </span>
        <motion.span
          className="block w-px"
          style={{ height: 34, background: 'var(--c-rule-dark)', transformOrigin: 'top' }}
          animate={{ scaleY: [0.3, 1, 0.3] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden
        />
      </motion.div>
    </section>
  );
}
