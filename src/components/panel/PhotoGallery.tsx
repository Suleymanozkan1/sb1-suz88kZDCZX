'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Action, EmptyState, PanelSection } from '@/components/admin/ui';
import {
  IconArrow,
  IconCamera,
  IconClose,
  IconDownload,
} from '@/components/invitation/Ornaments';
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
    <PanelSection
      n={4}
      label="Albüm"
      title="Misafir Fotoğrafları"
      lead={`${visible.length} fotoğraf · ${formatBytes(totalBytes)} · masadaki QR koddan yüklenir`}
      action={
        visible.length > 0 ? (
          <a
            href={api.photosZipUrl(filter === 'all' ? undefined : filter)}
            className="cta nudge"
            download
          >
            <IconDownload size={14} />
            Tümünü İndir
            <IconArrow size={14} />
          </a>
        ) : undefined
      }
    >

      {invitations.length > 1 && (
        <div className="mb-[var(--sp-md)] flex flex-wrap gap-[var(--sp-md)]">
          {[{ id: 'all', label: 'Tümü' }, ...invitations.map((inv) => ({
            id: inv.id,
            label: `${inv.groomName} ${inv.conjunction} ${inv.brideName}`,
          }))].map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setFilter(option.id)}
              className="relative pb-2 font-sans text-sm transition-colors duration-300"
              style={{
                color: filter === option.id ? 'var(--c-gold-light)' : 'var(--c-on-dark-faint)',
              }}
            >
              {option.label}
              <span
                className="absolute inset-x-0 bottom-0 h-px origin-left transition-transform duration-500"
                style={{
                  background: 'currentColor',
                  transform: filter === option.id ? 'scaleX(1)' : 'scaleX(0)',
                }}
                aria-hidden
              />
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="t-body mb-4" style={{ color: '#e2a3a3' }}>
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-[var(--sp-sm)] sm:grid-cols-3 lg:grid-cols-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="aspect-square animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={IconCamera}
          title="Henüz fotoğraf yok"
          lead="Masalara koyduğunuz QR kodu okutan misafirlerin fotoğrafları burada birikir."
        />
      ) : (
        <div className="columns-2 gap-[var(--sp-sm)] sm:columns-3 lg:columns-4">
          {visible.map((photo, i) => (
            <motion.button
              key={photo.id}
              type="button"
              onClick={() => setOpen(i)}
              className="group relative mb-[var(--sp-sm)] block w-full break-inside-avoid overflow-hidden"
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
                className="block w-full transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
              />
              {photo.uploaderName && (
                <span
                  className="absolute inset-x-0 bottom-0 truncate px-3 py-2 text-left font-sans text-[11px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{ background: 'rgba(9,6,3,0.75)', color: 'var(--c-gold-light)' }}
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
            style={{ background: 'rgba(9,6,3,0.96)' }}
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
                  <p className="t-lead" style={{ color: 'var(--c-on-dark)' }}>
                    {current.uploaderName || 'İsimsiz misafir'}
                  </p>
                  <p className="numerals font-sans text-xs" style={{ color: 'var(--c-on-dark-faint)' }}>
                    {formatWhen(current.createdAt)}
                    {current.width > 0 ? ` · ${current.width}×${current.height}` : ''} ·{' '}
                    {formatBytes(current.size)}
                  </p>
                  {current.note && (
                    <p className="t-body mt-1 italic" style={{ color: 'var(--c-on-dark-soft)' }}>
                      “{current.note}”
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <a
                    href={api.photoDownloadUrl(current.id)}
                    download
                    className="cta nudge"
                  >
                    <IconDownload size={14} />
                    Orijinali İndir
                  </a>
                  {canDelete && (
                    <Action danger onClick={() => remove(current.id)}>
                      Sil
                    </Action>
                  )}
                </div>
              </div>
            </motion.div>

            <button
              type="button"
              onClick={close}
              aria-label="Kapat"
              className="absolute right-6 top-6 transition-transform duration-500 hover:rotate-90"
              style={{ color: 'var(--c-on-dark-soft)' }}
            >
              <IconClose size={20} />
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
                  className="absolute left-3 sm:left-6"
                  style={{ color: 'var(--c-on-dark-soft)' }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden>
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
                  className="absolute right-3 sm:right-6"
                  style={{ color: 'var(--c-on-dark-soft)' }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden>
                    <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1" fill="none" />
                  </svg>
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </PanelSection>
  );
}
