// Admin Users Management Page
// View and manage all users in the system

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import UsersManagement from '@/components/admin/UsersManagement'

export default async function AdminUsersPage() {
  const session = await getSession()

  // Require authentication and ADMIN role
  if (!session.isLoggedIn || session.role !== 'ADMIN') {
    redirect('/login')
  }

  return <UsersManagement session={session} />
}
