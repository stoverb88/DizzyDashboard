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
    const { exerciseType, params, results, actualDuration, beatCount, cycleCount } = body

    // Handle different exercise types with appropriate defaults
    const isTwoTargetVOR = exerciseType === 'TwoTargetVOR'

    const exerciseSession = await prisma.exerciseSession.create({
      data: {
        userId: session.userId,
        exerciseType,
        targetSymbol: isTwoTargetVOR ? 'X' : params.targetSymbol,
        orientation: isTwoTargetVOR ? 'horizontal' : params.orientation,
        cadence: isTwoTargetVOR ? 0 : params.cadence,
        duration: params.duration,
        audioType: params.audioType,
        actualDuration,
        beatCount: isTwoTargetVOR ? cycleCount : beatCount,
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
