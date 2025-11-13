import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { normalizeChartId, isValidChartId } from '@/lib/chart-id'

interface NoteData {
  narrative: string
  createdAt: number
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body with error handling
    let body
    try {
      body = await request.json()
    } catch (parseError) {
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

    const noteData: NoteData = {
      narrative: narrative.trim(),
      createdAt: Date.now()
    }

    // Store with 72-hour expiration (259200 seconds)
    const retentionSeconds = 72 * 60 * 60 // 72 hours
    try {
      await kv.setex(`vestibular:note:${normalizedChartId}`, retentionSeconds, JSON.stringify(noteData))
    } catch (kvError) {
      console.error('KV Storage Error:', kvError)
      return NextResponse.json(
        {
          error: 'Database temporarily unavailable. Please try again in a moment.',
          retryable: true
        },
        { status: 503 }
      )
    }

    return NextResponse.json({
      success: true,
      id: normalizedChartId,
      message: 'Note saved successfully',
      expiresAt: noteData.createdAt + (retentionSeconds * 1000) // 72 hours in ms
    })
  } catch (error) {
    // Log detailed error for debugging
    console.error('Error saving note:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: error?.constructor?.name
    })

    return NextResponse.json(
      {
        error: 'An unexpected error occurred while saving the note',
        retryable: true
      },
      { status: 500 }
    )
  }
} 