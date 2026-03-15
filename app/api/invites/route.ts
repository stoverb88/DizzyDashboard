// Patient Invite API for Medical Professionals
// Allows medical professionals to generate and view patient invite codes

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { createPatientInvite } from '@/lib/invitations'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Check authentication and role
    const session = await getSession()
    if (!session.isLoggedIn) {
      return NextResponse.json(
        { error: 'Unauthorized - Login required' },
        { status: 401 }
      )
    }

    if (session.role !== 'MEDICAL_PROFESSIONAL' && session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Medical professional or admin access required' },
        { status: 403 }
      )
    }

    // Create the invite code
    const result = await createPatientInvite(session.userId)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to generate invite code' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      invite: result.invite,
      code: result.code,
    })
  } catch (error) {
    console.error('Error creating patient invite:', error)
    return NextResponse.json(
      { error: 'Failed to create patient invite' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication and role
    const session = await getSession()
    if (!session.isLoggedIn) {
      return NextResponse.json(
        { error: 'Unauthorized - Login required' },
        { status: 401 }
      )
    }

    if (session.role !== 'MEDICAL_PROFESSIONAL' && session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Medical professional or admin access required' },
        { status: 403 }
      )
    }

    // Fetch invites created by this medical professional
    const invites = await prisma.patientInvite.findMany({
      where: {
        createdBy: session.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10, // Only return the most recent 10 invites
      select: {
        id: true,
        code: true,
        createdAt: true,
        expiresAt: true,
        usedAt: true,
        usedByUser: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        useCount: true,
        maxUses: true,
      },
    })

    return NextResponse.json({
      success: true,
      invites,
    })
  } catch (error) {
    console.error('Error fetching patient invites:', error)
    return NextResponse.json(
      { error: 'Failed to fetch patient invites' },
      { status: 500 }
    )
  }
}
