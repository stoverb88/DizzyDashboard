// Admin Sessions Management Page
// View and manage active user sessions

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import SessionsManagement from '@/components/admin/SessionsManagement'

export default async function AdminSessionsPage() {
  const session = await getSession()

  // Require authentication and ADMIN role
  if (!session.isLoggedIn || session.role !== 'ADMIN') {
    redirect('/login')
  }

  return <SessionsManagement session={session} />
}
