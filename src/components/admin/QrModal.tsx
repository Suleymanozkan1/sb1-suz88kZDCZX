'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import type { Invitation } from '@/lib/types';

type Kind = 'davet' | 'yukle';

const KINDS: { id: Kind; label: string; path: string; hint: string }[] = [
  {
    id: 'davet',
    label: 'Davetiye QR',
    path: '/davet/',
    hint: 'Misafirlere gönderilir — davetiyeyi açar.',
  },
  {
    id: 'yukle',
    label: 'Fotoğraf QR',
    path: '/yukle/',
    hint: 'Masalara konur — yalnızca fotoğraf yükleme sayfasını açar.',
  },
];

/**
 * Her davetiye için iki ayrı QR üretir: davetiyenin kendisi ve masalara
 * konacak, yalnızca fotoğraf yüklemeye açılan kod.
 */
export default function QrModal({
  invitation,
  onClose,
}: {
  invitation: Invitation;
  onClose: () => void;
}) {
  const [kind, setKind] = useState<Kind>('davet');
  const [dataUrl, setDataUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const active = KINDS.find((k) => k.id === kind) ?? KINDS[0];
  const url =
    typeof window === 'undefined' ? '' : `${window.location.origin}${active.path}${invitation.slug}`;

  useEffect(() => {
    if (!url) return;
    setDataUrl('');
    QRCode.toDataURL(url, {
      width: 640,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#1a0f08', light: '#FAF6F0' },
    }).then(setDataUrl, () => setDataUrl(''));
  }, [url]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt('Bağlantı:', url);
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-[900] flex items-center justify-center p-6"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-sm rounded-2xl p-8 text-center"
        style={{ background: '#150e07', border: '1px solid rgba(201,168,76,0.25)' }}
        initial={{ scale: 0.94 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-5 font-serif text-xl font-light" style={{ color: '#E8D5A3' }}>
          QR Kod
        </h3>

        <div className="mb-5 flex gap-2">
          {KINDS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setKind(option.id)}
              className="flex-1 rounded-xl px-3 py-2 font-sans text-xs transition-all"
              style={{
                background: kind === option.id ? 'rgba(201,168,76,0.18)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${kind === option.id ? 'rgba(201,168,76,0.5)' : 'rgba(201,168,76,0.12)'}`,
                color: kind === option.id ? '#E8D5A3' : 'rgba(255,255,255,0.5)',
              }}
            >
              {option.label}
            </button>
          ))}
        </div>

        {dataUrl ? (
          // QR görseli data URI olduğu için next/image optimizasyonuna gerek yok.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dataUrl} alt="QR Kod" className="mx-auto w-56 rounded-xl" />
        ) : (
          <div className="mx-auto h-56 w-56 animate-pulse rounded-xl bg-white/5" />
        )}

        <p className="mt-4 font-sans text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {active.hint}
        </p>
        <p className="mt-2 break-all font-sans text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {url}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={dataUrl || '#'}
            download={`${invitation.slug}-${kind}-qr.png`}
            className="btn-gold flex-1 text-center"
          >
            İndir
          </a>
          <button type="button" onClick={copy} className="btn-ghost flex-1">
            {copied ? 'Kopyalandı ✓' : 'Linki Kopyala'}
          </button>
        </div>

        <button type="button" onClick={onClose} className="btn-ghost mt-3 w-full">
          Kapat
        </button>
      </motion.div>
    </motion.div>
  );
}
