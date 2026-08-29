'use client';

import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Divider, IconArrow } from '@/components/invitation/Ornaments';
import { login } from '@/lib/api';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [setupHint, setSetupHint] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { session } = await login(username, password);
      // Hedef verilmemişse rolün kendi paneline gidilir.
      router.push(next || (session.role === 'admin' ? '/admin' : '/panel'));
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Giriş yapılamadı';
      setError(message);
      // Sunucu yapılandırması eksikse bu bir parola hatası değildir.
      setSetupHint(/ADMIN_PASSWORD|Postgres|BLOB_READ_WRITE_TOKEN/.test(message));
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.form
      onSubmit={submit}
      className="w-full max-w-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mb-[var(--sp-lg)]">
        <p className="t-label" style={{ color: 'var(--c-gold)' }}>
          Sagra Davetiye
        </p>
        <h1 className="t-display mt-3" style={{ color: 'var(--c-on-dark)' }}>
          Giriş
        </h1>
        <div className="mt-[var(--sp-md)]" style={{ color: 'var(--c-gold)' }}>
          <Divider className="!justify-start" />
        </div>
      </div>

      <label className="field-label" htmlFor="username">
        Kullanıcı Adı
      </label>
      <input
        id="username"
        autoComplete="username"
        required
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="field t-lead"
        placeholder="kullaniciadi"
      />

      <div className="mt-[var(--sp-md)]">
        <label className="field-label" htmlFor="password">
          Parola
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field t-lead"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <div className="mt-[var(--sp-md)]">
          <p className="t-body" style={{ color: '#e2a3a3' }}>
            {error}
          </p>
          {setupHint && (
            <p className="t-body mt-2" style={{ color: 'var(--c-on-dark-faint)' }}>
              Bu bir parola hatası değil — sunucu henüz yapılandırılmamış.
              Yapılandırmayı <code>/api/health</code> adresinden görebilirsiniz.
            </p>
          )}
        </div>
      )}

      <button type="submit" disabled={busy} className="cta nudge mt-[var(--sp-md)]">
        {busy ? 'Kontrol ediliyor' : 'Giriş Yap'}
        <IconArrow size={14} />
      </button>
    </motion.form>
  );
}

export default function LoginPage() {
  return (
    <div
      className="relative flex min-h-screen items-center justify-center px-[var(--sp-md)]"
      style={{ background: 'linear-gradient(180deg, var(--c-ink) 0%, var(--c-night) 70%)' }}
    >
      <div className="grain" aria-hidden />
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
