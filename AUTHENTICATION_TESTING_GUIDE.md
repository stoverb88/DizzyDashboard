# Authentication Testing Guide

## Overview

The authentication system is now fully implemented with industry-leading security features including:
- Role-based access control (Medical Professional vs Patient)
- Email/password authentication for medical professionals
- Simple 6-digit code access for patients
- Biometric authentication support (Face ID, Touch ID, Windows Hello, Fingerprint)
- WebAuthn standard implementation
- Route protection middleware
- Session management with JWT

---

## Test Environment Setup

### 1. Services Running

Make sure these services are running:

```bash
# Development server (should already be running)
npm run dev
# http://localhost:3001

# Prisma Studio (should already be running)
# http://localhost:5555
```

### 2. Test Data Created

The following test accounts have been created:

**Medical Professional:**
- Email: `doctor@test.com`
- Password: `Test1234!`

**Patient Codes:**
- Code: `123456`
- Code: `654321`

---

## Testing Scenarios

### Scenario 1: Medical Professional Login (First Time)

1. **Navigate to Login**
   - Go to http://localhost:3001
   - Should auto-redirect to http://localhost:3001/login

2. **Select Role**
   - Click on "Medical Professional" card
   - Should see the medical login screen

3. **Enter Credentials**
   - Email: `doctor@test.com`
   - Password: `Test1234!`
   - Click "Sign In"

4. **Biometric Setup (Optional)**
   - If your device supports biometrics, you'll see a setup screen
   - Click "Enable [Face ID/Touch ID/etc]" to set up biometrics
   - OR click "Skip for Now" to proceed without biometrics

5. **Access Main App**
   - Should redirect to http://localhost:3001/app
   - Should see the full Vestibular Screening App with all tabs

6. **Verify Session**
   - Refresh the page
   - Should remain logged in (not redirected to login)

---

### Scenario 2: Medical Professional Login (With Biometrics)

**Prerequisites:** Complete Scenario 1 and enable biometric authentication

1. **Logout** (if needed, or open incognito window)

2. **Navigate to Login**
   - Go to http://localhost:3001/login
   - Select "Medical Professional"

3. **Enter Email**
   - Enter: `doctor@test.com`
   - Notice the "Sign in with [Biometric]" button appears

4. **Use Biometric Authentication**
   - Click "Sign in with [Face ID/Touch ID/etc]"
   - Device will prompt for biometric verification
   - Complete biometric verification

5. **Access Main App**
   - Should immediately redirect to http://localhost:3001/app
   - No password required!

---

### Scenario 3: Patient Login (First Time - Auto-Registration)

1. **Navigate to Login**
   - Go to http://localhost:3001/login

2. **Select Role**
   - Click on "Patient" card
   - Should see the 6-digit code entry screen

3. **Enter Code**
   - Enter: `123456` (or `654321`)
   - Can type or paste
   - Auto-submits when 6th digit is entered

4. **Access Exercises Tab**
   - Should redirect to http://localhost:3001/app
   - Should see ONLY the Exercises tab (limited access for patients)
   - Other tabs hidden based on patient role

5. **Verify Session**
   - Refresh the page
   - Should remain logged in

---

### Scenario 4: Patient Login (Returning User)

**Prerequisites:** Complete Scenario 3

1. **Logout** (if needed, or open new incognito window)

2. **Navigate to Login**
   - Go to http://localhost:3001/login
   - Select "Patient"

3. **Enter Same Code**
   - Enter: `123456` (same code as before)
   - System recognizes returning user

4. **Access Exercises Tab**
   - Should redirect to http://localhost:3001/app
   - Welcome back message
   - Same limited patient access

---

### Scenario 5: Route Protection

**Test Protected Routes:**

1. **Try to access /app without authentication**
   - Logout or open incognito
   - Go to http://localhost:3001/app
   - Should redirect to http://localhost:3001/login?callbackUrl=/app

2. **Login and verify callback**
   - Login as medical professional or patient
   - Should redirect back to /app after authentication

