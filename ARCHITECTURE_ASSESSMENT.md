# Vestibular Screening WebApp - Architecture Assessment

## Executive Summary
The Vestibular Screening WebApp (DizzyDashboard) is a Next.js-based Progressive Web App designed for clinical vestibular assessment and BPPV treatment. Currently, there is **NO authentication mechanism** in place. The app uses client-side localStorage for data persistence and Vercel KV (Redis) for temporary 24-hour chart note storage.

---

## 1. TECH STACK DETAILS

### Framework & Runtime
- **Next.js**: 14.1.0 (App Router)
- **React**: 18.2.0 with TypeScript 5.3.3
- **Runtime**: Node.js (via Next.js server)
- **Hosting**: Vercel (verified by project.json and KV integration)

### Frontend Dependencies
- **Styling**: Tailwind CSS 3.4.1
- **Animation**: Framer Motion 12.16.0
- **UI Components**: 
  - Radix UI (accordion, tabs, tooltips, scroll areas, separators)
  - Lucide React (icons)
  - Custom Button, Card, Badge, Alert components
- **Input Handling**: react-swipeable 7.0.2
- **Media**: react-player 2.16.0
- **Image Processing**: sharp 0.34.2

### Backend & Data
- **API Route Handler**: Next.js API routes (/app/api)
- **Data Persistence**: 
  - **Client-side**: localStorage only (form data, UI state)
  - **Server-side**: Vercel KV (Redis) for chart notes (24-hour expiration)
- **KV Package**: @vercel/kv 1.0.1

### Development Tools
- **Linting**: ESLint with Next.js config
- **Package Manager**: npm (package-lock.json present)
- **HTTPS Support**: Custom Node.js server (server.js with SSL certificates)

---

## 2. CURRENT AUTHENTICATION STATE

### Key Finding: NO AUTHENTICATION IMPLEMENTED

**There are zero authentication mechanisms in place:**

```
NO auth libraries detected:
- No NextAuth.js
- No Supabase Auth
- No Auth0
- No Firebase Auth
- No Passport.js
- No JWT handling
- No session management
- No user table/storage
```

**Evidence from codebase search:**
- `/app/middleware.ts` - Does not exist
- No auth-related imports found in any component
- No login/signup pages
- No protected routes
- All app state is public and client-side accessible

### Current Data Flow (Unauthenticated)

```
User Flow:
1. SplashScreen (disclaimer) → onDismiss()
2. PostSplashOptions (Start Eval / Find Chart)
3. If "Start Eval":
   - EvalTab (9-step form wizard)
   - Data stored in localStorage: 'vestibularFormData'
   - UI state in localStorage: 'evalCurrentStep', 'evalHasReset'
   - Export generates chart ID (6 alphanumeric chars)
   - Chart note sent to Vercel KV with key: 'vestibular:note:{CHART_ID}'
   - Expiration: 24 hours via SETEX

4. If "Find Chart":
   - FindChartNote component
   - User enters 6-digit chart ID
   - GET /api/notes/[id] retrieves from KV
   - No authentication required
```

---

## 3. APP ROUTING STRUCTURE

### Navigation Flow

```
ROOT: app/page.tsx
  └─ VestibularScreeningApp (with EvalProvider)
     └─ VestibularScreeningAppContent (state management)
        ├─ appState: 'splash' | 'options' | 'eval' | 'find-chart'
        │
        ├─ Splash Screen Phase (appState === 'splash')
        │  └─ SplashScreen.tsx
        │     ├─ Logo animation
        │     ├─ 500ms delay
        │     └─ Disclaimer modal
        │        └─ "I Understand and Agree" → handleSplashDismiss()
        │
        ├─ Options Phase (appState === 'options')
        │  └─ PostSplashOptions.tsx
        │     ├─ Button: "Start an Eval"
        │     │  └─ handleStartEval() → appState = 'eval'
        │     └─ Button: "Find my chart note"
        │        └─ handleFindChart() → appState = 'find-chart'
        │
        ├─ Evaluation Phase (appState === 'eval')
        │  ├─ Bottom Navigation (BottomNavBar)
        │  │  ├─ Questionnaire (EvalTab)
        │  │  ├─ Oculomotor (OculomotorExam)
        │  │  ├─ HINTS (HintsTab)
        │  │  ├─ Diagnostics (DiagnosticsTab)
        │  │  ├─ Maneuvers (ManeuversTab)
        │  │  └─ Exercises (ExercisesTab)
        │  │
        │  └─ EvalTab (Most Complex - 11 steps)
        │     1. Red Flag Screening
        │     2. History of Present Illness
        │     3. Hearing & Ear Health
        │     4. Associated Symptoms
        │     5. Oculomotor Exam
        │     6. Positional Testing
        │     7. Treatment Provided
        │     8. Clinical Snapshot
        │     9. Plan of Care
        │     10. Narrative Summary
        │     11. Export
        │
        └─ Find Chart Phase (appState === 'find-chart')
           └─ FindChartNote.tsx
              ├─ Input: 6-digit chart ID
              ├─ GET /api/notes/{id}
              └─ Display retrieved note

Header:
├─ "DIZZY DASHBOARD" logo (clickable)
│  ├─ In eval: opens reset confirmation dialog
│  └─ In options: returns to options view
└─ Request fullscreen on splash dismiss (cross-browser support)

Fullscreen Escape:
- Pinch gesture (2 fingers closing) in fullscreen mode
- Calls exitFullscreen()
```

