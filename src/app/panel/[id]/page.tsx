import { notFound, redirect } from 'next/navigation';
import InvitationForm from '@/components/admin/InvitationForm';
import { currentSession } from '@/lib/auth';
import { getInvitation } from '@/lib/store';

export const dynamic = 'force-dynamic';

export default async function EditInvitationPage({ params }: { params: { id: string } }) {
  const session = currentSession();
  if (!session) redirect(`/giris?next=/panel/${params.id}`);

  const invitation = await getInvitation(params.id);
  if (!invitation) notFound();

  // Başka bir hesabın davetiyesi bu panelden düzenlenemez.
  if (session.role !== 'admin' && invitation.ownerId !== session.userId) redirect('/panel');

  return <InvitationForm existing={invitation} backHref="/panel" />;
}
