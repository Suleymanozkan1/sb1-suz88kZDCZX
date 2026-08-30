'use client';

import { motion } from 'framer-motion';
import SectionHead from './SectionHead';
import { IconArrow, IconCalendar, IconClock, IconPin, IconVenue } from './Ornaments';
import {
  calendarEndStamp,
  calendarStamp,
  formatDate,
  formatTimeRange,
  formatWeekday,
} from '@/lib/format';
import type { Invitation } from '@/lib/types';

/**
 * Düğün bilgileri.
 *
 * Dört cam kart yerine bir "künye" — her satır ince bir kuralla ayrılmış,
 * etiket solda, değer sağda. Basılı bir davetiyenin arka yüzü gibi okunur.
 */
export default function DetailsSection({ invitation }: { invitation: Invitation }) {
  const conjunction = invitation.conjunction || '&';
  const location = [invitation.venueName, invitation.district, invitation.city]
    .filter(Boolean)
    .join(', ');

  const rows = [
    {
      Icon: IconVenue,
      label: 'Mekân',
      value: invitation.venueName || '—',
      sub: [invitation.district, invitation.city].filter(Boolean).join(', '),
    },
    {
      Icon: IconCalendar,
      label: 'Tarih',
      value: formatDate(invitation.weddingDate) || '—',
      sub: formatWeekday(invitation.weddingDate),
    },
    {
      Icon: IconClock,
      label: 'Saat',
      value: formatTimeRange(invitation.weddingTime, invitation.weddingEndTime) || '—',
      sub: 'Kapılar yarım saat önce açılır',
    },
    {
      Icon: IconPin,
      label: 'Adres',
      value: invitation.address || invitation.city || '—',
      sub: invitation.district,
    },
  ];

  const start = calendarStamp(invitation.weddingDate, invitation.weddingTime);
  const end = calendarEndStamp(
    invitation.weddingDate,
    invitation.weddingTime,
    invitation.weddingEndTime,
  );
  const title = `${invitation.groomName} ${conjunction} ${invitation.brideName} Düğünü`;

  const googleUrl =
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    `&text=${encodeURIComponent(title)}` +
    `&dates=${start}/${end}` +
    `&location=${encodeURIComponent(location)}` +
    `&details=${encodeURIComponent(invitation.invitationText ?? '')}`;


  return (
    <section id="details" className="section-gap relative">
      <div className="mx-auto max-w-5xl px-[var(--sp-md)]">
        <SectionHead
          n={2}
          label={invitation.detailsSectionSubtitle || 'Detaylar'}
          title={invitation.detailsSectionTitle || 'Düğün Bilgileri'}
        />

        <div>
          {rows.map((row, i) => (
            <motion.div
              key={row.label}
              className="relative grid grid-cols-1 items-baseline gap-x-[var(--sp-md)] gap-y-2 py-[var(--sp-sm)] sm:grid-cols-12"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-140px' }}
              transition={{ duration: 1.16, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="rule absolute inset-x-0 top-0" aria-hidden />

              <div
                className="flex items-center gap-3 sm:col-span-4"
                style={{ color: 'var(--c-gold-deep)' }}
              >
                <row.Icon size={19} />
                <span className="t-label">{row.label}</span>
              </div>

              <div className="sm:col-span-8">
                <p className="t-h2" style={{ color: 'var(--c-on-light)' }}>
                  {row.value}
                </p>
                {row.sub && (
                  <p className="t-body mt-1" style={{ color: 'var(--c-on-light-faint)' }}>
                    {row.sub}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
          <span className="rule block" aria-hidden />
        </div>

        {invitation.weddingDate && (
          <motion.div
            className="mt-[var(--sp-md)] flex flex-wrap items-center gap-x-8 gap-y-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.16, delay: 0.2 }}
          >
            <a
              href={googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cta cta-on-light nudge"
            >
              Takvime Ekle
              <IconArrow size={15} />
            </a>
          </motion.div>
        )}
      </div>
    </section>
  );
}
