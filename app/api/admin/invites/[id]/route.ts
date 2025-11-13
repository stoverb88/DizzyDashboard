// Admin Invite Delete API
// Delete a specific invitation code

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and admin role
    const session = await getSession()
    if (!session.isLoggedIn || session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const inviteId = params.id

    // Check if invite exists and is not used
    const invite = await prisma.patientInvite.findUnique({
      where: { id: inviteId },
    })

    if (!invite) {
      return NextResponse.json(
        { error: 'Invite not found' },
        { status: 404 }
      )
    }

    if (invite.usedAt) {
      return NextResponse.json(
        { error: 'Cannot delete used invite' },
        { status: 400 }
      )
    }

    // Delete the invite
    await prisma.patientInvite.delete({
      where: { id: inviteId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting invite:', error)
    return NextResponse.json(
      { error: 'Failed to delete invite' },
      { status: 500 }
    )
  }
}
