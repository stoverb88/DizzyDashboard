// Cleanup orphaned medical invites (admin utility)
// Removes invite records where the user has already registered or the invite was used

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Delete all medical invite records for this email
    const result = await prisma.medicalInvite.deleteMany({
      where: { email: email.toLowerCase() },
    })

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      message: `Deleted ${result.count} invite record(s) for ${email}`,
    })
  } catch (error) {
    console.error('Error cleaning up invites:', error)
    return NextResponse.json(
      { error: 'Failed to cleanup invites' },
      { status: 500 }
    )
  }
}
