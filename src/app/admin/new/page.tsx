import { redirect } from 'next/navigation';
import InvitationForm from '@/components/admin/InvitationForm';
import { isAuthenticated } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default function NewInvitationPage() {
  if (!isAuthenticated()) redirect('/admin/login?next=/admin/new');
  return <InvitationForm />;
}