3. **Try to access /login while authenticated**
   - Login first
   - Try to navigate to http://localhost:3001/login
   - Should redirect to /app (you're already logged in)

---

### Scenario 6: Invalid Credentials

**Test Error Handling:**

1. **Invalid Medical Professional Login**
   - Select "Medical Professional"
   - Email: `wrong@test.com`
   - Password: `WrongPassword123!`
   - Click "Sign In"
   - Should see error: "Invalid email or password"

2. **Invalid Patient Code**
   - Select "Patient"
   - Enter: `999999` (non-existent code)
   - Should see error: "Invalid code" or "Code not found"

3. **Expired Patient Code**
   - (Would need to manually expire a code in database)
   - Should see error: "Code has expired"

---

## Database Inspection

### View Data in Prisma Studio

1. Open http://localhost:5555

2. **Check User Table**
   - Should see the medical professional: `doctor@test.com`
   - Should see any patients that have logged in
   - Check `biometricEnabled` field (true if biometrics set up)

3. **Check PatientInvite Table**
   - Should see codes: `123456`, `654321`
   - Check `usedAt` field (null if unused, date if used)
   - Check `useCount` field (increments each time code is used)

4. **Check WebAuthnCredential Table** (if biometrics enabled)
   - Should see credential entries
   - Each device gets a separate entry
   - Check `deviceName` and `lastUsedAt` fields

5. **Check Session Table** (after login)
   - Should see active sessions
   - Each session has a `sessionToken` and `expires` date

---

## Testing Biometric Authentication

### Requirements

- **macOS:** Touch ID or Apple Silicon Mac with Face ID
- **iOS/iPadOS:** Face ID or Touch ID
- **Windows:** Windows Hello (Face, Fingerprint, or PIN)
- **Android:** Fingerprint or Face Unlock
- **Chrome/Edge:** Version 67+
- **Safari:** Version 13+
- **Firefox:** Version 60+

### Testing Steps

1. **Initial Setup**
   - Login as medical professional
   - When prompted, click "Enable [Biometric]"
   - Device will prompt for biometric enrollment
   - Complete device-specific enrollment

2. **Verify Registration**
   - Check Prisma Studio → WebAuthnCredential table
   - Should see new credential entry
   - User's `biometricEnabled` should be `true`

3. **Test Authentication**
   - Logout
   - Login again, enter email
   - Click "Sign in with [Biometric]"
   - Device prompts for biometric
   - Complete authentication
   - Should login immediately

4. **Test Multiple Devices** (optional)
   - Login on different device
   - Enable biometrics on that device too
   - Check Prisma Studio → multiple credential entries

5. **Test Credential Removal** (future feature)
   - Navigate to account settings
   - Remove biometric credential
   - Verify removed from database
   - Next login should not show biometric option

---

## Common Issues & Solutions

### Issue: "Biometric authentication not available"

**Possible Causes:**
- Device doesn't have biometric hardware
- Browser doesn't support WebAuthn
- Biometrics not set up on device
- Website not running on HTTPS (required in production)

**Solution:**
- localhost is exempt from HTTPS requirement
- Check browser compatibility
- Set up biometrics in device settings

---

### Issue: "Cannot fetch data from service" during seeding

**Cause:** DATABASE_URL not set properly

**Solution:**
```bash
DATABASE_URL="postgresql://..." npm run db:seed
```

---

### Issue: Middleware redirect loop

**Cause:** Session cookie not being set properly

**Solution:**
- Check NEXTAUTH_URL in .env.local
- Clear cookies and try again
- Check browser console for errors

---

### Issue: "Invalid email or password" for correct credentials

**Possible Causes:**
- Password not properly hashed
- User not in database
- NextAuth configuration issue

**Solution:**
- Check user exists in Prisma Studio
- Verify password field is not null
- Check auth.ts configuration

---

## Security Testing

### Password Requirements

**Medical Professionals:**
- Minimum 12 characters (current: 8 for testing)
- Should include uppercase, lowercase, numbers, symbols
- Test weak passwords (should be rejected)

**Test Cases:**
- ✅ `Test1234!` (valid)
- ❌ `test` (too short)
- ❌ `12345678` (no letters)
- ❌ `TestTest` (no numbers/symbols)

---

### Session Management

**Test Session Expiration:**
1. Login
2. Check session in Prisma Studio (7-day expiration)
3. Manually expire session (set expires to past date)
4. Refresh app
5. Should redirect to login

**Test Multiple Sessions:**
1. Login on Device A
2. Login on Device B (different browser/device)
3. Both should work independently
4. Check Session table → 2 active sessions

---

### Rate Limiting

**Test Login Attempts:**
1. Try 5+ failed logins
2. Should see rate limiting error
3. Wait 15 minutes or check rate limit reset time

---

## Production Deployment Checklist

Before deploying to production, update:

1. **Environment Variables:**
   ```env
   NEXT_PUBLIC_RP_ID="yourdomain.com"
   NEXT_PUBLIC_ORIGIN="https://yourdomain.com"
   NEXTAUTH_URL="https://yourdomain.com"
   ```

2. **Password Requirements:**
   - Update to 12+ character minimum
   - Add complexity requirements
   - Update medical registration API validation

3. **Rate Limiting:**
   - Review limits in lib/rate-limit.ts
   - Adjust based on usage patterns

4. **Session Duration:**
   - Review 7-day session duration
   - Adjust in auth.ts if needed

5. **HTTPS:**
   - Ensure all traffic is HTTPS
   - Biometric auth requires secure context

---

## Success Criteria

- ✅ Medical professionals can login with email/password
- ✅ Medical professionals can enable biometric auth
- ✅ Medical professionals can login with biometrics
- ✅ Patients can login with 6-digit code
- ✅ Patients auto-register on first login
- ✅ Patients see only Exercises tab (role-based access)
- ✅ Route protection works (unauthenticated → redirect to login)
- ✅ Sessions persist across page refreshes
- ✅ Biometric credentials stored securely
- ✅ Error messages are clear and helpful

---

## Next Steps

1. **Test all scenarios above**
2. **Report any issues found**
3. **Review UX/UI for improvements**
4. **Consider adding:**
   - Password reset flow
   - Account settings page
   - Biometric credential management
   - Admin user management panel

---

**Ready to test! 🚀**
