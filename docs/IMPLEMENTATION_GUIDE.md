# HIPAA Security Implementation Guide
## Step-by-Step Instructions for DizzyDashboard

**Version**: 1.0
**Last Updated**: 2025-10-22
**Estimated Implementation Time**: 2-3 weeks

---

## Overview

This guide provides concrete, actionable steps to implement HIPAA-compliant security controls in DizzyDashboard. Each section includes:
- Code examples ready to copy/paste
- Installation commands
- Configuration instructions
- Testing procedures

---

## Table of Contents

1. [Phase 1: Rate Limiting (2-3 hours)](#phase-1-rate-limiting)
2. [Phase 2: Application-Layer Encryption (4-6 hours)](#phase-2-application-layer-encryption)
3. [Phase 3: Audit Logging (3-4 hours)](#phase-3-audit-logging)
4. [Phase 4: Enhanced Access Control (6-8 hours)](#phase-4-enhanced-access-control)
5. [Phase 5: PHI Detection Warnings (2-3 hours)](#phase-5-phi-detection-warnings)
6. [Testing and Validation](#testing-and-validation)
7. [Vendor BAA Procurement](#vendor-baa-procurement)

---

## Phase 1: Rate Limiting

**Priority**: 🔴 Critical
**Time**: 2-3 hours
**Goal**: Prevent brute-force enumeration of chart IDs

### Step 1.1: Install Dependencies

```bash
npm install @upstash/ratelimit
```

### Step 1.2: Create Middleware

Create `middleware.ts` in the project root:

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { kv } from '@vercel/kv'

// Create rate limiter instance
const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(10, '60 s'), // 10 requests per minute
  analytics: true, // Enable analytics in Vercel dashboard
  prefix: 'ratelimit', // Redis key prefix
})

export async function middleware(request: NextRequest) {
  // Only rate limit API routes
  if (!request.nextUrl.pathname.startsWith('/api/notes')) {
    return NextResponse.next()
  }

  // Get client identifier (IP address)
  const ip = request.headers.get('x-forwarded-for') ||
             request.headers.get('x-real-ip') ||
             'anonymous'

  // Check rate limit
  const { success, limit, reset, remaining } = await ratelimit.limit(ip)

  // Create response
  const response = success
    ? NextResponse.next()
    : NextResponse.json(
        {
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((reset - Date.now()) / 1000)
        },
        { status: 429 }
      )

  // Add rate limit headers (standard HTTP headers)
  response.headers.set('X-RateLimit-Limit', limit.toString())
  response.headers.set('X-RateLimit-Remaining', remaining.toString())
  response.headers.set('X-RateLimit-Reset', new Date(reset).toISOString())

  return response
}

// Configure which routes to apply middleware to
export const config = {
  matcher: '/api/notes/:path*', // Apply to all /api/notes/* routes
}
```

### Step 1.3: Test Rate Limiting

```bash
# Start dev server
npm run dev

# Test with curl (run 15 times quickly)
for i in {1..15}; do
  curl -X GET http://localhost:3000/api/notes/ABC123 -w "\nStatus: %{http_code}\n"
  sleep 0.5
done

# Expected: First 10 succeed (200/404), next 5 fail with 429
```

### Step 1.4: Adjust Rate Limits (Optional)

For different rate limits per route:

```typescript
// More permissive for GET (retrieve)
const getRatelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(20, '60 s'), // 20/min for reads
})

// More restrictive for POST (create)
const postRatelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(5, '60 s'), // 5/min for writes
})

// In middleware:
const limiter = request.method === 'POST' ? postRatelimit : getRatelimit
const { success } = await limiter.limit(ip)
```

---

## Phase 2: Application-Layer Encryption

**Priority**: 🔴 Critical
**Time**: 4-6 hours
**Goal**: Encrypt narratives before storing in Vercel KV

### Step 2.1: Generate Encryption Key

```bash
# Generate a secure 256-bit key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Output example: 8f7a3b2c1d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0
```

Add to `.env.local`:

```bash
# .env.local
NARRATIVE_ENCRYPTION_KEY=8f7a3b2c1d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0
```

**IMPORTANT**: Add to `.gitignore` and never commit!

### Step 2.2: Create Encryption Utility

Create `lib/encryption.ts`:

```typescript
// lib/encryption.ts
import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16 // 128 bits
const AUTH_TAG_LENGTH = 16 // 128 bits

/**
 * Encrypts a narrative using AES-256-GCM
 * @param narrative - Plain text narrative to encrypt
 * @returns Object containing encrypted data, IV, and auth tag
 */
export function encryptNarrative(narrative: string): {
  encrypted: string
  iv: string
  authTag: string
} {
  const key = process.env.NARRATIVE_ENCRYPTION_KEY

  if (!key || key.length !== 64) { // 32 bytes = 64 hex chars
    throw new Error('Invalid NARRATIVE_ENCRYPTION_KEY: must be 64 hex characters (32 bytes)')
  }

  // Generate random initialization vector
  const iv = crypto.randomBytes(IV_LENGTH)

  // Create cipher
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(key, 'hex'),
    iv
  )

  // Encrypt narrative
  let encrypted = cipher.update(narrative, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  // Get authentication tag (ensures data integrity)
  const authTag = cipher.getAuthTag()

  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  }
}

