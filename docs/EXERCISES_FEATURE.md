# Exercises Feature - Implementation Guide

**Feature Branch**: `feature/vor-exercises`
**Status**: Phase 1 - Navigation & Structure ✅
**Last Updated**: 2025-10-26

---

## 📋 Overview

This document tracks the implementation of the Vestibular Exercises module, starting with VOR × 1 (Gaze Stabilization) exercises.

**Core Purpose**: Enable clinicians to prescribe and document standardized vestibular rehabilitation exercises with customizable parameters, real-time audio cues, and HIPAA-compliant note export.

**Regulatory Position**: Clinical support tool (NOT a medical device) - all parameters must be set by qualified healthcare professionals.

---

## 🎯 Feature Scope

### ✅ What's Included

- **VOR × 1 Gaze Stabilization Module**
  - Customizable target symbol (A, X, O)
  - Orientation selection (Horizontal, Vertical)
  - Adjustable cadence (60-120 BPM)
  - Adjustable duration (30-120 seconds)
  - Audio options (Voice cues, Beep, Silent)

- **Exercise Execution**
  - 3-second countdown with audio
  - Real-time metronome (visual + audio)
  - Voice prompts: "Start", "Halfway", "5 seconds remaining", "Stop"
  - Progress indicator

- **Session Documentation**
  - Symptom rating (0-10 dizziness scale)
  - Auto-generated chart notes
  - Export to secure storage (24-hour retention)
  - Copy/paste to EMR functionality

- **Safety Features**
  - Disclaimer: "Clinical support tool, not a medical device"
  - Contraindications warning before exercise
  - Clinician-controlled parameters only

### ❌ Explicitly Excluded (Regulatory Safety)

- ❌ VOR × 2 (head + target movement) - future consideration
- ❌ Adaptive suggestions ("increase cadence by 10%")
- ❌ Treatment efficacy claims
- ❌ Automated symptom monitoring
- ❌ Diagnostic feedback
- ❌ Patient mode (self-directed therapy) - future consideration

---

## 🏗️ Architecture

### Component Structure

```
components/
├── ExercisesTab.tsx                 ✅ Main exercise library view
├── VORx1Setup.tsx                   ⏳ Parameter configuration screen
├── VORx1Running.tsx                 ⏳ Exercise execution screen
├── VORx1Results.tsx                 ⏳ Completion & symptom rating
├── ExerciseNoteExport.tsx           ⏳ Chart note generation
└── MetronomeEngine.tsx              ⏳ Audio/timing engine (Web Audio API)

icons/
└── ActivityIcon.tsx                 ✅ Exercise tab icon (activity wave)
```

### Navigation Integration

**Bottom Nav Bar** (6 tabs total):
1. Eval (Clipboard)
2. Oculomotor (Eye)
3. HINTS (Lightbulb)
4. Diagnostics (Book)
5. Maneuvers (Bandage)
6. **Exercises (Activity wave)** ← NEW

---

## 🎨 Design System Compliance

All components follow existing DizzyDashboard design patterns:

**Colors** (from design tokens):
- Primary: `#3B82F6` (blue)
- Neutral: `#1A202C` (dark), `#718096` (gray)
- Background: `#F7FAFC` (light gray)
- Warning: `#FCD34D` (amber) for disclaimers
- Success: `#10B981` (green) for completion

**Typography**:
- Headers: 700 weight, 1.5-1.8rem
- Body: 400-500 weight, 0.9-1rem
- Labels: 600 weight, 0.8rem

**Spacing**:
- Mobile padding: 20px
- Desktop padding: 32px
- Card margins: 16px between elements

**Animations**:
- Fade in: opacity 0 → 1, duration 0.3s
- Hover lift: translateY(-2px)
- Tap scale: 0.98

**Icons**:
- 24x24 viewBox
- stroke="currentColor"
- strokeWidth="2"
- strokeLinecap="round"
- strokeLinejoin="round"

---

## 📝 Implementation Phases

### Phase 1: Navigation & Structure ✅ COMPLETE

**Tasks**:
- [x] Create feature branch `feature/vor-exercises`
- [x] Create ActivityIcon component (activity wave pattern)
- [x] Create ExercisesTab component (library view)
- [x] Add Exercise tab to bottom navigation
- [x] Integrate into VestibularScreeningApp routing
- [x] Add disclaimer and contraindications notice
- [x] Test navigation and basic UI

