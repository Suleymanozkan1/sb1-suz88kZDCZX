'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { Action, Badge, EmptyState, PanelSection } from '@/components/admin/ui';
import { IconEnvelope } from '@/components/invitation/Ornaments';
import * as api from '@/lib/api';
import type { Invitation, Wish } from '@/lib/types';

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('tr-TR', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Dilek defteri yönetimi.
 *
 * Misafir mesajları buraya onay bekler durumda düşer; davetiyede yalnızca
 * onaylananlar görünür. Bekleyenler üstte listelenir, çünkü panelin buradaki
 * işi "yeni ne geldi" sorusunu yanıtlamaktır.
 */
export default function WishBoard({
  invitations,
  n = 6,
}: {
  invitations: Invitation[];
  n?: number;
}) {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setWishes(await api.listWishes());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Dilekler yüklenemedi');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onayla(wish: Wish, approved: boolean) {
    setBusy(wish.id);
    try {
      const next = await api.setWishApproved(wish.id, approved);
      setWishes((rows) => rows.map((w) => (w.id === wish.id ? next : w)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'İşlem başarısız');
    } finally {
      setBusy('');
    }
  }

  async function sil(wish: Wish) {
    setBusy(wish.id);
    try {
      await api.deleteWish(wish.id);
      setWishes((rows) => rows.filter((w) => w.id !== wish.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Silinemedi');
    } finally {
      setBusy('');
    }
  }

  const slugAdi = (slug: string) => {
    const inv = invitations.find((i) => i.slug === slug);
    return inv ? `${inv.groomName} & ${inv.brideName}` : slug;
  };

  // Bekleyenler önce: panelin işi "yeni ne geldi" sorusunu yanıtlamak.
  const sirali = [...wishes].sort((a, b) => Number(a.approved) - Number(b.approved));
  const bekleyen = wishes.filter((w) => !w.approved).length;

  return (
    <PanelSection
      n={n}
      label="Dilek Defteri"
      title="Misafir Dilekleri"
      lead={bekleyen > 0 ? `${bekleyen} dilek onayınızı bekliyor.` : undefined}
    >
      {error && (
        <p className="t-body mb-3" style={{ color: '#e2a3a3' }}>
          {error}
        </p>
      )}

      {wishes.length === 0 ? (
        <EmptyState
          icon={IconEnvelope}
          title="Henüz dilek yok"
          lead="Misafirleriniz davetiyedeki dilek defterinden mesaj bıraktığında burada görünür."
        />
      ) : (
        <AnimatePresence initial={false}>
          {sirali.map((wish) => (
            <motion.div
              key={wish.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35 }}
              className="relative py-[var(--sp-sm)]"
              style={{ borderTop: '1px solid rgba(176, 141, 63, 0.14)' }}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="t-lead" style={{ color: 'var(--c-on-dark)' }}>
                      {wish.name || 'İsimsiz'}
                    </span>
                    <Badge tone={wish.approved ? 'ok' : 'off'}>
                      {wish.approved ? 'Yayında' : 'Onay bekliyor'}
                    </Badge>
                  </div>
                  <p className="t-body mt-2" style={{ color: 'var(--c-on-dark-soft)' }}>
                    {wish.message}
                  </p>
                  <p className="t-label mt-2" style={{ color: 'var(--c-on-dark-faint)' }}>
                    {slugAdi(wish.invitationSlug)} · {formatWhen(wish.createdAt)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <Action onClick={() => onayla(wish, !wish.approved)}>
                    {wish.approved ? 'Yayından Kaldır' : 'Onayla'}
                  </Action>
                  <Action danger onClick={() => sil(wish)}>
                    Sil
                  </Action>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </PanelSection>
  );
}
