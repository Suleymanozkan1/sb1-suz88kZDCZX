import Link from 'next/link';
import { Divider, IconArrow } from '@/components/invitation/Ornaments';
import { listInvitations } from '@/lib/store';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const invitations = (await listInvitations()).filter((row) => row.isActive);

  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-center px-[var(--sp-md)] py-[var(--sp-xl)] text-center"
      style={{ background: 'linear-gradient(180deg, var(--c-ink) 0%, var(--c-night) 65%)' }}
    >
      <div className="grain" aria-hidden />

      <p className="t-label" style={{ color: 'var(--c-gold)' }}>
        Dijital Davetiye
      </p>
      <h1 className="t-hero mt-4" style={{ color: 'var(--c-on-dark)' }}>
        Düğün
        <span className="block italic" style={{ color: 'var(--c-gold)' }}>
          Davetiyesi
        </span>
      </h1>
      <p className="t-body mt-[var(--sp-md)] measure" style={{ color: 'var(--c-on-dark-soft)' }}>
        Perde açılışı, balmumu mühür, geri sayım ve katılım formuyla kendi davetiyenizi
        oluşturun.
      </p>
      <div className="mt-[var(--sp-md)]" style={{ color: 'var(--c-gold)' }}>
        <Divider />
      </div>

      {invitations.length > 0 && (
        <div className="mt-[var(--sp-lg)] w-full max-w-md text-left">
          <p className="t-label" style={{ color: 'var(--c-on-dark-faint)' }}>
            Yayındaki Davetiyeler
          </p>
          <div className="mt-[var(--sp-sm)]">
            {invitations.map((row, i) => (
              <Link
                key={row.id}
                href={`/davet/${row.slug}`}
                className="group relative block py-[var(--sp-sm)]"
              >
                <span className="rule-dark absolute inset-x-0 top-0" aria-hidden />
                <span className="t-h2 block" style={{ color: 'var(--c-on-dark)' }}>
                  {row.groomName}{' '}
                  <span className="italic" style={{ color: 'var(--c-gold)' }}>
                    {row.conjunction}
                  </span>{' '}
                  {row.brideName}
                </span>
                <span
                  className="mt-1 block font-sans text-xs"
                  style={{ color: 'var(--c-on-dark-faint)' }}
                >
                  /davet/{row.slug}
                </span>
                {i === invitations.length - 1 && (
                  <span className="rule-dark absolute inset-x-0 bottom-0" aria-hidden />
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      <Link href="/giris" className="cta nudge mt-[var(--sp-lg)]">
        Giriş Yap
        <IconArrow size={14} />
      </Link>
    </main>
  );
}
