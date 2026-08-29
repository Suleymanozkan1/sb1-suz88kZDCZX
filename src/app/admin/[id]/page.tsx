import { notFound, redirect } from 'next/navigation';
import InvitationForm from '@/components/admin/InvitationForm';
import { isAuthenticated } from '@/lib/auth';
import { getInvitation } from '@/lib/store';

export const dynamic = 'force-dynamic';

export default async function EditInvitationPage({ params }: { params: { id: string } }) {
  if (!isAuthenticated()) redirect(`/admin/login?next=/admin/${params.id}`);

  const invitation = await getInvitation(params.id);
  if (!invitation) notFound();

  return <InvitationForm existing={invitation} />;
}
