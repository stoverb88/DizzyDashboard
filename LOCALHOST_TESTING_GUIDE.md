# Localhost Testing Guide - Phase 1

## Development Server Running ✅

**URL:** http://localhost:3001

The server is running in the background. Open this URL in your browser to start testing!

---

## Test Plan

### Test 1: New 8-Character Chart ID Generation

**What we're testing:** The new secure chart ID generator

**Steps:**
1. Open http://localhost:3001
2. Click through the splash screen
3. Choose "Start Eval"
4. Fill in the evaluation form (you can skip through quickly for testing)
5. Navigate to step 9: "Plan of Care"
6. Proceed to step 10: "Narrative Summary"
7. Click "Export Chart Note"

**What to verify:**
- ✅ Chart ID should be **8 characters** (not 6)
- ✅ Format should be like: `A3X9K2M7` or `P5Q1R8S4`
- ✅ Should NOT contain: 0, 1, O, or I (confusing characters)
- ✅ Each generated ID should be unique (try exporting multiple times)

**Expected Result:**
```
✅ Chart Note Exported Successfully!
Your Chart ID: A3X9K2M7

This note will be available for 72 hours.
```

---

### Test 2: Note Retrieval with 8-Character Code

**What we're testing:** Retrieving notes with the new format

**Steps:**
1. Copy the 8-character chart ID from Test 1
2. Click "Back" or navigate to home
3. Choose "Find Chart Note"
4. Enter the chart ID (try both with and without hyphen)
   - Test: `A3X9K2M7`
   - Test: `A3X9-K2M7`
5. Click "Retrieve Chart Note"

**What to verify:**
- ✅ Input auto-formats with hyphen after 4 characters
- ✅ Accepts both `A3X9K2M7` and `A3X9-K2M7`
- ✅ Successfully retrieves the note
- ✅ Shows "Notes are available for 72 hours" message
- ✅ Copy button works

**Expected Result:**
```
✅ Note retrieved successfully
📄 Your Chart Note displayed below
[Copy] button available
```

---

### Test 3: Rate Limiting (Basic)

**What we're testing:** Rate limiting prevents too many requests

**Steps:**
1. Go to "Find Chart Note" page
2. Enter an INVALID chart ID (e.g., `INVALID1`)
3. Click "Retrieve Chart Note"
4. Repeat steps 2-3 rapidly **15 times**

**What to verify:**
- ✅ First 10 attempts: Shows "Chart note not found"
- ✅ 11th attempt onwards: Shows rate limit error
- ✅ Error message includes: "Too many requests. Please wait X minute(s)."
- ✅ Retrieve button should still work after 1 minute

**Expected Result After 10th Attempt:**
```
⚠️ Too many requests. Please try again later.
Please wait 1 minute(s).
```

---

### Test 4: Rate Limiting Headers (Advanced)

**What we're testing:** API returns proper rate limit headers

**Steps:**
1. Open browser DevTools (F12)
2. Go to "Network" tab
3. Navigate to "Find Chart Note"
4. Enter a chart ID and click "Retrieve"
5. Look at the response headers in DevTools

**What to verify:**
- ✅ Response includes `X-RateLimit-Remaining` header
- ✅ Value decreases with each request
- ✅ When rate limited, shows `X-RateLimit-Reset` timestamp

**Expected Headers:**
```
X-RateLimit-Remaining: 9
X-RateLimit-Limit: 10
X-RateLimit-Reset: 1699999999999
```

---

### Test 5: Invalid Chart ID Validation

**What we're testing:** System rejects invalid formats

**Test Cases:**

| Input | Expected Result |
|-------|----------------|
| `ABC` | "Please enter a valid 8-character ID." |
| `ABCDEFGHIJK` | Input truncates at 9 chars (8 + hyphen) |
| `12345678` | Accepts (all numeric) |
| `AAAAAAAA` | Accepts (all letters) |
| `A3X9-K2M7` | Accepts (with hyphen) |
| `a3x9k2m7` | Auto-converts to uppercase: `A3X9-K2M7` |

**Steps for each test:**
1. Clear the input field
2. Enter the test value
3. Observe behavior

