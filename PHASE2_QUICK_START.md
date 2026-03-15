# Phase 2: Quick Start - Action Items

## ✅ Completed So Far

1. ✅ Installed NextAuth.js v5
2. ✅ Installed Prisma & bcryptjs
3. ✅ Created comprehensive database schema
4. ✅ Initialized Prisma

---

## 🚀 Next Steps (Do These Now)

### Step 1: Set Up Vercel Postgres (5 minutes)

**Two Options:**

**Option A - Vercel Dashboard (Easiest):**
1. Go to: https://vercel.com/dashboard
2. Select your project
3. Click "Storage" → "Create Database" → "Postgres"
4. Name it: `vestibular-auth`
5. Click "Connect" to your project
6. Done! Environment variables are added automatically

**Option B - Command Line:**
```bash
vercel login
vercel link
vercel storage create postgres vestibular-auth
vercel env pull .env.local
```

---

### Step 2: Configure Local Environment (2 minutes)

1. **Generate NextAuth Secret:**
```bash
openssl rand -base64 32
```

2. **Create/Update `.env.local`:**
```bash
# Add these to .env.local file:
DATABASE_URL="(paste from Vercel Dashboard → Settings → Environment Variables → POSTGRES_PRISMA_URL)"
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="(paste generated secret from step 1)"
```

Your `.env.local` should now have:
- DATABASE_URL (from Vercel)
- NEXTAUTH_URL
- NEXTAUTH_SECRET
- KV_URL (already there)
- KV_REST_API_URL (already there)
- KV_REST_API_TOKEN (already there)
- KV_REST_API_READ_ONLY_TOKEN (already there)

---

### Step 3: Run Database Migration (1 minute)

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init
```

**Expected Output:**
```
✔ Generated Prisma Client
✔ The following migration(s) have been created and applied:
  migrations/
    └─ 20250103xxxxxx_init/
```

---

### Step 4: Verify Setup (Optional - 1 minute)

```bash
# Open Prisma Studio to view database
npx prisma studio
```

Opens at http://localhost:5555 - you should see your tables!

---

## 📋 Checklist

Before continuing, verify:

- [ ] Vercel Postgres database created
- [ ] DATABASE_URL in .env.local
- [ ] NEXTAUTH_SECRET in .env.local
- [ ] NEXTAUTH_URL in .env.local
- [ ] `npx prisma generate` ran successfully
- [ ] `npx prisma migrate dev` ran successfully
- [ ] No error messages

---

## ⚠️ Common Issues

### "Can't reach database server"
- Check DATABASE_URL is set in .env.local
- Use POSTGRES_PRISMA_URL (not POSTGRES_URL)
- Restart dev server

### "Environment variable not found"
- Make sure .env.local is in project root
- Check spelling of DATABASE_URL
- Restart dev server

### "Migration failed"
- Try: `npx prisma migrate reset`
- Then: `npx prisma migrate dev --name init`

---

## 🎯 After Setup Complete

**Tell me when you're done with these steps**, and I'll continue with:

1. NextAuth.js configuration
2. Login page creation
3. Registration flows
4. Invitation systems
5. Route protection

---

## 📚 Documentation

For detailed instructions, see:
- [VERCEL_POSTGRES_SETUP.md](VERCEL_POSTGRES_SETUP.md) - Complete database setup guide
- [PHASE2_AUTH_PLAN.md](PHASE2_AUTH_PLAN.md) - Full authentication implementation plan

---

## ⏱️ Time Estimate

- Database setup: 5 minutes
- Environment config: 2 minutes
- Migration: 1 minute
- **Total: ~8 minutes**

---

## Ready?

Once you complete Steps 1-3 above, let me know and I'll continue building the authentication system! 🚀
