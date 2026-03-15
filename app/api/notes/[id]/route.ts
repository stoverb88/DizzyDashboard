import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { rateLimit, trackFailedAttempt, resetFailedAttempts, getClientIp } from '@/lib/rate-limit'
import { normalizeChartId, isValidChartId } from '@/lib/chart-id'
import { decryptNote, deriveKvKey, isEncryptedNote, type StoredNote } from '@/lib/encryption'

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

    // Derive the HMAC-based KV key for this chartId
    let kvKey: string
    try {
      kvKey = await deriveKvKey(chartId)
    } catch (keyError) {
      console.error('Key derivation error:', keyError instanceof Error ? keyError.message : 'Unknown error')
      return NextResponse.json(
        { error: 'Server configuration error. Please contact support.' },
        { status: 500 }
      )
    }

    let noteDataRaw
    try {
      noteDataRaw = await kv.get(`vestibular:note:${kvKey}`)
    } catch (kvError) {
      console.error('KV retrieval error:', kvError instanceof Error ? kvError.message : 'Unknown error')
      return NextResponse.json(
        { error: 'Database temporarily unavailable. Please try again in a moment.', retryable: true },
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

    // Parse the stored value
    let parsedNote: StoredNote
    try {
      if (typeof noteDataRaw === 'string') {
        parsedNote = JSON.parse(noteDataRaw) as StoredNote
      } else {
        parsedNote = noteDataRaw as StoredNote
      }
    } catch {
      console.error('Error parsing stored note data')
      return NextResponse.json(
        { error: 'Stored note data is corrupted' },
        { status: 500 }
      )
    }

    // Decrypt if v1 encrypted note; pass through if legacy plaintext
    let narrative: string
    let createdAt: number

    if (isEncryptedNote(parsedNote)) {
      // v1 encrypted note path
      createdAt = parsedNote.createdAt
      try {
        narrative = await decryptNote(chartId, parsedNote)
      } catch (decryptError) {
        console.error('Decryption error:', decryptError instanceof Error ? decryptError.message : 'Unknown error')
        return NextResponse.json(
          { error: 'Failed to decrypt chart note. The note may be corrupted.' },
          { status: 500 }
        )
      }
    } else {
      console.error('Unexpected unencrypted note format')
      return NextResponse.json(
        { error: 'Stored note data is invalid' },
        { status: 500 }
      )
    }

    // Check if note has expired (defense-in-depth; KV TTL should handle this)
    const now = Date.now()
    const seventyTwoHours = 72 * 60 * 60 * 1000

    if (now - createdAt > seventyTwoHours) {
      try {
        await kv.del(`vestibular:note:${kvKey}`)
      } catch {
        // Continue anyway — note is expired regardless
      }
      await trackFailedAttempt(clientIp)
      return NextResponse.json(
        { error: 'Chart note has expired.' },
        { status: 410 } // 410 Gone
      )
    }

    // Successful retrieval — reset failure counter
    await resetFailedAttempts(clientIp)

    return NextResponse.json({
      narrative,
      createdAt,
      expiresAt: createdAt + seventyTwoHours
    }, {
      headers: {
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString()
      }
    })
  } catch (error) {
    console.error('Unexpected error retrieving note:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json(
      { error: 'An unexpected error occurred while retrieving the note', retryable: true },
      { status: 500 }
    )
  }
}
