import type { Metadata } from 'next';
import PhotoUpload from '@/components/guest/PhotoUpload';
import { getInvitationBySlug } from '@/lib/store';

export const dynamic = 'force-dynamic';

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const invitation = await getInvitationBySlug(params.slug);
  if (!invitation) return { title: 'Fotoğraf Yükleme' };

  return {
    title: `Fotoğraf Yükle | ${invitation.groomName} ${invitation.conjunction} ${invitation.brideName}`,
    description: 'Düğünde çektiğiniz fotoğrafları çiftle paylaşın.',
    robots: { index: false, follow: false },
  };
}

/** Masalardaki QR kodun açtığı sayfa: yalnızca fotoğraf yükleme, giriş gerekmez. */
export default async function GuestUploadPage({ params }: Props) {
  const invitation = await getInvitationBySlug(params.slug);

  if (!invitation || !invitation.isActive) {
    return (
      <main
        className="flex min-h-screen items-center justify-center px-6 text-center"
        style={{ background: 'radial-gradient(ellipse at center, var(--c-ember), var(--c-night))' }}
      >
        <div>
          <h1 className="t-display" style={{ color: 'var(--c-on-dark)' }}>
            Sayfa Bulunamadı
          </h1>
          <p className="t-body mt-4" style={{ color: 'var(--c-on-dark-soft)' }}>
            Bu yükleme bağlantısı geçerli değil.
          </p>
        </div>
      </main>
    );
  }

  const names = `${invitation.groomName} ${invitation.conjunction || '&'} ${invitation.brideName}`;

  return (
    <main
      className="relative min-h-screen"
      style={{ background: 'linear-gradient(180deg, var(--c-ink) 0%, var(--c-night) 65%)' }}
    >
      <div className="grain" aria-hidden />
      <PhotoUpload slug={invitation.slug} coupleNames={names} />
    </main>
  );
}
