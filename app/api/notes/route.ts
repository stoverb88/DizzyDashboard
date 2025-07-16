import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

interface NoteData {
  narrative: string
  createdAt: number
}

export async function POST(request: NextRequest) {
  try {
    const { narrative, chartId } = await request.json()
    
    if (!narrative || !chartId) {
      return NextResponse.json(
        { error: 'Missing narrative or chartId' },
        { status: 400 }
      )
    }

    if (chartId.length !== 6) {
      return NextResponse.json(
        { error: 'Chart ID must be exactly 6 characters' },
        { status: 400 }
      )
    }

    const noteData: NoteData = {
      narrative,
      createdAt: Date.now()
    }

    // Store with 24-hour expiration (86400 seconds)
    await kv.setex(`vestibular:note:${chartId}`, 86400, JSON.stringify(noteData))

    return NextResponse.json({ 
      success: true, 
      id: chartId,
      message: 'Note saved successfully' 
    })
  } catch (error) {
    console.error('Error saving note:', error)
    return NextResponse.json(
      { error: 'Failed to save note' },
      { status: 500 }
    )
  }
} 