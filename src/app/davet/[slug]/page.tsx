import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import InvitationView from '@/components/invitation/InvitationView';
import { formatDate } from '@/lib/format';
import { getInvitationBySlug } from '@/lib/store';
import type { Invitation } from '@/lib/types';

export const dynamic = 'force-dynamic';

type Props = { params: { slug: string } };

async function load(slug: string): Promise<Invitation | null> {
  const invitation = await getInvitationBySlug(slug);
  return invitation?.isActive ? invitation : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const invitation = await load(params.slug);
  if (!invitation) return { title: 'Davetiye Bulunamadı' };

  const conjunction = invitation.conjunction || '&';
  const names = `${invitation.groomName} ${conjunction} ${invitation.brideName}`;
  const date = formatDate(invitation.weddingDate);
  const subtitle = [date, invitation.city].filter(Boolean).join(' · ');

  return {
    title: `${names} | ${date}`,
    description:
      invitation.invitationText ||
      `${invitation.groomName} ve ${invitation.brideName}'in düğün kutlamasına davetlisiniz.`,
    openGraph: {
      title: `${names} | Düğün Davetiyesi`,
      description: subtitle,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${names} | Düğün Davetiyesi`,
      description: subtitle,
    },
  };
}

export default async function InvitationPage({ params }: Props) {
  const invitation = await load(params.slug);
  if (!invitation) notFound();

  return <InvitationView invitation={invitation} />;
}
