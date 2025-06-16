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
    
    if (chartId.length !== 6) {
      return NextResponse.json(
        { error: 'Invalid chart ID format. Must be 6 characters.' },
        { status: 400 }
      )
    }

    const noteDataRaw = await kv.get(`note:${chartId}`)
    
    if (!noteDataRaw) {
      return NextResponse.json(
        { error: 'Chart note not found or has expired.' },
        { status: 404 }
      )
    }

    const noteData: NoteData = JSON.parse(noteDataRaw as string)
    
    // Check if note has expired (just in case)
    const now = Date.now()
    const twentyFourHours = 24 * 60 * 60 * 1000
    
    if (now - noteData.createdAt > twentyFourHours) {
      // Clean up expired note
      await kv.del(`note:${chartId}`)
      return NextResponse.json(
        { error: 'Chart note has expired.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      narrative: noteData.narrative,
      createdAt: noteData.createdAt,
      expiresAt: noteData.createdAt + twentyFourHours
    })
  } catch (error) {
    console.error('Error retrieving note:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve note' },
      { status: 500 }
    )
  }
} 