// Invitation Generation Utilities
// For medical professional invites and patient codes

import { prisma } from './prisma'

/**
 * Generate a 6-digit numeric patient invitation code
 * Easy to remember and communicate verbally
 */
export function generatePatientInviteCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Generate an invitation code (alias for generatePatientInviteCode)
 * Used by admin panel for creating invite codes
 */
export function generateInviteCode(): string {
  return generatePatientInviteCode()
}

/**
 * Generate a secure token for medical professional invitations
 * Cryptographically random, URL-safe
 */
export function generateMedicalInviteToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Create a medical professional invitation
 *
 * @param email - Email address to invite
 * @param createdBy - User ID of creator (or "system")
 * @param expiresInDays - Days until expiration (default: 7)
 */
export async function createMedicalInvite(
  email: string,
  createdBy: string,
  expiresInDays: number = 7
) {
  const token = generateMedicalInviteToken()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + expiresInDays)

  try {
    const invite = await prisma.medicalInvite.create({
      data: {
        email,
        token,
        createdBy,
        expiresAt,
      },
    })

    return {
      success: true,
      invite,
      inviteUrl: `/auth/register?token=${token}`,
    }
  } catch (error) {
    if ((error as any).code === 'P2002') {
      // Unique constraint violation - email already invited
      return {
        success: false,
        error: 'This email has already been invited.',
      }
    }
    throw error
  }
}

/**
 * Create a patient invitation code
 *
 * @param createdBy - Medical professional user ID
 * @param expiresInDays - Days until expiration (default: 30)
 * @param note - Optional note about the patient
 */
export async function createPatientInvite(
  createdBy: string,
  expiresInDays: number = 30,
  note?: string
) {
  let code: string
  let attempts = 0
  const maxAttempts = 10

  // Generate unique code (retry if collision)
  while (attempts < maxAttempts) {
    code = generatePatientInviteCode()

    const existing = await prisma.patientInvite.findUnique({
      where: { code },
    })

    if (!existing) {
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + expiresInDays)

      const invite = await prisma.patientInvite.create({
        data: {
          code,
          createdBy,
          expiresAt,
          note,
        },
      })

      return {
        success: true,
        invite,
        code,
      }
    }

    attempts++
  }

  return {
    success: false,
    error: 'Failed to generate unique code. Please try again.',
  }
}

/**
 * Validate and use a medical professional invitation token
 *
 * @param token - Invitation token from URL
 */
export async function validateMedicalInvite(token: string) {
  const invite = await prisma.medicalInvite.findUnique({
    where: { token },
  })

  if (!invite) {
    return { valid: false, error: 'Invalid invitation token.' }
  }

  if (invite.usedAt) {
    return { valid: false, error: 'This invitation has already been used.' }
  }

  if (invite.expiresAt < new Date()) {
    return { valid: false, error: 'This invitation has expired.' }
  }

  if (!invite.approved) {
    return { valid: false, error: 'This invitation is pending approval.' }
  }

  return { valid: true, invite }
}

/**
 * Validate and use a patient invitation code
 *
 * @param code - 6-digit patient code
 */
export async function validatePatientInvite(code: string) {
  const normalizedCode = (code || '').trim().toUpperCase()

  if (!normalizedCode) {
    return { valid: false, error: 'Invalid invitation code.' }
  }

  const invite = await prisma.patientInvite.findUnique({
    where: { code: normalizedCode },
  })

  if (!invite) {
    return { valid: false, error: 'Invalid invitation code.' }
  }

  if (invite.expiresAt < new Date()) {
    return { valid: false, error: 'This invitation code has expired.' }
  }

  if (invite.useCount >= invite.maxUses) {
    return { valid: false, error: 'This invitation code has been fully used.' }
  }

  return { valid: true, invite }
}

/**
 * Mark medical invitation as used
 */
export async function useMedicalInvite(token: string) {
  await prisma.medicalInvite.update({
    where: { token },
    data: { usedAt: new Date() },
  })
}

/**
 * Mark patient invitation as used
 */
export async function usePatientInvite(code: string, userId: string) {
  const normalizedCode = (code || '').trim().toUpperCase()

  if (!normalizedCode) {
    throw new Error('Invalid invite code provided when marking as used.')
  }

  await prisma.patientInvite.update({
    where: { code: normalizedCode },
    data: {
      usedAt: new Date(),
      usedBy: userId,
      useCount: { increment: 1 },
    },
  })
}

/**
 * Get all invitations created by a user
 */
export async function getUserInvitations(userId: string) {
  const [medicalInvites, patientInvites] = await Promise.all([
    prisma.medicalInvite.findMany({
      where: { createdBy: userId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.patientInvite.findMany({
      where: { createdBy: userId },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return { medicalInvites, patientInvites }
}
