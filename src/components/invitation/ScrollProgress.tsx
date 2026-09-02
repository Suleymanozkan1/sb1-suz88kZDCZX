'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      className="fixed left-0 right-0 top-0 z-[9999] h-px origin-left"
      style={{
        scaleX,
        background:
          'linear-gradient(90deg, transparent, var(--c-gold), var(--c-gold-light), var(--c-gold), transparent)',
      }}
    />
  );
}