### Data Persistence During Navigation

```
EvalTab Component (EvalTab.tsx):
├─ Form State Management
│  ├─ Loads: localStorage.getItem('vestibularFormData')
│  ├─ Loads: localStorage.getItem('evalCurrentStep')
│  ├─ Loads: localStorage.getItem('evalHasReset')
│  │
│  └─ Debounced Save (500ms debounce)
│     ├─ localStorage.setItem('vestibularFormData', JSON.stringify())
│     ├─ localStorage.setItem('evalCurrentStep', step)
│     └─ localStorage.setItem('evalHasReset', boolean)
│
└─ HIPAA Modal (first reset only)
   └─ Shows disclaimer on first evaluation reset
```

---

## 4. DATABASE & DATA PERSISTENCE

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│           VESTIBULAR SCREENING WEBAPP                    │
├─────────────────────────────────────────────────────────┤
│                    CLIENT SIDE                           │
├─────────────────────────────────────────────────────────┤
│  localStorage (Browser Storage)                         │
│  ├─ vestibularFormData (FormData JSON)                  │
│  ├─ evalCurrentStep (number: 0-10)                      │
│  └─ evalHasReset (boolean)                              │
│  Expiration: Session-based (cleared on reset)           │
├─────────────────────────────────────────────────────────┤
│                   SERVER SIDE                           │
├─────────────────────────────────────────────────────────┤
│  Vercel KV (Redis-compatible)                           │
│  ├─ Key Pattern: 'vestibular:note:{CHART_ID}'           │
│  ├─ Value: { narrative: string, createdAt: timestamp }  │
│  └─ TTL: 86400 seconds (24 hours) via SETEX            │
│                                                         │
│  Environment Variables:                                 │
│  ├─ KV_URL (Redis connection string)                    │
│  ├─ KV_REST_API_URL                                     │
│  ├─ KV_REST_API_TOKEN                                   │
│  └─ KV_REST_API_READ_ONLY_TOKEN                         │
└─────────────────────────────────────────────────────────┘
```

### localStorage Data Structure

```typescript
// FormData interface (from EvalTab.tsx lines 256-299+)
interface FormData {
  redFlags: {
    doubleVision: boolean;
    slurredSpeech: boolean;
    difficultySwallowing: boolean;
    hiccups: boolean;
    weaknessOrNumbness: boolean;
    incoordination: boolean;
    lostConsciousness: boolean;
    chestPain: boolean;
  };
  hearingChanges: string;
  hearingLoss: string;
  hearingSide: string;
  tinnitus: string;
  tinnitusType: string;
  tinnitusGradual: string;
  audiogram: string;
  earFullness: string;
  earFullnessSide: string;
  mri: boolean;
  ctScan: boolean;
  smoke: string;
  drink: string;
  onsetDate: string;
  onsetType: string;
  activity: string;
  symptomType: string;
  trigger: string;
  triggerOther: string;
  worseWith: string[];
  symptomFrequency: string;
  episodeDuration: string;
  episodeDurationSpecific: string;
  spontaneousVsTriggered: string;
  dixHallpikeResult: string;
  orthostaticVitals: string;
  associatedSymptoms: string[];
  oscillopsia: boolean;
  tendencyToFall: boolean;
  nausea: boolean;
  vomiting: boolean;
  orthostaticBP: string;
  chestPainDetails: string;
  // ... continues with additional assessment fields
}

