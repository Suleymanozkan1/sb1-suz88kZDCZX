'use client';

import { motion } from 'framer-motion';
import { IconClose, IconWarning, SectionNumber } from '@/components/invitation/Ornaments';

/**
 * Panel arayüzünün paylaşılan parçaları.
 *
 * Davetiye sayfasıyla aynı dili konuşur: kart ve cam efekti yerine ince
 * kurallar, emoji yerine çizilmiş ikonlar, sabit hex yerine tasarım
 * simgeleri. Tek yerde durur ki admin ve çift panelleri ayrışmasın.
 */

/* ─────────────────────────────────────────────────────────── başlıklar */

export function PanelSection({
  n,
  label,
  title,
  lead,
  action,
  children,
}: {
  n: number;
  label: string;
  title: string;
  lead?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-[var(--sp-md)]">
      <header className="mb-[var(--sp-sm)] flex flex-wrap items-end justify-between gap-[var(--sp-sm)]">
        <div className="min-w-0">
          <div className="flex items-baseline gap-4" style={{ color: 'var(--c-gold)' }}>
            <SectionNumber n={n} className="text-xs opacity-85" />
            <span className="t-label">{label}</span>
          </div>
          <h2 className="t-h2 mt-3" style={{ color: 'var(--c-on-dark)' }}>
            {title}
          </h2>
          {lead && (
            <p className="t-body mt-2 measure" style={{ color: 'var(--c-on-dark-faint)' }}>
              {lead}
            </p>
          )}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

/* ───────────────────────────────────────────────────────── liste satırı */

/** Kart değil satır: üstte ince bir kural, altta içerik. */
export function Row({
  children,
  index = 0,
  last = false,
}: {
  children: React.ReactNode;
  index?: number;
  last?: boolean;
}) {
  return (
    <motion.div
      className="relative py-[var(--sp-sm)]"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: Math.min(index, 8) * 0.04, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="rule-dark absolute inset-x-0 top-0" aria-hidden />
      {children}
      {last && <span className="rule-dark absolute inset-x-0 bottom-0" aria-hidden />}
    </motion.div>
  );
}

/** İkonlu küçük künye parçası — listelerdeki meta bilgi satırı. */
export function Meta({
  icon: Icon,
  children,
}: {
  icon: (p: { size?: number }) => JSX.Element;
  children: React.ReactNode;
}) {
  return (
    <span className="flex items-center gap-2" style={{ color: 'var(--c-on-dark-faint)' }}>
      <Icon size={14} />
      <span className="font-sans text-xs">{children}</span>
    </span>
  );
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: 'ok' | 'off' | 'neutral';
}) {
  const palette = {
    ok: { color: '#9ed7a8', border: 'rgba(158, 215, 168, 0.3)' },
    off: { color: '#e2a3a3', border: 'rgba(226, 163, 163, 0.3)' },
    neutral: { color: 'var(--c-gold-light)', border: 'rgba(176, 141, 63, 0.3)' },
  }[tone];

  return (
    <span
      className="t-label rounded-full px-3 py-1"
      style={{ color: palette.color, border: `1px solid ${palette.border}` }}
    >
      {children}
    </span>
  );
}

/* ────────────────────────────────────────────────────────── eylem bağı */

/** Satır eylemleri: düğme değil metin bağı, alt çizgi soldan girer. */
export function Action({
  children,
  onClick,
  href,
  target,
  danger = false,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  target?: string;
  danger?: boolean;
  title?: string;
}) {
  const style = { color: danger ? '#e2a3a3' : 'var(--c-on-dark-soft)' };
  const className = 'link-underline';

  if (href) {
    return (
      <a href={href} target={target} rel={target ? 'noopener noreferrer' : undefined} className={className} style={style} title={title}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className} style={style} title={title}>
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────── modal */

export function Modal({
  children,
  onClose,
  danger = false,
  wide = false,
}: {
  children: React.ReactNode;
  onClose: () => void;
  danger?: boolean;
  wide?: boolean;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-[900] flex items-center justify-center p-[var(--sp-sm)]"
      style={{ background: 'rgba(9, 6, 3, 0.86)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={`relative w-full ${wide ? 'max-w-md' : 'max-w-sm'} p-[var(--sp-md)]`}
        style={{
          background: 'var(--c-ink)',
          border: `1px solid ${danger ? 'rgba(226, 163, 163, 0.28)' : 'rgba(176, 141, 63, 0.28)'}`,
        }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Kapat"
          className="absolute right-4 top-4 transition-transform duration-500 hover:rotate-90"
          style={{ color: 'var(--c-on-dark-faint)' }}
        >
          <IconClose size={16} />
        </button>
        {children}
      </motion.div>
    </motion.div>
  );
}

/** Geri alınamayan işlemler için ortak onay penceresi. */
export function ConfirmModal({
  title,
  body,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  title: string;
  body: React.ReactNode;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal onClose={onCancel} danger>
      <div className="text-center">
        <span className="inline-block" style={{ color: '#e2a3a3' }}>
          <IconWarning />
        </span>
        <h3 className="t-h2 mt-4" style={{ color: '#e2a3a3' }}>
          {title}
        </h3>
        <div className="t-body mt-4" style={{ color: 'var(--c-on-dark-soft)' }}>
          {body}
        </div>

        <div className="mt-[var(--sp-md)] flex justify-center gap-[var(--sp-md)]">
          <button
            type="button"
            onClick={onCancel}
            className="link-underline"
            style={{ color: 'var(--c-on-dark-soft)' }}
          >
            İptal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="link-underline"
            style={{ color: '#e2a3a3' }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/** İçerik olmadığında gösterilen sade blok. */
export function EmptyState({
  icon: Icon,
  title,
  lead,
}: {
  icon: (p: { size?: number }) => JSX.Element;
  title: string;
  lead: string;
}) {
  return (
    <div
      className="flex flex-col items-center py-[var(--sp-lg)] text-center"
      style={{ borderTop: '1px solid var(--c-rule-dark)', borderBottom: '1px solid var(--c-rule-dark)' }}
    >
      <span style={{ color: 'var(--c-on-dark-faint)' }}>
        <Icon size={28} />
      </span>
      <p className="t-h2 mt-4" style={{ color: 'var(--c-on-dark)' }}>
        {title}
      </p>
      <p className="t-body mt-2" style={{ color: 'var(--c-on-dark-faint)' }}>
        {lead}
      </p>
    </div>
  );
}
