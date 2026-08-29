'use client';

import { motion } from 'framer-motion';
import type { Invitation } from '@/lib/types';

export default function ProgramSection({ invitation }: { invitation: Invitation }) {
  const items = invitation.programItems ?? [];
  if (items.length === 0) return null;

  return (
    <section
      id="program"
      className="section-gap relative"
      style={{ background: 'linear-gradient(180deg, #FAF6F0 0%, #F5EDD8 50%, #FAF6F0 100%)' }}
    >
      <div className="mx-auto max-w-2xl px-6">
        <motion.div
          className="mb-14 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="font-sans text-xs uppercase tracking-title" style={{ color: '#9A7B2F' }}>
            Akış
          </p>
          <h2 className="mt-3 font-serif text-4xl font-light sm:text-5xl" style={{ color: '#2b1d0f' }}>
            Program
          </h2>
        </motion.div>

        <div className="relative">
          <div
            className="absolute bottom-4 left-[22px] top-4 w-[1px]"
            style={{
              background: 'linear-gradient(180deg, transparent, rgba(201,168,76,0.4), transparent)',
            }}
          />

          <div className="space-y-6">
            {items.map((item, i) => (
              <motion.div
                key={`${item.title}-${i}`}
                className="flex items-start gap-5"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div
                  className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-serif"
                  style={{
                    background: 'rgba(255,255,255,0.85)',
                    border: '1px solid rgba(201,168,76,0.35)',
                    color: '#9A7B2F',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  {item.icon}
                </div>

                <div
                  className="flex-1 rounded-2xl px-5 py-4"
                  style={{
                    background: 'rgba(255,255,255,0.6)',
                    border: '1px solid rgba(201,168,76,0.15)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                  }}
                >
                  <div className="flex flex-wrap items-baseline gap-x-3">
                    <span
                      className="font-sans text-sm tracking-[0.15em]"
                      style={{ color: '#9A7B2F' }}
                    >
                      {item.time}
                    </span>
                    <h3 className="font-serif text-lg font-light" style={{ color: '#2b1d0f' }}>
                      {item.title}
                    </h3>
                  </div>
                  {item.desc && (
                    <p className="mt-1 font-sans text-sm font-light" style={{ color: '#6b5a44' }}>
                      {item.desc}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
