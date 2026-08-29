'use client';

import { motion } from 'framer-motion';
import type { Invitation, StoryItem } from '@/lib/types';

function TimelineRow({ item, index }: { item: StoryItem; index: number }) {
  const right = item.side === 'right';

  return (
    <motion.div
      className={`mb-12 flex items-center gap-6 sm:mb-16 sm:gap-12 ${
        right ? 'flex-row-reverse' : ''
      }`}
      initial={{ opacity: 0, x: right ? 60 : -60 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay: index * 0.05 }}
    >
      {/* kart */}
      <div className={`flex-1 ${right ? 'text-left' : 'text-right'}`}>
        <div
          className="inline-block max-w-sm rounded-2xl p-5 sm:p-6"
          style={{
            background: item.highlight
              ? 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(232,213,163,0.08))'
              : 'rgba(255,255,255,0.6)',
            border: item.highlight
              ? '1px solid rgba(201,168,76,0.4)'
              : '1px solid rgba(201,168,76,0.15)',
            boxShadow: item.highlight
              ? '0 8px 40px rgba(201,168,76,0.15)'
              : '0 4px 20px rgba(0,0,0,0.05)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <span className="font-sans text-xs uppercase tracking-[0.25em]" style={{ color: '#9A7B2F' }}>
            {item.year}
          </span>
          <h3 className="mt-2 font-serif text-xl font-light" style={{ color: '#2b1d0f' }}>
            {item.title}
          </h3>
          <p className="mt-2 font-sans text-sm font-light leading-relaxed" style={{ color: '#6b5a44' }}>
            {item.desc}
          </p>
        </div>
      </div>

      {/* zaman çizgisi noktası */}
      <div className="relative flex shrink-0 items-center justify-center">
        <motion.div
          className="flex h-12 w-12 items-center justify-center rounded-full font-serif text-lg"
          style={{
            background: item.highlight
              ? 'linear-gradient(135deg, #C9A84C, #E8D5A3)'
              : 'rgba(255,255,255,0.8)',
            border: '1px solid rgba(201,168,76,0.4)',
            color: item.highlight ? '#3a2a17' : '#9A7B2F',
            boxShadow: item.highlight
              ? '0 0 30px rgba(201,168,76,0.4)'
              : '0 4px 15px rgba(0,0,0,0.08)',
          }}
          whileHover={{ scale: 1.12 }}
        >
          {item.icon}
        </motion.div>
      </div>

      <div className="flex-1" />
    </motion.div>
  );
}

export default function StorySection({ invitation }: { invitation: Invitation }) {
  const items = invitation.storyItems ?? [];
  if (items.length === 0) return null;

  return (
    <section
      id="story"
      className="section-gap relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #FAF6F0 0%, #F5EDD8 50%, #FAF6F0 100%)' }}
    >
      <div className="relative mx-auto max-w-4xl px-6">
        <motion.div
          className="mb-16 text-center sm:mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="font-sans text-xs uppercase tracking-title" style={{ color: '#9A7B2F' }}>
            {invitation.storySectionSubtitle || 'Bizim'}
          </p>
          <h2 className="mt-3 font-serif text-4xl font-light sm:text-5xl" style={{ color: '#2b1d0f' }}>
            {invitation.storySectionTitle || 'Hikayemiz'}
          </h2>
        </motion.div>

        <div className="relative">
          {/* dikey çizgi */}
          <div
            className="absolute bottom-0 left-1/2 top-0 w-[1px] -translate-x-1/2"
            style={{
              background:
                'linear-gradient(180deg, transparent, rgba(201,168,76,0.45), transparent)',
            }}
          />
          {items.map((item, i) => (
            <TimelineRow key={`${item.title}-${i}`} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
