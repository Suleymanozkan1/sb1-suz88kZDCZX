'use client';

import { motion } from 'framer-motion';
import type { Invitation } from '@/lib/types';

export default function LocationSection({ invitation }: { invitation: Invitation }) {
  const query = [invitation.venueName, invitation.address, invitation.district, invitation.city]
    .filter(Boolean)
    .join(' ');

  if (!query) return null;

  const encoded = encodeURIComponent(query);
  const googleMaps = invitation.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encoded}`;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encoded}`;
  const yandex = `https://yandex.com.tr/harita/?text=${encoded}`;
  const embed = `https://www.google.com/maps?q=${encoded}&output=embed`;

  return (
    <section
      id="location"
      className="section-gap relative"
      style={{ background: 'linear-gradient(180deg, #FAF6F0, #F0E8D8, #FAF6F0)' }}
    >
      <div className="mx-auto max-w-4xl px-6">
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="font-sans text-xs uppercase tracking-title" style={{ color: '#9A7B2F' }}>
            Konum
          </p>
          <h2 className="mt-3 font-serif text-4xl font-light sm:text-5xl" style={{ color: '#2b1d0f' }}>
            Nasıl Gelirsiniz?
          </h2>
        </motion.div>

        <motion.div
          className="overflow-hidden rounded-3xl"
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          style={{
            boxShadow: '0 12px 50px rgba(0,0,0,0.1)',
            border: '1px solid rgba(201,168,76,0.25)',
          }}
        >
          <iframe
            src={embed}
            width="100%"
            height="380"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Düğün Lokasyonu"
          />
        </motion.div>

        <motion.div
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <a href={directions} target="_blank" rel="noopener noreferrer" className="btn-gold">
            Yol Tarifi Al
          </a>
          <a
            href={googleMaps}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full px-6 py-3 font-sans text-sm uppercase tracking-[0.2em] transition-all hover:-translate-y-0.5"
            style={{
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(201,168,76,0.35)',
              color: '#6B4F1A',
            }}
          >
            Google Maps
          </a>
          <a
            href={yandex}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full px-6 py-3 font-sans text-sm uppercase tracking-[0.2em] transition-all hover:-translate-y-0.5"
            style={{
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(201,168,76,0.35)',
              color: '#6B4F1A',
            }}
          >
            Yandex Harita
          </a>
        </motion.div>

        <p className="mt-6 text-center font-serif text-lg font-light" style={{ color: '#2b1d0f' }}>
          {invitation.venueName}
        </p>
        <p className="mt-1 text-center font-sans text-sm font-light" style={{ color: '#8a765a' }}>
          {[invitation.address, invitation.district, invitation.city].filter(Boolean).join(', ')}
        </p>
      </div>
    </section>
  );
}
