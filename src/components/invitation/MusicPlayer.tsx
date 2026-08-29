'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

export default function MusicPlayer({
  src,
  volume = 50,
  autoStart = false,
}: {
  src: string;
  volume?: number;
  autoStart?: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = Math.min(Math.max(volume, 0), 100) / 100;
  }, [volume]);

  useEffect(() => {
    if (!autoStart) return;
    const audio = audioRef.current;
    if (!audio) return;
    // Tarayıcılar kullanıcı etkileşimi olmadan sesi engelleyebilir; sessizce geç.
    audio.play().then(
      () => setPlaying(true),
      () => setPlaying(false),
    );
  }, [autoStart]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(
        () => setPlaying(true),
        () => setPlaying(false),
      );
    }
  };

  return (
    <>
      <audio ref={audioRef} loop preload="none">
        <source src={src} type="audio/mpeg" />
      </audio>

      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? 'Müziği duraklat' : 'Müziği çal'}
        className="fixed bottom-6 right-6 z-[500] flex h-12 w-12 items-center justify-center rounded-full transition-all"
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(201,168,76,0.3)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        {playing ? (
          <div className="flex items-end gap-[3px]">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="w-[3px] rounded-full"
                style={{ background: '#C9A84C' }}
                animate={{ height: ['6px', '16px', '8px', '14px', '6px'] }}
                transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.12 }}
              />
            ))}
          </div>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="#C9A84C" aria-hidden>
            <path d="M4 2.5 L13 8 L4 13.5 Z" />
          </svg>
        )}
      </button>
    </>
  );
}
