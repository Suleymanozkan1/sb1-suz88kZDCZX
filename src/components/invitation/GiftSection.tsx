'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import SectionHead from './SectionHead';
import { Divider, IconCheck, IconArrow } from './Ornaments';
import { safeUrl } from '@/lib/safe-url';
import type { Invitation } from '@/lib/types';

/** IBAN'ı dörderli gruplayarak okunur kılar. */
function formatIban(raw: string): string {
  const clean = raw.replace(/\s+/g, '').toUpperCase();
  return clean.replace(/(.{4})/g, '$1 ').trim();
}

/**
 * Hediye bölümü.
 *
 * Türkiye'de düğün hediyesi çoğunlukla para olduğu için IBAN paylaşmak
 * yaygın bir ihtiyaç; misafirin numarayı elle kopyalamaya çalışması ise
 * hata kaynağı. Burada tek dokunuşla kopyalanır.
 *
 * Bölüm yalnızca çift açıkça açtığında ve dolduracak bir şey verdiğinde
 * görünür — IBAN kişisel bir bilgidir, varsayılan olarak yayımlanmaz.
 */
export default function GiftSection({ invitation }: { invitation: Invitation }) {
  const [copied, setCopied] = useState(false);

  const iban = invitation.giftIban?.trim() ?? '';
  const registry = safeUrl(invitation.giftRegistryUrl);
  if (!invitation.giftEnabled || (!iban && !registry)) return null;

  async function copy() {
    const value = iban.replace(/\s+/g, '').toUpperCase();
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Pano yoksa (eski tarayıcı, izin yok) seçilebilir bir uyarıya düşülür.
      window.prompt('IBAN:', value);
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2400);
  }

  return (
    <section id="gift" className="section-gap relative">
      <div className="mx-auto max-w-2xl px-[var(--sp-md)]">
        <SectionHead
          n={8}
          label="Hediye"
          title={invitation.giftTitle || 'Hediye'}
          align="center"
          tone="dark"
        />

        {invitation.giftNote && (
          <p
            className="t-body measure mx-auto text-center"
            style={{ color: 'var(--c-on-dark-soft)' }}
          >
            {invitation.giftNote}
          </p>
        )}

        {iban && (
          <motion.div
            className="mt-[var(--sp-md)] px-6 py-[var(--sp-md)] text-center"
            style={{ border: '1px solid rgba(176, 141, 63, 0.28)' }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-160px' }}
            transition={{ duration: 1.16, ease: [0.22, 1, 0.36, 1] }}
          >
            {invitation.giftAccountName && (
              <p className="t-body" style={{ color: 'var(--c-on-dark)' }}>
                {invitation.giftAccountName}
              </p>
            )}
            {invitation.giftBankName && (
              <p className="t-label mt-1" style={{ color: 'var(--c-on-dark-faint)' }}>
                {invitation.giftBankName}
              </p>
            )}

            <p
              className="numerals mt-[var(--sp-sm)] break-all text-lg"
              style={{ color: 'var(--c-gold-light)', letterSpacing: '0.06em' }}
            >
              {formatIban(iban)}
            </p>

            <button
              type="button"
              onClick={copy}
              className="mt-[var(--sp-sm)] inline-flex items-center gap-2 px-5 py-2 font-sans text-[11px] uppercase tracking-[0.18em] transition-colors duration-300"
              style={{ border: '1px solid rgba(176, 141, 63, 0.4)', color: 'var(--c-gold-light)' }}
            >
              {copied ? (
                <>
                  <IconCheck size={11} /> Kopyalandı
                </>
              ) : (
                'IBAN’ı Kopyala'
              )}
            </button>
          </motion.div>
        )}

        {registry && (
          <div className="mt-[var(--sp-md)] text-center">
            <a
              href={registry}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 t-body"
              style={{ color: 'var(--c-gold-light)' }}
            >
              Hediye Listemiz
              <IconArrow size={13} />
            </a>
          </div>
        )}

        <div className="mt-[var(--sp-md)] text-center" style={{ color: 'var(--c-gold)' }}>
          <Divider />
        </div>
      </div>
    </section>
  );
}
