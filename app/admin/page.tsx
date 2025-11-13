// Admin Dashboard Overview
// Main landing page for admin interface

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import AdminDashboard from '@/components/admin/AdminDashboard'

export default async function AdminPage() {
  const session = await getSession()

  // Require authentication and ADMIN role
  if (!session.isLoggedIn || session.role !== 'ADMIN') {
    redirect('/login')
  }

  return <AdminDashboard session={session} />
}
