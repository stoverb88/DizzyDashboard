# DizzyDashboard Security Documentation

**Version**: 1.0
**Last Updated**: 2025-10-22
**Status**: HIPAA Compliance In Progress

---

## Table of Contents

1. [Security Overview](#security-overview)
2. [Data Encryption](#data-encryption)
3. [Access Control](#access-control)
4. [Audit Logging](#audit-logging)
5. [Data Retention](#data-retention)
6. [PHI Handling](#phi-handling)
7. [Compliance Statements](#compliance-statements)
8. [Security Improvements Roadmap](#security-improvements-roadmap)

---

## Security Overview

DizzyDashboard is a clinical decision support tool for vestibular assessments. The application processes and temporarily stores de-identified clinical narratives.

### Architecture
- **Frontend**: Next.js 14.1.0 (React 18.2.0)
- **Backend**: Next.js API Routes (serverless)
- **Storage**: Vercel KV (Redis-based, powered by Upstash)
- **Hosting**: Vercel (HTTPS enforced)

### Data Flow
```
User Input → localStorage (client) → Generated Narrative → API POST /api/notes
→ Vercel KV (24h TTL) → chartId returned → GET /api/notes/{id} → Display
```

---

## Data Encryption

### 1. Encryption in Transit ✅

**HTTPS/TLS Enforcement**
- All API requests use HTTPS (enforced by Vercel)
- Minimum TLS version: 1.2
- Certificate management: Automated via Vercel/Let's Encrypt
- WebSocket connections: WSS (secure)

**Vercel KV Connection Security**
- Protocol: `rediss://` (Redis over TLS)
- TLS certificate validation: Enabled
- Connection string format: `rediss://default:[token]@[host]:6379`
- Reference: `@vercel/kv` v1.0.1 package

**Evidence**:
- API routes: `/app/api/notes/route.ts`, `/app/api/notes/[id]/route.ts`
- KV connection: TLS-encrypted by default (Upstash requirement)

---

### 2. Encryption at Rest ⚠️

**Current State**: Partial
- **Vercel KV Infrastructure**: Encrypted at rest by Upstash
- **Application Layer**: No additional encryption implemented

**Recommendations**:

#### Option A: Application-Layer Encryption (Recommended)
```typescript
// Encrypt before storing in KV
import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.NARRATIVE_ENCRYPTION_KEY // 32-byte key
const ENCRYPTION_ALGORITHM = 'aes-256-gcm'

function encryptNarrative(narrative: string): {
  encrypted: string
  iv: string
  authTag: string
} {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv)

  let encrypted = cipher.update(narrative, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag().toString('hex')

  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag
  }
}

function decryptNarrative(encrypted: string, iv: string, authTag: string): string {
  const decipher = crypto.createDecipheriv(
    ENCRYPTION_ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    Buffer.from(iv, 'hex')
  )
  decipher.setAuthTag(Buffer.from(authTag, 'hex'))

  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}
```

**Implementation**: See `/app/api/notes/route.ts` (lines 48-55 for storage)

#### Option B: Field-Level Encryption via KV Provider
- Request Upstash to enable encryption at rest with customer-managed keys
- Requires Enterprise plan with Upstash

**Status**: ❌ Not Implemented

---

## Access Control

### Current Implementation ⚠️

**Authentication**: None
- No user login system
- No API keys or bearer tokens
- Access controlled solely by knowledge of 6-digit chart ID

**Authorization**: None
- No role-based access control (RBAC)
- No permission system
- Anyone with chartId can retrieve note

**Risks**:
1. **Brute Force**: ~2.2 million possible IDs (36^6 combinations)
2. **No Attribution**: Cannot identify who accessed what
3. **No Revocation**: Cannot disable access to leaked IDs

---

### Recommended Improvements

#### 1. API Rate Limiting (High Priority)
```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit'
import { kv } from '@vercel/kv'

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
  analytics: true,
})

export async function middleware(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'anonymous'
  const { success, limit, reset, remaining } = await ratelimit.limit(ip)

  if (!success) {
    return new Response('Too Many Requests', { status: 429 })
  }

  return NextResponse.next()
}
```

**Required Package**: `@upstash/ratelimit`

---

#### 2. Session-Based Access Tokens (Medium Priority)
Instead of bare chartIds, generate short-lived tokens:

```typescript
// When saving a note
const accessToken = crypto.randomBytes(32).toString('hex') // 64-char token
const chartId = generateChartId() // 6-digit ID for display

await kv.setex(`token:${accessToken}`, 3600, chartId) // 1-hour token
await kv.setex(`note:${chartId}`, 86400, narrative) // 24-hour note

return { chartId, accessToken } // Share both with user
```

```typescript
// When retrieving
const chartId = await kv.get(`token:${accessToken}`)
if (!chartId) return 401 Unauthorized

const note = await kv.get(`note:${chartId}`)
```

**Benefit**: Tokens can be revoked independently of chart IDs

---

#### 3. Optional User Authentication (Low Priority for MVP)
For enterprise deployment:
- NextAuth.js with OAuth providers (Google, Microsoft)
- Role-based access: Clinician, Admin, Read-Only
- Multi-factor authentication (MFA)

**Status**: ❌ Not Implemented

---

## Audit Logging

### Current State ❌

**What's Logged**:
- Server-side errors (console.error)
- Vercel function logs (stdout/stderr)

**What's NOT Logged**:
- Chart note creation events
- Chart note retrieval events
- Failed access attempts
- IP addresses of requesters
- Timestamp of each access (only creation timestamp)

---

### Recommended Audit Log Implementation

#### Audit Log Schema
```typescript
interface AuditLog {
  eventId: string           // UUID
  timestamp: number         // Unix timestamp
  eventType: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'ACCESS_DENIED'
  resourceType: 'ChartNote'
  resourceId: string        // chartId
  actorId?: string          // userId (if auth implemented)
  actorIp: string          // IP address
  actorUserAgent: string   // Browser info
  success: boolean
  errorMessage?: string
  metadata?: Record<string, any>
}
```

#### Implementation in API Routes
```typescript
// app/api/notes/route.ts - POST endpoint
async function logAuditEvent(event: AuditLog) {
  const logKey = `audit:${Date.now()}:${event.eventId}`
  await kv.setex(logKey, 2592000, JSON.stringify(event)) // 30-day retention

  // Also send to external SIEM if configured
  if (process.env.AUDIT_WEBHOOK_URL) {
    await fetch(process.env.AUDIT_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    })
  }
}

// Usage
await logAuditEvent({
  eventId: crypto.randomUUID(),
  timestamp: Date.now(),
  eventType: 'CREATE',
  resourceType: 'ChartNote',
  resourceId: chartId,
  actorIp: request.headers.get('x-forwarded-for') || 'unknown',
  actorUserAgent: request.headers.get('user-agent') || 'unknown',
  success: true
})
```

#### Audit Log Retrieval API
```typescript
// app/api/audit/route.ts
export async function GET(request: NextRequest) {
  const chartId = request.nextUrl.searchParams.get('chartId')

  // Retrieve all logs for this chart
  const keys = await kv.keys(`audit:*`)
  const logs = await Promise.all(
    keys.map(async (key) => {
      const log = await kv.get(key)
      return JSON.parse(log as string)
    })
  )

  return NextResponse.json(
    logs.filter(log => log.resourceId === chartId)
  )
}
```

**Retention**: 30 days minimum for HIPAA compliance

**Status**: ❌ Not Implemented

---

## Data Retention

### Current Policy ✅

**Chart Notes**: 24 hours automatic deletion
- TTL enforced at KV level: `kv.setex(key, 86400, data)`
- Manual cleanup on expired note retrieval (GET endpoint, lines 74-85)
- No long-term archival

**Form Data (Client-Side)**: Indefinite
- Stored in browser localStorage
- Keys: `vestibularFormData`, `evalCurrentStep`, `evalHasReset`
- Cleared manually by user (Reset Evaluation button)

---

### Recommendations

1. **Implement Data Deletion Logging**
   - Log when notes expire/are deleted
   - Maintain deletion audit trail

2. **Configurable Retention Periods**
   ```typescript
   const RETENTION_HOURS = parseInt(process.env.NOTE_RETENTION_HOURS || '24')
   await kv.setex(key, RETENTION_HOURS * 3600, data)
   ```

3. **Automatic localStorage Cleanup**
   - Clear client data after 7 days of inactivity
   - Implement in `useEffect` hook

**Status**: Partial (server-side only)

---

## PHI Handling

### Data Minimization ✅

**Generated Narratives Are PHI-Free by Design**

The `generateNarrative()` function ([components/EvalTab.tsx:559-713](components/EvalTab.tsx#L559-L713)) creates clinical summaries WITHOUT:
- Patient names
- Dates of birth (DOB)
- Medical record numbers (MRN)
- Social security numbers (SSN)
- Addresses
- Phone numbers
- Email addresses
- Any unique identifiers

**Example Output**:
```
HISTORY: This patient presents with acute onset vertigo
and unsteadiness. Symptoms are provoked by head movements.

OCULOMOTOR: Normal smooth pursuit and saccades. Positive
left Dix-Hallpike test.

IMPRESSION: Findings consistent with left posterior canal BPPV.

PLAN: Left Epley maneuver performed with symptomatic improvement.
```

---

### User-Added PHI Risk ⚠️

**HIPAA Compliance Modal** ([components/EvalTab.tsx:2058-2167](components/EvalTab.tsx#L2058-L2167))

Displays on first narrative access:
- Warning about PHI inclusion in custom edits
- List of prohibited identifiers
- User acknowledgment required

**Limitation**: Cannot technically prevent users from typing PHI into the editable narrative

---

### Recommendations

#### 1. PHI Detection (Client-Side Warning)
```typescript
function detectPotentialPHI(text: string): string[] {
  const warnings = []

  // Detect potential SSN patterns
  if (/\b\d{3}-\d{2}-\d{4}\b/.test(text)) {
    warnings.push('Potential SSN detected')
  }

  // Detect potential DOB patterns
  if (/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/.test(text)) {
    warnings.push('Potential date of birth detected')
  }

  // Detect potential MRN patterns (customize for your facility)
  if (/\b(MRN|MR#)[\s:]*\d+\b/i.test(text)) {
    warnings.push('Potential medical record number detected')
  }

  return warnings
}

// Show warning before saving
const phiWarnings = detectPotentialPHI(editableNarrative)
if (phiWarnings.length > 0) {
  if (!confirm(`WARNING: ${phiWarnings.join(', ')}. Continue?`)) {
    return // Cancel save
  }
}
```

#### 2. Server-Side PHI Scrubbing
- Use regex patterns to redact common PHI patterns before storage
- Replace with `[REDACTED]` markers

**Status**: ❌ Not Implemented (client-side warning only)

---

## Compliance Statements

### Data Storage Declaration

**Official Statement for Privacy Policy**:

> **DizzyDashboard Data Storage Policy**
>
> DizzyDashboard temporarily stores de-identified clinical narratives for 24 hours to facilitate clinical workflow. All narratives are:
>
> - Automatically generated without Protected Health Information (PHI)
> - Stored in encrypted form in transit (TLS 1.2+)
> - Stored at rest using Vercel KV infrastructure encryption
> - Automatically deleted after 24 hours (no manual intervention required)
> - Accessible only via knowledge of a unique 6-character chart identifier
>
> **DizzyDashboard does not store patient names, dates of birth, medical record numbers, or other direct patient identifiers.** Users are responsible for ensuring any manual edits to generated narratives comply with HIPAA requirements before incorporation into official medical records.

---

### Business Associate Agreement (BAA) Requirements

For HIPAA compliance, you must obtain BAAs from all vendors handling PHI:

#### 1. Vercel (Hosting & API)
- **Website**: https://vercel.com/legal/hipaa-baa
- **Availability**: Enterprise plans only
- **Requirement**: Upgrade from Hobby/Pro to Enterprise
- **Cost**: Contact sales (typically $2,000+/month)
- **Process**: Legal review, countersigning

#### 2. Upstash (Vercel KV Backend)
- **Website**: https://upstash.com/docs/common/help/hipaa
- **Availability**: Enterprise plans with HIPAA compliance add-on
- **Requirement**: Contact support@upstash.com
- **Cost**: Custom pricing
- **Features**:
  - Encryption at rest with customer-managed keys
  - Audit logging
  - Dedicated infrastructure

---

### Current BAA Status ❌

**Vercel**: No BAA in place (assuming Pro plan)
**Upstash**: No BAA in place (default KV configuration)

**Recommendation**:
1. Evaluate whether your application actually handles PHI
2. If yes, upgrade to Enterprise plans with BAA support
3. If no, strengthen "PHI-free" claims with technical controls

---

## Security Improvements Roadmap

### Phase 1: Critical (Implement Immediately)
- [ ] Add rate limiting to API routes (@upstash/ratelimit)
- [ ] Implement audit logging for all chart access
- [ ] Add application-layer encryption for narratives
- [ ] Document current security controls in this file

### Phase 2: High Priority (Within 30 days)
- [ ] Obtain BAAs from Vercel and Upstash (if handling PHI)
- [ ] Implement client-side PHI detection warnings
- [ ] Add session-based access tokens
- [ ] Set up external SIEM for audit logs (e.g., Datadog, Splunk)

### Phase 3: Medium Priority (Within 90 days)
- [ ] Implement user authentication (NextAuth.js)
- [ ] Add role-based access control
- [ ] Implement IP whitelisting for enterprise deployments
- [ ] Add multi-factor authentication (MFA)

### Phase 4: Long-Term Enhancements
- [ ] Penetration testing by third-party security firm
- [ ] SOC 2 Type II certification
- [ ] HITRUST CSF certification (if required)
- [ ] Implement zero-knowledge encryption

---

## Incident Response

### Security Incident Definition
Any event involving:
- Unauthorized access to chart notes
- Data breach or exposure
- System compromise
- Suspected brute-force attacks

### Response Procedure
1. **Detect**: Monitor Vercel logs for suspicious activity
2. **Contain**: Disable API routes via Vercel dashboard
3. **Investigate**: Review audit logs (once implemented)
4. **Notify**: Inform affected users within 60 days (HIPAA breach notification)
5. **Remediate**: Patch vulnerabilities, rotate keys
6. **Document**: Create incident report

**Contact**: [Your security team email]

---

## Appendix

### Security Contact
- **Email**: security@yourdomain.com
- **Responsible Disclosure**: security@yourdomain.com
- **PGP Key**: [Public key if available]

### Last Security Review
- **Date**: 2025-10-22
- **Reviewer**: Claude (AI Assistant)
- **Next Review**: 2025-11-22

### Related Documents
- Privacy Policy (to be created)
- BAA Template (to be created)
- Incident Response Plan (to be created)
- Data Processing Agreement (to be created)

---

**Document Version**: 1.0
**Classification**: Internal Use Only
**Approved By**: [Pending]
