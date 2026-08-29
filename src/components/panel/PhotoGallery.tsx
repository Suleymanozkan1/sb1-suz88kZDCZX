'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState } from 'react';
import * as api from '@/lib/api';
import type { GuestPhoto, Invitation } from '@/lib/types';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('tr-TR', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Misafirlerin QR üzerinden yüklediği fotoğrafların özel albümü.
 * Izgarada küçük önizlemeler, büyütmede ve indirmede orijinal dosya kullanılır.
 */
export default function PhotoGallery({
  invitations,
  canDelete = true,
}: {
  invitations: Invitation[];
  canDelete?: boolean;
}) {
  const [photos, setPhotos] = useState<GuestPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [open, setOpen] = useState<number | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPhotos(await api.listPhotos());
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fotoğraflar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(
    () => (filter === 'all' ? photos : photos.filter((p) => p.invitationId === filter)),
    [photos, filter],
  );

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (delta: number) =>
      setOpen((current) =>
        current === null ? null : (current + delta + visible.length) % visible.length,
      ),
    [visible.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close, step]);

  async function remove(id: string) {
    await api.deletePhoto(id);
    setOpen(null);
    setPhotos((rows) => rows.filter((p) => p.id !== id));
  }

  const totalBytes = visible.reduce((sum, p) => sum + p.size, 0);
  const current = open !== null ? visible[open] : null;

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-light" style={{ color: '#E8D5A3' }}>
            Misafir Fotoğrafları
          </h2>
          <p className="mt-1 font-sans text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {visible.length} fotoğraf · {formatBytes(totalBytes)} · masadaki QR koddan yüklenir
          </p>
        </div>

        {visible.length > 0 && (
          <a
            href={api.photosZipUrl(filter === 'all' ? undefined : filter)}
            className="btn-gold"
            download
          >
            Tümünü İndir (ZIP)
          </a>
        )}
      </div>

      {invitations.length > 1 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {[{ id: 'all', label: 'Tümü' }, ...invitations.map((inv) => ({
            id: inv.id,
            label: `${inv.groomName} ${inv.conjunction} ${inv.brideName}`,
          }))].map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setFilter(option.id)}
              className="rounded-full px-4 py-2 font-sans text-xs transition-all"
              style={{
                background: filter === option.id ? 'rgba(201,168,76,0.18)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${filter === option.id ? 'rgba(201,168,76,0.5)' : 'rgba(201,168,76,0.12)'}`,
                color: filter === option.id ? '#E8D5A3' : 'rgba(255,255,255,0.5)',
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="mb-4 font-sans text-sm" style={{ color: '#f0a3a3' }}>
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="aspect-square animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="admin-card py-14 text-center">
          <p className="font-serif text-lg font-light" style={{ color: '#E8D5A3' }}>
            Henüz fotoğraf yok
          </p>
          <p className="mt-2 font-sans text-sm font-light" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Masalara koyduğunuz QR kodu okutan misafirlerin fotoğrafları burada birikir.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {visible.map((photo, i) => (
            <motion.button
              key={photo.id}
              type="button"
              onClick={() => setOpen(i)}
              className="group relative aspect-square overflow-hidden rounded-xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(i, 12) * 0.03 }}
              aria-label={`Fotoğraf ${i + 1} — büyüt`}
            >
              {/* Kaynak korumalı API ucudur; next/image optimizasyonuna gerek yok. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={api.photoThumbUrl(photo.id)}
                alt={photo.uploaderName || `Fotoğraf ${i + 1}`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {photo.uploaderName && (
                <span
                  className="absolute inset-x-0 bottom-0 truncate px-2 py-1 text-left font-sans text-[10px] opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ background: 'rgba(0,0,0,0.7)', color: '#E8D5A3' }}
                >
                  {photo.uploaderName}
                </span>
              )}
            </motion.button>
          ))}
        </div>
      )}

      {/* büyütme penceresi */}
      <AnimatePresence>
        {current && (
          <motion.div
            className="fixed inset-0 z-[900] flex items-center justify-center p-4"
            style={{ background: 'rgba(8,5,3,0.95)', backdropFilter: 'blur(8px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <motion.div
              className="relative flex h-full w-full max-w-4xl flex-col"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex min-h-0 flex-1 items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={api.photoFullUrl(current.id)}
                  alt={current.uploaderName || 'Fotoğraf'}
                  className="max-h-full max-w-full rounded-2xl object-contain"
                  style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-serif text-lg font-light" style={{ color: '#E8D5A3' }}>
                    {current.uploaderName || 'İsimsiz misafir'}
                  </p>
                  <p className="font-sans text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {formatWhen(current.createdAt)}
                    {current.width > 0 ? ` · ${current.width}×${current.height}` : ''} ·{' '}
                    {formatBytes(current.size)}
                  </p>
                  {current.note && (
                    <p className="mt-1 font-serif text-sm italic" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      “{current.note}”
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <a href={api.photoDownloadUrl(current.id)} download className="btn-gold">
                    Orijinali İndir
                  </a>
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => remove(current.id)}
                      className="rounded-full px-5 py-3 font-sans text-sm uppercase tracking-[0.15em]"
                      style={{
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.25)',
                        color: '#f0a3a3',
                      }}
                    >
                      Sil
                    </button>
                  )}
                </div>
              </div>
            </motion.div>

            <button
              type="button"
              onClick={close}
              aria-label="Kapat"
              className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full text-white"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              ✕
            </button>

            {visible.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Önceki fotoğraf"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(-1);
                  }}
                  className="absolute left-3 flex h-11 w-11 items-center justify-center rounded-full text-white sm:left-6"
                  style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
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
                  className="absolute right-3 flex h-11 w-11 items-center justify-center rounded-full text-white sm:right-6"
                  style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
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
