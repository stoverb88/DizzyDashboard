import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

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

    // Validate chartId format (6 alphanumeric characters)
    if (chartId.length !== 6 || !/^[A-Z0-9]{6}$/i.test(chartId)) {
      return NextResponse.json(
        { error: 'Chart ID must be exactly 6 alphanumeric characters' },
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

    // Store with 24-hour expiration (86400 seconds)
    try {
      await kv.setex(`vestibular:note:${chartId.toUpperCase()}`, 86400, JSON.stringify(noteData))
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
      id: chartId.toUpperCase(),
      message: 'Note saved successfully',
      expiresAt: noteData.createdAt + 86400000 // 24 hours in ms
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