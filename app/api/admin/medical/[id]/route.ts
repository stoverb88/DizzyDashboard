// Admin Medical Professional Delete API
// Delete a specific medical professional account

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

    const medicalId = params.id

    // Prevent self-deletion
    if (medicalId === session.userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Check if medical professional exists and get patient count
    const medical = await prisma.user.findUnique({
      where: {
        id: medicalId,
        role: 'MEDICAL_PROFESSIONAL',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        invitedUsers: {
          where: {
            role: 'PATIENT',
          },
          select: {
            id: true,
          },
        },
      },
    })

    if (!medical) {
      return NextResponse.json(
        { error: 'Medical professional not found' },
        { status: 404 }
      )
    }

    const patientCount = medical.invitedUsers.length

    // Clean up the medical invite record for this email to allow re-inviting
    // Delete any MedicalInvite records associated with this email
    await prisma.medicalInvite.deleteMany({
      where: { email: medical.email },
    })

    // Delete the medical professional (cascade deletes: sessions, accounts, created invites, password resets)
    await prisma.user.delete({
      where: { id: medicalId },
    })

    return NextResponse.json({
      success: true,
      deletedUser: {
        id: medical.id,
        email: medical.email,
        name: medical.name,
        role: medical.role,
        patientCount,
      }
    })
  } catch (error) {
    console.error('Error deleting medical professional:', error)
    return NextResponse.json(
      { error: 'Failed to delete medical professional' },
      { status: 500 }
    )
  }
}
