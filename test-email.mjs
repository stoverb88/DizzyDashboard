// Standalone email test script
// Run with: node test-email.mjs

import { config } from 'dotenv'
import { Resend } from 'resend'

// Load environment variables from .env.local
config({ path: '.env.local' })

async function testEmail() {
  console.log('Testing Resend email integration...\n')
  console.log('API Key configured:', process.env.RESEND_API_KEY ? '✅ Yes' : '❌ No')

  if (!process.env.RESEND_API_KEY || !process.env.RESEND_API_KEY.startsWith('re_')) {
    console.error('\n❌ Error: Invalid RESEND_API_KEY in .env.local')
    console.error('Current value:', process.env.RESEND_API_KEY?.substring(0, 20) + '...')
    console.error('Please ensure your Resend API key starts with "re_"')
    process.exit(1)
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  console.log('\n')

  // Test 1: Medical Invite Email
  console.log('📧 Test 1: Sending medical invite email...')
  try {
    const inviteResult = await resend.emails.send({
      from: 'noreply@dizzydashboard.com',
      to: 'benstover@gmail.com',
      subject: "You're invited to join DizzyDashboard",
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">DizzyDashboard</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Vestibular Screening Platform</p>
          </div>
          <div style="background: white; padding: 40px 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
            <h2 style="color: #333; margin-top: 0;">Test Email - You've Been Invited</h2>
            <p>This is a test email from your DizzyDashboard Resend integration! 🎉</p>
            <p>If you're seeing this, your email system is working perfectly.</p>
            <div style="margin: 30px 0;">
              <a href="http://localhost:3001/auth/register?token=TEST_TOKEN"
                 style="display: inline-block; background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                Complete Registration (Test Link)
              </a>
            </div>
            <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #ffc107; border-radius: 4px;">
              <p style="margin: 0; color: #856404;"><strong>⏱️ This invitation expires in 7 days</strong></p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: 'Test invite email from DizzyDashboard. Visit: http://localhost:3001/auth/register?token=TEST_TOKEN'
    })

    console.log('   ✅ Medical invite email sent successfully!')
    console.log('   📧 Email ID:', inviteResult.data?.id)
    console.log('   📬 Sent to: benstover@gmail.com\n')
  } catch (error) {
    console.error('   ❌ Failed to send medical invite email')
    console.error('   Error:', error.message)
    console.error('   Details:', error, '\n')
  }

  // Test 2: Password Reset Email
  console.log('📧 Test 2: Sending password reset email...')
  try {
    const resetResult = await resend.emails.send({
      from: 'noreply@dizzydashboard.com',
      to: 'benstover@gmail.com',
      subject: 'Password Reset Request - DizzyDashboard',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">DizzyDashboard</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Password Reset Request</p>
          </div>
          <div style="background: white; padding: 40px 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
            <h2 style="color: #333; margin-top: 0;">Test Email - Reset Your Password</h2>
            <p>This is a test password reset email! 🔐</p>
            <div style="background: #f8f9fa; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 30px 0; border-radius: 8px;">
              <p style="margin: 0 0 10px 0; color: #666; font-size: 14px; font-weight: 600;">RESET CODE</p>
              <p style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #667eea; margin: 0; font-family: 'Courier New', monospace;">
                TEST1234567890AB
              </p>
            </div>
            <div style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; border-radius: 4px;">
              <p style="margin: 0; color: #856404;"><strong>⏱️ This code expires in 24 hours</strong></p>
            </div>
            <ol style="color: #666; margin: 20px 0;">
              <li>Go to the DizzyDashboard login page</li>
              <li>Click "Forgot Password?"</li>
              <li>Enter your email and the reset code above</li>
              <li>Create your new password</li>
            </ol>
          </div>
        </body>
        </html>
      `,
      text: 'Test password reset email from DizzyDashboard. Reset code: TEST1234567890AB. This code expires in 24 hours.'
    })

    console.log('   ✅ Password reset email sent successfully!')
    console.log('   📧 Email ID:', resetResult.data?.id)
    console.log('   📬 Sent to: benstover@gmail.com\n')
  } catch (error) {
    console.error('   ❌ Failed to send password reset email')
    console.error('   Error:', error.message)
    console.error('   Details:', error, '\n')
  }

  console.log('─'.repeat(60))
  console.log('🎉 Email testing complete!')
  console.log('─'.repeat(60))
  console.log('\n📋 Next steps:')
  console.log('   1. Check your inbox at benstover@gmail.com')
  console.log('   2. Check spam folder if not in inbox')
  console.log('   3. Verify Resend dashboard: https://resend.com/emails')
  console.log('   4. Check email rendering in different clients\n')
}

testEmail()
