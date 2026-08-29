'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import type { Invitation } from '@/lib/types';

export default function GallerySection({ invitation }: { invitation: Invitation }) {
  const images = invitation.galleryImages ?? [];
  const [open, setOpen] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (delta: number) =>
      setOpen((current) =>
        current === null ? null : (current + delta + images.length) % images.length,
      ),
    [images.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, close, step]);

  return (
    <section
      id="gallery"
      className="section-gap relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #FAF6F0 0%, #fff 50%, #FAF6F0 100%)' }}
    >
      {/* dekoratif ışık lekeleri */}
      <div
        className="pointer-events-none absolute -left-20 top-20 h-64 w-64 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.2), transparent 70%)' }}
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-20 h-72 w-72 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.15), transparent 70%)' }}
      />

      <div className="relative mx-auto max-w-5xl px-6">
        <motion.div
          className="mb-12 text-center sm:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="font-sans text-xs uppercase tracking-title" style={{ color: '#9A7B2F' }}>
            {invitation.gallerySectionSubtitle || 'Anılar'}
          </p>
          <h2 className="mt-3 font-serif text-4xl font-light sm:text-5xl" style={{ color: '#2b1d0f' }}>
            {invitation.gallerySectionTitle || 'Fotoğraf Galerisi'}
          </h2>
        </motion.div>

        {images.length === 0 ? (
          <p className="text-center font-sans text-sm font-light" style={{ color: '#8a765a' }}>
            Admin panelinden kendi fotoğraflarınızı yükleyebilirsiniz
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {images.map((src, i) => (
              <motion.button
                key={`${src.slice(0, 24)}-${i}`}
                type="button"
                onClick={() => setOpen(i)}
                className="group relative aspect-[3/4] overflow-hidden rounded-2xl"
                style={{
                  boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(201,168,76,0.1)',
                  rotate: `${i % 2 === 0 ? -1 : 2}deg`,
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 6) * 0.06 }}
                whileHover={{ scale: 1.03, rotate: 0 }}
                aria-label={`Anı ${i + 1} — büyüt`}
              >
                <Image
                  src={src}
                  alt={`Anı ${i + 1}`}
                  fill
                  unoptimized={src.startsWith('data:')}
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{ background: 'linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.08) 100%)' }}
                />
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* büyütme penceresi */}
      <AnimatePresence>
        {open !== null && images[open] && (
          <motion.div
            className="fixed inset-0 z-[900] flex items-center justify-center p-4"
            style={{ background: 'rgba(8,5,3,0.94)', backdropFilter: 'blur(8px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <motion.div
              className="relative h-[80vh] w-full max-w-3xl"
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[open]}
                alt={`Anı ${open + 1}`}
                fill
                unoptimized={images[open].startsWith('data:')}
                sizes="100vw"
                className="rounded-2xl object-contain"
                style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}
              />
            </motion.div>

            <button
              type="button"
              onClick={close}
              aria-label="Kapat"
              className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full text-white"
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              ✕
            </button>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Önceki fotoğraf"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(-1);
                  }}
                  className="absolute left-4 flex h-11 w-11 items-center justify-center rounded-full text-white sm:left-8"
                  style={{
                    background: 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label="Sonraki fotoğraf"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(1);
                  }}
                  className="absolute right-4 flex h-11 w-11 items-center justify-center rounded-full text-white sm:right-8"
                  style={{
                    background: 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  ›
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
