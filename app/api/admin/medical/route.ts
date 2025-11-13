// Admin Medical Professionals API
// Fetch and create medical professional accounts

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getSession()
    if (!session.isLoggedIn || session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    // Fetch all medical professionals with invite metadata and patient counts
    const professionals = await prisma.user.findMany({
      where: {
        role: 'MEDICAL_PROFESSIONAL',
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        lastLoginAt: true,
        inviteCode: true,
        inviteUsedAt: true,
        createdPatientInvites: {
          where: {
            usedAt: { not: null },
          },
          select: {
            id: true,
          },
        },
        invitedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        passwordResetRequests: {
          where: {
            usedAt: null,
            expiresAt: { gt: new Date() },
          },
          select: {
            id: true,
            expiresAt: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Transform the data
    const professionalsWithCounts = professionals.map((prof) => ({
      id: prof.id,
      email: prof.email,
      name: prof.name,
      createdAt: prof.createdAt.toISOString(),
      lastLoginAt: prof.lastLoginAt ? prof.lastLoginAt.toISOString() : null,
      inviteCode: prof.inviteCode,
      inviteUsedAt: prof.inviteUsedAt ? prof.inviteUsedAt.toISOString() : null,
      patientsCount: prof.createdPatientInvites.length,
      invitedBy: prof.invitedByUser
        ? {
            id: prof.invitedByUser.id,
            name: prof.invitedByUser.name,
            email: prof.invitedByUser.email,
          }
        : null,
      activeReset: prof.passwordResetRequests[0]
        ? {
            id: prof.passwordResetRequests[0].id,
            createdAt: prof.passwordResetRequests[0].createdAt.toISOString(),
            expiresAt: prof.passwordResetRequests[0].expiresAt.toISOString(),
          }
        : null,
    }))

    return NextResponse.json({ professionals: professionalsWithCounts })
  } catch (error) {
    console.error('Error fetching medical professionals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch medical professionals' },
      { status: 500 }
    )
  }
}

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
    const { email, password, name } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create medical professional
    const professional = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: name || null,
        password: hashedPassword,
        role: 'MEDICAL_PROFESSIONAL',
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      professional: {
        ...professional,
        createdAt: professional.createdAt.toISOString(),
        credentialsCount: 0,
        patientsCount: 0,
      },
    })
  } catch (error) {
    console.error('Error creating medical professional:', error)
    return NextResponse.json(
      { error: 'Failed to create medical professional' },
      { status: 500 }
    )
  }
}
