// Admin Invites API
// Create and fetch invitation codes

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { generateInviteCode } from '@/lib/invitations'

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

    // Fetch all invites with creator info
    const invites = await prisma.patientInvite.findMany({
      select: {
        id: true,
        code: true,
        createdBy: true,
        creator: {
          select: {
            name: true,
            email: true,
          },
        },
        usedAt: true,
        usedBy: true,
        usedByUser: {
          select: {
            name: true,
            email: true,
          },
        },
        expiresAt: true,
        createdAt: true,
        note: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Transform dates to ISO strings and map usedByUser to usedBy
    const invitesWithStrings = invites.map((invite) => ({
      id: invite.id,
      code: invite.code,
      type: 'PATIENT' as const,
      createdById: invite.createdBy,
      createdBy: invite.creator,
      usedAt: invite.usedAt?.toISOString() || null,
      usedBy: invite.usedByUser || null,
      expiresAt: invite.expiresAt.toISOString(),
      createdAt: invite.createdAt.toISOString(),
    }))

    return NextResponse.json({ invites: invitesWithStrings })
  } catch (error) {
    console.error('Error fetching invites:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invites' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getSession()
    if (!session.isLoggedIn || session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { note } = body

    // Generate unique invite code
    const code = generateInviteCode()

    // Create invite with 30 day expiration
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    const invite = await prisma.patientInvite.create({
      data: {
        code,
        expiresAt,
        createdBy: session.userId,
        note: note || null,
      },
      include: {
        creator: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      invite: {
        ...invite,
        usedAt: null,
        usedById: null,
        expiresAt: invite.expiresAt.toISOString(),
        createdAt: invite.createdAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Error creating invite:', error)
    return NextResponse.json(
      { error: 'Failed to create invite' },
      { status: 500 }
    )
  }
}
