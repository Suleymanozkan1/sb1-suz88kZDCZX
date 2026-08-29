'use client';

import { motion } from 'framer-motion';
import type { Invitation } from '@/lib/types';

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" />
    </svg>
  );
}

export default function ContactSection({ invitation }: { invitation: Invitation }) {
  const links = invitation.socialLinks ?? [];
  const conjunction = invitation.conjunction || '&';

  return (
    <section
      id="contact"
      className="section-gap relative"
      style={{ background: 'linear-gradient(135deg, #1a0f08 0%, #2d1f12 50%, #1a110a 100%)' }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, rgba(201,168,76,0.05), transparent 70%)' }}
      />

      <div className="relative mx-auto max-w-2xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="font-sans text-xs uppercase tracking-title" style={{ color: 'rgba(201,168,76,0.7)' }}>
            İletişim
          </p>
          <h2 className="mt-3 font-serif text-4xl font-light sm:text-5xl" style={{ color: '#E8D5A3' }}>
            Bize Ulaşın
          </h2>
        </motion.div>

        {links.length > 0 && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {links.map((link, i) => (
              <motion.a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-[150px] flex-col items-center gap-2 rounded-2xl px-6 py-5 transition-all hover:-translate-y-1"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(201,168,76,0.2)',
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <span style={{ color: '#C9A84C' }}>
                  <InstagramIcon />
                </span>
                <span className="font-sans text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  {link.name}
                </span>
                <span className="font-sans text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {link.handle}
                </span>
              </motion.a>
            ))}
          </div>
        )}

        {invitation.hashtag && (
          <motion.div
            className="mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <p className="font-sans text-xs uppercase tracking-[0.25em]" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Anılarınızı paylaşın
            </p>
            <p className="mt-3 font-serif text-2xl font-light gold-text">{invitation.hashtag}</p>
          </motion.div>
        )}

        <div className="mt-16 flex flex-col items-center gap-3">
          <span className="font-serif text-lg" style={{ color: 'rgba(201,168,76,0.7)' }}>
            ♡
          </span>
          <p className="font-serif text-lg font-light" style={{ color: 'rgba(232,213,163,0.8)' }}>
            {invitation.groomName} {conjunction} {invitation.brideName}
          </p>
          <p className="font-sans text-[10px] uppercase tracking-[0.3em]" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Made with ♡
          </p>
        </div>
      </div>
    </section>
  );
}
