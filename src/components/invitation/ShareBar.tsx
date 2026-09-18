'use client';

import { useState } from 'react';
import { IconCheck } from './Ornaments';
import type { Invitation } from '@/lib/types';

/**
 * Davetiyeyi iletme.
 *
 * Davetiyeler ağızdan ağıza yayılır: bir akraba linki alır ve gruba atar.
 * Adres çubuğundan kopyalamak telefonda zahmetli olduğu için WhatsApp ve
 * doğrudan kopyalama tek dokunuşa indirilir.
 */
export default function ShareBar({ invitation }: { invitation: Invitation }) {
  const [copied, setCopied] = useState(false);

  const conjunction = invitation.conjunction || '&';
  const names = `${invitation.brideName} ${conjunction} ${invitation.groomName}`;

  // Sunucuda window yoktur; adres istemcide çözülür.
  const url = typeof window === 'undefined' ? '' : window.location.href;
  const text = `${names} düğün davetiyesi: ${url}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      window.prompt('Davetiye adresi:', url);
    }
  }

  async function share() {
    // Mobilde yerel paylaşım sayfası varsa o kullanılır; yoksa WhatsApp.
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: names, text: `${names} düğün davetiyesi`, url });
        return;
      } catch {
        // Kullanıcı vazgeçti; WhatsApp'a düşülmez.
        return;
      }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-[var(--sp-sm)]">
      <button
        type="button"
        onClick={share}
        className="px-5 py-2 font-sans text-[11px] uppercase tracking-[0.18em] transition-colors duration-300"
        style={{ border: '1px solid rgba(176, 141, 63, 0.4)', color: 'var(--c-gold-light)' }}
      >
        Davetiyeyi Paylaş
      </button>
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-2 px-5 py-2 font-sans text-[11px] uppercase tracking-[0.18em] transition-colors duration-300"
        style={{ border: '1px solid rgba(176, 141, 63, 0.22)', color: 'var(--c-on-dark-soft)' }}
      >
        {copied ? (
          <>
            <IconCheck size={11} /> Kopyalandı
          </>
        ) : (
          'Bağlantıyı Kopyala'
        )}
      </button>
    </div>
  );
}
