'use client';

import { safeUrl } from '@/lib/safe-url';
import { motion } from 'framer-motion';
import SectionHead from './SectionHead';
import { IconArrow } from './Ornaments';
import type { Invitation } from '@/lib/types';

/**
 * Konum.
 *
 * Harita tam genişlikte ve çerçevesiz durur; adres ve yol tarifi
 * bağlantıları solda bir sütunda toplanır. Ortalanmış buton üçlüsü yerine
 * asimetrik bir yerleşim — sayfanın ritmini kırar.
 */
export default function LocationSection({ invitation }: { invitation: Invitation }) {
  const query = [invitation.venueName, invitation.address, invitation.district, invitation.city]
    .filter(Boolean)
    .join(' ');

  if (!query) return null;

  const encoded = encodeURIComponent(query);
  // Çiftin girdiği adres doğrulanır; şeması uygun değilse aramaya düşülür.
  const googleMaps =
    safeUrl(invitation.mapUrl) ?? `https://www.google.com/maps/search/?api=1&query=${encoded}`;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encoded}`;
  const yandex = `https://yandex.com.tr/harita/?text=${encoded}`;
  const embed = `https://www.google.com/maps?q=${encoded}&output=embed`;

  return (
    <section id="location" className="section-gap relative">
      <div className="mx-auto max-w-6xl px-[var(--sp-md)]">
        <SectionHead n={5} label="Konum" title="Nasıl Gelirsiniz?" />

        <div className="grid gap-[var(--sp-md)] lg:grid-cols-12">
          <motion.div
            className="lg:col-span-4"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="t-h2" style={{ color: 'var(--c-on-light)' }}>
              {invitation.venueName}
            </p>
            <p className="t-body mt-3" style={{ color: 'var(--c-on-light-soft)' }}>
              {[invitation.address, invitation.district, invitation.city]
                .filter(Boolean)
                .join(', ')}
            </p>

            <div className="mt-[var(--sp-md)] flex flex-col items-start gap-5">
              <a
                href={directions}
                target="_blank"
                rel="noopener noreferrer"
                className="cta cta-on-light nudge"
              >
                Yol Tarifi Al
                <IconArrow size={15} />
              </a>

              <div className="flex flex-col gap-3">
                <a
                  href={googleMaps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline self-start"
                  style={{ color: 'var(--c-on-light-soft)' }}
                >
                  Google Maps
                </a>
                <a
                  href={yandex}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline self-start"
                  style={{ color: 'var(--c-on-light-soft)' }}
                >
                  Yandex Harita
                </a>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="overflow-hidden lg:col-span-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{ border: '1px solid var(--c-rule)' }}
          >
            <iframe
              src={embed}
              width="100%"
              height="420"
              style={{ border: 0, filter: 'grayscale(0.35) sepia(0.15)' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Düğün Lokasyonu"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
