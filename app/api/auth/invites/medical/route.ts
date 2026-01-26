// Medical Professional Invitation API
// SECURITY: This endpoint is for creating medical professional invites ONLY
// Patient registration has been moved to /api/auth/register/patient

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { createMedicalInvite } from '@/lib/invitations'
import { sendMedicalInviteEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Creating an invite (authenticated user creating invite for someone else)
    // Check authentication
    const session = await getSession()
    if (!session?.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    // Check if user is medical professional or admin
    if (session.role !== 'MEDICAL_PROFESSIONAL' && session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only medical professionals can create invitations' },
        { status: 403 }
      )
    }

    const { email, expiresInDays } = body

    // Validate email
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
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

    // Create invitation
    const result = await createMedicalInvite(email.toLowerCase(), session.userId, expiresInDays || 7)

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
    }

    // Return invitation details
    return NextResponse.json({
      success: true,
      invitation: {
        email: result.invite!.email,
        token: result.invite!.token,
        expiresAt: result.invite!.expiresAt,
        inviteUrl: `${request.nextUrl.origin}${result.inviteUrl}`,
      },
      emailSent: emailResult.success,
      message: emailResult.success
        ? 'Invitation created and email sent successfully'
        : 'Invitation created successfully',
    })
  } catch (error) {
    console.error('Medical invite API error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// Get user's sent invitations
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (session.role !== 'MEDICAL_PROFESSIONAL' && session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    const { getUserInvitations } = await import('@/lib/invitations')
    const invitations = await getUserInvitations(session.userId)

    return NextResponse.json({
      success: true,
      medicalInvites: invitations.medicalInvites,
      patientInvites: invitations.patientInvites,
    })
  } catch (error) {
    console.error('Get invitations error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
