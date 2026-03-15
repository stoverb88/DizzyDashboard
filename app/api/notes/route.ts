import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { normalizeChartId, isValidChartId } from '@/lib/chart-id'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { encryptNote, deriveKvKey } from '@/lib/encryption'

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request)

    // Rate limiting: 20 requests per minute per IP
    const rateLimitResult = await rateLimit(clientIp, 20, 60)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.', resetAt: rateLimitResult.resetAt },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '20',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetAt.toString()
          }
        }
      )
    }

    // Parse request body with error handling
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const { narrative, chartId } = body

    // Validate required fields
    if (!narrative || !chartId) {
      return NextResponse.json(
        { error: 'Missing required fields: narrative and chartId are required' },
        { status: 400 }
      )
    }

    const normalizedChartId = normalizeChartId(chartId)

    // Validate chartId format (8 alphanumeric characters)
    if (!isValidChartId(normalizedChartId)) {
      return NextResponse.json(
        { error: 'Chart ID must be exactly 8 alphanumeric characters' },
        { status: 400 }
      )
    }

    // Validate narrative is a string and not empty
    if (typeof narrative !== 'string' || narrative.trim().length === 0) {
      return NextResponse.json(
        { error: 'Narrative must be a non-empty string' },
        { status: 400 }
      )
    }

    const retentionSeconds = 72 * 60 * 60 // 72 hours

    // Derive the HMAC-based KV key (hides raw chart IDs from the KV key namespace)
    let kvKey: string
    try {
      kvKey = await deriveKvKey(normalizedChartId)
    } catch (keyError) {
      console.error('Key derivation error:', keyError instanceof Error ? keyError.message : 'Unknown error')
      return NextResponse.json(
        { error: 'Server configuration error. Please contact support.' },
        { status: 500 }
      )
    }

    // Idempotency guard: prevent silent overwrite of an existing note
    try {
      const exists = await kv.exists(`vestibular:note:${kvKey}`)
      if (exists) {
        return NextResponse.json(
          { error: 'A chart note with this ID already exists.' },
          { status: 409 }
        )
      }
    } catch (existsError) {
      console.error('KV exists check error:', existsError instanceof Error ? existsError.message : 'Unknown error')
      return NextResponse.json(
        { error: 'Database temporarily unavailable. Please try again in a moment.', retryable: true },
        { status: 503 }
      )
    }

    // Encrypt the narrative with a key derived from the chart ID + server pepper
    let encryptedNote
    try {
      encryptedNote = await encryptNote(normalizedChartId, narrative.trim())
    } catch (encryptError) {
      console.error('Encryption error:', encryptError instanceof Error ? encryptError.message : 'Unknown error')
      return NextResponse.json(
        { error: 'Failed to secure the note. Please try again.' },
        { status: 500 }
      )
    }

    // Store encrypted note with 72-hour expiration
    try {
      await kv.setex(`vestibular:note:${kvKey}`, retentionSeconds, JSON.stringify(encryptedNote))
    } catch (kvError) {
      console.error('KV storage error:', kvError instanceof Error ? kvError.message : 'Unknown error')
      return NextResponse.json(
        { error: 'Database temporarily unavailable. Please try again in a moment.', retryable: true },
        { status: 503 }
      )
    }

    return NextResponse.json({
      success: true,
      id: normalizedChartId,
      message: 'Note saved successfully',
      expiresAt: encryptedNote.createdAt + (retentionSeconds * 1000)
    })
  } catch (error) {
    console.error('Unexpected error saving note:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json(
      { error: 'An unexpected error occurred while saving the note', retryable: true },
      { status: 500 }
    )
  }
}
