// Password reset verification endpoint
// Confirms that an admin-approved window and token are valid

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, token } = body

    if (!email || !token) {
      return NextResponse.json(
        { error: 'Email and reset token are required' },
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

    return NextResponse.json({
      success: true,
      resetRequestId: resetRequest.id,
      expiresAt: resetRequest.expiresAt.toISOString(),
      message: 'Reset token verified. You may create a new password.',
    })
  } catch (error) {
    console.error('Password reset verify error:', error)
    return NextResponse.json(
      { error: 'Failed to verify reset token' },
      { status: 500 }
    )
  }
}
