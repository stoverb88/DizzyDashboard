import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { exerciseType, params, results, actualDuration, beatCount } = body

    const exerciseSession = await prisma.exerciseSession.create({
      data: {
        userId: session.userId,
        exerciseType,
        targetSymbol: params.targetSymbol,
        orientation: params.orientation,
        cadence: params.cadence,
        duration: params.duration,
        audioType: params.audioType,
        actualDuration,
        beatCount,
        dizzyRating: results.dizzyRating,
        position: results.position,
        surfaceType: results.surfaceType,
        footPosition: results.footPosition,
      }
    })

    return NextResponse.json({ success: true, session: exerciseSession })
  } catch (error) {
    console.error('Error saving exercise session:', error)
    return NextResponse.json({ error: 'Failed to save session' }, { status: 500 })
  }
}