**Files Modified**:
- `components/VestibularScreeningApp.tsx` - Added exercises tab
- `components/icons/ActivityIcon.tsx` - NEW
- `components/ExercisesTab.tsx` - NEW
- `docs/EXERCISES_FEATURE.md` - NEW (this file)

**Git Status**: Ready to commit
**Testing**: Dev server running on http://localhost:3001

---

### Phase 2: VOR × 1 Setup Screen ⏳ NEXT

**Tasks**:
- [ ] Create VORx1Setup component
- [ ] Implement parameter controls:
  - Target symbol dropdown (A, X, O)
  - Orientation toggle (Horizontal/Vertical)
  - Cadence slider (60-120 BPM) with +/- buttons
  - Duration slider (30-120 sec) with +/- buttons
  - Audio radio buttons (Voice, Beep, Silent)
- [ ] Add contraindications checklist modal
- [ ] "Start Exercise" button with validation
- [ ] Preview mode (show target without exercise)
- [ ] Save preset templates (optional)

**Design Specs**:
```
[VOR × 1 Exercise Setup]

Target Symbol:  [Dropdown: A ▼]
Orientation:    (•) Horizontal  ( ) Vertical

Cadence:        [60] ▣▣▣▣▣▣▣▣▣▣▣ [120 BPM]
                [-]  slider      [+]

Duration:       [60] ▣▣▣▣▣▣▣▣▣▣▣ [120 sec]
                [-]  slider      [+]

Audio Cues:     (•) Voice Prompts
                ( ) Beep Only
                ( ) Silent

⚠️ Before starting:
□ Patient cleared for vestibular rehabilitation
□ No active BPPV or neck instability
□ Patient understands exercise instructions

[Preview Target]  [Start Exercise →]
```

**Estimated Time**: 4-6 hours

---

### Phase 3: MetronomeEngine (Audio System) ⏳

**Tasks**:
- [ ] Create MetronomeEngine class using Web Audio API
- [ ] Implement precise timing (not setInterval)
- [ ] Generate audio tones for metronome beats
- [ ] Create/source voice prompt MP3s:
  - "Get ready" (countdown)
  - "Start exercise now"
  - "Halfway there"
  - "Five seconds remaining"
  - "Stop. Exercise complete."
- [ ] Implement volume controls
- [ ] Test audio performance on iOS/Android

**Technical Approach**:
```typescript
// lib/MetronomeEngine.ts
class MetronomeEngine {
  private audioContext: AudioContext
  private scheduledBeats: number[] = []
  private currentBeat: number = 0

  constructor(bpm: number, duration: number, audioType: 'voice' | 'beep' | 'silent') {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }

  scheduleBeats() {
    // Use Web Audio API scheduler for precise timing
    // Look-ahead scheduling to avoid drift
  }

  playBeep(time: number) {
    // Generate sine wave beep at specified time
  }

  playVoice(audioFile: string, time: number) {
    // Load and play MP3 at specified time
  }

  start() { /* ... */ }
  stop() { /* ... */ }
  pause() { /* ... */ }
}
```

**Estimated Time**: 6-8 hours (includes audio sourcing/recording)

---

### Phase 4: VOR × 1 Running Screen ⏳

**Tasks**:
- [ ] Create VORx1Running component
- [ ] Display target symbol (large, centered, high contrast)
- [ ] Implement countdown timer (3-2-1-GO)
- [ ] Show progress bar with time remaining
- [ ] Display current beat count (optional)
- [ ] Integrate MetronomeEngine
- [ ] Visual metronome (pulsing border or indicator)
- [ ] Emergency stop button
- [ ] Prevent screen sleep during exercise
- [ ] Test on mobile devices

**Design Specs**:
```
[Countdown: 3...2...1]

          A          ← Large target (72pt font)

Time: [███████░░░░░░] 30s / 60s

BPM: 90
Beat: 45 / 90

                     [■ Stop]  ← Emergency stop
```

**Estimated Time**: 4-5 hours

---

### Phase 5: VOR × 1 Results & Note Export ⏳

**Tasks**:
- [ ] Create VORx1Results component
- [ ] Symptom rating slider (0-10 dizziness)
- [ ] Free-text clinical observations field
- [ ] Auto-generate structured chart note
- [ ] Integrate with existing note export system
- [ ] Save to Vercel KV (24-hour retention)
- [ ] Generate chartId (6-digit alphanumeric)
- [ ] Copy to clipboard functionality
- [ ] Export PDF option (optional)
- [ ] Session history view (last 5 sessions for same patient)

