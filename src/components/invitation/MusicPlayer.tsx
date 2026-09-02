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
      {/*
        Tür belirtilmiyor: sabit `audio/mpeg` yazılıydı ve kendi dosyasını
        yükleyen biri m4a/ogg/wav koyduğunda tarayıcı kaynağı reddediyordu.
        Adresi doğrudan vermek, türü tarayıcının belirlemesini sağlar.
      */}
      <audio ref={audioRef} src={src} loop preload="none" />

      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? 'Müziği duraklat' : 'Müziği çal'}
        className="fixed bottom-6 right-6 z-[500] flex h-12 w-12 items-center justify-center rounded-full transition-all"
        style={{
          background: 'rgba(13, 8, 5, 0.35)',
          backdropFilter: 'blur(14px)',
          border: '1px solid rgba(176, 141, 63, 0.35)',
          color: 'var(--c-gold-light)',
        }}
      >
        {playing ? (
          <div className="flex items-end gap-[3px]">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="w-[3px] rounded-full"
                style={{ background: 'currentColor' }}
                animate={{ height: ['6px', '16px', '8px', '14px', '6px'] }}
                transition={{ duration: 1.59, repeat: Infinity, delay: i * 0.12 }}
              />
            ))}
          </div>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
            <path d="M4 2.5 L13 8 L4 13.5 Z" />
          </svg>
        )}
      </button>
    </>
  );
}
