import Link from 'next/link';
import { Divider, IconArrow } from '@/components/invitation/Ornaments';

/**
 * Karşılama sayfası.
 *
 * Burada hiçbir davetiye listelenmez. Eskiden yayındaki davetiyeler çift
 * adları ve adresleriyle birlikte sıralanıyordu; bu, giriş yapmamış herkese
 * kimin düğünü olduğunu ve davetiye adreslerini veriyordu. Bir davetiye
 * yalnızca adresini bilen kişiye açılır.
 */
export default function HomePage() {
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
        Sahra
        <span className="block italic" style={{ color: 'var(--c-gold)' }}>
          Davetiye
        </span>
      </h1>
      <p className="t-body mt-[var(--sp-md)] measure" style={{ color: 'var(--c-on-dark-soft)' }}>
        Perde açılışı, balmumu mühür, geri sayım ve katılım formuyla kendi davetiyenizi
        oluşturun.
      </p>
      <div className="mt-[var(--sp-md)]" style={{ color: 'var(--c-gold)' }}>
        <Divider />
      </div>

      <Link href="/giris" className="cta nudge mt-[var(--sp-lg)]">
        Giriş Yap
        <IconArrow size={14} />
      </Link>
    </main>
  );
}
