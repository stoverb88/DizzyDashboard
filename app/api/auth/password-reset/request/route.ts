// Self-Service Password Reset Request API
// Allows users to request password reset codes without admin intervention

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

// Generate 6-digit numeric code
function generateResetCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Hash reset token with SHA256
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      // Don't reveal invalid format to prevent enumeration
      return NextResponse.json({
        success: true,
        message: 'If an account exists with that email, a reset code has been sent.',
      })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true, name: true },
    })

    // If user doesn't exist, return success anyway (prevent enumeration)
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with that email, a reset code has been sent.',
      })
    }

    // RATE LIMITING: Check recent reset requests (past 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentRequests = await prisma.passwordResetRequest.count({
      where: {
        userId: user.id,
        createdAt: { gte: oneHourAgo },
      },
    })

    if (recentRequests >= 3) {
      // Rate limit exceeded - but don't tell user for security
      console.warn(`Rate limit exceeded for password reset: ${user.email}`)
      return NextResponse.json({
        success: true,
        message: 'If an account exists with that email, a reset code has been sent.',
      })
    }

    // Generate reset code and hash
    const resetCode = generateResetCode()
    const tokenHash = hashToken(resetCode)

    // Create reset request (24-hour expiration, self-service: requestedById is null)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
    await prisma.passwordResetRequest.create({
      data: {
        userId: user.id,
        requestedById: null, // Self-service (no admin)
        tokenHash,
        expiresAt,
      },
    })

    // Send email with reset code
    if (user.email) {
      const emailResult = await sendPasswordResetEmail(
        user.email,
        resetCode,
        24,
        false // requestedByAdmin = false (self-service)
      )

      if (!emailResult.success) {
        console.error('Failed to send password reset email:', emailResult.error)
      }
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account exists with that email, a reset code has been sent.',
    })
  } catch (error) {
    console.error('Password reset request error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
