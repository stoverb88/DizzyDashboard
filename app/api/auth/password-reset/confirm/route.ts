// Password reset confirmation endpoint
// Updates clinician password when admin-issued token is valid

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, token, password } = body

    if (!email || !token || !password) {
      return NextResponse.json(
        { error: 'Email, token, and new password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        role: true,
      },
    })

    if (!user || user.role !== 'MEDICAL_PROFESSIONAL') {
      return NextResponse.json(
        { error: 'No clinician found with that email' },
        { status: 404 }
      )
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

    const resetRequest = await prisma.passwordResetRequest.findFirst({
      where: {
        userId: user.id,
        tokenHash,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!resetRequest) {
      return NextResponse.json(
        { error: 'Reset token is invalid or expired' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          lastLoginAt: null,
        },
      }),
      prisma.passwordResetRequest.update({
        where: { id: resetRequest.id },
        data: { usedAt: new Date() },
      }),
    ])

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. Please log in with your new credentials.',
    })
  } catch (error) {
    console.error('Password reset confirm error:', error)
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    )
  }
}