**Chart Note Format**:
```
VESTIBULAR REHABILITATION EXERCISE

Exercise Type: Gaze Stabilization (VOR × 1)
Orientation: Horizontal
Target Symbol: A
Cadence: 90 beats/minute
Duration: 60 seconds
Repetitions: 1 set

PATIENT RESPONSE:
Symptom Provocation: 3/10 dizziness
Quality: Lightheadedness, mild imbalance
Duration: Symptoms resolved within 30 seconds post-exercise
Tolerance: Good - completed full duration

CLINICAL NOTES:
[Optional free-text field for clinician observations]

SESSION METADATA:
Supervised by: [Clinician name - optional]
Date: [Auto-timestamp]
Chart ID: [ABC123 if saved]
```

**Estimated Time**: 3-4 hours

---

### Phase 6: Testing & Refinement ⏳

**Tasks**:
- [ ] Cross-browser testing (Chrome, Safari, Firefox, Edge)
- [ ] Mobile device testing (iOS, Android)
- [ ] Audio latency testing
- [ ] Haptic feedback integration
- [ ] Accessibility testing (screen readers)
- [ ] Performance profiling
- [ ] User testing with 2-3 clinicians
- [ ] Bug fixes and polish
- [ ] Documentation updates

**Test Cases**:
1. Audio plays at correct cadence (±5ms accuracy)
2. Exercise stops precisely at duration limit
3. Voice prompts align with timing ("Halfway" at 50%)
4. Screen stays awake during exercise
5. Emergency stop works immediately
6. Chart notes save correctly to KV
7. Notes expire after 24 hours
8. HIPAA modal displays appropriately
9. Offline functionality (cached audio)
10. Rate limiting doesn't block legitimate use

**Estimated Time**: 1 week

---

### Phase 7: Merge to Main ⏳

**Tasks**:
- [ ] Final code review
- [ ] Update main README.md
- [ ] Create pull request
- [ ] Staging deployment test
- [ ] Merge to main branch
- [ ] Production deployment
- [ ] Monitor error logs
- [ ] User feedback collection

---

## 📊 Technical Specifications

### Audio System

**Web Audio API** (preferred over HTML5 `<audio>` tags):
- Precise timing (sub-millisecond accuracy)
- Low latency
- Programmatic control
- Works offline with Service Worker caching

**Voice Prompts** (MP3 format):
- 44.1 kHz sample rate
- 128 kbps bitrate
- Mono (not stereo - smaller file size)
- Normalized volume (-3 dB peak)
- Total file size: ~500 KB (all prompts combined)

**Metronome Beep**:
- 1000 Hz sine wave
- 50ms duration
- Fade in/out to avoid clicks

### Timer System

**requestAnimationFrame** for visual updates:
- Smooth progress bar animation
- 60 FPS rendering
- Synced with display refresh

**Web Audio scheduler** for audio events:
- Look-ahead scheduling (100ms window)
- Scheduled at precise audio context time
- No drift over long durations

### State Management

**localStorage** for session data (consistent with existing app):
```typescript
interface VORx1Session {
  targetSymbol: 'A' | 'X' | 'O'
  orientation: 'horizontal' | 'vertical'
  cadence: number // 60-120
  duration: number // 30-120
  audioType: 'voice' | 'beep' | 'silent'
  completedAt?: number
  symptomRating?: number
  notes?: string
}
```

**sessionStorage** for in-progress exercise:
- Current beat count
- Elapsed time
- Paused state (if pause feature added)

### API Integration

**POST /api/notes** (existing endpoint):
- Exercise chart notes use same 24-hour storage
- Same chartId format (6 alphanumeric)
- Same encryption (if Phase 2 of HIPAA guide implemented)
- Same audit logging

**New field in NoteData**:
```typescript
interface NoteData {
  narrative: string
  createdAt: number
  noteType?: 'evaluation' | 'exercise' // NEW - distinguish note types
  exerciseData?: VORx1Session // NEW - structured exercise data
}
```

---

## 🔒 Security & Compliance

### HIPAA Considerations

**PHI Handling**:
- Exercise notes are PHI-free by default (no patient identifiers)
- Clinician name is optional (can be omitted)
- Same 24-hour retention as evaluation notes
- Same encryption requirements (see SECURITY.md)

**User Consent**:
- Same HIPAA modal as EvalTab
- Disclaimer: "This is a clinical support tool, not a medical device"
- User acknowledges not to add patient identifiers

