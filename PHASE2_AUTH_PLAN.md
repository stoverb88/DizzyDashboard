# Phase 2: Authentication Implementation Plan

## Overview

**Goal:** Implement user authentication with role-based access control
**Timeline:** 2 weeks (14 days)
**Cost:** $0 additional (Vercel Postgres free tier)
**Status:** Ready to begin

---

## Your Requirements

### 1. Medical Professionals
- Invite-only system (initially)
- Ready to scale to self-registration with admin approval
- Full access to all app features
- Easy invite management

### 2. Patients (Patient Portal)
- Invitation code system (6-digit)
- Sign-in button: "I have a code"
- Access to Exercises tab ONLY
- Easy for patients (written code works)
- Lower security needs (just exercises)

### 3. Cost Constraints
- Keep it free if possible
- Minimize ongoing costs

---

## Technical Stack (FREE Options)

### Database: Vercel Postgres (Free Tier)
```
✅ 256MB storage (enough for 10,000+ users)
✅ 60 hours compute/month
✅ Perfect for auth + sessions
✅ Built into Vercel
✅ $0/month
```

### Authentication: NextAuth.js v5
```
✅ Free, open-source
✅ Built for Next.js
✅ Session management included
✅ Role-based access control
✅ Production-ready
```

### ORM: Prisma
```
✅ Free, open-source
✅ Type-safe database queries
✅ Easy migrations
✅ Great developer experience
```

---

## Database Schema

```prisma
// schema.prisma

model User {
  id            String    @id @default(cuid())
  email         String?   @unique
  emailVerified DateTime?
  password      String?   // Hashed with bcrypt
  name          String?
  role          UserRole  @default(PATIENT)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // For patient portal
  inviteCode    String?   @unique // 6-digit code
  invitedBy     String?   // Medical professional who invited them
  inviteUsedAt  DateTime? // When code was used

  sessions      Session[]
  accounts      Account[]
}

model MedicalInvite {
  id          String   @id @default(cuid())
  email       String   @unique
  token       String   @unique
  createdBy   String   // Admin or system
  createdAt   DateTime @default(now())
  expiresAt   DateTime
  usedAt      DateTime?
  approved    Boolean  @default(false)

  // For future admin approval flow
  needsApproval Boolean @default(false)
}

model PatientInvite {
  id          String   @id @default(cuid())
  code        String   @unique // 6-digit code
  createdBy   String   // Medical professional user ID
  createdAt   DateTime @default(now())
  expiresAt   DateTime // 30 days
  usedAt      DateTime?
  usedBy      String?  // User ID who used it
  maxUses     Int      @default(1)
  useCount    Int      @default(0)
}

enum UserRole {
  PATIENT
  MEDICAL_PROFESSIONAL
  ADMIN
}

// NextAuth required tables
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}
```

---

## Implementation Timeline

### Week 1: Foundation

#### Day 1-2: Database Setup
- [ ] Create Vercel Postgres database
- [ ] Install Prisma and NextAuth.js
- [ ] Create database schema
- [ ] Run initial migration
- [ ] Test database connection

**Commands:**
```bash
npm install next-auth@beta @auth/prisma-adapter prisma @prisma/client bcryptjs
npm install -D @types/bcryptjs
npx prisma init
npx prisma migrate dev --name init
```

#### Day 3-4: NextAuth Configuration
- [ ] Configure NextAuth.js v5
- [ ] Set up credentials provider
- [ ] Create session strategy
- [ ] Add middleware for route protection
- [ ] Test authentication flow

**File:** `auth.ts` (NextAuth config)
**File:** `middleware.ts` (Route protection)

#### Day 5-7: Login/Signup UI
- [ ] Create login page
- [ ] Add role selection (Medical/Patient)
- [ ] Patient "I have a code" flow
- [ ] Medical professional invite system
- [ ] Error handling and validation

