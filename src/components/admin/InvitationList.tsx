'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import * as api from '@/lib/api';
import { formatDate } from '@/lib/format';
import type { Invitation, Rsvp } from '@/lib/types';

function QrModal({ invitation, onClose }: { invitation: Invitation; onClose: () => void }) {
  const [dataUrl, setDataUrl] = useState('');
  const url = `${window.location.origin}/davet/${invitation.slug}`;

  useEffect(() => {
    QRCode.toDataURL(url, {
      width: 512,
      margin: 2,
      color: { dark: '#1a0f08', light: '#FAF6F0' },
    }).then(setDataUrl, () => setDataUrl(''));
  }, [url]);

  return (
    <motion.div
      className="fixed inset-0 z-[900] flex items-center justify-center p-6"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-sm rounded-2xl p-8 text-center"
        style={{ background: '#150e07', border: '1px solid rgba(201,168,76,0.25)' }}
        initial={{ scale: 0.94 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-6 font-serif text-xl font-light" style={{ color: '#E8D5A3' }}>
          QR Kod
        </h3>

        {dataUrl ? (
          // QR görseli data URI olduğu için next/image optimizasyonuna gerek yok.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dataUrl} alt="QR Kod" className="mx-auto w-56 rounded-xl" />
        ) : (
          <div className="mx-auto h-56 w-56 animate-pulse rounded-xl bg-white/5" />
        )}

        <p className="mt-4 break-all font-sans text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {url}
        </p>

        <div className="mt-6 flex gap-3">
          <a
            href={dataUrl || '#'}
            download={`${invitation.slug}-qr.png`}
            className="btn-gold flex-1 text-center"
          >
            İndir
          </a>
          <button type="button" onClick={onClose} className="btn-ghost flex-1">
            Kapat
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function DeleteModal({
  invitation,
  onCancel,
  onConfirm,
}: {
  invitation: Invitation;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-[900] flex items-center justify-center p-6"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
    >
      <motion.div
        className="w-full max-w-sm rounded-2xl p-8 text-center"
        style={{ background: '#150e07', border: '1px solid rgba(239,68,68,0.3)' }}
        initial={{ scale: 0.94 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-serif text-xl font-light" style={{ color: '#f0a3a3' }}>
          Davetiyeyi Sil
        </h3>
        <p className="mt-3 font-sans text-sm font-light" style={{ color: 'rgba(255,255,255,0.55)' }}>
          {invitation.groomName} {invitation.conjunction} {invitation.brideName} davetiyesi
          silinecek. Bu işlem geri alınamaz.
        </p>

        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onCancel} className="btn-ghost flex-1">
            İptal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-full px-6 py-3 font-sans text-sm uppercase tracking-[0.2em] transition-all"
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
  );
}

export default function InvitationList({ initial }: { initial: Invitation[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [qrFor, setQrFor] = useState<Invitation | null>(null);
  const [deleteFor, setDeleteFor] = useState<Invitation | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    api.listRsvps().then(setRsvps, () => setRsvps([]));
  }, []);

  const refresh = useCallback(async () => {
    setRows(await api.listInvitations());
    router.refresh();
  }, [router]);

  async function copyLink(invitation: Invitation) {
    const url = `${window.location.origin}/davet/${invitation.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(invitation.id);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      window.prompt('Davetiye linki:', url);
    }
  }

  async function toggle(invitation: Invitation) {
    await api.updateInvitation(invitation.id, { isActive: !invitation.isActive });
    await refresh();
  }

  async function remove() {
    if (!deleteFor) return;
    await api.deleteInvitation(deleteFor.id);
    setDeleteFor(null);
    await refresh();
  }

  async function signOut() {
    await api.logout();
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="font-serif text-xl" style={{ color: '#C9A84C' }}>
            ✦
          </span>
          <h1 className="mt-2 font-serif text-3xl font-light" style={{ color: '#E8D5A3' }}>
            Düğün Davetiyeleri
          </h1>
          <p className="mt-1 font-sans text-xs uppercase tracking-[0.25em]" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Admin Paneli
          </p>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={signOut} className="btn-ghost">
            Çıkış
          </button>
          <Link href="/admin/new" className="btn-gold">
            + Yeni Davetiye Oluştur
          </Link>
        </div>
      </header>

      {rows.length === 0 ? (
        <div className="admin-card py-16 text-center">
          <p className="font-serif text-xl font-light" style={{ color: '#E8D5A3' }}>
            Henüz davetiye yok
          </p>
          <p className="mt-2 font-sans text-sm font-light" style={{ color: 'rgba(255,255,255,0.4)' }}>
            İlk düğün davetiyenizi oluşturun
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((row) => {
            const rsvpCount = rsvps.filter((r) => r.invitationSlug === row.slug).length;
            return (
              <motion.div
                key={row.id}
                className="admin-card"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-serif text-xl font-light" style={{ color: '#E8D5A3' }}>
                        {row.groomName} {row.conjunction} {row.brideName}
                      </h2>
                      <span
                        className="rounded-full px-2 py-0.5 font-sans text-xs"
                        style={
                          row.isActive
                            ? { background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', color: '#86efac' }
                            : { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f0a3a3' }
                        }
                      >
                        {row.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>

                    <div
                      className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-sans text-xs"
                      style={{ color: 'rgba(255,255,255,0.45)' }}
                    >
                      <span>📅 {formatDate(row.weddingDate) || 'Tarih yok'}</span>
                      <span>📍 {row.city || '—'}</span>
                      <span>🔗 /davet/{row.slug}</span>
                      <span>✉️ {rsvpCount} katılım</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    href={`/davet/${row.slug}`}
                    target="_blank"
                    className="rounded-full px-4 py-2 font-sans text-xs uppercase tracking-[0.15em]"
                    style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)', color: '#E8D5A3' }}
                  >
                    Önizle
                  </Link>
                  <Link
                    href={`/admin/${row.id}`}
                    className="rounded-full px-4 py-2 font-sans text-xs uppercase tracking-[0.15em]"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.2)', color: 'rgba(255,255,255,0.75)' }}
                  >
                    Düzenle
                  </Link>
                  <button
                    type="button"
                    onClick={() => copyLink(row)}
                    title="Linki Kopyala"
                    className="rounded-full px-4 py-2 font-sans text-xs uppercase tracking-[0.15em]"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.2)', color: 'rgba(255,255,255,0.75)' }}
                  >
                    {copied === row.id ? 'Kopyalandı ✓' : 'Linki Kopyala'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setQrFor(row)}
                    className="rounded-full px-4 py-2 font-sans text-xs uppercase tracking-[0.15em]"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.2)', color: 'rgba(255,255,255,0.75)' }}
                  >
                    QR Kod
                  </button>
                  <button
                    type="button"
                    onClick={() => toggle(row)}
                    className="rounded-full px-4 py-2 font-sans text-xs uppercase tracking-[0.15em]"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.2)', color: 'rgba(255,255,255,0.75)' }}
                  >
                    {row.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteFor(row)}
                    className="rounded-full px-4 py-2 font-sans text-xs uppercase tracking-[0.15em]"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#f0a3a3' }}
                  >
                    Sil
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* katılım bildirimleri */}
      {rsvps.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 font-serif text-2xl font-light" style={{ color: '#E8D5A3' }}>
            Katılım Bildirimleri
          </h2>
          <div className="space-y-2">
            {rsvps.map((rsvp) => (
              <div
                key={rsvp.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(201,168,76,0.12)' }}
              >
                <div className="min-w-0">
                  <p className="font-sans text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>
                    {rsvp.name}{' '}
                    <span style={{ color: rsvp.attending ? '#86efac' : '#f0a3a3' }}>
                      {rsvp.attending ? `· ${rsvp.count} kişi` : '· katılamıyor'}
                    </span>
                  </p>
                  <p className="font-sans text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {rsvp.phone} · /{rsvp.invitationSlug}
                    {rsvp.note ? ` · “${rsvp.note}”` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await api.deleteRsvp(rsvp.id);
                    setRsvps(await api.listRsvps());
                  }}
                  className="font-sans text-xs uppercase tracking-[0.15em]"
                  style={{ color: 'rgba(239,68,68,0.6)' }}
                >
                  Sil
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <AnimatePresence>
        {qrFor && <QrModal invitation={qrFor} onClose={() => setQrFor(null)} />}
        {deleteFor && (
          <DeleteModal
            invitation={deleteFor}
            onCancel={() => setDeleteFor(null)}
            onConfirm={remove}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
