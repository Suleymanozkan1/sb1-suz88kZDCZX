'use client';

import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { login } from '@/lib/api';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/admin';

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(password);
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Giriş yapılamadı');
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.form
      onSubmit={submit}
      className="w-full max-w-sm rounded-3xl p-8"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(201,168,76,0.18)' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-8 text-center">
        <span className="font-serif text-2xl" style={{ color: '#C9A84C' }}>
          ✦
        </span>
        <h1 className="mt-3 font-serif text-2xl font-light" style={{ color: '#E8D5A3' }}>
          Admin Paneli
        </h1>
        <p className="mt-2 font-sans text-xs uppercase tracking-[0.25em]" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Düğün Davetiyeleri
        </p>
      </div>

      <label className="field-label" htmlFor="password">
        Şifre
      </label>
      <input
        id="password"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="field"
        placeholder="••••••••"
      />

      {error && (
        <p className="mt-4 font-sans text-sm" style={{ color: '#f0a3a3' }}>
          {error}
        </p>
      )}

      <button type="submit" disabled={busy} className="btn-gold mt-6 w-full">
        {busy ? 'Kontrol ediliyor…' : 'Giriş Yap'}
      </button>
    </motion.form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
