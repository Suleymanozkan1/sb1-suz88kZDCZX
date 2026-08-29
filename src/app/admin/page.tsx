import { redirect } from 'next/navigation';
import InvitationList from '@/components/admin/InvitationList';
import PanelHeader from '@/components/admin/PanelHeader';
import PhotoGallery from '@/components/panel/PhotoGallery';
import UserManager from '@/components/admin/UserManager';
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
        title="Düğün Davetiyeleri"
        subtitle="Admin Paneli"
        newHref="/admin/new"
      />

      <InvitationList initial={invitations} session={session} users={users} />

      <UserManager initial={users} invitations={invitations} />

      <div className="mt-14">
        <PhotoGallery invitations={invitations} />
      </div>
    </div>
  );
}