localStorage Keys:
1. 'vestibularFormData' → JSON.stringify(FormData)
2. 'evalCurrentStep' → string (number 0-10)
3. 'evalHasReset' → string ('true' | 'false')
```

### Vercel KV Data Structure

```typescript
// Stored via POST /api/notes
interface NoteData {
  narrative: string;      // Generated clinical summary
  createdAt: number;      // Timestamp in milliseconds
}

// Stored with key: 'vestibular:note:{CHART_ID}'
// Example: 'vestibular:note:ABC123'
// Retrieved via GET /api/notes/{id}
```

### API Routes

```
POST /api/notes
├─ Body: { narrative: string, chartId: string }
├─ Validation:
│  ├─ chartId: exactly 6 alphanumeric characters
│  └─ narrative: non-empty string
├─ Storage: KV.SETEX(key, 86400 seconds, JSON value)
└─ Response: { success: true, id: string, expiresAt: number }

GET /api/notes/[id]
├─ Param: id (6-character chart ID, case-insensitive)
├─ Validation: 6 alphanumeric characters
├─ Retrieval: KV.GET(key)
├─ Expiration check: if createdAt + 86400000ms < now → delete & 410 Gone
└─ Response: { narrative: string, createdAt: number, expiresAt: number }
```

### No Database Tables/Collections
- **PostgreSQL**: Not configured
- **MongoDB**: Not configured
- **Firebase**: Not configured
- **Supabase**: Not configured

---

## 5. API ROUTES & BACKEND FUNCTIONALITY

### Existing API Endpoints

#### 1. POST /api/notes - Save Chart Note

```typescript
// File: /app/api/notes/route.ts
// Method: POST
// Auth: None (public endpoint)

Request:
{
  narrative: string,     // Clinical summary text
  chartId: string        // 6-char alphanumeric ID
}

Validation:
- chartId length !== 6 → 400 Bad Request
- chartId format !== /^[A-Z0-9]{6}$/i → 400 Bad Request
- narrative empty or not string → 400 Bad Request

Success Response (200):
{
  success: true,
  id: string,            // Uppercase chart ID
  message: string,
  expiresAt: number      // Timestamp when note expires
}

Error Responses:
- 400: Missing/invalid fields
- 503: KV storage temporarily unavailable (retryable: true)
- 500: Unexpected error (retryable: true)
```

#### 2. GET /api/notes/[id] - Retrieve Chart Note

```typescript
// File: /app/api/notes/[id]/route.ts
// Method: GET
// Auth: None (public endpoint)

Param:
- id: 6-character chart ID (case-insensitive, auto-converted to uppercase)

Success Response (200):
{
  narrative: string,     // Original narrative text
  createdAt: number,     // Millisecond timestamp
  expiresAt: number      // When it will expire
}

Error Responses:
- 400: Invalid chart ID format
- 404: Chart note not found
- 410: Gone - Chart note has expired (auto-deleted from KV)
- 503: KV retrieval temporarily unavailable (retryable: true)
- 500: Unexpected error (retryable: true)

Automatic Cleanup:
- If note expired: KV.DEL() called to remove it
- Age check: now - createdAt > 86400000ms (24 hours)
```

### No Other Backend Functionality
- No user management endpoints
- No data export/import endpoints
- No admin endpoints
- No analytics/logging endpoints

---

## 6. VERCEL CONFIGURATION

### Vercel Project Setup

```json
// .vercel/project.json
{
  "projectId": "prj_M9FwcKkSVNVWZHWoFqSuiGGMVnUn",
  "orgId": "team_PmtLMynyy1tr6O7AsLddzCjn"
}
```

### Environment Variables (Development)

```
# .env.development.local
KV_REST_API_READ_ONLY_TOKEN=AoC3AAIgcDHPo7X8QPtpuuLdhCqnJBlIIXKwMS3PdmUGfoGYAFmybg
KV_REST_API_TOKEN=AYC3AAIjcDEwNTIxYjI2ZTA0ZWQ0MjNmODdkYWFiYjQ1MTc3ODNiZHAxMA
KV_REST_API_URL=https://boss-alien-32951.upstash.io
KV_URL=rediss://default:AYC3AAIjcDEwNTIxYjI2ZTA0ZWQ0MjNmODdkYWFiYjQ1MTc3ODNiZHAxMA@boss-alien-32951.upstash.io:6379
REDIS_URL=rediss://default:AYC3AAIjcDEwNTIxYjI2ZTA0ZWQ0MjNmODdkYWFiYjQ1MTc3ODNiZHAxMA@boss-alien-32951.upstash.io:6379
```

### Server Configuration

```javascript
// server.js - HTTPS development server
const https = require('https');
const hostname = '192.168.4.120';
const port = process.env.PORT || 3000;

