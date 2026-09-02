'use client';

import { slugify } from '@/lib/slug';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { Action, Badge, ConfirmModal, EmptyState, Meta, PanelSection, Row } from './ui';
import {
  IconArrow,
  IconCalendar,
  IconEnvelope,
  IconPlus,
  IconUser,
} from '@/components/invitation/Ornaments';
import * as api from '@/lib/api';
import type { Invitation, SafeUser } from '@/lib/types';

function formatDay(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * Yeni açılan ya da sıfırlanan parolayı bir kez gösteren kutu.
 * Parola sunucuda yalnızca özet olarak saklandığı için bu, kullanıcıya
 * iletilebileceği tek andır — bu yüzden görsel olarak da öne çıkar.
 */
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
  const [girisLinki, setGirisLinki] = useState('');

  // Adres yalnızca tarayıcıda bilinir; sunucuda üretilirse hidrasyon uyuşmaz.
  useEffect(() => setGirisLinki(`${window.location.origin}/giris`), []);

  /*
     Kopyalanan metin doğrudan çifte iletilecek hâlde.

     Önce yalnızca kullanıcı adı ve parola kopyalanıyordu; giriş adresi
     kutuda hiç yazmadığı için her seferinde elle ekleniyordu. Üçü tek
     tuşla, alt alta çıkıyor.
  */
  const iletilecekMetin = [
    'Sahra Davetiye — giriş bilgileriniz',
    '',
    `Giriş linki: ${girisLinki}`,
    `Kullanıcı adı: ${username}`,
    `Şifre: ${password}`,
  ].join('\n');

  async function copy() {
    try {
      await navigator.clipboard.writeText(iletilecekMetin);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Pano izni yoksa (http, eski tarayıcı) metin elle seçilebilsin.
      window.prompt('Giriş bilgileri — kopyalayın:', iletilecekMetin);
    }
  }

  return (
    <motion.div
      className="mb-[var(--sp-md)] p-[var(--sp-md)]"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ border: '1px solid rgba(176, 141, 63, 0.4)' }}
    >
      <p className="t-label" style={{ color: 'var(--c-gold)' }}>
        Giriş Bilgileri
      </p>

      <dl className="mt-[var(--sp-sm)] space-y-2">
        <div className="flex items-baseline gap-4">
          <dt className="t-label w-24 shrink-0" style={{ color: 'var(--c-on-dark-faint)' }}>
            Giriş Linki
          </dt>
          <dd className="t-lead break-all" style={{ color: 'var(--c-on-dark)' }}>
            {girisLinki || '—'}
          </dd>
        </div>
        <div className="flex items-baseline gap-4">
          <dt className="t-label w-24 shrink-0" style={{ color: 'var(--c-on-dark-faint)' }}>
            Kullanıcı Adı
          </dt>
          <dd className="t-lead" style={{ color: 'var(--c-on-dark)' }}>
            {username}
          </dd>
        </div>
        <div className="flex items-baseline gap-4">
          <dt className="t-label w-24 shrink-0" style={{ color: 'var(--c-on-dark-faint)' }}>
            Şifre
          </dt>
          <dd className="t-lead numerals tracking-wide" style={{ color: 'var(--c-gold-light)' }}>
            {password}
          </dd>
        </div>
      </dl>

      <p className="t-body mt-[var(--sp-sm)] measure" style={{ color: 'var(--c-on-dark-faint)' }}>
        Bu parola bir daha gösterilmez — çifte iletmeyi unutmayın.
      </p>

      <div className="mt-[var(--sp-sm)] flex gap-[var(--sp-md)]">
        <Action onClick={copy}>{copied ? 'Kopyalandı' : 'Üçünü Birden Kopyala'}</Action>
        <Action onClick={onDone}>Tamam</Action>
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
    <PanelSection
      n={3}
      label="Hesaplar"
      title="Çift Hesapları"
      lead="Her çift için bir hesap açın — hesaplar yalnızca kendi davetiyelerini yönetir."
      action={
        <button type="button" onClick={() => setOpen((v) => !v)} className="cta nudge">
          {open ? (
            'Vazgeç'
          ) : (
            <>
              <IconPlus size={14} />
              Yeni Hesap
              <IconArrow size={14} />
            </>
          )}
        </button>
      }
    >
      <AnimatePresence>
        {open && (
          <motion.form
            onSubmit={create}
            className="mb-[var(--sp-md)] overflow-hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="grid gap-[var(--sp-md)] sm:grid-cols-2">
              <label className="block">
                <span className="field-label">Kullanıcı Adı *</span>
                <input
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="field t-lead"
                  placeholder="alperen-ayse"
                />
                {/*
                  Ad sadeleştirilerek kaydedilir. Ne kaydedileceği yazarken
                  görünmezse, yönetici yazdığı adı çifte verip giriş
                  yapılamamasına yol açabiliyor.
                */}
                {username && slugify(username) !== username && (
                  <span className="t-label mt-1 block" style={{ color: 'var(--c-on-dark-faint)' }}>
                    Kaydedilecek ad: {slugify(username) || '—'}
                  </span>
                )}
              </label>
              <label className="block">
                <span className="field-label">Görünen Ad</span>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="field t-lead"
                  placeholder="Alperen & Ayşe"
                />
              </label>
            </div>

            <p className="t-body mt-[var(--sp-sm)]" style={{ color: 'var(--c-on-dark-faint)' }}>
              Parola otomatik üretilir ve oluşturulduktan sonra bir kez gösterilir.
            </p>

            {error && (
              <p className="t-body mt-3" style={{ color: '#e2a3a3' }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={busy} className="cta nudge mt-[var(--sp-sm)]">
              {busy ? 'Oluşturuluyor' : 'Hesabı Oluştur'}
              <IconArrow size={14} />
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
        <EmptyState icon={IconUser} title="Henüz hesap yok" lead="İlk çift hesabını oluşturun" />
      ) : (
        <div>
          {accounts.map((user, i) => {
            const owned = invitations.filter((inv) => inv.ownerId === user.id);
            return (
              <Row key={user.id} index={i} last={i === accounts.length - 1}>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <h3 className="t-lead" style={{ color: 'var(--c-on-dark)' }}>
                    {user.displayName}
                  </h3>
                  <Badge>@{user.username}</Badge>
                </div>

                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                  <Meta icon={IconCalendar}>
                    <span className="numerals">{formatDay(user.createdAt)}</span> tarihinde açıldı
                  </Meta>
                  <Meta icon={IconEnvelope}>
                    <span className="numerals">{owned.length}</span> davetiye
                  </Meta>
                </div>

                <div className="mt-[var(--sp-sm)] flex flex-wrap gap-x-6 gap-y-3">
                  <Action onClick={() => resetPassword(user)}>Parolayı Sıfırla</Action>
                  <Action onClick={() => setDeleteFor(user)} danger>
                    Hesabı Sil
                  </Action>
                </div>
              </Row>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {deleteFor && (
          <ConfirmModal
            title="Hesabı Sil"
            body={
              <>
                <strong>{deleteFor.displayName}</strong> hesabı, davetiyeleri, katılım bildirimleri
                ve yüklenen tüm fotoğraflar kalıcı olarak silinecek. Bu işlem geri alınamaz.
              </>
            }
            confirmLabel="Evet, Sil"
            onCancel={() => setDeleteFor(null)}
            onConfirm={remove}
          />
        )}
      </AnimatePresence>
    </PanelSection>
  );
}
