// Admin Invites API
// Create and fetch invitation codes (both PATIENT and MEDICAL_PROFESSIONAL)

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { generateInviteCode, createMedicalInvite } from '@/lib/invitations'
import { sendMedicalInviteEmail } from '@/lib/email'

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

    // Fetch both patient and medical professional invites
    const [patientInvites, medicalInvites] = await Promise.all([
      prisma.patientInvite.findMany({
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
      }),
      prisma.medicalInvite.findMany({
        select: {
          id: true,
          email: true,
          token: true,
          createdBy: true,
          creator: {
            select: {
              name: true,
              email: true,
            },
          },
          usedAt: true,
          expiresAt: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ])

    // Transform patient invites
    const transformedPatientInvites = patientInvites.map((invite) => ({
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

    // Transform medical invites
    const transformedMedicalInvites = medicalInvites.map((invite) => ({
      id: invite.id,
      email: invite.email,
      token: invite.token,
      inviteUrl: `${request.nextUrl.origin}/auth/register?token=${invite.token}`,
      type: 'MEDICAL_PROFESSIONAL' as const,
      createdById: invite.createdBy,
      createdBy: invite.creator,
      usedAt: invite.usedAt?.toISOString() || null,
      usedBy: null, // Medical invites don't track who used them in the same way
      expiresAt: invite.expiresAt.toISOString(),
      createdAt: invite.createdAt.toISOString(),
    }))

    // Merge and sort by creation date
    const allInvites = [...transformedPatientInvites, ...transformedMedicalInvites].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return NextResponse.json({ invites: allInvites })
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
    const { type, email, expiresInDays, note } = body

    // Default to PATIENT type if not specified
    const inviteType = type || 'PATIENT'

    if (inviteType === 'MEDICAL_PROFESSIONAL') {
      // Create medical professional invitation

      // Validate email for medical invites
      if (!email) {
        return NextResponse.json(
          { error: 'Email is required for medical professional invitations' },
          { status: 400 }
        )
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        )
      }

      const result = await createMedicalInvite(
        email.toLowerCase(),
        session.userId,
        expiresInDays || 7
      )

      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        )
      }

      // Send invitation email (non-blocking)
      const inviteUrl = `${request.nextUrl.origin}${result.inviteUrl}`
      const emailResult = await sendMedicalInviteEmail(
        email.toLowerCase(),
        inviteUrl,
        expiresInDays || 7
      )

      // Log email status but don't block invite creation
      if (!emailResult.success) {
        console.error('Failed to send invitation email:', emailResult.error)
        // Note: We continue anyway - admin can manually share the URL
      }

      // Fetch the created invite with creator info
      const medicalInvite = await prisma.medicalInvite.findUnique({
        where: { token: result.invite!.token },
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
          id: medicalInvite!.id,
          type: 'MEDICAL_PROFESSIONAL' as const,
          token: medicalInvite!.token,
          email: medicalInvite!.email,
          inviteUrl: `${request.nextUrl.origin}${result.inviteUrl}`,
          createdById: medicalInvite!.createdBy,
          createdBy: medicalInvite!.creator,
          usedAt: medicalInvite!.usedAt?.toISOString() || null,
          usedBy: null,
          expiresAt: medicalInvite!.expiresAt.toISOString(),
          createdAt: medicalInvite!.createdAt.toISOString(),
        },
        emailSent: emailResult.success,
        message: emailResult.success
          ? 'Invitation created and email sent successfully'
          : 'Invitation created. Email failed to send - please share the URL manually'
      })
    } else {
      // Create patient invitation code

      // Generate unique invite code
      const code = generateInviteCode()

      // Create invite with 30 day expiration
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + (expiresInDays || 30))

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
          id: invite.id,
          type: 'PATIENT' as const,
          code: invite.code,
          createdById: invite.createdBy,
          createdBy: invite.creator,
          usedAt: null,
          usedBy: null,
          expiresAt: invite.expiresAt.toISOString(),
          createdAt: invite.createdAt.toISOString(),
        },
      })
    }
  } catch (error) {
    console.error('Error creating invite:', error)
    return NextResponse.json(
      { error: 'Failed to create invite' },
      { status: 500 }
    )
  }
}
