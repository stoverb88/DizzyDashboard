#!/bin/bash
# Production Database Migration Script
# This script migrates the production database to remove biometric features

echo "🔄 Production Database Migration"
echo "================================="
echo ""
echo "⚠️  WARNING: This will modify your production database!"
echo "   - Removes 'biometricEnabled' column from User table"
echo "   - Drops 'WebAuthnCredential' table"
echo ""
echo "Please paste your POSTGRES_PRISMA_URL (from Vercel dashboard):"
read -r DATABASE_URL

if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL cannot be empty"
  exit 1
fi

echo ""
echo "Running migration..."
echo ""

DATABASE_URL="$DATABASE_URL" npx prisma db push --accept-data-loss

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Migration completed successfully!"
  echo ""
  echo "Next steps:"
  echo "1. Push your code changes to GitHub"
  echo "2. Vercel will automatically redeploy"
  echo "3. Your production app should work correctly"
else
  echo ""
  echo "❌ Migration failed. Please check the error above."
  exit 1
fi
