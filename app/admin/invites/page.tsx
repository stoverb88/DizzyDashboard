// Admin Invites Management Page
// Create and manage patient invitation codes

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import InvitesManagement from '@/components/admin/InvitesManagement'

export default async function AdminInvitesPage() {
  const session = await getSession()

  // Require authentication and ADMIN role
  if (!session.isLoggedIn || session.role !== 'ADMIN') {
    redirect('/login')
  }

  return <InvitesManagement session={session} />
}
