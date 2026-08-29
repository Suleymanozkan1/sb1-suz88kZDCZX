import Link from 'next/link';
import { listInvitations } from '@/lib/store';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const invitations = (await listInvitations()).filter((row) => row.isActive);

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center px-6 py-20 text-center"
      style={{ background: 'linear-gradient(135deg, #1a0f08 0%, #2d1f12 45%, #0d0805 100%)' }}
    >
      <span className="font-serif text-3xl" style={{ color: '#C9A84C' }}>
        ✦
      </span>
      <h1 className="t-display mt-5" style={{ color: 'var(--c-on-dark)' }}>
        Dijital Düğün Davetiyesi
      </h1>
      <p className="mt-4 max-w-md font-sans text-sm font-light" style={{ color: 'rgba(255,255,255,0.5)' }}>
        Perde açılışı, balmumu mühür, geri sayım ve katılım formuyla kendi davetiyenizi
        oluşturun.
      </p>

      {invitations.length > 0 && (
        <div className="mt-12 w-full max-w-md space-y-3">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Yayındaki Davetiyeler
          </p>
          {invitations.map((row) => (
            <Link
              key={row.id}
              href={`/davet/${row.slug}`}
              className="block rounded-2xl px-5 py-4 text-left transition-all hover:-translate-y-0.5"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,168,76,0.18)' }}
            >
              <span className="font-serif text-lg font-light" style={{ color: '#E8D5A3' }}>
                {row.groomName} {row.conjunction} {row.brideName}
              </span>
              <span className="mt-1 block font-sans text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                /davet/{row.slug}
              </span>
            </Link>
          ))}
        </div>
      )}

      <Link href="/giris" className="btn-gold mt-12">
        Giriş Yap
      </Link>
    </main>
  );
}
