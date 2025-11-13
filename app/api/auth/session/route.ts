// Session API
// Returns current user session data

import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

export async function GET() {
  try {
    const session = await getSession()

    console.log('[Session API] Session retrieved:', {
      hasSession: !!session,
      userId: session?.userId || null,
      role: session?.role || null,
      isLoggedIn: session?.isLoggedIn || null,
      allKeys: session ? Object.keys(session) : [],
    })

    if (!session || !session.userId) {
      console.log('[Session API] No valid session found - returning null user')
      return NextResponse.json(
        { user: null },
        { status: 200 }
      )
    }

    console.log('[Session API] Valid session found - returning user data')
    // Return session data
    return NextResponse.json({
      user: {
        id: session.userId,
        email: session.email,
        name: session.name,
        role: session.role,
      },
    })
  } catch (error) {
    console.error('[Session API] Session fetch error:', error)
    return NextResponse.json(
      { user: null },
      { status: 200 }
    )
  }
}
