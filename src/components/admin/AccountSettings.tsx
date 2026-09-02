'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Meta, PanelSection } from './ui';
import { IconArrow, IconCheck, IconKey, IconUser } from '@/components/invitation/Ornaments';
import * as api from '@/lib/api';
import type { Session } from '@/lib/types';

/**
 * Hesap ayarları — her iki rol için de aynı.
 *
 * Kendi parolasını değiştirmek isteyen herkes (admin dâhil) buradan yapar.
 * Mevcut parola sorulur; çerezi ele geçiren biri parolayı da değiştirip
 * hesabı devralamasın diye.
 */
export default function AccountSettings({ session, n }: { session: Session; n: number }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [repeat, setRepeat] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  function reset() {
    setCurrent('');
    setNext('');
    setRepeat('');
    setError('');
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    if (next !== repeat) {
      setError('Yeni parolalar birbiriyle uyuşmuyor.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      await api.changeOwnPassword(current, next);
      reset();
      setOpen(false);
      setDone(true);
      window.setTimeout(() => setDone(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Parola değiştirilemedi');
    } finally {
      setBusy(false);
    }
  }

  const fields = [
    { id: 'current', label: 'Mevcut Parola', value: current, set: setCurrent },
    { id: 'next', label: 'Yeni Parola', value: next, set: setNext },
    { id: 'repeat', label: 'Yeni Parola (Tekrar)', value: repeat, set: setRepeat },
  ];

  return (
    <PanelSection
      n={n}
      label="Hesabım"
      title="Hesap Ayarları"
      action={
        <button
          type="button"
          onClick={() => {
            setOpen((v) => !v);
            reset();
          }}
          className="cta nudge"
        >
          {open ? (
            'Vazgeç'
          ) : (
            <>
              <IconKey size={14} />
              Parolamı Değiştir
              <IconArrow size={14} />
            </>
          )}
        </button>
      }
    >
      <div className="relative py-[var(--sp-sm)]">
        <span className="rule-dark absolute inset-x-0 top-0" aria-hidden />
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Meta icon={IconUser}>{session.displayName}</Meta>
          <Meta icon={IconKey}>
            @{session.username} · {session.role === 'admin' ? 'Yönetici' : 'Çift hesabı'}
          </Meta>
        </div>
        <span className="rule-dark absolute inset-x-0 bottom-0" aria-hidden />
      </div>

      <AnimatePresence>
        {done && (
          <motion.p
            className="mt-[var(--sp-sm)] flex items-center gap-2"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ color: 'var(--c-gold-light)' }}
          >
            <IconCheck size={16} />
            <span className="t-body">Parolanız değiştirildi.</span>
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.form
            onSubmit={submit}
            className="overflow-hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mt-[var(--sp-md)] grid gap-[var(--sp-md)] sm:grid-cols-3">
              {fields.map((field) => (
                <label key={field.id} className="block">
                  <span className="field-label">{field.label}</span>
                  <input
                    type="password"
                    required
                    autoComplete={field.id === 'current' ? 'current-password' : 'new-password'}
                    value={field.value}
                    onChange={(e) => field.set(e.target.value)}
                    className="field t-lead"
                    placeholder="••••••••"
                  />
                </label>
              ))}
            </div>

            <p className="t-body mt-[var(--sp-sm)]" style={{ color: 'var(--c-on-dark-faint)' }}>
              En az 6 karakter.
            </p>

            {error && (
              <p className="t-body mt-3" style={{ color: '#e2a3a3' }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={busy} className="cta nudge mt-[var(--sp-sm)]">
              {busy ? 'Değiştiriliyor' : 'Parolayı Değiştir'}
              <IconArrow size={14} />
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </PanelSection>
  );
}
