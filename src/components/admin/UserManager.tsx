'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import * as api from '@/lib/api';
import type { Invitation, SafeUser } from '@/lib/types';

function formatDay(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Yeni oluşturulan ya da sıfırlanan parolayı bir kez gösteren kutu. */
function CredentialBox({
  username,
  password,
  onDone,
}: {
  username: string;
  password: string;
  onDone: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(`Kullanıcı adı: ${username}\nParola: ${password}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt('Giriş bilgileri:', `${username} / ${password}`);
    }
  }

  return (
    <motion.div
      className="mt-4 rounded-2xl p-5"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.35)' }}
    >
      <p className="font-sans text-xs uppercase tracking-[0.2em]" style={{ color: '#C9A84C' }}>
        Giriş Bilgileri
      </p>
      <p className="mt-3 font-mono text-sm" style={{ color: '#E8D5A3' }}>
        {username}
      </p>
      <p className="font-mono text-lg" style={{ color: '#E8D5A3' }}>
        {password}
      </p>
      <p className="mt-3 font-sans text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
        Bu parola bir daha gösterilmez — çifte iletmeyi unutmayın.
      </p>

      <div className="mt-4 flex gap-3">
        <button type="button" onClick={copy} className="btn-gold flex-1">
          {copied ? 'Kopyalandı ✓' : 'Kopyala'}
        </button>
        <button type="button" onClick={onDone} className="btn-ghost flex-1">
          Tamam
        </button>
      </div>
    </motion.div>
  );
}

/**
 * Hesap yönetimi — yalnızca admin. Her çift için bir hesap açılır, iş bitince
 * hesap silinerek davetiyeleri, katılım bildirimleri ve fotoğrafları temizlenir.
 */
export default function UserManager({
  initial,
  invitations,
}: {
  initial: SafeUser[];
  invitations: Invitation[];
}) {
  const [users, setUsers] = useState(initial);
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [credential, setCredential] = useState<{ username: string; password: string } | null>(null);
  const [deleteFor, setDeleteFor] = useState<SafeUser | null>(null);

  const refresh = useCallback(async () => {
    setUsers(await api.listUsers());
  }, []);

  useEffect(() => {
    setUsers(initial);
  }, [initial]);

  async function create(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { user, password } = await api.createUser({ username, displayName });
      setCredential({ username: user.username, password });
      setUsername('');
      setDisplayName('');
      setOpen(false);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hesap oluşturulamadı');
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword(user: SafeUser) {
    const { password } = await api.resetUserPassword(user.id);
    setCredential({ username: user.username, password });
  }

  async function remove() {
    if (!deleteFor) return;
    await api.deleteUser(deleteFor.id);
    setDeleteFor(null);
    await refresh();
  }

  const accounts = users.filter((u) => u.role !== 'admin');

  return (
    <section className="mt-14">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-light" style={{ color: '#E8D5A3' }}>
            Hesaplar
          </h2>
          <p className="mt-1 font-sans text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Her çift için bir hesap açın — hesaplar yalnızca kendi davetiyelerini yönetir.
          </p>
        </div>
        <button type="button" onClick={() => setOpen((v) => !v)} className="btn-gold">
          {open ? 'Vazgeç' : '+ Yeni Hesap'}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.form
            onSubmit={create}
            className="admin-card mb-5"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="field-label">Kullanıcı Adı *</span>
                <input
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="field"
                  placeholder="alperenayse"
                />
              </label>
              <label className="block">
                <span className="field-label">Görünen Ad</span>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="field"
                  placeholder="Alperen & Ayşe"
                />
              </label>
            </div>

            <p className="mt-3 font-sans text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Parola otomatik üretilir ve oluşturulduktan sonra bir kez gösterilir.
            </p>

            {error && (
              <p className="mt-3 font-sans text-sm" style={{ color: '#f0a3a3' }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={busy} className="btn-gold mt-4">
              {busy ? 'Oluşturuluyor…' : 'Hesabı Oluştur'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {credential && (
          <CredentialBox
            username={credential.username}
            password={credential.password}
            onDone={() => setCredential(null)}
          />
        )}
      </AnimatePresence>

      {accounts.length === 0 ? (
        <div className="admin-card mt-4 py-12 text-center">
          <span className="text-2xl">👤</span>
          <p className="mt-3 font-serif text-lg font-light" style={{ color: '#E8D5A3' }}>
            Henüz hesap yok
          </p>
          <p className="mt-2 font-sans text-sm font-light" style={{ color: 'rgba(255,255,255,0.4)' }}>
            İlk çift hesabını oluşturun
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {accounts.map((user) => {
            const owned = invitations.filter((inv) => inv.ownerId === user.id);
            return (
              <motion.div
                key={user.id}
                className="admin-card"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-serif text-lg font-light" style={{ color: '#E8D5A3' }}>
                    {user.displayName}
                  </h3>
                  <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    @{user.username}
                  </span>
                </div>

                <div
                  className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-sans text-xs"
                  style={{ color: 'rgba(255,255,255,0.45)' }}
                >
                  <span>📅 {formatDay(user.createdAt)} tarihinde açıldı</span>
                  <span>💌 {owned.length} davetiye</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => resetPassword(user)}
                    className="rounded-full px-4 py-2 font-sans text-xs uppercase tracking-[0.15em]"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(201,168,76,0.2)',
                      color: 'rgba(255,255,255,0.75)',
                    }}
                  >
                    Parolayı Sıfırla
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteFor(user)}
                    className="rounded-full px-4 py-2 font-sans text-xs uppercase tracking-[0.15em]"
                    style={{
                      background: 'rgba(239,68,68,0.08)',
                      border: '1px solid rgba(239,68,68,0.15)',
                      color: '#f0a3a3',
                    }}
                  >
                    Hesabı Sil
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {deleteFor && (
          <motion.div
            className="fixed inset-0 z-[900] flex items-center justify-center p-6"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteFor(null)}
          >
            <motion.div
              className="w-full max-w-sm rounded-2xl p-8 text-center"
              style={{ background: '#150e07', border: '1px solid rgba(239,68,68,0.3)' }}
              initial={{ scale: 0.94 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-2xl">⚠️</span>
              <h3 className="mt-3 font-serif text-xl font-light" style={{ color: '#f0a3a3' }}>
                Hesabı Sil
              </h3>
              <p
                className="mt-3 font-sans text-sm font-light"
                style={{ color: 'rgba(255,255,255,0.55)' }}
              >
                <strong>{deleteFor.displayName}</strong> hesabı, davetiyeleri, katılım
                bildirimleri ve yüklenen tüm fotoğraflar kalıcı olarak silinecek. Bu işlem geri
                alınamaz.
              </p>

              <div className="mt-6 flex gap-3">
                <button type="button" onClick={() => setDeleteFor(null)} className="btn-ghost flex-1">
                  İptal
                </button>
                <button
                  type="button"
                  onClick={remove}
                  className="flex-1 rounded-full px-6 py-3 font-sans text-sm uppercase tracking-[0.2em]"
                  style={{
                    background: 'rgba(239,68,68,0.15)',
                    border: '1px solid rgba(239,68,68,0.35)',
                    color: '#f0a3a3',
                  }}
                >
                  Evet, Sil
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
