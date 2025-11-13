import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { rateLimit, trackFailedAttempt, resetFailedAttempts, getClientIp } from '@/lib/rate-limit'
import { normalizeChartId, isValidChartId } from '@/lib/chart-id'

interface NoteData {
  narrative: string
  createdAt: number
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientIp = getClientIp(request)

    // Rate limiting: 10 requests per minute per IP
    const rateLimitResult = await rateLimit(clientIp, 10, 60)

    if (!rateLimitResult.success) {
      if (rateLimitResult.blocked) {
        return NextResponse.json(
          {
            error: 'Too many failed attempts. Access temporarily blocked.',
            resetAt: rateLimitResult.resetAt
          },
          {
            status: 429,
            headers: {
              'X-RateLimit-Blocked': 'true',
              'X-RateLimit-Reset': rateLimitResult.resetAt.toString()
            }
          }
        )
      }

      return NextResponse.json(
        {
          error: 'Too many requests. Please try again later.',
          resetAt: rateLimitResult.resetAt
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetAt.toString()
          }
        }
      )
    }

    const chartId = normalizeChartId(params.id)

    // Validate chartId format (now supports both 6 and 8 character codes for transition)
    if (!isValidChartId(chartId)) {
      await trackFailedAttempt(clientIp)
      return NextResponse.json(
        { error: 'Invalid chart ID format. Must be 8 alphanumeric characters.' },
        {
          status: 400,
          headers: {
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString()
          }
        }
      )
    }

    let noteDataRaw
    try {
      noteDataRaw = await kv.get(`vestibular:note:${chartId}`)
    } catch (kvError) {
      console.error('KV Retrieval Error:', kvError)
      return NextResponse.json(
        {
          error: 'Database temporarily unavailable. Please try again in a moment.',
          retryable: true
        },
        { status: 503 }
      )
    }

    if (!noteDataRaw) {
      await trackFailedAttempt(clientIp)
      return NextResponse.json(
        { error: 'Chart note not found or has expired.' },
        {
          status: 404,
          headers: {
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString()
          }
        }
      )
    }

    // Handle both string and object responses from KV
    let noteData: NoteData
    try {
      if (typeof noteDataRaw === 'string') {
        noteData = JSON.parse(noteDataRaw)
      } else {
        noteData = noteDataRaw as NoteData
      }
    } catch (parseError) {
      console.error('Error parsing note data:', parseError)
      return NextResponse.json(
        { error: 'Stored note data is corrupted' },
        { status: 500 }
      )
    }

    // Validate note data structure
    if (!noteData.narrative || typeof noteData.createdAt !== 'number') {
      console.error('Invalid note data structure:', noteData)
      return NextResponse.json(
        { error: 'Stored note data is invalid' },
        { status: 500 }
      )
    }

    // Check if note has expired (just in case)
    const now = Date.now()
    const seventyTwoHours = 72 * 60 * 60 * 1000

    if (now - noteData.createdAt > seventyTwoHours) {
      // Clean up expired note
      try {
        await kv.del(`vestibular:note:${chartId}`)
      } catch (delError) {
        console.error('Error deleting expired note:', delError)
        // Continue anyway since note is expired
      }
      await trackFailedAttempt(clientIp)
      return NextResponse.json(
        { error: 'Chart note has expired.' },
        { status: 410 } // 410 Gone - resource existed but is no longer available
      )
    }

    // Successful retrieval - reset failure counter
    await resetFailedAttempts(clientIp)

    return NextResponse.json({
      narrative: noteData.narrative,
      createdAt: noteData.createdAt,
      expiresAt: noteData.createdAt + seventyTwoHours
    }, {
      headers: {
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString()
      }
    })
  } catch (error) {
    // Log detailed error for debugging
    console.error('Error retrieving note:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: error?.constructor?.name
    })

    return NextResponse.json(
      {
        error: 'An unexpected error occurred while retrieving the note',
        retryable: true
      },
      { status: 500 }
    )
  }
} 