// Medical Professional Registration API
// Validates invitation token and creates account

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { validateMedicalInvite, useMedicalInvite } from '@/lib/invitations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, token } = body

    // Validate required fields
    if (!email || !password || !token) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, and token are required' },
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

    // Validate password strength (minimum 8 characters)
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Validate invitation token
    const inviteValidation = await validateMedicalInvite(token)
    if (!inviteValidation.valid) {
      return NextResponse.json(
        { error: inviteValidation.error },
        { status: 400 }
      )
    }

    // Check if invitation email matches
    if (inviteValidation.invite?.email !== email) {
      return NextResponse.json(
        { error: 'Email does not match invitation' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        role: 'MEDICAL_PROFESSIONAL',
        emailVerified: new Date(), // Auto-verify since they used valid invite
      },
    })

    // Mark invitation as used
    await useMedicalInvite(token)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      message: 'Account created successfully. You can now log in.',
    })
  } catch (error) {
    console.error('Medical registration error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred during registration' },
      { status: 500 }
    )
  }
}
