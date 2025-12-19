import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || session.role !== 'MEDICAL_PROFESSIONAL') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const patients = await prisma.user.findMany({
      where: {
        invitedBy: session.userId,
        role: 'PATIENT',
        inviteUsedAt: { not: null }
      },
      select: {
        id: true,
        name: true,
        email: true,
        inviteCode: true,
        inviteUsedAt: true,
        lastLoginAt: true,
        createdAt: true,
        _count: {
          select: { exerciseSessions: true }
        }
      },
      orderBy: { lastLoginAt: 'desc' }
    })

    return NextResponse.json({ success: true, patients })
  } catch (error) {
    console.error('Error fetching patients:', error)
    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 })
  }
}
