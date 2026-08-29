import { redirect } from 'next/navigation';
import InvitationList from '@/components/admin/InvitationList';
import PanelHeader from '@/components/admin/PanelHeader';
import PhotoGallery from '@/components/panel/PhotoGallery';
import { currentSession } from '@/lib/auth';
import { listInvitations } from '@/lib/store';

export const dynamic = 'force-dynamic';

/** Çift paneli — hesap yalnızca kendi davetiyelerini ve albümünü görür. */
export default async function PanelPage() {
  const session = currentSession();
  if (!session) redirect('/giris?next=/panel');
  if (session.role === 'admin') redirect('/admin');

  const invitations = (await listInvitations()).filter((row) => row.ownerId === session.userId);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <PanelHeader
        session={session}
        title="Davetiyelerim"
        subtitle="Çift Paneli"
        newHref="/panel/new"
      />

      <InvitationList initial={invitations} session={session} />

      <div className="mt-14">
        <PhotoGallery invitations={invitations} />
      </div>
    </div>
  );
}
