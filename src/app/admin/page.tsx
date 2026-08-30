import { redirect } from 'next/navigation';
import AccountSettings from '@/components/admin/AccountSettings';
import InvitationList from '@/components/admin/InvitationList';
import PanelHeader from '@/components/admin/PanelHeader';
import PhotoGallery from '@/components/panel/PhotoGallery';
import WishBoard from '@/components/panel/WishBoard';
import SetupNotice from '@/components/admin/SetupNotice';
import UserManager from '@/components/admin/UserManager';
import VenueManager from '@/components/admin/VenueManager';
import { currentSession } from '@/lib/auth';
import { listInvitations, listUsers } from '@/lib/store';

export const dynamic = 'force-dynamic';

/** Admin paneli — yalnızca admin rolü erişebilir. */
export default async function AdminPage() {
  const session = currentSession();
  if (!session) redirect('/giris?next=/admin');
  if (session.role !== 'admin') redirect('/panel');

  const [invitations, users] = await Promise.all([listInvitations(), listUsers()]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <PanelHeader
        session={session}
        title="Sahra Davetiye"
        subtitle="Admin Paneli"
        newHref="/admin/new"
      />

      <SetupNotice />

      <InvitationList initial={invitations} session={session} users={users} />

      <UserManager initial={users} invitations={invitations} />

      <VenueManager n={4} />

      <AccountSettings session={session} n={5} />

      <PhotoGallery invitations={invitations} n={6} />

      <WishBoard invitations={invitations} n={7} />
    </div>
  );
}
