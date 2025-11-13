// Admin Dashboard Stats API
// Returns aggregated statistics for the admin dashboard

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getSession()
    if (!session.isLoggedIn || session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    // Get user counts by role
    const [totalUsers, medicalProfessionals, patients] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'MEDICAL_PROFESSIONAL' } }),
      prisma.user.count({ where: { role: 'PATIENT' } }),
    ])

    // Get active invites count (not used and not expired)
    const activeInvites = await prisma.patientInvite.count({
      where: {
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    })

    // For sessions, we can't track them in DB with iron-session
    // So we'll return a placeholder for now
    // In a real implementation, you might use a session store like Redis
    const activeSessions = 0

    return NextResponse.json({
      totalUsers,
      medicalProfessionals,
      patients,
      activeInvites,
      activeSessions,
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
