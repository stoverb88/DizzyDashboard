// Patient Login API
// Validates 6-digit code and returns patient data

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validatePatientInvite } from '@/lib/invitations'
import { createSession } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body

    // Validate required field
    if (!code) {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      )
    }

    // Normalize code (remove spaces, uppercase)
    const normalizedCode = code.toString().replace(/\s/g, '').toUpperCase()

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(normalizedCode)) {
      return NextResponse.json(
        { error: 'Invalid code format. Must be 6 digits.' },
        { status: 400 }
      )
    }

    // Check if user already exists with this code
    const existingUser = await prisma.user.findUnique({
      where: { inviteCode: normalizedCode },
    })

    if (existingUser) {
      // User exists - create session and return their data (patient login)
      console.log('[Patient Login] Existing user found:', {
        id: existingUser.id,
        role: existingUser.role,
        inviteCode: existingUser.inviteCode,
      })

      const loginTimestamp = new Date()
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { lastLoginAt: loginTimestamp },
      })

      await createSession({
        userId: existingUser.id,
        email: existingUser.email || undefined,
        name: existingUser.name || undefined,
        role: existingUser.role,
      })

      console.log('[Patient Login] Session created for role:', existingUser.role)

      return NextResponse.json({
        success: true,
        user: {
          id: existingUser.id,
          name: existingUser.name,
          role: existingUser.role,
          inviteCode: existingUser.inviteCode,
          lastLoginAt: loginTimestamp.toISOString(),
        },
        message: 'Welcome back!',
      })
    }

    // User doesn't exist - validate invitation and auto-register
    const inviteValidation = await validatePatientInvite(normalizedCode)
    if (!inviteValidation.valid) {
      return NextResponse.json(
        { error: inviteValidation.error },
        { status: 400 }
      )
    }

    const invite = inviteValidation.invite!

    // Auto-create user account (simplified patient registration)
    const newUser = await prisma.user.create({
      data: {
        name: `Patient ${normalizedCode}`,
        role: 'PATIENT',
        inviteCode: normalizedCode,
        invitedBy: invite.createdBy,
        inviteUsedAt: new Date(),
        lastLoginAt: new Date(),
      },
    })

    // Mark invitation as used
    await prisma.patientInvite.update({
      where: { code: normalizedCode },
      data: {
        usedAt: new Date(),
        usedBy: newUser.id,
        useCount: { increment: 1 },
      },
    })

    // Create session for new user
    await createSession({
      userId: newUser.id,
      email: newUser.email || undefined,
      name: newUser.name || undefined,
      role: newUser.role,
    })

    // Return user data
    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        role: newUser.role,
        inviteCode: newUser.inviteCode,
      },
      message: 'Welcome! Your account has been created.',
    })
  } catch (error) {
    console.error('Patient login error:', error)

    // Handle duplicate code (shouldn't happen, but just in case)
    if ((error as any).code === 'P2002') {
      return NextResponse.json(
        { error: 'This code has already been used.' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred during login' },
      { status: 500 }
    )
  }
}
