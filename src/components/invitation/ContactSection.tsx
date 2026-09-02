'use client';

import { safeUrl } from '@/lib/safe-url';
import ShareBar from './ShareBar';
import { motion } from 'framer-motion';
import { IconInstagram } from './Ornaments';
import type { Invitation } from '@/lib/types';

/**
 * Kapanış.
 *
 * Site haritası değil, bir varış noktası: isimler sayfadaki en büyük
 * ikinci tipografiyle geri gelir ve hashtag hafif bir hayalet katman
 * olarak arkada durur. Ziyaretçinin akılda tutacağı son kare budur.
 */
export default function ContactSection({
  invitation,
  brand,
}: {
  invitation: Invitation;
  /**
   * İşletmenin kendi hesabı — davetiyeden değil AYARDAN gelir. Her çifte
   * ayrı yazdırmak, birinin yanlış yazması ve kimsenin fark etmemesi
   * demekti.
   */
  brand?: { instagram: string; instagramLabel: string };
}) {
  // Adresi geçersiz olan hesap bağlantısı hiç basılmaz.
  const kendi = (invitation.socialLinks ?? [])
    .map((link) => ({ ...link, href: safeUrl(link.href) }))
    .filter((link): link is typeof link & { href: string } => Boolean(link.href));

  const isletme = brand?.instagram
    ? [{ name: brand.instagramLabel || 'Sahra Davet', handle: brand.instagramLabel, href: safeUrl(brand.instagram) }]
        .filter((l): l is typeof l & { href: string } => Boolean(l.href))
    : [];

  const links = [...kendi, ...isletme];
  const conjunction = invitation.conjunction || '&';

  return (
    <section id="contact" className="relative overflow-hidden pt-[var(--sp-lg)] pb-[var(--sp-lg)]">
      {/* hayalet hashtag — arka planda, okunaklı olmayacak kadar sönük */}
      {invitation.hashtag && (
        <span
          className="t-hero pointer-events-none absolute inset-x-0 bottom-[-0.18em] select-none text-center"
          style={{ color: 'rgba(242, 233, 216, 0.035)', whiteSpace: 'nowrap' }}
          aria-hidden
        >
          {invitation.hashtag}
        </span>
      )}

      <div className="relative mx-auto max-w-4xl px-[var(--sp-md)] text-center">
        <motion.p
          className="t-label"
          style={{ color: 'var(--c-gold)' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.3 }}
        >
          {invitation.contactSectionTitle || 'Görüşmek Üzere'}
        </motion.p>

        <motion.p
          className="t-display mt-[var(--sp-sm)]"
          style={{ color: 'var(--c-on-dark)' }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.59, ease: [0.22, 1, 0.36, 1] }}
        >
          {invitation.brideName}{' '}
          <span className="italic" style={{ color: 'var(--c-gold)' }}>
            {conjunction}
          </span>{' '}
          {invitation.groomName}
        </motion.p>

        {invitation.showSocial && (links.length > 0 || invitation.hashtag) && (
          <motion.p
            className="t-label mt-[var(--sp-md)]"
            style={{ color: 'var(--c-gold)' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.3, delay: 0.15 }}
          >
            {invitation.socialSectionTitle || 'Etiketlemeyi Unutmayın'}
          </motion.p>
        )}

        {invitation.showSocial && links.length > 0 && (
          <motion.div
            className="mt-[var(--sp-sm)] flex flex-wrap items-center justify-center gap-x-[var(--sp-md)] gap-y-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.3, delay: 0.2 }}
          >
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline flex items-center gap-3"
                style={{ color: 'var(--c-on-dark-soft)' }}
              >
                <IconInstagram size={17} />
                {link.handle || link.name}
              </a>
            ))}
          </motion.div>
        )}

        {invitation.showSocial && invitation.hashtag && (
          <motion.p
            className="t-lead mt-[var(--sp-md)]"
            style={{ color: 'var(--c-gold-light)' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.3, delay: 0.3 }}
          >
            {invitation.hashtag}
          </motion.p>
        )}

        {/*
          Paylaşma kapanışta durur: davetiye okunduktan sonra iletilir,
          okunmadan önce değil.
        */}
        <div className="mt-[var(--sp-lg)]">
          <ShareBar invitation={invitation} />
        </div>

        <p className="t-label mt-[var(--sp-lg)]" style={{ color: 'var(--c-on-dark-faint)' }}>
          Sevgiyle hazırlandı
        </p>
      </div>
    </section>
  );
}
