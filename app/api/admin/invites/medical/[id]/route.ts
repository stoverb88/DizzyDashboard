// Admin Medical Invite Delete API
// Delete a specific medical professional invite

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const session = await getSession()
    if (!session.isLoggedIn || session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const inviteId = params.id

    // Verify invite exists before deleting
    const invite = await prisma.medicalInvite.findUnique({
      where: { id: inviteId },
    })

    if (!invite) {
      return NextResponse.json(
        { error: 'Medical invite not found' },
        { status: 404 }
      )
    }

    // Delete the medical invite
    await prisma.medicalInvite.delete({
      where: { id: inviteId },
    })

    return NextResponse.json({
      success: true,
      message: 'Medical invite deleted successfully',
      deletedEmail: invite.email,
    })
  } catch (error) {
    console.error('Error deleting medical invite:', error)
    return NextResponse.json(
      { error: 'Failed to delete medical invite' },
      { status: 500 }
    )
  }
}
