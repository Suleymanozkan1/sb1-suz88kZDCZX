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
        style={{ background: 'radial-gradient(ellipse at center, #2a1f14, #0d0805)' }}
      >
        <div>
          <h1 className="font-serif text-3xl font-light" style={{ color: '#E8D5A3' }}>
            Sayfa Bulunamadı
          </h1>
          <p className="mt-4 font-sans text-sm font-light" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Bu yükleme bağlantısı geçerli değil.
          </p>
        </div>
      </main>
    );
  }

  const names = `${invitation.groomName} ${invitation.conjunction || '&'} ${invitation.brideName}`;

  return (
    <main
      className="min-h-screen"
      style={{ background: 'linear-gradient(135deg, #1a0f08 0%, #2d1f12 45%, #0d0805 100%)' }}
    >
      <PhotoUpload slug={invitation.slug} coupleNames={names} />
    </main>
  );
}