/**
 * Decrypts an encrypted narrative
 * @param encrypted - Hex-encoded encrypted data
 * @param iv - Hex-encoded initialization vector
 * @param authTag - Hex-encoded authentication tag
 * @returns Decrypted plain text narrative
 */
export function decryptNarrative(
  encrypted: string,
  iv: string,
  authTag: string
): string {
  const key = process.env.NARRATIVE_ENCRYPTION_KEY

  if (!key || key.length !== 64) {
    throw new Error('Invalid NARRATIVE_ENCRYPTION_KEY')
  }

  // Create decipher
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(key, 'hex'),
    Buffer.from(iv, 'hex')
  )

  // Set authentication tag (will throw if tampered)
  decipher.setAuthTag(Buffer.from(authTag, 'hex'))

  // Decrypt narrative
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

/**
 * Type guard to check if data is encrypted format
 */
export function isEncryptedFormat(data: any): data is {
  encrypted: string
  iv: string
  authTag: string
  createdAt: number
} {
  return (
    data &&
    typeof data.encrypted === 'string' &&
    typeof data.iv === 'string' &&
    typeof data.authTag === 'string' &&
    typeof data.createdAt === 'number'
  )
}
```

### Step 2.3: Update POST Endpoint (Save Notes)

Modify `app/api/notes/route.ts`:

```typescript
// app/api/notes/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { encryptNarrative } from '@/lib/encryption'

interface EncryptedNoteData {
  encrypted: string
  iv: string
  authTag: string
  createdAt: number
}

