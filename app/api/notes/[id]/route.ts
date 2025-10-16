import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

interface NoteData {
  narrative: string
  createdAt: number
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const chartId = params.id.toUpperCase()

    // Validate chartId format
    if (chartId.length !== 6 || !/^[A-Z0-9]{6}$/.test(chartId)) {
      return NextResponse.json(
        { error: 'Invalid chart ID format. Must be 6 alphanumeric characters.' },
        { status: 400 }
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
      return NextResponse.json(
        { error: 'Chart note not found or has expired.' },
        { status: 404 }
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
    const twentyFourHours = 24 * 60 * 60 * 1000

    if (now - noteData.createdAt > twentyFourHours) {
      // Clean up expired note
      try {
        await kv.del(`vestibular:note:${chartId}`)
      } catch (delError) {
        console.error('Error deleting expired note:', delError)
        // Continue anyway since note is expired
      }
      return NextResponse.json(
        { error: 'Chart note has expired.' },
        { status: 410 } // 410 Gone - resource existed but is no longer available
      )
    }

    return NextResponse.json({
      narrative: noteData.narrative,
      createdAt: noteData.createdAt,
      expiresAt: noteData.createdAt + twentyFourHours
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