**Audit Logging** (if Phase 3 of HIPAA guide implemented):
```typescript
await logAuditEvent({
  eventType: 'CREATE',
  resourceType: 'ExerciseNote',
  resourceId: chartId,
  actorIp,
  actorUserAgent,
  success: true,
  metadata: {
    exerciseType: 'VORx1',
    duration: 60,
    cadence: 90
  }
})
```

### Regulatory Compliance

**FDA Medical Device Classification**:
- Current design: NOT a medical device (clinical support tool)
- Key factors:
  - ✅ Clinician sets all parameters
  - ✅ No diagnostic claims
  - ✅ No treatment recommendations
  - ✅ No automated adjustments
  - ✅ Documentation support only

**Language to Use**:
- ✅ "Guided exercise support"
- ✅ "Rehabilitation training tool"
- ✅ "Clinician-directed therapy"
- ✅ "Documentation assistance"

**Language to AVOID**:
- ❌ "Treats dizziness"
- ❌ "Improves balance"
- ❌ "Diagnoses vestibular disorders"
- ❌ "Optimizes therapy"

---

## 🎓 Clinical Context

### VOR × 1 Exercise Background

**Purpose**: Improve vestibulo-ocular reflex (VOR) gain for gaze stabilization during head movements.

**Indications**:
- Unilateral vestibular hypofunction (UVH)
- Bilateral vestibular hypofunction (BVH)
- Post-concussion syndrome with vestibular involvement
- Vestibular neuritis recovery phase
- Post-acoustic neuroma resection

**Contraindications**:
- Active BPPV (treat first with canalith repositioning)
- Unstable cervical spine
- Severe motion intolerance (start with lower cadence)
- Recent stroke (within 24 hours)
- Uncontrolled cardiovascular conditions

**Typical Dosage**:
- Frequency: 3-5 times per day
- Repetitions: 3 sets per session
- Cadence: Start 60-90 BPM, progress to 120+ BPM
- Duration: 30-60 seconds per set
- Rest: 30-60 seconds between sets
- Progression: Increase cadence or add distractions (walking, standing on foam)

**Expected Patient Response**:
- Mild dizziness (3-5/10) is therapeutic
- Severe symptoms (>7/10) indicate over-exertion
- Symptoms should resolve within 30-60 seconds
- Gradual improvement in tolerance over 2-4 weeks

---

## 🐛 Known Issues & Future Enhancements

### Known Issues (Phase 1)
- None yet - basic navigation complete

### Planned Enhancements (Post-MVP)
1. **Exercise Templates**
   - Save/load common protocols ("Post-Concussion", "UVL Standard")
   - Share templates between clinicians

2. **Multi-Exercise Sessions**
   - Chain exercises: VORx1 Horizontal → Rest → VORx1 Vertical → Rest
   - Total session timer

3. **Patient Mode** (Future - requires authentication)
   - QR code access (expires 24 hours)
   - Self-guided home exercises
   - Adherence tracking
   - Symptom logging

4. **Advanced Audio**
   - Customizable voice (male/female, language options)
   - Adjustable metronome pitch
   - Background music option

5. **Visual Enhancements**
   - Animated target (for VORx2 in future)
   - Customizable target size
   - High-contrast mode for low vision
   - Color-blind friendly options

6. **Analytics** (De-identified)
   - Average cadence progression over time
   - Symptom trend analysis
   - Session completion rates

7. **Additional Exercises**
   - Balance exercises (static/dynamic)
   - Habituation exercises
   - Adaptation exercises
   - Substitution exercises

---

## 📚 References

**Clinical Guidelines**:
1. Vestibular Rehabilitation for Peripheral Vestibular Hypofunction: An Evidence-Based Clinical Practice Guideline (APTA, 2016)
2. Clinical Practice Guideline: Benign Paroxysmal Positional Vertigo (AAO-HNS, 2017)
3. Vestibular Rehabilitation Therapy (VRT) for Unilateral Peripheral Vestibular Dysfunction (Cochrane Review, 2015)

**Technical Resources**:
1. Web Audio API Specification: https://www.w3.org/TR/webaudio/
2. Metronome implementation best practices: https://web.dev/audio-scheduling/
3. HIPAA Security Rule: https://www.hhs.gov/hipaa/for-professionals/security/index.html

---

## 📞 Support

**Questions or Issues**:
- Technical: dev@yourdomain.com
- Clinical: clinical@yourdomain.com
- Security/HIPAA: security@yourdomain.com

---

**Document Version**: 1.0
**Last Review**: 2025-10-26
**Next Review**: After Phase 6 completion
