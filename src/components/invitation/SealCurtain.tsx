'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { sealPalette } from '@/lib/theme';
import { useMounted } from '@/lib/useMounted';
import type { Invitation } from '@/lib/types';

type Phase = 'idle' | 'cracking' | 'burst' | 'parting' | 'revealed' | 'done';

/** Efekt sesini bir kez çalar; tarayıcı engellerse sessizce geçer. */
function playCue(src: string, volume: number) {
  if (!src) return;
  const audio = new Audio(src);
  audio.volume = Math.min(Math.max(volume, 0), 100) / 100;
  void audio.play().catch(() => undefined);
}

/* ---------------------------------------------------------------- toz zerreleri */

function DustMotes({ active, count = 35 }: { active: boolean; count?: number }) {
  const mounted = useMounted();
  const motes = useMemo(
    () =>
      Array.from({ length: count }, (_, id) => ({
        id,
        x: `${Math.random() * 100}%`,
        y: `${Math.random() * 100}%`,
        size: 1 + Math.random() * 2.5,
        opacity: 0.1 + Math.random() * 0.35,
        duration: 6 + Math.random() * 8,
        delay: Math.random() * 5,
      })),
    [count],
  );

  if (!active || !mounted) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
      {motes.map((m) => (
        <motion.div
          key={m.id}
          className="absolute rounded-full"
          style={{
            left: m.x,
            top: m.y,
            width: m.size,
            height: m.size,
            background: `rgba(232,213,163,${m.opacity})`,
          }}
          animate={{ y: [0, -30, 0], x: [0, 12, 0], opacity: [0, 1, 0] }}
          transition={{ duration: m.duration, delay: m.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------- düşen gül yaprakları */

function FallingPetals({ active }: { active: boolean }) {
  const mounted = useMounted();
  const petals = useMemo(
    () =>
      Array.from({ length: 14 }, (_, id) => ({
        id,
        x: `${Math.random() * 100}%`,
        size: 10 + Math.random() * 14,
        rotation: Math.random() * 360,
        drift: -60 + Math.random() * 120,
        duration: 7 + Math.random() * 6,
        delay: Math.random() * 4,
      })),
    [],
  );

  if (!active || !mounted) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[15] overflow-hidden">
      {petals.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{ left: p.x }}
          initial={{ y: '-10vh', rotate: p.rotation, opacity: 0 }}
          animate={{
            y: '110vh',
            rotate: p.rotation + 720,
            x: p.drift,
            opacity: [0, 0.85, 0.85, 0],
          }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width={p.size} height={p.size * 1.4} viewBox="0 0 10 14">
            <ellipse
              cx="5"
              cy="7"
              rx="4"
              ry="7"
              fill={`rgb(${210 + (p.id % 3) * 15}, ${140 + (p.id % 4) * 10}, ${
                120 + (p.id % 2) * 20
              })`}
            />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

/* --------------------------------------------------------------- ışık huzmeleri */

function LightRays({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[20] overflow-hidden">
      {Array.from({ length: 9 }, (_, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-0 origin-top"
          style={{
            width: i % 2 === 0 ? 3 : 1.5,
            height: '100%',
            marginLeft: -1,
            background: `linear-gradient(180deg, rgba(232,213,163,${
              0.15 + (i % 3) * 0.08
            }), transparent)`,
            transform: `rotate(${-40 + 10 * i}deg)`,
          }}
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: [0, 0.7, 0.4], scaleY: 1 }}
          transition={{ delay: 0.2 + 0.08 * i, duration: 2.61, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------- mühür rozeti */

function WaxSeal({
  invitation,
  phase,
  onBreak,
}: {
  invitation: Invitation;
  phase: Phase;
  onBreak: () => void;
}) {
  const colors = sealPalette(invitation.sealType);
  const monogram =
    invitation.sealMonogram?.trim() ||
    `${invitation.groomName?.[0] ?? 'A'}${invitation.brideName?.[0] ?? 'B'}`;
  /*
     Tuğra kavisleri yalnızca MÜHÜR seçimine bakar.

     Önce mektup tasarımı da "ottoman" ise çiziliyorlardı; bu, Osmanlı
     mektup tasarımı seçildiğinde dokuz mühürden dokuzuna birden tuğra
     kondurup "Osmanlı Tuğrası" mührünü "Gold Balmumu"ndan ayırt edilemez
     hâle getiriyordu. Mektubun tasarımı mührün ne olduğunu belirlememeli.
  */
  const isOttoman = invitation.sealType === 'ottoman';
  const breaking = phase === 'cracking' || phase === 'burst';

  return (
    <motion.div
      className="relative cursor-pointer"
      whileHover={phase === 'idle' ? { scale: 1.06 } : undefined}
      whileTap={phase === 'idle' ? { scale: 0.96 } : undefined}
      animate={
        breaking
          ? { scale: [1, 1.25, 0], rotate: [0, -8, 14], opacity: [1, 1, 0] }
          : { scale: 1, rotate: 0, opacity: 1 }
      }
      transition={{ duration: breaking ? 0.7 : 0.3 }}
      onClick={phase === 'idle' ? onBreak : undefined}
      role="button"
      tabIndex={0}
      aria-label="Mührü kır ve davetiyeyi aç"
      onKeyDown={(e) => {
        if (phase === 'idle' && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onBreak();
        }
      }}
    >
      {/* dönen ışık halkası */}
      <motion.div
        className="pointer-events-none absolute inset-0 -m-6 rounded-full"
        style={{
          background: `conic-gradient(from 0deg, transparent, ${colors.grad2}, transparent, ${colors.grad1}, transparent)`,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
      />
      <div
        className="pointer-events-none absolute inset-0 -m-4 rounded-full"
        style={{ background: `radial-gradient(circle, ${colors.glow}, transparent 70%)` }}
      />

      <div
        className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full sm:h-32 sm:w-32"
        style={{ boxShadow: `0 12px 50px ${colors.glow}, 0 4px 20px rgba(0,0,0,0.5)` }}
      >
        {invitation.sealImage ? (
          <Image src={invitation.sealImage} alt="Mühür" fill className="object-cover" unoptimized />
        ) : (
          <svg width="110" height="110" viewBox="0 0 110 110">
            <defs>
              <radialGradient id="wax" cx="35%" cy="30%">
                <stop offset="0%" stopColor={colors.grad1} />
                <stop offset="55%" stopColor={colors.grad2} />
                <stop offset="100%" stopColor={colors.grad3} />
              </radialGradient>
              <filter id="waxShadow">
                <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor={colors.grad3} floodOpacity="0.7" />
              </filter>
            </defs>

            <motion.circle
              cx="55"
              cy="55"
              r={50}
              fill="none"
              stroke={colors.glow}
              strokeWidth="1"
              initial={{ r: 50, opacity: 0.3 }}
              animate={{ r: [50, 54, 50], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2.9, repeat: Infinity }}
            />
            <circle cx="55" cy="55" r="46" fill="url(#wax)" filter="url(#waxShadow)" />
            <circle cx="55" cy="55" r="38" fill="none" stroke={colors.grad1} strokeWidth="0.8" opacity="0.55" />

            {/* dış çentikler */}
            {Array.from({ length: 24 }, (_, i) => {
              const a = ((360 * i) / 24) * (Math.PI / 180);
              return (
                <line
                  key={i}
                  x1={55 + 38 * Math.cos(a)}
                  y1={55 + 38 * Math.sin(a)}
                  x2={55 + 44 * Math.cos(a)}
                  y2={55 + 44 * Math.sin(a)}
                  stroke={colors.grad1}
                  strokeWidth="0.7"
                  opacity="0.45"
                />
              );
            })}

            <text
              x="55"
              y="63"
              textAnchor="middle"
              fontFamily="var(--font-serif), Georgia, serif"
              fontSize={monogram.length > 3 ? 17 : 24}
              fontWeight="500"
              letterSpacing="1"
              fill={colors.grad1}
            >
              {monogram}
            </text>

            {isOttoman && (
              <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <path
                  d="M30 78 C42 70 68 70 80 78"
                  fill="none"
                  stroke={colors.grad1}
                  strokeWidth="1"
                  opacity="0.6"
                />
                <path
                  d="M38 32 C46 26 64 26 72 32"
                  fill="none"
                  stroke={colors.grad1}
                  strokeWidth="1"
                  opacity="0.6"
                />
              </motion.g>
            )}
          </svg>
        )}
      </div>
    </motion.div>
  );
}

/* --------------------------------------------------------------------- kıvılcımlar */

function Sparks({ active }: { active: boolean }) {
  const mounted = useMounted();
  const sparks = useMemo(
    () =>
      Array.from({ length: 26 }, (_, id) => ({
        id,
        angle: (360 * id) / 26,
        distance: 90 + Math.random() * 160,
        size: 2 + Math.random() * 4,
      })),
    [],
  );

  if (!active || !mounted) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[56]">
      {sparks.map((s) => {
        const rad = (s.angle * Math.PI) / 180;
        return (
          <motion.div
            key={s.id}
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{
              width: s.size,
              height: s.size,
              background: s.id % 3 === 0 ? 'var(--c-cream)' : 'var(--c-gold-light)',
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(rad) * s.distance,
              y: Math.sin(rad) * s.distance,
              opacity: 0,
              scale: 0.2,
            }}
            transition={{ duration: 1.3, ease: 'easeOut' }}
          />
        );
      })}
    </div>
  );
}

/* ================================================================= ana bileşen */

export default function SealCurtain({
  invitation,
  onOpened,
}: {
  invitation: Invitation;
  onOpened: () => void;
}) {
  const [phase, setPhase] = useState<Phase>('idle');
  const colors = sealPalette(invitation.sealType);

  const names = [invitation.groomName || 'Damat', invitation.brideName || 'Gelin'];
  const conjunction = invitation.conjunction || '&';

  const finish = useCallback(() => {
    setPhase('done');
    onOpened();
  }, [onOpened]);

  const open = useCallback(() => {
    const volume = invitation.soundEnabled ? invitation.soundVolume : 0;

    setPhase('cracking');
    playCue(invitation.sealBreakSound, volume);

    // Açılış zaman çizgisi, bölüm animasyonlarıyla aynı oranda uzatıldı;
    // aksi hâlde bir sonraki aşama, öncekinin animasyonu bitmeden başlıyor
    // ve sahne aceleye gelmiş görünüyordu.
    window.setTimeout(() => setPhase('burst'), 650);
    window.setTimeout(() => {
      setPhase('parting');
      playCue(invitation.envelopeOpenSound, volume);
    }, 1600);
    window.setTimeout(() => setPhase('revealed'), 3600);
    window.setTimeout(finish, 4900);
  }, [finish, invitation.sealBreakSound, invitation.envelopeOpenSound, invitation.soundEnabled, invitation.soundVolume]);

  /* Escape ile atla */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [finish]);

  /* Perde açılırken sayfanın kaymasını engelle */
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const parted = phase === 'parting' || phase === 'revealed' || phase === 'done';

  return (
    <motion.div
      className="fixed inset-0 z-[10000] overflow-hidden"
      style={{ background: '#0f0a06' }}
      animate={phase === 'revealed' ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 1.3 }}
    >
      {/* kapak fotoğrafı */}
      {invitation.coverImage && (
        <div className="absolute inset-0">
          <Image
            src={invitation.coverImage}
            alt="Kapak"
            fill
            priority
            unoptimized={invitation.coverImage.startsWith('data:')}
            className="object-cover opacity-40"
            sizes="100vw"
          />
          <div className="absolute inset-0" style={{ background: 'rgba(10,6,3,0.55)' }} />
        </div>
      )}

      <LightRays active={parted} />
      <DustMotes active={phase !== 'done'} />
      <FallingPetals active={parted} />

      {/* üst / alt maskeler */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-[45] bg-black" style={{ height: '10vh' }} />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[45] bg-black" style={{ height: '10vh' }} />

      {/* perde kanatları */}
      {(['left', 'right'] as const).map((side) =>
        (['outer', 'inner'] as const).map((layer) => (
          <motion.div
            key={`${side}-${layer}`}
            className={`curtain-panel absolute top-0 h-full ${side === 'left' ? 'left-0' : 'right-0'}`}
            style={{
              width: layer === 'outer' ? '54%' : '48%',
              transformOrigin: side === 'left' ? 'left center' : 'right center',
              zIndex: layer === 'outer' ? 30 : 25,
            }}
            initial={{ x: 0 }}
            animate={{ x: parted ? (side === 'left' ? '-110%' : '110%') : 0 }}
            transition={{
              duration: 2.1,
              delay: layer === 'outer' ? 0 : 0.15,
              ease: [0.76, 0, 0.24, 1],
            }}
          >
            <div className={`absolute inset-0 ${layer === 'outer' ? 'curtain-fabric-rich' : 'curtain-sheer'}`} />
            <div className={`absolute inset-0 ${side === 'left' ? 'curtain-folds-left' : 'curtain-folds-right'}`} />
            <div className={`curtain-fringe absolute bottom-0 h-16 w-full ${side === 'left' ? 'left-0' : 'right-0'}`} />
            <div
              className={`absolute top-0 h-full w-4 ${side === 'left' ? 'right-0' : 'left-0'}`}
              style={{
                background:
                  side === 'left'
                    ? 'linear-gradient(90deg, transparent, rgba(201,168,76,0.5))'
                    : 'linear-gradient(270deg, transparent, rgba(201,168,76,0.5))',
              }}
            />
          </motion.div>
        )),
      )}

      {/* korniş (valance) */}
      <motion.div
        className="absolute left-0 right-0 top-0 z-40"
        initial={{ y: 0 }}
        animate={{ y: parted ? '-120%' : 0 }}
        transition={{ duration: 2.32, ease: [0.76, 0, 0.24, 1] }}
      >
        <div className="valance-bar relative h-20 w-full sm:h-24">
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, #0d0604 0%, #1f1008 50%, #3d2010 100%)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-0">
            {Array.from({ length: 7 }, (_, i) => (
              <motion.div
                key={i}
                className="valance-swag"
                style={{ height: 34 }}
                animate={{ y: [0, 3, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: 0.1 * i }}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* mühür ve çağrı metni */}
      <AnimatePresence>
        {phase !== 'parting' && phase !== 'revealed' && phase !== 'done' && (
          <motion.div
            className="absolute left-1/2 top-1/2 z-[55] text-center"
            style={{ x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.72 }}
          >
            <motion.p
              className="mb-5 font-sans text-[10px] uppercase tracking-title sm:text-xs"
              style={{ color: 'rgba(255,255,255,0.65)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Düğün Davetiyesi
            </motion.p>

            <motion.div
              className="mb-6 font-serif"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 1.3 }}
              style={{
                fontSize: 'clamp(1.25rem, 3.6vw, 1.9rem)',
                color: colors.grad1,
                textShadow: '0 2px 24px rgba(0,0,0,0.85)',
              }}
            >
              {names[0]} <span className="mx-3 font-light">{conjunction}</span> {names[1]}
            </motion.div>

            <div className="flex justify-center">
              <WaxSeal invitation={invitation} phase={phase} onBreak={open} />
            </div>

            <motion.p
              className="mt-12 font-serif text-sm italic tracking-widest sm:text-base"
              style={{ color: 'rgba(232,213,163,0.75)', textShadow: '0 2px 16px rgba(0,0,0,0.9)' }}
              initial={{ opacity: 0, letterSpacing: '0.1em' }}
              animate={{ opacity: 1, letterSpacing: '0.2em' }}
              transition={{ delay: 1.8, duration: 1.45 }}
            >
              Mührü kırarak perdeyi açın
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <Sparks active={phase === 'burst'} />

      {/* patlama parlaması */}
      <AnimatePresence>
        {phase === 'burst' && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-[60]"
            style={{ background: 'radial-gradient(circle at center, rgba(255,240,200,0.9), transparent 60%)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.16 }}
          />
        )}
      </AnimatePresence>

      {/* atla butonu */}
      {phase !== 'done' && (
        <button
          type="button"
          onClick={finish}
          className="fixed right-6 top-6 z-[10001] rounded-full px-4 py-2 font-sans text-xs uppercase tracking-widest transition-all"
          style={{
            // %50 opaklıkta bu düğme perdenin üzerinde neredeyse
            // görünmüyordu; atlama yolu bulunamayan bir çıkış olmamalı.
            color: 'rgba(232,213,163,0.92)',
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(201,168,76,0.4)',
          }}
        >
          Geç →
        </button>
      )}
    </motion.div>
  );
}
