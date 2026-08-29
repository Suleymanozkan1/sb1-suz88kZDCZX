'use client';

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
export default function ContactSection({ invitation }: { invitation: Invitation }) {
  const links = invitation.socialLinks ?? [];
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
          transition={{ duration: 0.9 }}
        >
          Görüşmek Üzere
        </motion.p>

        <motion.p
          className="t-display mt-[var(--sp-sm)]"
          style={{ color: 'var(--c-on-dark)' }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          {invitation.groomName}{' '}
          <span className="italic" style={{ color: 'var(--c-gold)' }}>
            {conjunction}
          </span>{' '}
          {invitation.brideName}
        </motion.p>

        {links.length > 0 && (
          <motion.div
            className="mt-[var(--sp-md)] flex flex-wrap items-center justify-center gap-x-[var(--sp-md)] gap-y-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.2 }}
          >
            {links.map((link) => (
              <a
                key={link.name}
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

        {invitation.hashtag && (
          <motion.p
            className="t-lead mt-[var(--sp-md)]"
            style={{ color: 'var(--c-gold-light)' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.3 }}
          >
            {invitation.hashtag}
          </motion.p>
        )}

        <p className="t-label mt-[var(--sp-lg)]" style={{ color: 'var(--c-on-dark-faint)' }}>
          Sevgiyle hazırlandı
        </p>
      </div>
    </section>
  );
}
