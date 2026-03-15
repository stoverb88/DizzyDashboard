# Authentication Implementation Guide for Vestibular Screening WebApp

## Overview
This guide provides concrete steps and code examples to implement NextAuth.js v5 authentication in the existing application.

## Phase 1: Setup (Days 1-2)

### Step 1.1: Install Dependencies
```bash
npm install next-auth@5
npm install @prisma/client
npm install -D prisma
npm install bcryptjs
npm install @types/bcryptjs -D
```

### Step 1.2: Initialize Prisma (Optional but Recommended)
```bash
npx prisma init
```

Create `.env.local`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/vestibular_db"
NEXTAUTH_SECRET="your-very-long-random-string-here"
NEXTAUTH_URL="http://localhost:3000"
```

### Step 1.3: Prisma Schema (prisma/schema.prisma)
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  passwordHash  String
  role          String    @default("clinician") // clinician, admin
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  evaluations   Evaluation[]
  sessions      Session[]
  accounts      Account[]
}

model Account {
  id                 String  @id @default(cuid())
  userId             String
  type               String
  provider           String
  providerAccountId  String
  refresh_token      String?
  access_token       String?
  expires_at         Int?
  token_type         String?
  scope              String?
  id_token           String?
  session_state      String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model Evaluation {
  id            String    @id @default(cuid())
  userId        String
  chartId       String    @unique
  narrative     String    @db.Text
  formData      String    @db.Text // JSON string
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  expiresAt     DateTime  // For 24-hour expiration
  
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([chartId])
  @@index([expiresAt])
}
```

## Phase 2: Authentication Setup (Days 3-5)

### Step 2.1: Create Auth Configuration

Create `auth.config.ts`:
```typescript
// auth.config.ts
import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { db } from "@/lib/db"

export const authConfig = {
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
    async authorized({ auth, request }) {
      const isAuthed = !!auth?.user
      const isOnAuth = request.nextUrl.pathname.startsWith("/auth")
      
      if (isOnAuth) {
        return !isAuthed
      }
      return isAuthed
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.isActive) {
          return null
        }

        const isPasswordValid = await compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
} satisfies NextAuthConfig
```

Create `auth.ts`:
```typescript
// auth.ts
import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
```

### Step 2.2: Create Auth API Route

Create `app/api/auth/[...nextauth]/route.ts`:
```typescript
// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth"

export const { GET, POST } = handlers
```

## Phase 3: Middleware (Days 6-7)

### Step 3.1: Create Middleware

Create `middleware.ts`:
```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"

const protectedRoutes = ["/eval", "/dashboard"]
const publicRoutes = ["/", "/auth/signin", "/auth/signup"]

export async function middleware(request: NextRequest) {
  const session = await auth()
  const pathname = request.nextUrl.pathname

  // Handle protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!session?.user) {
      return NextResponse.redirect(new URL("/auth/signin", request.url))
    }
  }

  // Handle auth routes
  if (pathname.startsWith("/auth") && session?.user) {
    return NextResponse.redirect(new URL("/eval", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
}
```

## Phase 4: UI Components (Days 8-10)

### Step 4.1: Create Sign In Page

Create `app/auth/signin/page.tsx`:
```typescript
// app/auth/signin/page.tsx
"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"

export default function SignIn() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
      } else if (result?.ok) {
        router.push("/eval")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-2">DizzyDashboard</h1>
        <p className="text-center text-gray-500 mb-8">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Don't have an account?{" "}
          <a href="/auth/signup" className="text-blue-600 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  )
}
```

### Step 4.2: Create Sign Up Page

Create `app/auth/signup/page.tsx`:
```typescript
// app/auth/signup/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { hash } from "bcryptjs"
import { Button } from "@/components/ui/Button"

export default function SignUp() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Registration failed")
        return
      }

      router.push("/auth/signin?message=Account created successfully")
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-2">DizzyDashboard</h1>
        <p className="text-center text-gray-500 mb-8">Create your account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account?{" "}
          <a href="/auth/signin" className="text-blue-600 hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}
```

### Step 4.3: Create Registration API Route

Create `app/api/auth/register/route.ts`:
```typescript
// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await hash(password, 10)

    // Create user
    const user = await db.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: "clinician",
      },
    })

    return NextResponse.json(
      { message: "User created successfully", id: user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
```

## Phase 5: Update Protected Routes (Days 11-12)

### Step 5.1: Update Evaluation Route

Wrap evaluation routes with authentication:
```typescript
// app/(protected)/eval/page.tsx
"use client"

import { auth } from "@/auth"
import VestibularScreeningApp from "@/components/VestibularScreeningApp"
import { redirect } from "next/navigation"

export default async function EvalPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/signin")
  }

  return (
    <div>
      <VestibularScreeningApp userId={session.user.id} />
    </div>
  )
}
```

### Step 5.2: Update API Routes with Auth

```typescript
// app/api/notes/route.ts (Updated)
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { kv } from "@vercel/kv"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  // Check authentication
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  try {
    const { narrative, chartId } = await request.json()

    // Validation
    if (!narrative || !chartId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Save to database
    const evaluation = await db.evaluation.create({
      data: {
        userId: session.user.id,
        chartId,
        narrative,
        formData: JSON.stringify({}), // Include actual form data
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    })

    // Also save to KV for quick access
    await kv.setex(
      `vestibular:note:${chartId.toUpperCase()}`,
      86400,
      JSON.stringify({ narrative, createdAt: Date.now() })
    )

    return NextResponse.json({
      success: true,
      id: chartId,
      message: "Note saved successfully",
      expiresAt: evaluation.expiresAt.getTime(),
    })
  } catch (error) {
    console.error("Error saving note:", error)
    return NextResponse.json(
      { error: "Internal server error", retryable: true },
      { status: 500 }
    )
  }
}
```

## Phase 6: Testing & Deployment (Days 13-14)

### Step 6.1: Run Database Migrations
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### Step 6.2: Test Flows
1. Test registration with new email
2. Test sign in with valid credentials
3. Test protected route access
4. Test evaluation workflow
5. Test chart export and retrieval

### Step 6.3: Deploy to Vercel
```bash
# Set environment variables in Vercel dashboard
# DATABASE_URL (Vercel Postgres)
# NEXTAUTH_SECRET (generate with: openssl rand -base64 32)
# NEXTAUTH_URL (your production domain)

git add .
git commit -m "Add NextAuth.js authentication"
git push
```

## Important Considerations

1. **NEXTAUTH_SECRET**: Generate a secure secret for production
2. **Database**: Use Vercel Postgres for production (managed by Vercel)
3. **Rate Limiting**: Add rate limiting to registration and login endpoints
4. **Email Verification**: Consider adding email verification before account activation
5. **Session Duration**: Configure appropriate session expiration times
6. **HTTPS**: Ensure HTTPS in production (Vercel handles this)

## Files to Create
- `auth.config.ts`
- `auth.ts`
- `middleware.ts`
- `app/api/auth/[...nextauth]/route.ts`
- `app/api/auth/register/route.ts`
- `app/auth/signin/page.tsx`
- `app/auth/signup/page.tsx`
- `prisma/schema.prisma`
- `lib/db.ts` (Prisma client export)

## Timeline
- Phase 1 (Setup): 2 days
- Phase 2 (Auth): 3 days
- Phase 3 (Middleware): 2 days
- Phase 4 (UI): 3 days
- Phase 5 (Protected Routes): 2 days
- Phase 6 (Testing & Deploy): 2 days
- **Total: 14 days (2 weeks)**

---
**Note**: Adjust timeline based on team size and complexity requirements.