**Files:**
- `app/auth/login/page.tsx`
- `app/auth/signup/page.tsx`
- `components/auth/LoginForm.tsx`

### Week 2: Features & Polish

#### Day 8-9: Patient Portal
- [ ] 6-digit invitation code generator
- [ ] Patient registration with code
- [ ] Validate and consume invite codes
- [ ] Limit to single use (or configurable)
- [ ] Expire codes after 30 days

**API Routes:**
- `app/api/auth/patient-invite/route.ts`
- `app/api/auth/register-patient/route.ts`

#### Day 10-11: Medical Professional System
- [ ] Email invitation system
- [ ] Invite token generation
- [ ] Registration with invite token
- [ ] Admin dashboard for invites
- [ ] View/manage sent invitations

**Features:**
- Send invitations via email (or copy link)
- Track invitation status
- Resend/revoke invitations
- Future: Admin approval queue

**API Routes:**
- `app/api/auth/medical-invite/route.ts`
- `app/api/auth/register-medical/route.ts`

#### Day 12-13: Access Control
- [ ] Protect all routes except public pages
- [ ] Limit patients to Exercises tab
- [ ] Full access for medical professionals
- [ ] Conditional UI rendering by role
- [ ] Session persistence

**Files:**
- `middleware.ts` (Enhanced)
- `components/VestibularScreeningApp.tsx` (Updated)
- `hooks/useRole.ts` (New helper)

#### Day 14: Testing & Polish
- [ ] Test all authentication flows
- [ ] Test role-based access
- [ ] Test invite systems
- [ ] Security audit
- [ ] Documentation

---

## User Flows

### Medical Professional Registration (Invite-Only)

```
1. Admin creates invitation
   ↓
2. Invitation email sent (or link copied)
   ↓
3. User clicks link: /auth/signup?token=xxx
   ↓
4. Registration form (name, email, password)
   ↓
5. Submit → Account created with MEDICAL_PROFESSIONAL role
   ↓
6. Redirect to login
   ↓
7. Login → Full app access
```

### Patient Registration (Code-Based)

```
1. Medical professional creates patient invite
   ↓
2. System generates 6-digit code (e.g., 123456)
   ↓
3. Provider shares code with patient (verbal, written, SMS)
   ↓
4. Patient opens app → "I have a code"
   ↓
5. Enter 6-digit code
   ↓
6. Optional: Set password/PIN for future logins
   ↓
7. Account created with PATIENT role
   ↓
8. Redirect to Exercises tab (limited access)
```

### Login Flow (After Registration)

```
1. Splash screen
   ↓
2. Login page
   - Email/Password (Medical Professional)
   - "I have a code" button (Patient)
   ↓
3. Disclaimer
   ↓
4. Main app (role-based access)
```

---

## Medical Professional Invite Management

### Dashboard Features

**Create Invitation:**
```typescript
interface InviteForm {
  email: string
  expiresInDays: number // Default: 7
  requiresApproval: boolean // Future feature
}
```

**Invitation Link:**
```
https://yourdomain.com/auth/signup?token=abc123xyz789
```

**Track Invitations:**
```
┌─────────────────────────────────────────────────┐
│ Sent Invitations                                │
├─────────────────────────────────────────────────┤
│ Email              Status      Sent      Expires│
│ dr.smith@mail.com  Pending     11/01    11/08  │
│ dr.jones@mail.com  Accepted    10/28    -      │
│ dr.brown@mail.com  Expired     10/20    10/27  │
└─────────────────────────────────────────────────┘
[+ New Invitation] [Resend] [Revoke]
```

**Easy Sharing:**
```typescript
// Copy invitation link
function copyInviteLink(token: string) {
  const link = `${window.location.origin}/auth/signup?token=${token}`
  navigator.clipboard.writeText(link)
  toast.success('Invitation link copied!')
}

// Or send via email (future: SendGrid/Resend integration)
function sendInviteEmail(email: string, token: string) {
  // Email with magic link
}
```

