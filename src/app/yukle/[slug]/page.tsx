import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PhotoUpload from '@/components/guest/PhotoUpload';
import { getInvitationBySlug } from '@/lib/store';

export const dynamic = 'force-dynamic';

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const invitation = await getInvitationBySlug(params.slug);
  // isActive denetimi burada da gerekli: aksi hâlde yayından kaldırılmış bir
  // davetiyenin çift adları sayfa başlığında görünüyordu.
  if (!invitation?.isActive) return { title: 'Fotoğraf Yükleme' };

  return {
    title: `Fotoğraf Yükle | ${invitation.groomName} ${invitation.conjunction} ${invitation.brideName}`,
    description: 'Düğünde çektiğiniz fotoğrafları çiftle paylaşın.',
    robots: { index: false, follow: false },
  };
}

/** Masalardaki QR kodun açtığı sayfa: yalnızca fotoğraf yükleme, giriş gerekmez. */
export default async function GuestUploadPage({ params }: Props) {
  const invitation = await getInvitationBySlug(params.slug);

  if (!invitation?.isActive) notFound();

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
