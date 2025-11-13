// Medical Professional Invitation & Redemption API
// Handles both creating invites and redeeming invite codes

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getSession, createSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { createMedicalInvite, validatePatientInvite, usePatientInvite } from '@/lib/invitations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // CASE 1: Redeeming an invite code (has code, email, password)
    if (body.inviteCode || body.code) {
      const { inviteCode, code, email, password, name } = body
      const inviteCodeToUse = inviteCode || code
      const normalizedCode = inviteCodeToUse?.trim().toUpperCase()

      // Validate required fields
      if (!normalizedCode || !email || !password) {
        return NextResponse.json(
          { error: 'Invite code, email, and password are required' },
          { status: 400 }
        )
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        )
      }

      // Validate password strength
      if (password.length < 8) {
        return NextResponse.json(
          { error: 'Password must be at least 8 characters long' },
          { status: 400 }
        )
      }

      // Validate invite code
      const inviteValidation = await validatePatientInvite(normalizedCode)
      if (!inviteValidation.valid) {
        return NextResponse.json(
          { error: inviteValidation.error || 'Invalid invite code' },
          { status: 400 }
        )
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 400 }
        )
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12)

      // Create user with MEDICAL_PROFESSIONAL role
      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          name: name || null,
          role: 'MEDICAL_PROFESSIONAL',
          emailVerified: new Date(),
          inviteCode: normalizedCode,
          invitedBy: inviteValidation.invite!.createdBy,
          inviteUsedAt: new Date(),
          lastLoginAt: new Date(),
        },
      })

      // Mark invitation as used
      await usePatientInvite(normalizedCode, user.id)

      // Create session
      await createSession({
        userId: user.id,
        email: user.email!,
        name: user.name || undefined,
        role: user.role,
      })

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        message: 'Account created successfully',
      })
    }

    // CASE 2: Creating an invite (authenticated user creating invite for someone else)
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

    // Return invitation details
    return NextResponse.json({
      success: true,
      invitation: {
        email: result.invite!.email,
        token: result.invite!.token,
        expiresAt: result.invite!.expiresAt,
        inviteUrl: `${request.nextUrl.origin}${result.inviteUrl}`,
      },
      message: 'Invitation created successfully',
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