---

## Patient Invitation System

### Code Generation

```typescript
// Simple 6-digit numeric code (easy to remember/write)
function generatePatientInviteCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Example codes: 123456, 789012, 456789
```

**Why 6 digits?**
- Easy for patients to remember
- Easy to write down
- Easy to communicate verbally
- 1,000,000 combinations (sufficient with expiration)
- Lower security needs (only grants exercise access)

### Security for Patient Codes

**Protection:**
- 30-day expiration
- Single use (or configurable max uses)
- Rate limiting on code entry (10 attempts/hour)
- Logs who created each code
- Option to revoke unused codes

**Attack Mitigation:**
```
Even with 1M combinations:
- Rate limit: 10 attempts/hour = 240/day
- Would take 4,166 days (11+ years) to brute force
- Codes expire in 30 days
- Only grants exercise access (low value target)
```

### Provider Dashboard

```
┌─────────────────────────────────────────────────┐
│ Patient Invitation Codes                        │
├─────────────────────────────────────────────────┤
│ Code     Created   Expires   Status    Patient  │
│ 123456   11/01     12/01     Used      Jane D.  │
│ 789012   11/02     12/02     Active    -        │
│ 456789   10/15     11/15     Expired   -        │
└─────────────────────────────────────────────────┘
[+ Generate New Code]

┌─────────────────────────────────────────────────┐
│ New Invitation Code                             │
│                                                 │
│ Your code: 789012                               │
│                                                 │
│ [Copy Code] [Print] [Send SMS*]                │
│                                                 │
│ Valid for 30 days                               │
└─────────────────────────────────────────────────┘
```

---

## Route Protection

### Public Routes (No Auth Required)
```
/                       # Splash screen
/auth/login             # Login page
/auth/signup            # Registration (with token/code)
/api/auth/*             # NextAuth API routes
```

### Protected Routes

**Patients (PATIENT role):**
```
✅ /exercises           # Full access
✅ /exercises/*         # All exercise pages
❌ /eval                # Blocked
❌ /find-chart          # Blocked
❌ /invites             # Blocked
```

**Medical Professionals (MEDICAL_PROFESSIONAL role):**
```
✅ /eval                # Full access
✅ /exercises           # Full access
✅ /find-chart          # Full access
✅ /invites             # Manage invitations
✅ /admin*              # If needed
```

