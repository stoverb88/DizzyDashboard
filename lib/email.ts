// Email Service using Resend
// Handles medical professional invitations and password reset emails

import { Resend } from 'resend'

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

// Email configuration
const FROM_EMAIL = 'noreply@dizzydashboard.com'
const APP_NAME = 'DizzyDashboard'

export interface EmailResult {
  success: boolean
  error?: string
  emailId?: string
}

/**
 * Send medical professional invitation email
 */
export async function sendMedicalInviteEmail(
  to: string,
  inviteUrl: string,
  expiresInDays: number = 7
): Promise<EmailResult> {
  try {
    // Validate environment
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured')
      return { success: false, error: 'Email service not configured' }
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `You're invited to join ${APP_NAME}`,
      html: getMedicalInviteEmailHTML(inviteUrl, expiresInDays),
      text: getMedicalInviteEmailText(inviteUrl, expiresInDays),
    })

    if (error) {
      console.error('Resend API error:', error)
      return { success: false, error: error.message }
    }

    console.log('Medical invite email sent:', { to, emailId: data?.id })
    return { success: true, emailId: data?.id }
  } catch (error) {
    console.error('Failed to send medical invite email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  to: string,
  resetToken: string,
  expiresInHours: number = 24,
  requestedByAdmin: boolean = false
): Promise<EmailResult> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured')
      return { success: false, error: 'Email service not configured' }
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Password Reset Request - ${APP_NAME}`,
      html: getPasswordResetEmailHTML(resetToken, expiresInHours, requestedByAdmin),
      text: getPasswordResetEmailText(resetToken, expiresInHours, requestedByAdmin),
    })

    if (error) {
      console.error('Resend API error:', error)
      return { success: false, error: error.message }
    }

    console.log('Password reset email sent:', { to, emailId: data?.id })
    return { success: true, emailId: data?.id }
  } catch (error) {
    console.error('Failed to send password reset email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Email Templates - HTML versions
function getMedicalInviteEmailHTML(inviteUrl: string, expiresInDays: number): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Medical Professional Invitation</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">DizzyDashboard</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Vestibular Screening Platform</p>
  </div>

  <div style="background: white; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #333; margin-top: 0;">You've Been Invited</h2>

    <p>You've been invited to join DizzyDashboard as a medical professional. This platform provides comprehensive vestibular screening tools and patient management.</p>

    <div style="margin: 30px 0;">
      <a href="${inviteUrl}"
         style="display: inline-block; background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
        Complete Registration
      </a>
    </div>

    <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #ffc107; border-radius: 4px; margin: 20px 0;">
      <p style="margin: 0; color: #856404;">
        <strong>⏱️ This invitation expires in ${expiresInDays} days</strong>
      </p>
    </div>

    <p style="color: #666; font-size: 14px; margin-top: 30px;">
      If the button doesn't work, copy and paste this link into your browser:
    </p>
    <p style="word-break: break-all; color: #667eea; font-size: 12px; background: #f5f5f5; padding: 10px; border-radius: 4px;">
      ${inviteUrl}
    </p>

    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

    <p style="color: #999; font-size: 12px; margin: 0;">
      If you didn't expect this invitation, you can safely ignore this email.
    </p>
  </div>
</body>
</html>
  `
}

function getPasswordResetEmailHTML(resetToken: string, expiresInHours: number, requestedByAdmin: boolean = false): string {
  const introText = requestedByAdmin
    ? 'Your administrator has created a password reset window for your DizzyDashboard account. Use the code below to reset your password:'
    : 'You requested a password reset for your DizzyDashboard account. Use the code below to reset your password:'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Request</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">DizzyDashboard</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Password Reset Request</p>
  </div>

  <div style="background: white; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>

    <p>${introText}</p>

    <div style="background: #f8f9fa; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 30px 0; border-radius: 8px;">
      <p style="margin: 0 0 10px 0; color: #666; font-size: 14px; font-weight: 600;">RESET CODE</p>
      <p style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #667eea; margin: 0; font-family: 'Courier New', monospace;">
        ${resetToken}
      </p>
    </div>

    <div style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; border-radius: 4px; margin: 20px 0;">
      <p style="margin: 0; color: #856404;">
        <strong>⏱️ This code expires in ${expiresInHours} hours</strong>
      </p>
    </div>

    <ol style="color: #666; margin: 20px 0;">
      <li>Go to the DizzyDashboard login page</li>
      <li>Click "Forgot Password?"</li>
      <li>Enter your email and the reset code above</li>
      <li>Create your new password</li>
    </ol>

    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

    <div style="background: #fff5f5; padding: 15px; border-left: 4px solid #dc3545; border-radius: 4px;">
      <p style="margin: 0; color: #721c24; font-size: 14px;">
        <strong>⚠️ Security Notice</strong><br>
        ${requestedByAdmin
          ? 'If you did not request this reset or are unaware of this action, please contact your administrator immediately.'
          : 'If you didn\'t request this password reset, please ignore this email and ensure your account is secure. Your password will remain unchanged.'}
      </p>
    </div>
  </div>
</body>
</html>
  `
}

// Email Templates - Plain text versions
function getMedicalInviteEmailText(inviteUrl: string, expiresInDays: number): string {
  return `
DizzyDashboard - Medical Professional Invitation

You've been invited to join DizzyDashboard as a medical professional.

Complete your registration by visiting:
${inviteUrl}

⏱️ This invitation expires in ${expiresInDays} days

If you didn't expect this invitation, you can safely ignore this email.

---
DizzyDashboard - Vestibular Screening Platform
  `.trim()
}

function getPasswordResetEmailText(resetToken: string, expiresInHours: number, requestedByAdmin: boolean = false): string {
  const introText = requestedByAdmin
    ? 'Your administrator has created a password reset window for your account.'
    : 'You requested a password reset for your account.'

  const securityNotice = requestedByAdmin
    ? 'If you did not request this reset or are unaware of this action, please contact your administrator immediately.'
    : 'If you didn\'t request this password reset, please ignore this email. Your password will remain unchanged.'

  return `
DizzyDashboard - Password Reset Request

${introText}

RESET CODE: ${resetToken}

⏱️ This code expires in ${expiresInHours} hours

Steps to reset your password:
1. Go to the DizzyDashboard login page
2. Click "Forgot Password?"
3. Enter your email and the reset code above
4. Create your new password

⚠️ SECURITY NOTICE
${securityNotice}

---
DizzyDashboard - Vestibular Screening Platform
  `.trim()
}