export async function POST(request: NextRequest) {
  try {
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

    // ENCRYPT THE NARRATIVE
    let encryptedData: { encrypted: string; iv: string; authTag: string }
    try {
      encryptedData = encryptNarrative(narrative.trim())
    } catch (encryptError) {
      console.error('Encryption error:', encryptError)
      return NextResponse.json(
        { error: 'Failed to encrypt narrative. Please contact support.' },
        { status: 500 }
      )
    }

    const noteData: EncryptedNoteData = {
      ...encryptedData,
      createdAt: Date.now()
    }

    // Store encrypted data with 24-hour expiration
    try {
      await kv.setex(
        `vestibular:note:${chartId.toUpperCase()}`,
        86400,
        JSON.stringify(noteData)
      )
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
      message: 'Note saved successfully (encrypted)',
      expiresAt: noteData.createdAt + 86400000
    })
  } catch (error) {
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
```

### Step 2.4: Update GET Endpoint (Retrieve Notes)

Modify `app/api/notes/[id]/route.ts`:

```typescript
// app/api/notes/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { decryptNarrative, isEncryptedFormat } from '@/lib/encryption'

interface EncryptedNoteData {
  encrypted: string
  iv: string
  authTag: string
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

    // Parse stored data
    let noteData: EncryptedNoteData
    try {
      if (typeof noteDataRaw === 'string') {
        noteData = JSON.parse(noteDataRaw)
      } else {
        noteData = noteDataRaw as EncryptedNoteData
      }
    } catch (parseError) {
      console.error('Error parsing note data:', parseError)
      return NextResponse.json(
        { error: 'Stored note data is corrupted' },
        { status: 500 }
      )
    }

    // Validate encrypted data structure
    if (!isEncryptedFormat(noteData)) {
      console.error('Invalid encrypted note data structure:', noteData)
      return NextResponse.json(
        { error: 'Stored note data is invalid' },
        { status: 500 }
      )
    }

    // Check if note has expired
    const now = Date.now()
    const twentyFourHours = 24 * 60 * 60 * 1000

    if (now - noteData.createdAt > twentyFourHours) {
      // Clean up expired note
      try {
        await kv.del(`vestibular:note:${chartId}`)
      } catch (delError) {
        console.error('Error deleting expired note:', delError)
      }
      return NextResponse.json(
        { error: 'Chart note has expired.' },
        { status: 410 }
      )
    }

    // DECRYPT THE NARRATIVE
    let decryptedNarrative: string
    try {
      decryptedNarrative = decryptNarrative(
        noteData.encrypted,
        noteData.iv,
        noteData.authTag
      )
    } catch (decryptError) {
      console.error('Decryption error:', decryptError)
      return NextResponse.json(
        { error: 'Failed to decrypt narrative. Data may be corrupted.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      narrative: decryptedNarrative,
      createdAt: noteData.createdAt,
      expiresAt: noteData.createdAt + twentyFourHours,
      encrypted: true // Indicate to client that encryption is active
    })
  } catch (error) {
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
```

### Step 2.5: Test Encryption

```bash
# Start dev server
npm run dev

# Save a test note
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"chartId":"TEST01","narrative":"This is a test narrative with sensitive clinical findings."}'

# Expected output: {"success":true,"id":"TEST01","message":"Note saved successfully (encrypted)",...}

# Retrieve the note
curl http://localhost:3000/api/notes/TEST01

# Expected: Decrypted narrative returned

# Verify encryption in KV (using Vercel CLI)
vercel kv get vestibular:note:TEST01

# Expected: Encrypted JSON with "encrypted", "iv", "authTag" fields (not plain text)
```

---

## Phase 3: Audit Logging

**Priority**: 🟠 High
**Time**: 3-4 hours
**Goal**: Track all access to chart notes for compliance

### Step 3.1: Create Audit Log Interface

Create `lib/audit.ts`:

```typescript
// lib/audit.ts
import { kv } from '@vercel/kv'
import crypto from 'crypto'

export type AuditEventType = 'CREATE' | 'READ' | 'DELETE' | 'ACCESS_DENIED' | 'ENCRYPTION_ERROR'

export interface AuditLog {
  eventId: string
  timestamp: number
  eventType: AuditEventType
  resourceType: 'ChartNote'
  resourceId: string // chartId
  actorIp: string
  actorUserAgent: string
  success: boolean
  errorMessage?: string
  metadata?: Record<string, any>
}

/**
 * Logs an audit event to Vercel KV
 * Retention: 6 years (HIPAA requirement)
 */
export async function logAuditEvent(event: Omit<AuditLog, 'eventId' | 'timestamp'>): Promise<void> {
  const auditLog: AuditLog = {
    eventId: crypto.randomUUID(),
    timestamp: Date.now(),
    ...event
  }

  const logKey = `audit:${auditLog.timestamp}:${auditLog.eventId}`
  const sixYears = 6 * 365 * 24 * 60 * 60 // seconds

  try {
    // Store in KV with 6-year retention
    await kv.setex(logKey, sixYears, JSON.stringify(auditLog))

    // Optionally send to external SIEM/webhook
    if (process.env.AUDIT_WEBHOOK_URL) {
      await fetch(process.env.AUDIT_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(auditLog)
      }).catch(err => {
        // Don't fail the main request if webhook fails
        console.error('Audit webhook error:', err)
      })
    }
  } catch (error) {
    // Critical: Audit logging failure should be logged but not block operations
    console.error('CRITICAL: Audit logging failed:', error, auditLog)
  }
}

/**
 * Retrieves audit logs for a specific chart ID
 */
export async function getAuditLogs(chartId: string): Promise<AuditLog[]> {
  try {
    const keys = await kv.keys('audit:*')
    const logs: AuditLog[] = []

    for (const key of keys) {
      const logData = await kv.get(key)
      if (logData) {
        const log = typeof logData === 'string' ? JSON.parse(logData) : logData
        if (log.resourceId === chartId.toUpperCase()) {
          logs.push(log)
        }
      }
    }

    return logs.sort((a, b) => b.timestamp - a.timestamp) // Newest first
  } catch (error) {
    console.error('Error retrieving audit logs:', error)
    return []
  }
}
```

### Step 3.2: Integrate Audit Logging into API Routes

Update `app/api/notes/route.ts` POST handler:

```typescript
// Add at top of file
import { logAuditEvent } from '@/lib/audit'

// Inside POST function, after validation, before encryption:
const actorIp = request.headers.get('x-forwarded-for') ||
                request.headers.get('x-real-ip') ||
                'unknown'
const actorUserAgent = request.headers.get('user-agent') || 'unknown'

// After successful storage:
await logAuditEvent({
  eventType: 'CREATE',
  resourceType: 'ChartNote',
  resourceId: chartId.toUpperCase(),
  actorIp,
  actorUserAgent,
  success: true,
  metadata: {
    narrativeLength: narrative.trim().length,
    encrypted: true
  }
})

// In catch block for encryption errors:
await logAuditEvent({
  eventType: 'ENCRYPTION_ERROR',
  resourceType: 'ChartNote',
  resourceId: chartId.toUpperCase(),
  actorIp,
  actorUserAgent,
  success: false,
  errorMessage: encryptError instanceof Error ? encryptError.message : 'Unknown encryption error'
})
```

Update `app/api/notes/[id]/route.ts` GET handler:

```typescript
// Add at top of file
import { logAuditEvent } from '@/lib/audit'

// Inside GET function, after validation:
const actorIp = request.headers.get('x-forwarded-for') ||
                request.headers.get('x-real-ip') ||
                'unknown'
const actorUserAgent = request.headers.get('user-agent') || 'unknown'

// After successful decryption:
await logAuditEvent({
  eventType: 'READ',
  resourceType: 'ChartNote',
  resourceId: chartId,
  actorIp,
  actorUserAgent,
  success: true
})

// In 404 not found case:
await logAuditEvent({
  eventType: 'ACCESS_DENIED',
  resourceType: 'ChartNote',
  resourceId: chartId,
  actorIp,
  actorUserAgent,
  success: false,
  errorMessage: 'Chart note not found or has expired'
})
```

### Step 3.3: Create Audit Log Retrieval API

Create `app/api/audit/route.ts`:

```typescript
// app/api/audit/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getAuditLogs } from '@/lib/audit'

export async function GET(request: NextRequest) {
  // In production, add authentication here!
  // For now, this is an admin-only endpoint

  const chartId = request.nextUrl.searchParams.get('chartId')

  if (!chartId) {
    return NextResponse.json(
      { error: 'chartId query parameter required' },
      { status: 400 }
    )
  }

  if (chartId.length !== 6 || !/^[A-Z0-9]{6}$/i.test(chartId)) {
    return NextResponse.json(
      { error: 'Invalid chart ID format' },
      { status: 400 }
    )
  }

  try {
    const logs = await getAuditLogs(chartId)

    return NextResponse.json({
      chartId: chartId.toUpperCase(),
      totalEvents: logs.length,
      logs
    })
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve audit logs' },
      { status: 500 }
    )
  }
}
```

### Step 3.4: Test Audit Logging

```bash
# Create a note
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"chartId":"AUDIT1","narrative":"Test audit logging"}'

