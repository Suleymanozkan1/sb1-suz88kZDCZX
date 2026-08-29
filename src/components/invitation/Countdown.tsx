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

/**
 * Geri sayım — cam kutular yerine editoryal rakamlar.
 * Sayılar ince dikey kurallarla ayrılır; ölçü etiketleri altta, küçük ve
 * harf aralıklı durur. Yalnızca saniye tik attıkça yumuşakça değişir.
 */
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
    { label: 'Gün', value: left.days, pad: 0 },
    { label: 'Saat', value: left.hours, pad: 2 },
    { label: 'Dakika', value: left.minutes, pad: 2 },
    { label: 'Saniye', value: left.seconds, pad: 2 },
  ];

  return (
    <motion.div
      className="flex items-stretch"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.6, duration: 1.2 }}
    >
      {cells.map((cell, i) => (
        <div
          key={cell.label}
          className="flex flex-col justify-end pr-6 sm:pr-10"
          style={{
            borderLeft: i === 0 ? 'none' : '1px solid var(--c-rule-dark)',
            paddingLeft: i === 0 ? 0 : 'clamp(1.25rem, 3vw, 2.5rem)',
          }}
        >
          <span
            className="numerals leading-none"
            style={{
              color: 'var(--c-on-dark)',
              fontSize: 'clamp(2rem, 5.5vw, 3.75rem)',
              fontWeight: 300,
            }}
          >
            {String(cell.value).padStart(cell.pad, '0')}
          </span>
          <span className="t-label mt-3" style={{ color: 'var(--c-on-dark-faint)' }}>
            {cell.label}
          </span>
        </div>
      ))}
    </motion.div>
  );
}
