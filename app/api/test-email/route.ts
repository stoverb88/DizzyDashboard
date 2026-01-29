// Test Email API
// SECURITY: Admin-only endpoint for testing email functionality
// TODO: Remove before production or add strict IP whitelist

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { sendMedicalInviteEmail, sendPasswordResetEmail } from '@/lib/email'

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
    const { type, email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      )
    }

    const origin = request.nextUrl.origin

    if (type === 'invite') {
      const testInviteUrl = `${origin}/auth/register?token=TEST_TOKEN_123456789`
      const result = await sendMedicalInviteEmail(email, testInviteUrl, 7)

      return NextResponse.json({
        success: result.success,
        type: 'Medical Invite Email',
        sentTo: email,
        emailId: result.emailId,
        error: result.error,
      })
    } else if (type === 'password-reset') {
      const testResetToken = 'TEST1234567890AB'
      const result = await sendPasswordResetEmail(email, testResetToken, 24)

      return NextResponse.json({
        success: result.success,
        type: 'Password Reset Email',
        sentTo: email,
        emailId: result.emailId,
        error: result.error,
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid email type. Use "invite" or "password-reset"' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    )
  }
}
