'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import SectionHead from './SectionHead';
import type { Invitation } from '@/lib/types';

/**
 * Galeri.
 *
 * Sütun tabanlı (masonry) yerleşim. Fotoğrafların en-boy oranı önceden
 * bilinmediği için sabit oranlı bir ızgara satırları hizalayamaz ve
 * aralarda boşluk bırakır; sütun akışı her görüntüyü doğal oranıyla
 * yerleştirir ve boşluk bırakmaz. Bu yüzden burada `next/image` yerine
 * düz `img` kullanılır: yükseklik içeriğe göre belirlenir.
 */

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
    <section id="gallery" className="section-gap relative">
      <div className="mx-auto max-w-6xl px-[var(--sp-md)]">
        <SectionHead
          n={4}
          label={invitation.gallerySectionSubtitle || 'Anılar'}
          title={invitation.gallerySectionTitle || 'Fotoğraf Galerisi'}
        />

        {images.length === 0 ? (
          <p className="t-body" style={{ color: 'var(--c-on-light-faint)' }}>
            Fotoğraflar yakında burada olacak.
          </p>
        ) : (
          <div className="columns-1 gap-[var(--sp-sm)] sm:columns-2 lg:columns-3">
            {images.map((src, i) => (
              <motion.button
                key={`${src.slice(0, 24)}-${i}`}
                type="button"
                onClick={() => setOpen(i)}
                className="group relative mb-[var(--sp-sm)] block w-full break-inside-avoid overflow-hidden"
                initial={{ opacity: 0, y: 34 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 1, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                aria-label={`Anı ${i + 1} — büyüt`}
              >
                {/* Oran bilinmediği için doğal yükseklik kullanılır. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Anı ${i + 1}`}
                  loading="lazy"
                  className="block w-full transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                />

                {/* üzerine gelince ince bir çerçeve içe doğru çizilir */}
                <span
                  className="pointer-events-none absolute inset-3 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{ border: '1px solid rgba(247, 241, 230, 0.55)' }}
                  aria-hidden
                />
                <span
                  className="numerals pointer-events-none absolute bottom-3 left-4 text-sm opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{ color: 'rgba(247,241,230,0.9)' }}
                  aria-hidden
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {open !== null && images[open] && (
          <motion.div
            className="fixed inset-0 z-[900] flex items-center justify-center p-[var(--sp-sm)]"
            style={{ background: 'rgba(9,6,3,0.96)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <motion.div
              className="relative h-[78vh] w-full max-w-4xl"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[open]}
                alt={`Anı ${open + 1}`}
                fill
                unoptimized={images[open].startsWith('data:')}
                sizes="100vw"
                className="object-contain"
              />
            </motion.div>

            <span
              className="numerals absolute bottom-6 left-1/2 -translate-x-1/2 text-sm"
              style={{ color: 'var(--c-on-dark-faint)' }}
            >
              {String(open + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
            </span>

            <button
              type="button"
              onClick={close}
              aria-label="Kapat"
              className="absolute right-6 top-6 transition-transform duration-500 hover:rotate-90"
              style={{ color: 'var(--c-on-dark-soft)' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
                <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1" />
              </svg>
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
                  className="absolute left-4 sm:left-8"
                  style={{ color: 'var(--c-on-dark-soft)' }}
                >
                  <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden>
                    <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1" fill="none" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Sonraki fotoğraf"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(1);
                  }}
                  className="absolute right-4 sm:right-8"
                  style={{ color: 'var(--c-on-dark-soft)' }}
                >
                  <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden>
                    <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1" fill="none" />
                  </svg>
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
