'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as api from '@/lib/api';
import type { Session } from '@/lib/types';

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
    <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div>
        <span className="font-serif text-xl" style={{ color: '#C9A84C' }}>
          ✦
        </span>
        <h1 className="mt-2 font-serif text-3xl font-light" style={{ color: '#E8D5A3' }}>
          {title}
        </h1>
        <p
          className="mt-1 font-sans text-xs uppercase tracking-[0.25em]"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          {subtitle} · {session.displayName}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={signOut} className="btn-ghost">
          Çıkış
        </button>
        <Link href={newHref} className="btn-gold">
          + Yeni Davetiye Oluştur
        </Link>
      </div>
    </header>
  );
}
