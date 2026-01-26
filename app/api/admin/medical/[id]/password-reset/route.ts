// Admin-triggered password reset window
// Allows admins to issue a 24h reset token for a clinician

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { sendPasswordResetEmail } from '@/lib/email'

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

    // Fetch clinician email for sending reset email
    const clinicianWithEmail = await prisma.user.findUnique({
      where: { id: clinician.id },
      select: { email: true, name: true },
    })

    // Send password reset email (non-blocking)
    let emailSent = false
    if (clinicianWithEmail?.email) {
      const emailResult = await sendPasswordResetEmail(
        clinicianWithEmail.email,
        resetToken, // Plain token (not hashed)
        24
      )

      emailSent = emailResult.success

      if (!emailResult.success) {
        console.error('Failed to send password reset email:', emailResult.error)
        // Note: We continue anyway - admin can manually share the token
      }
    } else {
      console.warn('Cannot send password reset email - clinician has no email address')
    }

    return NextResponse.json({
      success: true,
      resetToken,
      expiresAt: resetRequest.expiresAt.toISOString(),
      emailSent,
      message: emailSent
        ? 'Password reset window created and email sent successfully'
        : 'Password reset window created for 24 hours',
    })
  } catch (error) {
    console.error('Error creating password reset window:', error)
    return NextResponse.json(
      { error: 'Failed to create password reset window' },
      { status: 500 }
    )
  }
}
