# Canal Flow Direction Summary

## Current Implementation (Latest Fix)

### **RIGHT EAR - CLOCKWISE FLOW** ✅ (Working Perfectly)
```
START: 120° (7 o'clock) → CLOCKWISE → EXIT: 60° (5 o'clock)

Flow Path:
  120° (7:00) ← Particles spawn here
   ↓ CLOCKWISE
  90° (6:00)
   ↓
  60° (5:00) ← VESTIBULE EXIT

Stage Brackets:
- Stage 1 (Red):    90-130°   | Starting position (7 o'clock)
- Stage 2 (Yellow): 130-210°  | First movement
- Stage 3 (Blue):   210-290°  | Top of canal
- Stage 4 (Orange): 290-360°/0-45° | Approaching vestibule (wraps)
- Stage 5 (Green):  45-90°    | AT VESTIBULE EXIT (5 o'clock)
```

---

### **LEFT EAR - COUNTERCLOCKWISE FLOW** (Latest Fix)
```
START: 60° (5 o'clock) → COUNTERCLOCKWISE → EXIT: 210° (7 o'clock)

Flow Path:
  60° (5:00) ← Particles spawn here
   ↓ COUNTERCLOCKWISE
  90° (6:00)
   ↓
  120° (7:00)
   ↓
  150° (8:00)
   ↓
  180° (9:00)
   ↓
  210° (7:00) ← VESTIBULE EXIT

Stage Brackets:
- Stage 1 (Red):    30-70°    | Starting position (5 o'clock)
- Stage 2 (Yellow): 70-120°   | Moving toward 6 o'clock
- Stage 3 (Blue):   120-180°  | Through 6-9 o'clock (top)
- Stage 4 (Orange): 180-225°  | Approaching 7 o'clock
- Stage 5 (Green):  195-240°  | AT VESTIBULE EXIT (7 o'clock)
```

---

## Visual Diagram

```
           12:00 (270°)
               |
    ╔═════════════════╗
   ║                   ║
   ║   BLUE (Stage 3)  ║
   ║                   ║
9:00 ══                 ══ 3:00
(180°)                    (0°)
   ║                   ║
   ║  YELLOW (Stage 2) ║
   ║                   ║
    ╚═════════════════╝
               |
           6:00 (90°)

RIGHT EAR (Clockwise ↻):
  START (Red) → Yellow → Blue → Orange → GREEN (EXIT at 5:00)

LEFT EAR (Counterclockwise ↺):
  START (Red) → Yellow → Blue → Orange → GREEN (EXIT at 7:00)
```

---

## Key Points

1. **Vestibule = EXIT** where particles finish (Stage 5 Green)
2. **Particles spawn OPPOSITE** from their vestibule exit
3. **Flow directions are OPPOSITE** between ears:
   - Right: CLOCKWISE (decreasing degrees)
   - Left: COUNTERCLOCKWISE (increasing degrees)
4. **Both follow 5-stage progression**: Red → Yellow → Blue → Orange → Green

---

## Testing Checklist

### Right Ear (Working ✅):
- [x] Particles spawn at ~120° (7 o'clock)
- [x] Flow clockwise toward 60° (5 o'clock)
- [x] Progress through stages 1→2→3→4→5
- [x] Complete at vestibule (60°)

### Left Ear (Test Now 🧪):
- [ ] Particles spawn at ~60° (5 o'clock)
- [ ] Flow counterclockwise toward 210° (7 o'clock)
- [ ] Progress through stages 1→2→3→4→5 (no skipping!)
- [ ] Stage 5 triggers when particles reach 210° area
- [ ] Complete at vestibule (210°)

---

## Server Status
✅ Running at: **https://192.168.4.120:3000**

Refresh browser and test the left ear clinician view now!
