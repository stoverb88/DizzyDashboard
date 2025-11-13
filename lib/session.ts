// Session management using iron-session
// Provides secure, encrypted cookie-based sessions

import { getIronSession, IronSession } from 'iron-session'
import { cookies } from 'next/headers'
import type { UserRole } from '@prisma/client'

export interface SessionData {
  userId: string
  email?: string
  name?: string
  role: UserRole
  isLoggedIn: boolean
}

const sessionOptions = {
  password: process.env.NEXTAUTH_SECRET!,
  cookieName: 'vestibular_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? ('none' as const) : ('lax' as const),
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
}

export async function getSession() {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions)
  return session
}

export async function createSession(userData: Omit<SessionData, 'isLoggedIn'>) {
  const session = await getSession()
  session.userId = userData.userId
  session.email = userData.email
  session.name = userData.name
  session.role = userData.role
  session.isLoggedIn = true
  await session.save()
}

export async function destroySession() {
  const session = await getSession()
  session.destroy()
}
