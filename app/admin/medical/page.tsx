// Admin Medical Professional Management Page
// Add and manage medical professional accounts

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import MedicalManagement from '@/components/admin/MedicalManagement'

export default async function AdminMedicalPage() {
  const session = await getSession()

  // Require authentication and ADMIN role
  if (!session.isLoggedIn || session.role !== 'ADMIN') {
    redirect('/login')
  }

  return <MedicalManagement session={session} />
}
