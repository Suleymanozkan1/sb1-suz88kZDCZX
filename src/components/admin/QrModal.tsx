'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Action, Modal } from './ui';
import { IconDownload } from '@/components/invitation/Ornaments';
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
    <Modal onClose={onClose}>
      <p className="t-label" style={{ color: 'var(--c-gold)' }}>
        QR Kod
      </p>

      <div className="mt-[var(--sp-sm)] flex gap-[var(--sp-md)]">
        {KINDS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setKind(option.id)}
            className="relative pb-2 font-sans text-sm transition-colors duration-300"
            style={{
              color: kind === option.id ? 'var(--c-gold-light)' : 'var(--c-on-dark-faint)',
            }}
          >
            {option.label}
            <span
              className="absolute inset-x-0 bottom-0 h-px origin-left transition-transform duration-500"
              style={{
                background: 'currentColor',
                transform: kind === option.id ? 'scaleX(1)' : 'scaleX(0)',
              }}
              aria-hidden
            />
          </button>
        ))}
      </div>

      <div className="mt-[var(--sp-md)]">
        {dataUrl ? (
          // QR görseli data URI olduğu için next/image optimizasyonuna gerek yok.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dataUrl} alt="QR Kod" className="mx-auto w-52" />
        ) : (
          <div className="mx-auto h-52 w-52 animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
        )}
      </div>

      <p className="t-body mt-[var(--sp-sm)] measure" style={{ color: 'var(--c-on-dark-soft)' }}>
        {active.hint}
      </p>
      <p className="mt-2 break-all font-sans text-xs" style={{ color: 'var(--c-on-dark-faint)' }}>
        {url}
      </p>

      <div className="mt-[var(--sp-md)] flex flex-wrap gap-[var(--sp-md)]">
        <a
          href={dataUrl || '#'}
          download={`${invitation.slug}-${kind}-qr.png`}
          className="link-underline flex items-center gap-2"
          style={{ color: 'var(--c-gold-light)' }}
        >
          <IconDownload size={14} />
          PNG İndir
        </a>
        <Action onClick={copy}>{copied ? 'Kopyalandı' : 'Linki Kopyala'}</Action>
      </div>
    </Modal>
  );
}
