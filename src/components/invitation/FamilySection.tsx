'use client';

import { motion } from 'framer-motion';
import SectionHead from './SectionHead';
import type { Invitation } from '@/lib/types';

/**
 * Ailelerimiz — gelin solda, damat sağda.
 *
 * Serbest metin, çünkü Türkiye'de bu satır çok farklı yazılıyor: kimi
 * "Yılmaz Ailesi", kimi anne-baba adlarını tam yazıyor, kimi ikisini
 * birden. Dört ayrı alan sormak, üçünü de boş bırakan çifte yanlış soru
 * sormak olurdu.
 */
export default function FamilySection({ invitation, n }: { invitation: Invitation; n: number }) {
  const taraflar = [
    { label: invitation.brideFamilyLabel || 'Gelin Ailesi', text: invitation.brideFamilyText },
    { label: invitation.groomFamilyLabel || 'Damat Ailesi', text: invitation.groomFamilyText },
  ].filter((t) => t.text.trim());

  if (!invitation.showFamily || taraflar.length === 0) return null;

  return (
    <section id="family" className="section-gap relative">
      <div className="mx-auto max-w-4xl px-[var(--sp-md)]">
        <SectionHead
          n={n}
          label={invitation.familySectionSubtitle || 'Bizi Yetiştirenler'}
          title={invitation.familySectionTitle || 'Ailelerimiz'}
        />

        <div className="grid gap-[var(--sp-md)] text-center sm:grid-cols-2">
          {taraflar.map((taraf, i) => (
            <motion.div
              key={taraf.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-120px' }}
              transition={{ duration: 1.0, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="t-label" style={{ color: 'var(--c-gold-deep)' }}>
                {taraf.label}
              </p>
              <p
                className="t-lead mt-3 whitespace-pre-line leading-relaxed"
                style={{ color: 'var(--c-on-light)' }}
              >
                {taraf.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
