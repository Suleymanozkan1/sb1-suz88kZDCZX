'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useMounted } from '@/lib/useMounted';

/** Sayfa boyunca yavaşça düşen altın yaprak dokusu. */
export default function Petals({ count = 12 }: { count?: number }) {
  const mounted = useMounted();
  const petals = useMemo(
    () =>
      Array.from({ length: count }, (_, id) => ({
        id,
        x: `${Math.random() * 100}%`,
        size: 8 + Math.random() * 10,
        rotation: Math.random() * 360,
        drift: -50 + Math.random() * 100,
        duration: 12 + Math.random() * 10,
        delay: Math.random() * 10,
        opacity: 0.18 + Math.random() * 0.25,
      })),
    [count],
  );

  if (!mounted) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
      {petals.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{ left: p.x }}
          initial={{ y: '-10vh', rotate: p.rotation, opacity: 0 }}
          animate={{ y: '110vh', rotate: p.rotation + 540, x: p.drift, opacity: [0, p.opacity, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' }}
        >
          <svg width={p.size} height={p.size * 1.6} viewBox="0 0 10 16">
            <path
              d="M5 0 C8 3 9 8 7 13 C5 16 3 16 1 13 C-1 8 2 3 5 0 Z"
              fill={`rgba(201, 168, 76, ${p.opacity})`}
            />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}