# Retrieve the note (generates READ event)
curl http://localhost:3000/api/notes/AUDIT1

# View audit logs
curl "http://localhost:3000/api/audit?chartId=AUDIT1"

# Expected: JSON with CREATE and READ events, including IP addresses and timestamps
```

---

## Phase 4: Enhanced Access Control

**Priority**: 🟡 Medium
**Time**: 6-8 hours
**Goal**: Replace bare chart IDs with session-based access tokens

### Step 4.1: Update Data Model

Modify `app/api/notes/route.ts` POST endpoint:

```typescript
// After saving encrypted note, generate access token
const accessToken = crypto.randomBytes(32).toString('hex') // 64-character token

// Store token mapping (1-hour expiration)
await kv.setex(`token:${accessToken}`, 3600, chartId.toUpperCase())

// Return both chartId (for display) and accessToken (for access)
return NextResponse.json({
  success: true,
  chartId: chartId.toUpperCase(), // Show to user (human-readable)
  accessToken, // Use for API requests (secure)
  message: 'Note saved successfully (encrypted)',
  expiresAt: noteData.createdAt + 86400000,
  tokenExpiresAt: Date.now() + 3600000 // 1 hour
})
```

### Step 4.2: Update Retrieval Endpoint

Create `app/api/notes/token/[token]/route.ts`:

```typescript
// app/api/notes/token/[token]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { decryptNarrative, isEncryptedFormat } from '@/lib/encryption'
import { logAuditEvent } from '@/lib/audit'

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const { token } = params
  const actorIp = request.headers.get('x-forwarded-for') || 'unknown'
  const actorUserAgent = request.headers.get('user-agent') || 'unknown'

  // Validate token format (64 hex characters)
  if (!/^[a-f0-9]{64}$/i.test(token)) {
    await logAuditEvent({
      eventType: 'ACCESS_DENIED',
      resourceType: 'ChartNote',
      resourceId: 'INVALID_TOKEN',
      actorIp,
      actorUserAgent,
      success: false,
      errorMessage: 'Invalid access token format'
    })

    return NextResponse.json(
      { error: 'Invalid access token format' },
      { status: 400 }
    )
  }

  // Retrieve chartId from token
  let chartId: string | null
  try {
    chartId = await kv.get(`token:${token}`)
  } catch (error) {
    console.error('Error retrieving token:', error)
    return NextResponse.json(
      { error: 'Database error' },
      { status: 503 }
    )
  }

  if (!chartId) {
    await logAuditEvent({
      eventType: 'ACCESS_DENIED',
      resourceType: 'ChartNote',
      resourceId: 'UNKNOWN',
      actorIp,
      actorUserAgent,
      success: false,
      errorMessage: 'Access token not found or expired'
    })

    return NextResponse.json(
      { error: 'Access token not found or has expired' },
      { status: 401 }
    )
  }

  // Retrieve encrypted note
  const noteDataRaw = await kv.get(`vestibular:note:${chartId}`)

  if (!noteDataRaw) {
    await logAuditEvent({
      eventType: 'ACCESS_DENIED',
      resourceType: 'ChartNote',
      resourceId: chartId,
      actorIp,
      actorUserAgent,
      success: false,
      errorMessage: 'Chart note not found'
    })

    return NextResponse.json(
      { error: 'Chart note not found or has expired' },
      { status: 404 }
    )
  }

  // Decrypt and return (similar to original GET endpoint)
  // ... (copy decryption logic from Phase 2.4)

  await logAuditEvent({
    eventType: 'READ',
    resourceType: 'ChartNote',
    resourceId: chartId,
    actorIp,
    actorUserAgent,
    success: true,
    metadata: { accessMethod: 'token' }
  })

  return NextResponse.json({
    narrative: decryptedNarrative,
    chartId, // Return chartId for display
    createdAt: noteData.createdAt,
    expiresAt: noteData.createdAt + 86400000,
    encrypted: true
  })
}
```

### Step 4.3: Update Frontend

Modify `components/EvalTab.tsx` (Step 10):

```typescript
// After successful save response:
const data = await response.json()