// SSL Certificates required:
// - certificates/localhost-key.pem
// - certificates/localhost.pem

// Scripts:
// npm run dev:https → NODE_ENV=development node server.js
// npm run start:https → NODE_ENV=production node server.js
```

### No Production Auth Deployed
- No authentication service configured in Vercel
- No OAuth integrations set up
- No API secrets for auth providers

---

## 7. KEY COMPONENT DETAILS

### VestibularScreeningApp.tsx (Main Container)
```
State:
├─ appState: 'splash' | 'options' | 'eval' | 'find-chart'
├─ activeTab: 'questionnaire' | 'oculomotor' | 'hints' | ... (6 tabs)
├─ isMobile: boolean
├─ direction: 'next' | 'prev' | null
├─ showConfirmDialog: boolean
├─ evalKey: number (forces re-render)
└─ isFullscreen: boolean

Context:
└─ EvalProvider (for form reset signaling)

Features:
├─ Fullscreen API support (with pinch-to-exit gesture)
├─ Responsive layout (mobile < 768px)
├─ Logo click handling (reset dialog in eval, back to options otherwise)
├─ Tab navigation with Framer Motion
└─ Cross-browser event handling for fullscreen changes
```

### EvalTab.tsx (Complex Form Component)
```
Features:
├─ 11-step wizard (0-10, including export)
├─ Multi-panel form with 50+ form fields
├─ localStorage debounce (500ms)
├─ Automatic step position recovery
├─ HIPAA disclaimer modal (first reset only)
├─ Chart ID generation (6 random alphanumerics)
├─ Narrative generation from form data
├─ Copy-to-clipboard for chart ID
└─ Send to KV via POST /api/notes

localStorage Interactions:
├─ Load on mount
├─ Save on every form change (debounced)
├─ Clear on explicit reset
└─ Persist step position across tab switches
```

### SplashScreen.tsx
```
Flow:
1. Fixed position overlay (z-index: 1000)
2. Logo animation (up 120px)
3. After 500ms: Show disclaimer modal
4. User clicks "I Understand and Agree"
5. Calls onDismiss() → requests fullscreen
6. Transitions to PostSplashOptions

No authentication checkpoint here
```

### FindChartNote.tsx
```
Flow:
1. Input field for 6-digit chart ID
2. Validates length = 6
3. GET /api/notes/{id}
4. Display retrieved narrative
5. Copy button for narrative text
6. Back button to options

No authentication or verification
- Any valid 6-char ID can retrieve a note (if it exists)
- No expiration check needed client-side
```

---

## 8. CONTEXT & HOOKS

### EvalContext (contexts/EvalContext.tsx)
```typescript
// Minimal context for form reset signaling
interface EvalContextType {
  resetEvalForm: (() => void) | null;
  setResetFunction: (fn: () => void) => void;
}

// Usage: Allows parent component to trigger EvalTab reset
```

### useDebounce Hook (hooks/useDebounce.ts)
- Debounces form data saves to localStorage (500ms)
- Prevents excessive writes

---

## 9. SECURITY ANALYSIS

### Current Vulnerabilities (No Auth Implementation)

1. **No User Identification**
   - Anyone can start an evaluation
   - No patient/clinician verification
   - No audit trail

2. **No Data Privacy**
   - localStorage is plaintext (client-accessible)
   - Chart IDs are simple 6-digit codes (brute-forceable)
   - Anyone can retrieve any chart note with correct ID

3. **No Access Control**
   - All API endpoints are public
   - No authentication headers
   - No rate limiting

4. **Data Exposure**
   - Medical data stored in localStorage (not encrypted)
   - If device compromised, all form data exposed
   - Browser DevTools can access all data

### HIPAA Compliance Status: **NOT COMPLIANT**
- No encryption in transit or at rest for medical data
- No audit logging
- No user authentication
- No access controls
- No data deletion mechanisms (except KV 24-hour auto-expire)

---

## 10. AUTHENTICATION IMPLEMENTATION FEASIBILITY

### Recommended Approach: NextAuth.js v5 (App Router)

**Feasibility: HIGH** - Next.js 14.1.0 is fully compatible

#### Implementation Steps:
```
1. Install NextAuth.js v5
   npm install next-auth@5

