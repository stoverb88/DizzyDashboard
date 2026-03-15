# Vercel Postgres Setup Guide

## Step-by-Step Instructions

### Option 1: Via Vercel Dashboard (Recommended - Easiest)

1. **Go to your Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your "vestibular-screening-webapp" project

2. **Navigate to Storage Tab**
   - Click "Storage" in the top navigation
   - Click "Create Database"
   - Select "Postgres"

3. **Create Database**
   - Database Name: `vestibular-auth` (or any name you prefer)
   - Region: Choose closest to your users (e.g., `us-east-1`)
   - Click "Create"

4. **Connect to Project**
   - Select your project: "vestibular-screening-webapp"
   - Click "Connect"
   - Vercel will automatically add environment variables

5. **Get Connection String**
   - Go to Settings → Environment Variables
   - You should see: `POSTGRES_URL`, `POSTGRES_PRISMA_URL`, etc.
   - Copy `POSTGRES_PRISMA_URL` value

6. **Add to Local Environment**
   ```bash
   # Open/create .env.local file
   echo 'DATABASE_URL="your-postgres-prisma-url-here"' >> .env.local
   ```

---

### Option 2: Via Vercel CLI (Alternative)

```bash
# Install Vercel CLI if you haven't
npm install -g vercel

# Login
vercel login

# Link project
vercel link

# Create Postgres database
vercel storage create postgres vestibular-auth

# Pull environment variables
vercel env pull .env.local
```

---

## After Database Creation

### Step 1: Update .env.local

Your `.env.local` file should have:

```env
# Vercel Postgres (from Vercel Dashboard)
DATABASE_URL="postgres://..."

# NextAuth (generate these)
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="your-secret-here"

# Existing Vercel KV
KV_URL="..."
KV_REST_API_URL="..."
KV_REST_API_TOKEN="..."
KV_REST_API_READ_ONLY_TOKEN="..."
```

### Step 2: Generate NEXTAUTH_SECRET

```bash
# Generate a secure random secret
openssl rand -base64 32
```

Copy the output and add to `.env.local`:
```env
NEXTAUTH_SECRET="paste-generated-secret-here"
```

### Step 3: Run Prisma Migration

```bash
# Generate Prisma Client
npx prisma generate

# Create and run migration
npx prisma migrate dev --name init

# You should see:
# ✅ Database synchronized
# ✅ Prisma Client generated
```

### Step 4: Verify Database

```bash
# Open Prisma Studio to view database
npx prisma studio

# Opens at: http://localhost:5555
# You should see your tables: User, Session, PatientInvite, etc.
```

---

## Troubleshooting

### Error: "Can't reach database server"

**Cause:** DATABASE_URL not set or incorrect

**Solution:**
1. Check `.env.local` exists and has DATABASE_URL
2. Verify URL is from POSTGRES_PRISMA_URL (not POSTGRES_URL)
3. Restart dev server: `npm run dev`

### Error: "Environment variable not found: DATABASE_URL"

**Solution:**
```bash
# Make sure .env.local is in project root
ls -la .env.local

# Restart dev server
npm run dev
```

### Error: "Migration failed"

**Solution:**
```bash
# Reset database and try again
npx prisma migrate reset
npx prisma migrate dev --name init
```

### Error: "prisma-client-js not found"

**Solution:**
```bash
# Regenerate Prisma Client
npx prisma generate
```

---

## Vercel Postgres Free Tier Limits

✅ **256 MB storage** (enough for ~10,000 users)
✅ **60 hours compute/month** (plenty for moderate usage)
✅ **1 database per project**

**Current Usage Estimate:**
- Each user: ~2KB
- Each session: ~500 bytes
- Each invite: ~1KB

**Capacity:**
- 10,000 users = ~20MB
- 100,000 sessions = ~50MB
- **Total: Well under 256MB limit**

---

## Production Environment Variables

After local testing, add to Vercel production:

1. Go to: Vercel Dashboard → Your Project → Settings → Environment Variables

2. Add these variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXTAUTH_URL` | `https://yourdomain.com` | Production |
| `NEXTAUTH_SECRET` | `(same secret from .env.local)` | Production, Preview, Development |

**Note:** `DATABASE_URL` is already added by Vercel Storage connection

---

## Database Schema Overview

Your database will have these tables:

### Core Tables
- **User** - User accounts (medical professionals & patients)
- **Session** - Active login sessions
- **Account** - OAuth accounts (future)

### Invitation Tables
- **MedicalInvite** - Email invitations for medical professionals
- **PatientInvite** - 6-digit codes for patients

### Helper Tables
- **VerificationToken** - Email verification tokens

---

## Next Steps

After database setup:

1. ✅ DATABASE_URL set in .env.local
2. ✅ NEXTAUTH_SECRET generated
3. ✅ Prisma migrated (`npx prisma migrate dev`)
4. ✅ Prisma Client generated (`npx prisma generate`)

**You're ready to continue with NextAuth.js configuration!**

---

## Useful Commands

```bash
# View database in browser
npx prisma studio

# Create new migration after schema changes
npx prisma migrate dev --name description_of_change

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Update Prisma Client after schema changes
npx prisma generate

# Format schema file
npx prisma format

# Validate schema
npx prisma validate
```

---

## Cost Management

### Stay on Free Tier
- Monitor usage in Vercel Dashboard → Storage
- Free tier resets monthly
- Upgrade warning at 80% usage

### When to Upgrade ($20/month)
- 10,000+ users
- 1M+ sessions/month
- Need more than 60 hours compute
- Want automatic backups

---

## Security Notes

- ✅ DATABASE_URL contains credentials - never commit to git
- ✅ .env.local is gitignored by default
- ✅ Vercel encrypts environment variables
- ✅ Use POSTGRES_PRISMA_URL for Prisma (connection pooling)
- ✅ Use POSTGRES_URL for direct connections

---

## Quick Reference

**Dashboard Links:**
- Storage: https://vercel.com/dashboard/{your-team}/stores
- Environment Vars: https://vercel.com/dashboard/{your-team}/settings/environment-variables

**Local URLs:**
- App: http://localhost:3001
- Prisma Studio: http://localhost:5555

**Important Files:**
- Schema: `/prisma/schema.prisma`
- Env: `/.env.local` (don't commit!)
- Migrations: `/prisma/migrations/`
