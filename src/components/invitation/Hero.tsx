'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Countdown from './Countdown';
import { formatDate, targetDate } from '@/lib/format';
import type { Invitation } from '@/lib/types';

export default function Hero({ invitation }: { invitation: Invitation }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '28%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const conjunction = invitation.conjunction || '&';

  const orbs = [
    { top: '15%', left: '10%', size: 400, opacity: 0.06 },
    { top: '60%', left: '75%', size: 200, opacity: 0.05 },
    { top: '35%', left: '55%', size: 250, opacity: 0.07 },
  ];

  return (
    <section
      ref={ref}
      id="hero"
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1a0f08 0%, #2d1f12 30%, #1a110a 60%, #0d0805 100%)',
      }}
    >
      {/* yumuşak ışık lekeleri */}
      <div className="absolute inset-0">
        {orbs.map((orb, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-3xl"
            style={{
              top: orb.top,
              left: orb.left,
              width: orb.size,
              height: orb.size,
              background: `radial-gradient(circle, rgba(201,168,76,${orb.opacity}), transparent 70%)`,
            }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 9 + i * 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <motion.div
        style={{ y, opacity }}
        className="relative z-20 mx-auto max-w-4xl px-6 text-center"
      >
        {/* üst ayraç */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <div
            className="h-[1px] w-16 sm:w-24"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.6))' }}
          />
          <span className="font-serif text-lg" style={{ color: '#C9A84C' }}>
            ❋
          </span>
          <div
            className="h-[1px] w-16 sm:w-24"
            style={{ background: 'linear-gradient(270deg, transparent, rgba(201,168,76,0.6))' }}
          />
        </div>

        <motion.p
          className="mb-8 font-sans text-[10px] uppercase tracking-title sm:text-xs"
          style={{ color: 'rgba(255,255,255,0.55)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Düğünümüze Davetlisiniz
        </motion.p>

        {/* isimler */}
        <motion.h1
          className="mb-10 font-serif font-light leading-tight"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 60, damping: 16, delay: 0.7 }}
        >
          <span
            className="gold-text block"
            style={{ fontSize: 'clamp(2rem, 8vw, 5rem)' }}
          >
            {invitation.groomName || 'Damat'}
            <span className="mx-4 font-light sm:mx-8">{conjunction}</span>
            {invitation.brideName || 'Gelin'}
          </span>
        </motion.h1>

        {/* tarih · saat · şehir */}
        <motion.div
          className="mb-10 flex flex-wrap items-center justify-center gap-4 sm:mb-12 sm:gap-6"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <div
            className="h-[1px] w-8 sm:w-16"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.5))' }}
          />
          <p className="font-sans text-xs font-light uppercase tracking-widest text-white/60 sm:text-sm">
            {formatDate(invitation.weddingDate)}
          </p>
          <span style={{ color: 'rgba(201,168,76,0.6)' }}>·</span>
          <p className="font-sans text-xs font-light uppercase tracking-widest text-white/60 sm:text-sm">
            {invitation.weddingTime}
          </p>
          <span style={{ color: 'rgba(201,168,76,0.6)' }}>·</span>
          <p className="font-sans text-xs font-light uppercase tracking-widest text-white/60 sm:text-sm">
            {invitation.city}
          </p>
          <div
            className="h-[1px] w-8 sm:w-16"
            style={{ background: 'linear-gradient(270deg, transparent, rgba(201,168,76,0.5))' }}
          />
        </motion.div>

        <div className="mb-12">
          <Countdown targetDate={targetDate(invitation.weddingDate, invitation.weddingTime)} />
        </div>

        {/* eylem düğmeleri */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
        >
          <a href="#rsvp" className="btn-gold">
            Katılım Durumunu Belirt
          </a>
          <a href="#details" className="btn-ghost">
            Detayları Gör
          </a>
        </motion.div>
      </motion.div>

      {/* kaydırma göstergesi */}
      {/* Framer Motion inline transform yazdığı için yatay ortalama da x ile verilir;
          Tailwind'in -translate-x-1/2 sınıfı burada ezilirdi. */}
      <motion.div
        className="absolute bottom-8 left-1/2 z-20 flex flex-col items-center gap-2"
        style={{ x: '-50%' }}
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span
          className="font-sans text-[10px] uppercase tracking-[0.3em]"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          Kaydır
        </span>
        <div
          className="flex h-8 w-5 justify-center rounded-full pt-1.5"
          style={{ border: '1px solid rgba(201,168,76,0.35)' }}
        >
          <motion.div
            className="h-1.5 w-1 rounded-full"
            style={{ background: '#C9A84C' }}
            animate={{ y: [0, 10, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}
