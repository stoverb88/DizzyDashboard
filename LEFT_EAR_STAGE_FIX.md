# Left Ear Stage Progression Fix

## Issue Identified
The left ear clinician view was experiencing rapid stage progression (2→5) when particles reached the upper portion of the canal tube.

---

## Root Cause

### ❌ **Before (Broken Logic):**

The bracket degree ranges were **out of order** and had **gaps** between stages:

```
Degree Layout (0° = 3 o'clock, 90° = 6 o'clock, 180° = 9 o'clock, 270° = 12 o'clock):

Red (Stage 1):    30° - 70°     ✓ Correct
Yellow (Stage 2): 70° - 150°    ✓ Correct
                  320° - 30°    ✓ Correct (wraps around)

[150° - 210°]: ORANGE (Stage 4) ❌ OUT OF ORDER!
[210° - 290°]: BLUE (Stage 3)   ❌ SHOULD BE BEFORE ORANGE!
[290° - 320°]: GREEN (Stage 5)  ✓ But unreachable properly!
```

**The Problem:**
- When particles moved from 210° → 290° (blue/Stage 3)
- They would hit 290° and immediately enter green (Stage 5)
- **Stage 4 (orange) was completely bypassed** because it was placed at 150-210° (before Stage 3!)
- This caused rapid jumping from Stage 2 → 3 → 5, skipping Stage 4 entirely

---

## ✅ **After (Fixed Logic):**

Sequential progression with proper stage ordering:

```
Corrected Degree Layout:

Stage 1 - Red:    30° - 70°      | Starting position (1-2 o'clock)
Stage 2 - Yellow: 70° - 150°     | Supine, head left (2-5 o'clock)
                  320° - 30°      | Wraps around for left ear
Stage 3 - Blue:   210° - 270°    | Top of canal (7-9 o'clock)  ← NARROWED
Stage 4 - Orange: 270° - 310°    | Left side (9-10 o'clock)    ← MOVED HERE!
Stage 5 - Green:  310° - 320°    | Near vestibule (10-11 o'clock)

Transition zone: 150° - 210° stays in Stage 2 (safety buffer)
```

**Key Changes:**
1. **Blue (Stage 3)** narrowed from 210-290° to **210-270°**
2. **Orange (Stage 4)** moved from 150-210° to **270-310°** (after blue, before green)
3. **Green (Stage 5)** adjusted from 290-320° to **310-320°** (more precise)
4. Added transition buffer at 150-210° to prevent premature advancement

---

## Visual Representation

```
      12 o'clock (270°)
           │
      ╔════╧════╗
     ╔╝ BLUE(3)  ╚╗
    ║             ║
9 ──║ ORANGE(4)   ║── 3 o'clock (0°/360°)
    ║   GREEN(5)  ║
     ╚╗ YELLOW(2)╔╝
      ╚═════╧════╝
           │
      6 o'clock (90°)

LEFT EAR - Clockwise flow:
RED(1) → YELLOW(2) → BLUE(3) → ORANGE(4) → GREEN(5) → Vestibule
```

---

## Code Changes

**File:** `components/CanalSimulation.tsx`
**Lines:** 1080-1100

### Before:
```typescript
// Blue bracket: Top of canal
if (degrees >= 210 && degrees < 290) return 'blue'
// Orange bracket: Left side, approaching vestibule
if (degrees >= 150 && degrees < 210) return 'orange'  // ❌ WRONG ORDER!
// Green bracket: Final vestibule position
if (degrees >= 290 && degrees < 320) return 'green'
```

### After:
```typescript
// Stage 3: Blue bracket - Top of canal
if (degrees >= 210 && degrees < 270) return 'blue'

// Stage 4: Orange bracket - Left side of canal
if (degrees >= 270 && degrees < 310) return 'orange'  // ✅ SEQUENTIAL!

// Stage 5: Green bracket - Final vestibule position
if (degrees >= 310 && degrees < 320) return 'green'

// Fallback for transition zones
if (degrees >= 150 && degrees < 210) return 'yellow'
```

---

## Testing Steps

1. **Start Left Ear Training** with Clinician View
2. **Move particles clockwise** through the canal:
   - Start: 30-70° (Red/Stage 1) ✓
   - Turn device: Particles move to 70-150° (Yellow/Stage 2) ✓
   - Continue: Particles reach 210-270° (Blue/Stage 3) ✓
   - Keep going: Particles enter 270-310° (Orange/Stage 4) ✓ **NO MORE SKIP!**
   - Final: Particles reach 310-320° (Green/Stage 5) ✓
   - Complete: Particles enter vestibule ✓

3. **Verify:** Stage progression should now be **1 → 2 → 3 → 4 → 5** without rapid jumps

---

## Impact

### Before Fix:
- ❌ Stages would jump 2 → 3 → 5 (skipping 4)
- ❌ Confusing user experience
- ❌ Incorrect training progression

### After Fix:
- ✅ Smooth progression through all 5 stages
- ✅ Proper Epley maneuver sequence
- ✅ Better training experience
- ✅ Matches right ear behavior

---

## Related Files
- `components/CanalSimulation.tsx` (main fix)
- No avatar images need changing (they're already correct)
- No other components affected

---

**Status:** ✅ **FIXED** - Left ear stage progression now works correctly for clinician view.
