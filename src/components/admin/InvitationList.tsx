'use client';

import { AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import QrModal from './QrModal';
import { Action, Badge, ConfirmModal, EmptyState, Meta, PanelSection, Row } from './ui';
import {
  IconCalendar,
  IconCamera,
  IconEnvelope,
  IconLink,
  IconPin,
  IconUser,
} from '@/components/invitation/Ornaments';
import * as api from '@/lib/api';
import { formatDate } from '@/lib/format';
import type { GuestPhoto, Invitation, Rsvp, SafeUser, Session } from '@/lib/types';

export default function InvitationList({
  initial,
  session,
  users = [],
}: {
  initial: Invitation[];
  session: Session;
  users?: SafeUser[];
}) {
  const router = useRouter();
  const isAdmin = session.role === 'admin';

  const [rows, setRows] = useState(initial);
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [photos, setPhotos] = useState<GuestPhoto[]>([]);
  const [qrFor, setQrFor] = useState<Invitation | null>(null);
  const [deleteFor, setDeleteFor] = useState<Invitation | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    api.listRsvps().then(setRsvps, () => setRsvps([]));
    api.listPhotos().then(setPhotos, () => setPhotos([]));
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

  return (
    <>
      <PanelSection
        n={1}
        label="Davetiyeler"
        title={isAdmin ? 'Tüm Davetiyeler' : 'Davetiyelerim'}
      >
        {rows.length === 0 ? (
          <EmptyState
            icon={IconEnvelope}
            title="Henüz davetiye yok"
            lead="İlk düğün davetiyenizi oluşturun"
          />
        ) : (
          <div>
            {rows.map((row, i) => {
              const rsvpCount = rsvps.filter((r) => r.invitationSlug === row.slug).length;
              const photoCount = photos.filter((p) => p.invitationId === row.id).length;
              const owner = users.find((u) => u.id === row.ownerId);

              return (
                <Row key={row.id} index={i} last={i === rows.length - 1}>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <h3 className="t-h2" style={{ color: 'var(--c-on-dark)' }}>
                      {row.groomName}{' '}
                      <span className="italic" style={{ color: 'var(--c-gold)' }}>
                        {row.conjunction}
                      </span>{' '}
                      {row.brideName}
                    </h3>
                    <Badge tone={row.isActive ? 'ok' : 'off'}>
                      {row.isActive ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                    {isAdmin && owner && <Meta icon={IconUser}>{owner.displayName}</Meta>}
                    <Meta icon={IconCalendar}>
                      <span className="numerals">{formatDate(row.weddingDate) || 'Tarih yok'}</span>
                    </Meta>
                    <Meta icon={IconPin}>{row.city || '—'}</Meta>
                    <Meta icon={IconLink}>/davet/{row.slug}</Meta>
                    <Meta icon={IconEnvelope}>
                      <span className="numerals">{rsvpCount}</span> katılım
                    </Meta>
                    <Meta icon={IconCamera}>
                      <span className="numerals">{photoCount}</span> fotoğraf
                    </Meta>
                  </div>

                  <div className="mt-[var(--sp-sm)] flex flex-wrap gap-x-6 gap-y-3">
                    <Action href={`/davet/${row.slug}`} target="_blank">
                      Önizle
                    </Action>
                    <Action href={`${isAdmin ? '/admin' : '/panel'}/${row.id}`}>Düzenle</Action>
                    <Action onClick={() => copyLink(row)} title="Davetiye bağlantısını kopyala">
                      {copied === row.id ? 'Kopyalandı' : 'Linki Kopyala'}
                    </Action>
                    <Action onClick={() => setQrFor(row)}>QR Kod</Action>
                    <Action onClick={() => toggle(row)}>
                      {row.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                    </Action>
                    {isAdmin && (
                      <Action onClick={() => setDeleteFor(row)} danger>
                        Sil
                      </Action>
                    )}
                  </div>
                </Row>
              );
            })}
          </div>
        )}
      </PanelSection>

      {rsvps.length > 0 && (
        <PanelSection
          n={2}
          label="Katılım"
          title="Gelen Bildirimler"
          lead={`${rsvps.length} kayıt`}
        >
          <div>
            {rsvps.map((rsvp, i) => (
              <Row key={rsvp.id} index={i} last={i === rsvps.length - 1}>
                <div className="flex flex-wrap items-baseline justify-between gap-4">
                  <div className="min-w-0">
                    <p className="t-lead" style={{ color: 'var(--c-on-dark)' }}>
                      {rsvp.name}
                      <span
                        className="ml-3 font-sans text-xs"
                        style={{ color: rsvp.attending ? '#9ed7a8' : '#e2a3a3' }}
                      >
                        {rsvp.attending ? `${rsvp.count} kişi` : 'katılamıyor'}
                      </span>
                    </p>
                    <p className="mt-1 font-sans text-xs" style={{ color: 'var(--c-on-dark-faint)' }}>
                      <span className="numerals">{rsvp.phone}</span> · /{rsvp.invitationSlug}
                    </p>
                    {rsvp.note && (
                      <p
                        className="t-body mt-2 measure italic"
                        style={{ color: 'var(--c-on-dark-soft)' }}
                      >
                        “{rsvp.note}”
                      </p>
                    )}
                  </div>
                  <Action
                    danger
                    onClick={async () => {
                      await api.deleteRsvp(rsvp.id);
                      setRsvps(await api.listRsvps());
                    }}
                  >
                    Sil
                  </Action>
                </div>
              </Row>
            ))}
          </div>
        </PanelSection>
      )}

      <AnimatePresence>
        {qrFor && <QrModal invitation={qrFor} onClose={() => setQrFor(null)} />}
        {deleteFor && (
          <ConfirmModal
            title="Davetiyeyi Sil"
            body={
              <>
                <strong>
                  {deleteFor.groomName} {deleteFor.conjunction} {deleteFor.brideName}
                </strong>{' '}
                davetiyesi ve ona yüklenen fotoğraflar silinecek. Bu işlem geri alınamaz.
              </>
            }
            confirmLabel="Evet, Sil"
            onCancel={() => setDeleteFor(null)}
            onConfirm={remove}
          />
        )}
      </AnimatePresence>
    </>
  );
}
