// Admin-triggered password reset window
// Allows admins to issue a 24h reset token for a clinician

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const clinicianId = params.id
    if (!clinicianId) {
      return NextResponse.json(
        { error: 'Clinician ID is required' },
        { status: 400 }
      )
    }

    const clinician = await prisma.user.findUnique({
      where: { id: clinicianId },
      select: { id: true, role: true },
    })

    if (!clinician || clinician.role !== 'MEDICAL_PROFESSIONAL') {
      return NextResponse.json(
        { error: 'Medical professional not found' },
        { status: 404 }
      )
    }

    // Remove any previous pending reset windows
    await prisma.passwordResetRequest.deleteMany({
      where: {
        userId: clinician.id,
        usedAt: null,
      },
    })

    const resetToken = crypto.randomBytes(16).toString('hex').toUpperCase()
    const tokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex')

    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    const resetRequest = await prisma.passwordResetRequest.create({
      data: {
        userId: clinician.id,
        requestedById: session.userId,
        tokenHash,
        expiresAt,
      },
    })

    return NextResponse.json({
      success: true,
      resetToken,
      expiresAt: resetRequest.expiresAt.toISOString(),
      message: 'Password reset window created for 24 hours',
    })
  } catch (error) {
    console.error('Error creating password reset window:', error)
    return NextResponse.json(
      { error: 'Failed to create password reset window' },
      { status: 500 }
    )
  }
}
