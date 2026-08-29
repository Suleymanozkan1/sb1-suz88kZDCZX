'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Divider, IconArrow, IconPlus } from '@/components/invitation/Ornaments';
import * as api from '@/lib/api';
import type { Session } from '@/lib/types';

/**
 * Panel başlığı — davetiye sayfasının hero'suyla aynı editoryal düzen:
 * küçük harf aralıklı etiket, altında büyük display başlık, sola yaslı.
 */
export default function PanelHeader({
  session,
  title,
  subtitle,
  newHref,
}: {
  session: Session;
  title: string;
  subtitle: string;
  newHref: string;
}) {
  const router = useRouter();

  async function signOut() {
    await api.logout();
    router.push('/giris');
    router.refresh();
  }

  return (
    <header className="pb-[var(--sp-sm)]">
      <div className="flex flex-wrap items-end justify-between gap-[var(--sp-sm)]">
        <div className="min-w-0">
          <p className="t-label" style={{ color: 'var(--c-gold)' }}>
            {subtitle}
          </p>
          <h1 className="t-h2 mt-3" style={{ color: 'var(--c-on-dark)' }}>
            {title}
          </h1>
          <p className="t-body mt-2" style={{ color: 'var(--c-on-dark-faint)' }}>
            {session.displayName}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-[var(--sp-md)]">
          <button
            type="button"
            onClick={signOut}
            className="link-underline"
            style={{ color: 'var(--c-on-dark-faint)' }}
          >
            Çıkış
          </button>
          <Link href={newHref} className="cta nudge">
            <IconPlus size={14} />
            Yeni Davetiye
            <IconArrow size={14} />
          </Link>
        </div>
      </div>

      <div className="mt-[var(--sp-sm)]" style={{ color: 'var(--c-gold)' }}>
        <Divider className="!justify-start" />
      </div>
    </header>
  );
}
