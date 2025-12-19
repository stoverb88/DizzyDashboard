import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { patientId: string } }
) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || session.role !== 'MEDICAL_PROFESSIONAL') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { patientId } = params

    // Verify patient belongs to this clinician
    const patient = await prisma.user.findFirst({
      where: {
        id: patientId,
        invitedBy: session.userId,
        role: 'PATIENT'
      }
    })

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    const sessions = await prisma.exerciseSession.findMany({
      where: { userId: patientId },
      orderBy: { completedAt: 'desc' },
      take: 50
    })

    return NextResponse.json({ success: true, sessions })
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
  }
}