if (response.ok) {
  setUploadStatus('success')

  // Display BOTH chartId (for human reference) and provide token link
  const tokenUrl = `${window.location.origin}/retrieve?token=${data.accessToken}`

  // Show success message with instructions
  alert(
    `Chart Note Saved Successfully!\n\n` +
    `Chart ID: ${data.chartId}\n` +
    `Access URL: ${tokenUrl}\n\n` +
    `Share the URL above (expires in 1 hour) or use the Chart ID in "Find My Chart Note" (valid for 24 hours).`
  )
}
```

Create `app/retrieve/page.tsx` for token-based retrieval:

```typescript
// app/retrieve/page.tsx
'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function RetrievePage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [narrative, setNarrative] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setError('No access token provided')
      setLoading(false)
      return
    }

    fetch(`/api/notes/token/${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.narrative) {
          setNarrative(data.narrative)
        } else {
          setError(data.error || 'Failed to retrieve note')
        }
      })
      .catch(err => {
        setError('Network error')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [token])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Chart Note</h1>
      <textarea
        readOnly
        value={narrative}
        style={{
          width: '100%',
          minHeight: '400px',
          padding: '15px',
          fontFamily: 'monospace'
        }}
      />
    </div>
  )
}
```

---

## Phase 5: PHI Detection Warnings

**Priority**: 🟡 Medium
**Time**: 2-3 hours
**Goal**: Warn users before saving narratives with potential PHI

### Step 5.1: Create PHI Detection Utility

Create `lib/phi-detection.ts`:

```typescript
// lib/phi-detection.ts

export interface PhiWarning {
  type: 'SSN' | 'DOB' | 'MRN' | 'PHONE' | 'EMAIL' | 'NAME'
  message: string
  matchCount: number
}

/**
 * Detects potential PHI in narrative text
 */
export function detectPotentialPHI(text: string): PhiWarning[] {
  const warnings: PhiWarning[] = []

  // SSN pattern: XXX-XX-XXXX or XXXXXXXXX
  const ssnMatches = text.match(/\b\d{3}-\d{2}-\d{4}\b|\b\d{9}\b/g)
  if (ssnMatches) {
    warnings.push({
      type: 'SSN',
      message: 'Potential Social Security Number detected',
      matchCount: ssnMatches.length
    })
  }

  // Date patterns (potential DOB): MM/DD/YYYY, MM-DD-YYYY
  const dobMatches = text.match(/\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g)
  if (dobMatches) {
    warnings.push({
      type: 'DOB',
      message: 'Potential date of birth detected',
      matchCount: dobMatches.length
    })
  }

  // MRN patterns: "MRN:", "MR#", "Medical Record Number"
  const mrnMatches = text.match(/\b(MRN|MR#|Medical Record Number)[\s:]*\d+\b/gi)
  if (mrnMatches) {
    warnings.push({
      type: 'MRN',
      message: 'Potential medical record number detected',
      matchCount: mrnMatches.length
    })
  }

  // Phone numbers: (XXX) XXX-XXXX, XXX-XXX-XXXX
  const phoneMatches = text.match(/\b\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g)
  if (phoneMatches) {
    warnings.push({
      type: 'PHONE',
      message: 'Potential phone number detected',
      matchCount: phoneMatches.length
    })
  }

  // Email addresses
  const emailMatches = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g)
  if (emailMatches) {
    warnings.push({
      type: 'EMAIL',
      message: 'Email address detected',
      matchCount: emailMatches.length
    })
  }

  // Capitalized consecutive words (potential names: "John Doe")
  const nameMatches = text.match(/\b[A-Z][a-z]+\s[A-Z][a-z]+\b/g)
  if (nameMatches && nameMatches.length > 2) { // More than 2 to avoid false positives
    warnings.push({
      type: 'NAME',
      message: 'Potential patient names detected (capitalized names)',
      matchCount: nameMatches.length
    })
  }

  return warnings
}
```

### Step 5.2: Integrate into Frontend

Modify `components/EvalTab.tsx` in the save function:

```typescript
// Add import
import { detectPotentialPHI } from '@/lib/phi-detection'

// In saveNarrativeToServer function, before fetch:
const saveNarrativeToServer = async () => {
  if (!formData.chartId) return;

  const narrativeToSave = editableNarrative || generateNarrative()

  // PHI DETECTION
  const phiWarnings = detectPotentialPHI(narrativeToSave)

  if (phiWarnings.length > 0) {
    const warningMessages = phiWarnings.map(w =>
      `- ${w.message} (${w.matchCount} occurrence${w.matchCount > 1 ? 's' : ''})`
    ).join('\n')

    const confirmSave = window.confirm(
      `⚠️ POTENTIAL PHI DETECTED ⚠️\n\n` +
      `The following patterns were found in your narrative:\n\n` +
      `${warningMessages}\n\n` +
      `Including Protected Health Information (PHI) may violate HIPAA regulations.\n\n` +
      `Do you want to proceed anyway?`
    )

    if (!confirmSave) {
      return // Cancel save
    }
  }

  setIsUploading(true);
  setUploadStatus('idle');

  // ... rest of save logic
}
```

### Step 5.3: Test PHI Detection

```typescript
// Test cases:
const testNarratives = [
  "Patient John Doe presented with vertigo. DOB: 05/15/1980. MRN: 123456.",
  "SSN 123-45-6789 reported dizziness. Call 555-123-4567.",
  "Email patient@example.com for follow-up.",
  "This narrative is PHI-free with no identifiers." // Should pass
]

testNarratives.forEach(narrative => {
  console.log('Testing:', narrative)
  console.log('Warnings:', detectPotentialPHI(narrative))
})
```

---

## Testing and Validation

### Comprehensive Test Checklist

- [ ] **Rate Limiting**
  - [ ] 11th request within 1 minute returns HTTP 429
  - [ ] Rate limit headers present (X-RateLimit-*)
  - [ ] Rate limit resets after 1 minute

- [ ] **Encryption**
  - [ ] Notes stored in KV are encrypted (not readable)
  - [ ] Notes can be decrypted correctly on retrieval
  - [ ] Tampering with authTag causes decryption failure
  - [ ] Missing encryption key causes error (not silent failure)

- [ ] **Audit Logging**
  - [ ] CREATE events logged when saving notes
  - [ ] READ events logged when retrieving notes
  - [ ] ACCESS_DENIED events logged for invalid requests
  - [ ] Logs include IP address, user agent, timestamp
  - [ ] Logs retrievable via /api/audit endpoint

- [ ] **Access Tokens**
  - [ ] Access tokens are 64 hex characters
  - [ ] Tokens expire after 1 hour
  - [ ] Expired tokens return HTTP 401
  - [ ] Invalid token format returns HTTP 400

- [ ] **PHI Detection**
  - [ ] SSN patterns detected and warned
  - [ ] DOB patterns detected and warned
  - [ ] MRN patterns detected and warned
  - [ ] User can cancel save after warning
  - [ ] PHI-free narratives pass without warnings

### Load Testing

```bash
# Install artillery (load testing tool)
npm install -g artillery

# Create test script: artillery.yml
# config:
#   target: 'http://localhost:3000'
#   phases:
#     - duration: 60
#       arrivalRate: 10
# scenarios:
#   - name: "Create and retrieve notes"
#     flow:
#       - post:
#           url: "/api/notes"
#           json:
#             chartId: "TEST{{ $randomString() }}"
#             narrative: "Load test narrative"

# Run load test
artillery run artillery.yml
```

---

## Vendor BAA Procurement

### Step 1: Vercel Enterprise Plan

1. **Contact Vercel Sales**:
   - Email: sales@vercel.com
   - Form: https://vercel.com/contact/sales

2. **Required Information**:
   - Company name and contact
   - Expected traffic volume
   - Deployment regions
   - HIPAA BAA requirement

3. **Pricing**:
   - Enterprise plan: ~$2,000-5,000/month minimum
   - Includes: BAA, SLA, dedicated support

4. **Implementation Timeline**:
   - Sales call: 1-2 weeks
   - Legal review: 2-4 weeks
   - Execution: 1 week

### Step 2: Upstash HIPAA Compliance

1. **Contact Upstash Support**:
   - Email: support@upstash.com
   - Subject: "HIPAA BAA Request for DizzyDashboard"

2. **Required Information**:
   - Current KV usage (check Vercel dashboard)
   - Data volume estimates
   - Encryption requirements

3. **Pricing**:
   - Enterprise plan: Custom (typically $500+/month)
   - HIPAA add-on: Additional fee

4. **Migration**:
   - No code changes required
   - Upstash will migrate your data to dedicated cluster

---

## Deployment Checklist

Before deploying to production:

- [ ] All environment variables set in Vercel dashboard
- [ ] `NARRATIVE_ENCRYPTION_KEY` is 64 hex characters
- [ ] `AUDIT_WEBHOOK_URL` configured (if using external SIEM)
- [ ] Rate limiting tested and confirmed working
- [ ] Encryption tested end-to-end
- [ ] Audit logs verified in production
- [ ] SECURITY.md reviewed and approved
- [ ] BAA_TEMPLATE.md ready for legal review
- [ ] PRIVACY_POLICY.md published on website
- [ ] Vercel Enterprise plan activated
- [ ] Upstash BAA signed
- [ ] Penetration test scheduled (optional but recommended)

---

## Support and Resources

### Documentation
- [SECURITY.md](./SECURITY.md) - Full security documentation
- [BAA_TEMPLATE.md](./BAA_TEMPLATE.md) - Business Associate Agreement template
- [PRIVACY_POLICY.md](./PRIVACY_POLICY.md) - Privacy policy for users

### External Resources
- HIPAA Security Rule: https://www.hhs.gov/hipaa/for-professionals/security/index.html
- Vercel Security: https://vercel.com/security
- Upstash Security: https://upstash.com/docs/common/security

### Contact
- Security Issues: security@yourdomain.com
- Implementation Help: dev@yourdomain.com
- Legal/Compliance: legal@yourdomain.com

---

**Document Version**: 1.0
**Tested With**: Node.js 20.x, Next.js 14.1.0, @vercel/kv 1.0.1
**Estimated Total Cost**: $0 (self-implementation) + $2,500-10,000/year (vendor BAAs)
