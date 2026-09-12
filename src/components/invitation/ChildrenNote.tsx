'use client';

import { motion } from 'framer-motion';
import type { Invitation } from '@/lib/types';

/**
 * Çocuk notu — tek satır, tek tik.
 *
 * Eskiden bu bilgi SSS'te "Çocuklar davetli mi?" diye bir soru-cevaptı ve
 * metni çift elle yazıyordu; çoğu zaman kırıcı çıkıyordu. Kabul edilen
 * söyleyiş: yetişkinlere yönelik bir düğünde çocuklara "iyi uykular" denir.
 */
export default function ChildrenNote({ invitation }: { invitation: Invitation }) {
  if (!invitation.showChildren) return null;

  return (
    <section id="children" className="relative py-[var(--sp-md)]">
      <div className="mx-auto max-w-2xl px-[var(--sp-md)]">
        <motion.p
          className="flex items-baseline justify-center gap-3 text-center"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-120px' }}
          transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
        >
          <span aria-hidden style={{ color: 'var(--c-gold-deep)' }}>
            ✓
          </span>
          <span
            className="t-lead italic"
            style={{ color: 'var(--c-on-light-soft)', fontFamily: 'var(--f-display)' }}
          >
            {invitation.childrenWelcome
              ? 'Çocuklar da davetlidir — minik misafirlerimizi de bekliyoruz.'
              : 'Düğünümüz yalnızca yetişkinlere yöneliktir — minik misafirlerimize iyi uykular.'}
          </span>
        </motion.p>
      </div>
    </section>
  );
}
