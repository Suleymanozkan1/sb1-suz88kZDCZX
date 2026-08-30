'use client';

import { motion } from 'framer-motion';
import { Divider } from './Ornaments';
import { BESMELE, READY_AYET, READY_HADIS } from '@/lib/defaults';
import { formatDate } from '@/lib/format';
import type { Invitation } from '@/lib/types';

const IN_VIEW = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
};

/**
 * Mektup — sayfanın gece/gündüz köprüsü.
 *
 * Gövde gradyanı tam burada bronzdan kreme döner, bu yüzden bölüm kendi
 * zeminini boyamaz. Metin rengi de yolculuğa uyacak şekilde açık→koyu
 * geçer. Kompozisyon ortalanmıştır: bu, sayfadaki iki dönüm noktasından
 * biri ve ortalama burada kasıt taşır.
 */
export default function LetterSection({ invitation }: { invitation: Invitation }) {
  const conjunction = invitation.conjunction || '&';
  const monogram =
    invitation.sealMonogram?.trim() ||
    `${invitation.groomName?.[0] ?? ''} ${conjunction} ${invitation.brideName?.[0] ?? ''}`;

  const fullNames = [
    [invitation.groomName, invitation.groomSurname].filter(Boolean).join(' '),
    [invitation.brideName, invitation.brideSurname].filter(Boolean).join(' '),
  ].filter(Boolean);

  return (
    <section id="letter" className="section-gap relative">
      <div className="relative mx-auto max-w-3xl px-[var(--sp-md)] text-center">
        {/* monogram — kart değil, kâğıda basılı bir damga */}
        <motion.div
          className="flex justify-center"
          {...IN_VIEW}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="flex h-24 w-24 items-center justify-center rounded-full"
            style={{ border: '1px solid rgba(226, 205, 151, 0.32)' }}
          >
            <span
              className="t-lead italic"
              style={{ color: 'var(--c-gold-light)' }}
            >
              {monogram}
            </span>
          </div>
        </motion.div>

        {invitation.showBesmele && (
          <motion.p
            className="mt-[var(--sp-md)] font-serif text-xl"
            style={{ color: 'var(--c-gold-light)', direction: 'rtl' }}
            {...IN_VIEW}
            transition={{ duration: 1 }}
          >
            {BESMELE}
          </motion.p>
        )}

        <motion.div
          className="mt-[var(--sp-md)]"
          style={{ color: 'var(--c-gold-deep)' }}
          {...IN_VIEW}
          transition={{ duration: 1, delay: 0.1 }}
        >
          <Divider />
        </motion.div>

        {/* davet metni — sayfanın en büyük düz metni, italik ve geniş satır aralığı */}
        <motion.p
          className="t-display mx-auto mt-[var(--sp-md)] italic measure"
          style={{ color: 'var(--c-on-dark)', fontSize: 'clamp(1.2rem, 2.3vw, 1.7rem)', lineHeight: 1.45 }}
          {...IN_VIEW}
          transition={{ duration: 1.1, delay: 0.15 }}
        >
          {invitation.invitationText}
        </motion.p>

        {(invitation.showAyet || invitation.showHadis || invitation.duaText) && (
          <motion.div
            className="mx-auto mt-[var(--sp-md)] max-w-xl space-y-4"
            {...IN_VIEW}
            transition={{ duration: 1, delay: 0.2 }}
          >
            {invitation.showAyet && (
              <p className="t-lead italic" style={{ color: 'var(--c-on-dark-soft)' }}>
                {READY_AYET}
              </p>
            )}
            {invitation.showHadis && (
              <p className="t-lead italic" style={{ color: 'var(--c-on-dark-soft)' }}>
                {READY_HADIS}
              </p>
            )}
            {invitation.duaText && (
              <p className="t-body" style={{ color: 'var(--c-on-dark-soft)' }}>
                {invitation.duaText}
              </p>
            )}
            {invitation.religiousSource && (
              <p className="t-label" style={{ color: 'var(--c-gold)' }}>
                {invitation.religiousSource}
              </p>
            )}
          </motion.div>
        )}

        {/* imza bloğu — mektubun altındaki el yazısı hissi */}
        <motion.div
          className="mt-[var(--sp-lg)]"
          {...IN_VIEW}
          transition={{ duration: 1, delay: 0.25 }}
        >
          <span
            className="mx-auto block h-10 w-px"
            style={{ background: 'var(--c-rule-dark)' }}
            aria-hidden
          />

          {fullNames.length > 0 && (
            <p
              className="t-lead mt-[var(--sp-sm)]"
              style={{ color: 'var(--c-on-dark)' }}
            >
              {fullNames.join(`  ${conjunction}  `)}
            </p>
          )}

          <p className="numerals mt-3 text-sm" style={{ color: 'var(--c-on-dark-faint)' }}>
            {[formatDate(invitation.weddingDate), invitation.city].filter(Boolean).join(' · ')}
          </p>
        </motion.div>
      </div>

      {/* gece → gündüz dönüşü bu boşlukta tamamlanır */}
    </section>
  );
}