**What to verify:**
- ✅ Input auto-uppercases
- ✅ Input auto-formats with hyphen
- ✅ Input validates length
- ✅ Button disables for invalid length

---

### Test 6: 72-Hour Retention Message

**What we're testing:** UI shows correct retention period

**Steps:**
1. Go to "Find Chart Note" page
2. Look at the help text above the input field

**What to verify:**
- ✅ Shows: "Notes are available for 72 hours after creation."
- ✅ Does NOT show: "24 hours"

**Expected Text:**
```
Enter your 8-character ID to retrieve your chart note.
Notes are available for 72 hours after creation.
```

---

### Test 7: Backward Compatibility (6-Char Codes)

**What we're testing:** Old 6-character codes fail gracefully

**Steps:**
1. Go to "Find Chart Note"
2. Enter a 6-character code (e.g., `ABC123`)
3. Try to retrieve

**What to verify:**
- ✅ Button stays disabled (length validation)
- ✅ Cannot submit 6-character codes
- ✅ No error until user tries to submit

**Expected Result:**
```
Button disabled until 8 characters entered
```

---

### Test 8: Rate Limit Recovery

**What we're testing:** Rate limit resets after time window

**Steps:**
1. Trigger rate limit (10+ rapid requests)
2. Note the "wait X minutes" message
3. Wait for the specified time
4. Try retrieving a note again

**What to verify:**
- ✅ After waiting, rate limit is lifted
- ✅ Can make requests again
- ✅ Counter resets to 10 attempts

**Expected Result:**
```
After 1 minute: Rate limit lifted, requests work again
```

---

## Advanced Testing (Optional)

### Test 9: API Direct Testing

**Using cURL or Postman:**

**Create a note:**
```bash
curl -X POST http://localhost:3001/api/notes \
  -H "Content-Type: application/json" \
  -d '{"chartId":"A3X9K2M7","narrative":"Test note content"}'
```

**Expected Response:**
```json
{
  "success": true,
  "id": "A3X9K2M7",
  "message": "Note saved successfully",
  "expiresAt": 1699999999999
}
```

**Retrieve a note:**
```bash
curl http://localhost:3001/api/notes/A3X9K2M7
```

**Expected Response:**
```json
{
  "narrative": "Test note content",
  "createdAt": 1699999999999,
  "expiresAt": 1699999999999
}
```

**Test rate limiting:**
```bash
# Run this 15 times rapidly
for i in {1..15}; do
  curl http://localhost:3001/api/notes/INVALID$i
  echo ""
done
```

**Expected:** First 10 succeed, 11-15 return 429 status

---

### Test 10: Collision Test (ID Uniqueness)

**What we're testing:** Chart IDs are unique

**Steps:**
1. Create 10 evaluations
2. Export each one and note the chart IDs
3. Compare all IDs

**What to verify:**
- ✅ All 10 IDs are different
- ✅ No duplicates
- ✅ Random distribution (not sequential)

**Script to help:**
```javascript
// Open browser console on any page
const ids = [];
for (let i = 0; i < 100; i++) {
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  const CHARS = '234567892ABCDEFGHJKLMNPQRSTUVWXYZ';
  const id = Array.from(array).map(byte => CHARS[byte % CHARS.length]).join('');
  ids.push(id);
}

// Check for duplicates
const unique = new Set(ids);
console.log(`Generated: ${ids.length}, Unique: ${unique.size}`);
console.log(`Duplicates: ${ids.length - unique.size}`);
```

**Expected:** 0 duplicates in 100 generations

---

## Troubleshooting

### Issue: "Cannot connect to server"

**Solution:**
```bash
# Check if server is running
# Should see: ✓ Ready in XXXXms
# If not, restart:
npm run dev
```

### Issue: "Invalid chart ID format"

**Cause:** Trying to use old 6-character codes

**Solution:** Generate new 8-character codes for testing

### Issue: Rate limit not triggering

**Cause:** Using different IPs or browser cleared rate limit data

**Solution:**
- Clear Vercel KV data if using remote KV
- Or wait 1 minute and try again
- Check that requests are coming from same IP

