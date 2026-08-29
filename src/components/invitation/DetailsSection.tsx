'use client';

import { motion } from 'framer-motion';
import { calendarEndStamp, calendarStamp, formatDate, formatWeekday } from '@/lib/format';
import type { Invitation } from '@/lib/types';

function CalendarButtons({ invitation }: { invitation: Invitation }) {
  const conjunction = invitation.conjunction || '&';
  const title = `${invitation.groomName} ${conjunction} ${invitation.brideName} Düğünü`;
  const location = [invitation.venueName, invitation.district, invitation.city]
    .filter(Boolean)
    .join(', ');

  const start = calendarStamp(invitation.weddingDate, invitation.weddingTime);
  const end = calendarEndStamp(invitation.weddingDate, invitation.weddingTime);

  const googleUrl =
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    `&text=${encodeURIComponent(title)}` +
    `&dates=${start}/${end}` +
    `&location=${encodeURIComponent(location)}` +
    `&details=${encodeURIComponent(invitation.invitationText ?? '')}`;

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `SUMMARY:${title}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `LOCATION:${location}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\n');

  const icsHref = `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;

  if (!invitation.weddingDate) return null;

  return (
    <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
      <a
        href={googleUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 rounded-full px-6 py-3 font-sans text-xs uppercase tracking-[0.2em] transition-all hover:-translate-y-0.5"
        style={{
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(201,168,76,0.35)',
          color: '#6B4F1A',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
          <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.2" />
          <path d="M2 6.5h12M5.5 2v2.5M10.5 2v2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        Takvime Ekle
      </a>

      <a
        href={icsHref}
        download={`${invitation.slug || 'dugun'}.ics`}
        className="flex items-center gap-2 rounded-full px-6 py-3 font-sans text-xs uppercase tracking-[0.2em] transition-all hover:-translate-y-0.5"
        style={{
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(201,168,76,0.35)',
          color: '#6B4F1A',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M8 2v8m0 0L5 7m3 3 3-3M3 13h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        .ics İndir
      </a>
    </div>
  );
}

export default function DetailsSection({ invitation }: { invitation: Invitation }) {
  const mapsQuery = encodeURIComponent(
    [invitation.venueName, invitation.address, invitation.district, invitation.city]
      .filter(Boolean)
      .join(' '),
  );

  const cards = [
    {
      icon: '◈',
      label: 'Lokasyon',
      value: invitation.venueName || '—',
      sub: [invitation.district, invitation.city].filter(Boolean).join(', '),
    },
    {
      icon: '◇',
      label: 'Tarih',
      value: formatDate(invitation.weddingDate) || '—',
      sub: formatWeekday(invitation.weddingDate),
    },
    {
      icon: '✦',
      label: 'Saat',
      value: invitation.weddingTime || '—',
      sub: 'Kapılar 30 dk önce açılır',
    },
    {
      icon: '❋',
      label: 'Adres',
      value: invitation.address || invitation.city || '—',
      sub: invitation.district,
    },
  ];

  return (
    <section
      id="details"
      className="section-gap relative"
      style={{ background: 'linear-gradient(180deg, #FAF6F0 0%, #F5EDD8 50%, #FAF6F0 100%)' }}
    >
      <div className="mx-auto max-w-4xl px-6">
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="font-sans text-xs uppercase tracking-title" style={{ color: '#9A7B2F' }}>
            Detaylar
          </p>
          <h2 className="mt-3 font-serif text-4xl font-light sm:text-5xl" style={{ color: '#2b1d0f' }}>
            Düğün Bilgileri
          </h2>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2">
          {cards.map((card, i) => (
            <motion.div
              key={card.label}
              className="rounded-2xl p-6"
              style={{
                background: 'rgba(255,255,255,0.65)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(201,168,76,0.15)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-serif"
                  style={{
                    background: 'rgba(201,168,76,0.1)',
                    border: '1px solid rgba(201,168,76,0.3)',
                    color: '#9A7B2F',
                  }}
                >
                  {card.icon}
                </div>
                <div className="min-w-0">
                  <p
                    className="font-sans text-[10px] uppercase tracking-[0.25em]"
                    style={{ color: '#9A7B2F' }}
                  >
                    {card.label}
                  </p>
                  <p className="mt-1 truncate font-serif text-lg font-light" style={{ color: '#2b1d0f' }}>
                    {card.value}
                  </p>
                  {card.sub && (
                    <p className="mt-0.5 font-sans text-xs font-light" style={{ color: '#8a765a' }}>
                      {card.sub}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <CalendarButtons invitation={invitation} />

        {mapsQuery && (
          <div className="mt-6 text-center">
            <a
              href={invitation.mapUrl || `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-xs uppercase tracking-[0.25em] underline-offset-4 hover:underline"
              style={{ color: '#9A7B2F' }}
            >
              📍 Haritada Gör
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
