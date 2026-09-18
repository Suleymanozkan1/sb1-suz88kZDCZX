import { redirect } from 'next/navigation';
import InvitationForm from '@/components/admin/InvitationForm';
import { currentSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default function NewInvitationPage() {
  const session = currentSession();
  if (!session) redirect('/giris?next=/panel/new');
  return <InvitationForm backHref="/panel" />;
}
