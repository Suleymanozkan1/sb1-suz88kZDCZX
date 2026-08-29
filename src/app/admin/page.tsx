import { redirect } from 'next/navigation';
import InvitationList from '@/components/admin/InvitationList';
import { isAuthenticated } from '@/lib/auth';
import { listInvitations } from '@/lib/store';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  if (!isAuthenticated()) redirect('/admin/login');
  return <InvitationList initial={await listInvitations()} />;
}
