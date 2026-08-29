'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Remaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function remainingFrom(target: string): Remaining {
  const diff = new Date(target).getTime() - Date.now();
  if (!Number.isFinite(diff) || diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function Countdown({ targetDate }: { targetDate: string }) {
  // Sunucu ve istemci ilk turda aynı çıktıyı üretsin diye sıfırdan başlar.
  const [left, setLeft] = useState<Remaining>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!targetDate) return;
    setLeft(remainingFrom(targetDate));
    const timer = window.setInterval(() => setLeft(remainingFrom(targetDate)), 1000);
    return () => window.clearInterval(timer);
  }, [targetDate]);

  const cells = [
    { label: 'Gün', value: left.days },
    { label: 'Saat', value: left.hours },
    { label: 'Dakika', value: left.minutes },
    { label: 'Saniye', value: left.seconds },
  ];

  return (
    <motion.div
      className="flex items-center justify-center gap-2 sm:gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.8 }}
    >
      {cells.map((cell, i) => (
        <div key={cell.label} className="flex items-center">
          <div className="text-center">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl sm:h-20 sm:w-20"
              style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(201,168,76,0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
              }}
            >
              <motion.span
                key={cell.value}
                initial={{ y: -12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="font-serif text-2xl font-light sm:text-3xl"
                style={{ color: '#E8D5A3' }}
              >
                {String(cell.value).padStart(2, '0')}
              </motion.span>
            </div>
            <span
              className="mt-2 block font-sans text-[10px] uppercase tracking-[0.2em] sm:text-xs"
              style={{ color: 'rgba(255,255,255,0.45)' }}
            >
              {cell.label}
            </span>
          </div>
          {i < 3 && (
            <span className="mx-1 font-serif text-xl sm:mx-2" style={{ color: 'rgba(201,168,76,0.4)' }}>
              :
            </span>
          )}
        </div>
      ))}
    </motion.div>
  );
}
