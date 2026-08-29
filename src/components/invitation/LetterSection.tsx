'use client';

import { motion } from 'framer-motion';
import { BESMELE, READY_AYET, READY_HADIS } from '@/lib/defaults';
import { formatDate } from '@/lib/format';
import type { Invitation } from '@/lib/types';

/** Monogram, davet metni ve manevi içeriği taşıyan "mektup" bölümü. */
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
    <section
      id="letter"
      className="section-gap relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #FAF6F0 0%, #fff 55%, #FAF6F0 100%)' }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40"
        style={{ background: 'linear-gradient(180deg, rgba(13,8,5,0.12), transparent)' }}
      />

      <div className="relative mx-auto max-w-2xl px-6 text-center">
        {/* monogram madalyonu */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mb-10 flex justify-center"
        >
          <div
            className="flex h-24 w-24 items-center justify-center rounded-full"
            style={{
              background: 'linear-gradient(135deg, rgba(201,168,76,0.12), rgba(232,213,163,0.05))',
              border: '1px solid rgba(201,168,76,0.35)',
            }}
          >
            <span className="font-serif text-xl font-light" style={{ color: '#9A7B2F' }}>
              {monogram}
            </span>
          </div>
        </motion.div>

        {invitation.showBesmele && (
          <motion.p
            className="mb-8 font-serif text-xl"
            style={{ color: '#9A7B2F', direction: 'rtl' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {BESMELE}
          </motion.p>
        )}

        {/* ayraç */}
        <motion.div
          className="mb-10 flex items-center justify-center gap-3"
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
        >
          <div className="h-[1px] w-20" style={{ background: 'linear-gradient(90deg, transparent, #C9A84C)' }} />
          <span style={{ color: '#C9A84C' }}>✦</span>
          <div className="h-[1px] w-20" style={{ background: 'linear-gradient(270deg, transparent, #C9A84C)' }} />
        </motion.div>

        <motion.p
          className="mb-8 font-serif text-xl font-light italic leading-relaxed sm:text-2xl"
          style={{ color: '#3a2a17' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          “{invitation.invitationText}”
        </motion.p>

        {invitation.showAyet && (
          <motion.p
            className="mx-auto mb-6 max-w-xl font-serif text-base font-light italic leading-relaxed"
            style={{ color: '#6b5a44' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {READY_AYET}
          </motion.p>
        )}

        {invitation.showHadis && (
          <motion.p
            className="mx-auto mb-6 max-w-xl font-serif text-base font-light italic leading-relaxed"
            style={{ color: '#6b5a44' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {READY_HADIS}
          </motion.p>
        )}

        {invitation.duaText && (
          <motion.p
            className="mx-auto mb-4 max-w-xl font-serif text-base font-light leading-relaxed"
            style={{ color: '#6b5a44' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {invitation.duaText}
          </motion.p>
        )}

        {invitation.religiousSource && (
          <p className="mb-8 font-sans text-xs uppercase tracking-[0.25em]" style={{ color: '#9A7B2F' }}>
            {invitation.religiousSource}
          </p>
        )}

        <motion.div
          className="mb-8 flex items-center justify-center gap-3"
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <div className="h-[1px] w-12" style={{ background: 'rgba(201,168,76,0.5)' }} />
          <span style={{ color: '#C9A84C' }}>♡</span>
          <div className="h-[1px] w-12" style={{ background: 'rgba(201,168,76,0.5)' }} />
        </motion.div>

        {fullNames.length > 0 && (
          <motion.p
            className="mb-3 font-serif text-lg font-light"
            style={{ color: '#2b1d0f' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            {fullNames.join(`  ${conjunction}  `)}
          </motion.p>
        )}

        <motion.p
          className="font-sans text-xs uppercase tracking-[0.25em]"
          style={{ color: '#8a765a' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          {formatDate(invitation.weddingDate)} · {invitation.city}
        </motion.p>
      </div>
    </section>
  );
}