### Issue: Notes not persisting

**Cause:** Vercel KV not connected locally

**Check:**
```bash
# Verify .env.local has KV credentials
cat .env.local | grep KV_
```

**Expected:**
```
KV_URL=...
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...
```

---

## Testing Checklist

Use this checklist to track your testing progress:

### Basic Functionality
- [ ] Dev server starts without errors
- [ ] App loads at http://localhost:3001
- [ ] Can navigate through splash screen
- [ ] Can start evaluation

### Chart ID Generation
- [ ] Generates 8-character IDs
- [ ] IDs are uppercase
- [ ] IDs don't contain 0, 1, O, I
- [ ] Each ID is unique

### Note Storage & Retrieval
- [ ] Can save evaluation note
- [ ] Can retrieve note with 8-char code
- [ ] Input auto-formats with hyphen
- [ ] Copy button works
- [ ] Shows "72 hours" message

### Rate Limiting
- [ ] First 10 requests succeed
- [ ] 11th request shows rate limit error
- [ ] Error shows countdown timer
- [ ] Rate limit resets after 1 minute
- [ ] Rate limit headers present in API response

### Validation
- [ ] Rejects codes shorter than 8 chars
- [ ] Rejects codes longer than 8 chars
- [ ] Auto-uppercases input
- [ ] Accepts codes with/without hyphen

### UI/UX
- [ ] Help text shows "72 hours" not "24 hours"
- [ ] Chart ID displays with hyphen (A3X9-K2M7)
- [ ] Error messages are clear
- [ ] Button disables appropriately

---

## Performance Metrics

**What to watch:**

### Page Load Time
```
Target: < 2 seconds
Measure: Chrome DevTools > Network > DOMContentLoaded
```

### API Response Time
```
Target: < 500ms
Measure: Chrome DevTools > Network > API request duration
```

### Chart ID Generation
```
Target: < 10ms
Measure: Should be instant (cryptographic operation)
```

---

## Test Results Template

Copy this template to track your results:

```
## Phase 1 Testing Results

**Date:** [Today's date]
**Tester:** [Your name]
**Environment:** Localhost (http://localhost:3001)

### Test 1: Chart ID Generation
- Status: ✅ Pass / ❌ Fail
- Notes: [Any observations]

### Test 2: Note Retrieval
- Status: ✅ Pass / ❌ Fail
- Notes: [Any observations]

### Test 3: Rate Limiting
- Status: ✅ Pass / ❌ Fail
- Notes: [Any observations]

### Test 4: Validation
- Status: ✅ Pass / ❌ Fail
- Notes: [Any observations]

### Test 5: UI Messages
- Status: ✅ Pass / ❌ Fail
- Notes: [Any observations]

### Issues Found:
1. [Issue description]
2. [Issue description]

### Overall Assessment:
- [ ] Ready for production
- [ ] Needs minor fixes
- [ ] Needs major work
```

---

## What to Look For

### ✅ Good Signs
- All chart IDs are 8 characters
- Rate limiting triggers after 10 attempts
- Notes retrieve successfully
- No console errors
- UI shows "72 hours"

### 🚨 Red Flags
- Chart IDs are still 6 characters
- Rate limiting never triggers
- Console shows errors
- Notes don't persist
- UI shows "24 hours"

---

## After Testing

### If Everything Works:
1. ✅ Mark Phase 1 as tested and approved
2. Ready to deploy to production
3. Can proceed to Phase 2 (authentication) if desired

### If Issues Found:
1. Document the issue
2. Check the troubleshooting section
3. Let me know what's broken - I'll fix it!

---

## Quick Commands

**Start server:**
```bash
npm run dev
```

**Stop server:**
```
Ctrl + C in terminal
```

**Build (check for errors):**
```bash
npm run build
```

**View logs:**
```
Check terminal where npm run dev is running
```

---

## Ready to Test!

🚀 **Your app is running at:** http://localhost:3001

Start with Test 1 (Chart ID Generation) and work through the checklist.

Let me know if you encounter any issues or have questions!
