'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import type { Invitation } from '@/lib/types';

export default function FaqSection({ invitation }: { invitation: Invitation }) {
  const items = invitation.faqItems ?? [];
  const [open, setOpen] = useState<number | null>(null);

  if (items.length === 0) return null;

  return (
    <section
      id="faq"
      className="section-gap relative"
      style={{ background: 'linear-gradient(180deg, #FAF6F0, #F0E8D8, #FAF6F0)' }}
    >
      <div className="mx-auto max-w-2xl px-6">
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="font-sans text-xs uppercase tracking-title" style={{ color: '#9A7B2F' }}>
            Merak Edilenler
          </p>
          <h2 className="mt-3 font-serif text-4xl font-light sm:text-5xl" style={{ color: '#2b1d0f' }}>
            Sık Sorulan Sorular
          </h2>
        </motion.div>

        <div className="space-y-3">
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={`${item.q}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full rounded-2xl p-5 text-left transition-all duration-300 sm:p-6"
                  style={{
                    background: isOpen ? 'rgba(201,168,76,0.1)' : 'rgba(255,255,255,0.65)',
                    border: isOpen
                      ? '1px solid rgba(201,168,76,0.4)'
                      : '1px solid rgba(201,168,76,0.15)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-serif text-lg font-light" style={{ color: '#2b1d0f' }}>
                      {item.q}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      className="shrink-0 font-sans text-xl font-light"
                      style={{ color: '#9A7B2F' }}
                    >
                      +
                    </motion.span>
                  </div>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden font-sans text-sm font-light leading-relaxed"
                        style={{ color: '#6b5a44' }}
                      >
                        <span className="mt-3 block">{item.a}</span>
                      </motion.p>
                    )}
                  </AnimatePresence>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
