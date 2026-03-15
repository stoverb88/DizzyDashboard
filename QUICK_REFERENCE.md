# Vestibular Screening WebApp - Quick Reference

## Overview
- **App Name**: DizzyDashboard
- **Type**: Progressive Web App (PWA) for clinical vestibular assessment
- **Status**: Fully functional WITHOUT authentication
- **Deployment**: Vercel

## Tech Stack Quick View
| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Next.js | 14.1.0 |
| Frontend | React | 18.2.0 |
| Language | TypeScript | 5.3.3 |
| Styling | Tailwind CSS | 3.4.1 |
| Animation | Framer Motion | 12.16.0 |
| Client Storage | localStorage | Browser API |
| Server Storage | Vercel KV (Redis) | 24h TTL |
| UI Components | Radix UI | Multiple |
| Icons | Lucide React | 0.363.0 |

## Critical Finding: NO AUTHENTICATION
```
ZERO Auth Implementation:
✗ No NextAuth.js
✗ No session management
✗ No user database
✗ No login/signup pages
✗ No protected routes
✗ No access controls
```

## App Flow
```
SplashScreen (disclaimer)
    ↓
PostSplashOptions
    ├─ Start an Eval → EvalTab (11-step form wizard)
    │                    ├─ Saves to localStorage
    │                    ├─ Generates chart ID
    │                    └─ Sends to Vercel KV (24hr)
    │
    └─ Find my chart note → FindChartNote
                              ├─ Input 6-digit ID
                              └─ GET /api/notes/[id]
```

## Data Persistence
- **Client**: localStorage (plaintext)
- **Server**: Vercel KV/Redis (24-hour expiration)
- **Database**: None (no PostgreSQL, MongoDB, etc.)

## API Endpoints
```
POST /api/notes
  Request: { narrative, chartId (6 chars) }
  Auth: None (public)
  Response: { success, id, expiresAt }

GET /api/notes/[id]
  Param: 6-character chart ID
  Auth: None (public)
  Response: { narrative, createdAt, expiresAt }
```

## Key Files
```
/app/page.tsx                           Entry point
/components/VestibularScreeningApp.tsx  Main container
/components/EvalTab.tsx                 Complex form (11 steps)
/components/SplashScreen.tsx            Disclaimer screen
/components/FindChartNote.tsx           Chart retrieval
/app/api/notes/route.ts                 Save endpoint
/app/api/notes/[id]/route.ts            Retrieve endpoint
/contexts/EvalContext.tsx               Form reset signals
/server.js                              HTTPS dev server
```

## Environment Variables
```
KV_URL                    Vercel KV connection
KV_REST_API_URL          KV REST endpoint
KV_REST_API_TOKEN        KV write token
KV_REST_API_READ_ONLY_TOKEN  KV read token
```

## Security Status: NOT PRODUCTION-READY
- No user identification
- No encryption
- No audit logging
- No rate limiting
- No HIPAA compliance
- Medical data exposed in localStorage

## Authentication Implementation Feasibility
- **Recommended**: NextAuth.js v5 (App Router compatible)
- **Database**: Vercel Postgres recommended
- **Estimated Effort**: 2-3 weeks
- **Feasibility**: HIGH (Next.js 14.1.0 fully compatible)

## Most Complex Component
**EvalTab.tsx** - Contains:
- 11-step form wizard
- 50+ form fields
- localStorage debounce (500ms)
- Narrative generation
- Chart ID creation
- HIPAA disclaimer modal

## Running the App
```bash
# Development
npm run dev              # HTTP on localhost:3000
npm run dev:https       # HTTPS on 192.168.4.120:3000

# Production
npm run build
npm run start           # HTTP
npm run start:https     # HTTPS
```

## Next Steps for Production
1. Implement NextAuth.js authentication
2. Add user/patient database
3. Encrypt sensitive data
4. Add audit logging
5. Implement rate limiting
6. Security audit
7. HIPAA compliance review

---
**For full details, see ARCHITECTURE_ASSESSMENT.md**