### Middleware Implementation

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })

  // Redirect to login if not authenticated
  if (!token && !isPublicRoute(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Role-based access control
  if (token?.role === 'PATIENT') {
    if (!request.nextUrl.pathname.startsWith('/exercises')) {
      return NextResponse.redirect(new URL('/exercises', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
```

---

## Security Considerations

### Password Security
```typescript
import bcrypt from 'bcryptjs'

// Hash passwords with bcrypt (12 rounds)
const hashedPassword = await bcrypt.hash(password, 12)

// Verify passwords
const isValid = await bcrypt.compare(password, hashedPassword)
```

### Session Security
- JWT tokens with short expiration (7 days)
- Secure cookie flags (httpOnly, secure, sameSite)
- Session rotation on login
- CSRF protection (built into NextAuth)

### Invite Security
- Cryptographically random tokens
- Time-based expiration
- Single-use tokens (medical invites)
- Limited-use codes (patient invites)
- Rate limiting on all auth endpoints

---

## Testing Checklist

### Medical Professional Flow
- [ ] Generate invitation link
- [ ] Copy link
- [ ] Open in incognito window
- [ ] Register new account
- [ ] Login
- [ ] Verify full app access
- [ ] Create patient invite code

### Patient Flow
- [ ] Generate patient invite code
- [ ] Open app (logged out)
- [ ] Click "I have a code"
- [ ] Enter 6-digit code
- [ ] Complete registration
- [ ] Login
- [ ] Verify only Exercises tab visible
- [ ] Try to access /eval (should block)

### Security Tests
- [ ] Try expired invite token
- [ ] Try used invite code
- [ ] Try invalid patient code
- [ ] Exceed rate limit on login
- [ ] Test password strength requirements
- [ ] Test session expiration

---

## Environment Variables

```bash
# .env.local

# Database
DATABASE_URL="postgres://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"

# Optional: Email invites (future)
# SMTP_HOST=
# SMTP_PORT=
# SMTP_USER=
# SMTP_PASS=
```

---

## Cost Breakdown (Monthly)

### Free Tier (Current Plan)

**Vercel Hobby:**
```
❌ Personal use only
❌ Cannot use for professional medical app
```

**Vercel Pro ($20/month):**
```
✅ Commercial use allowed
✅ Vercel KV included (Redis for rate limiting)
✅ Vercel Postgres free tier:
   - 256MB storage (~10,000 users)
   - 60 hours compute/month
✅ Unlimited API requests
✅ Email support

Total: $20/month (current plan, no increase)
```

### When You Outgrow Free Tier

**Vercel Postgres Paid ($20/month additional):**
```
512MB storage (~20,000 users)
1000 hours compute/month
Automatic backups
Point-in-time recovery

Total: $40/month ($20 base + $20 database)
```

**Estimated Limits:**
```
Free tier sufficient for:
- 10,000 users
- 100,000 sessions/month
- Moderate medical practice usage

Upgrade needed when:
- 10,000+ users
- 1M+ sessions/month
- Large hospital deployment
```

---

## Future Enhancements (Phase 3+)

### Admin Approval System
```
1. Medical professional applies (self-registration)
2. Admin receives notification
3. Admin reviews credentials
4. Admin approves/denies
5. User receives notification
```

### Email Integration
```
- Send invitations via email
- Password reset emails
- Welcome emails
- Activity notifications
```

### Two-Factor Authentication (2FA)
```
- TOTP (Google Authenticator)
- SMS codes
- Email codes
- Backup codes
```

### Advanced Features
```
- Audit logs (who accessed what, when)
- User management dashboard
- Bulk invite imports (CSV)
- SSO integration (Google, Microsoft)
- API keys for integrations
```

---

## Decision Points Before Starting

### 1. Medical Professional Invitations

**Option A: Email-based (Recommended)**
```
✅ Professional
✅ Secure
✅ Trackable
❌ Requires email service ($5-20/month)
```

**Option B: Link-based (Free)**
```
✅ Free
✅ Easy to share
✅ Works immediately
❌ Less professional
❌ Link could be leaked
```

**Recommendation:** Start with Option B (free), add Option A later

### 2. Patient Account Persistence

**Should patients create passwords?**

**Option A: Code-only (Simple)**
```
✅ Easiest for patients
✅ No password to remember
❌ Need code every time
❌ If code lost, lose access
```

**Option B: Optional password (Flexible)**
```
✅ Set password after first login
✅ Login with email+password later
✅ Still have code as backup
❌ Slightly more complex
```

**Recommendation:** Option B (let patients choose)

### 3. Invite Expiration

**Medical professionals:**
- 7 days (default)
- 30 days (if sharing slowly)

**Patients:**
- 30 days (recommended)
- 90 days (if long-term patients)

---

## Ready to Start?

I can begin Phase 2 implementation immediately. Just confirm:

1. **Start now?** Or wait for Phase 1 testing/feedback?
2. **Medical invites:** Email or link-based?
3. **Patient accounts:** Code-only or optional password?
4. **Any custom requirements** I should know about?

---

## Summary

✅ **Cost:** $0 additional (stays at $20/month)
✅ **Timeline:** 2 weeks
✅ **Scalability:** 10,000+ users on free tier
✅ **Security:** Production-ready
✅ **Features:** Role-based access, invite systems, protected routes

**Let me know when you're ready to proceed!**