2. Create auth configuration
   /auth.config.ts (for providers)
   /app/api/auth/[...nextauth]/route.ts (API handler)

3. Add middleware for protected routes
   /middleware.ts (Vercel supports this)

4. Add database adapter
   Options:
   ├─ Vercel Postgres (recommended for Vercel)
   ├─ Upstash Redis (already have KV)
   ├─ Supabase (third-party)
   └─ Prisma ORM for database abstraction

5. Create user model
   ├─ email (unique)
   ├─ passwordHash
   ├─ role (clinician, admin)
   └─ timestamps

6. Update protected routes
   ├─ /app/(protected)/eval/page.tsx
   ├─ /app/(protected)/find-chart/page.tsx
   └─ Use middleware for enforcement

7. Update components
   ├─ Add sign-in/sign-up pages
   ├─ Add sign-out button
   ├─ Update PostSplashOptions to include auth status
   └─ Protect API endpoints with auth checks

8. Update API routes
   ├─ POST /api/notes → require auth
   ├─ GET /api/notes/[id] → require auth or public key
   └─ Add audit logging
```

#### Estimated Effort: **2-3 weeks** for basic implementation

---

## 11. KEY FILES SUMMARY

### Entry Points
- `/app/page.tsx` - Route handler, imports VestibularScreeningApp
- `/app/layout.tsx` - Root layout with metadata
- `/components/VestibularScreeningApp.tsx` - Main app container

### Core Components
- `/components/SplashScreen.tsx` - Disclaimer screen
- `/components/PostSplashOptions.tsx` - Main menu
- `/components/EvalTab.tsx` - 11-step form wizard (most complex)
- `/components/FindChartNote.tsx` - Chart retrieval
- `/components/BottomNavBar.tsx` - Tab navigation

### Context & Hooks
- `/contexts/EvalContext.tsx` - Form reset signaling
- `/hooks/useDebounce.ts` - Debounce utility

### API Routes
- `/app/api/notes/route.ts` - POST endpoint (save)
- `/app/api/notes/[id]/route.ts` - GET endpoint (retrieve)

### Configuration
- `/next.config.js` - Not present
- `/tsconfig.json` - TypeScript configuration
- `/tailwind.config.ts` - Tailwind styling
- `/server.js` - HTTPS development server
- `.env.development.local` - KV credentials (dev)
- `.vercel/project.json` - Vercel project ID

### Utilities
- `/utils/fullscreenUtils.ts` - Fullscreen API wrapper
- `/utils/haptics.ts` - Haptic feedback
- `/utils/MetronomeEngine.ts` - Vestibular exercise audio
- `/lib/utils.ts` - Helper functions
- `/styles/design-tokens.ts` - Design system

---

## 12. DEPLOYMENT STATUS

### Current Deployment
- **Platform**: Vercel
- **Project ID**: prj_M9FwcKkSVNVWZHWoFqSuiGGMVnUn
- **Org ID**: team_PmtLMynyy1tr6O7AsLddzCjn
- **Build Command**: `next build`
- **Start Command**: `next start`

### Build Artifacts
- `/next` folder (Next.js build output)
- `.next/server` - Server-side bundles
- `.next/static` - Static assets

---

## 13. CONCLUSION

### Current State
The Vestibular Screening WebApp is a **fully functional clinical assessment tool** with:
- Comprehensive 9-step evaluation workflow
- Responsive mobile-first design
- Persistent form data storage (localStorage)
- Temporary chart note export (24-hour KV)
- **Zero authentication mechanisms**

### Authentication Gap
The app is currently suitable only for:
- Local clinical use (single workstation)
- Testing/development environments
- Educational purposes only

**NOT suitable for:**
- Multi-user environments
- Patient-facing deployment
- Secure medical data handling
- HIPAA compliance
- Production deployment

### Recommended Next Steps
1. **Implement authentication** (NextAuth.js v5 recommended)
2. **Add user/patient model** to database
3. **Migrate to secure database** (Vercel Postgres recommended)
4. **Implement encryption** for sensitive data
5. **Add access controls** and audit logging
6. **Conduct security audit** before any medical deployment
7. **Add role-based access** (clinician, admin, patient)
8. **Implement data export/deletion** features for compliance

---

**Document Generated**: November 3, 2025
**Project**: Vestibular Screening WebApp
**Version**: 0.1.0
**Status**: Ready for authentication implementation
