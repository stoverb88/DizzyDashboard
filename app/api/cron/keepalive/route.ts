import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { encryptNote, deriveKvKey } from '@/lib/encryption'

const DUMMY_CHART_ID = 'KEEPALIV'
const TTL_SECONDS = 72 * 60 * 60 // 72 hours

export async function GET(request: NextRequest) {
  // Verify cron secret — Vercel sends Authorization: Bearer <CRON_SECRET>
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const kvKey = await deriveKvKey(DUMMY_CHART_ID)
    const fullKey = `vestibular:note:${kvKey}`

    // Delete any existing entry so the write always succeeds
    await kv.del(fullKey)

    // Encrypt and store a dummy note
    const encrypted = await encryptNote(DUMMY_CHART_ID, 'Keepalive ping')
    await kv.setex(fullKey, TTL_SECONDS, JSON.stringify(encrypted))

    return NextResponse.json({ ok: true, ts: Date.now() })
  } catch (error) {
    console.error('Keepalive cron error:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Keepalive failed' }, { status: 500 })
  }
}
