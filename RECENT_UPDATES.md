# Recent Updates - Dizzy Dashboard

**Date**: December 16, 2025
**Session Summary**: Mobile viewport fixes and AMA citation formatting

---

## 1. Fixed Mobile Viewport Issues on Invites Page

### Problem
The Invites Management page was loading zoomed in on mobile devices, cutting off content and requiring manual zoom adjustment. This did not occur on other admin pages (Users, Medical).

### Root Cause
- Horizontal scrolling filter buttons (6 buttons: ALL, PATIENT, CLINICIAN, ACTIVE, USED, EXPIRED) with `whiteSpace: 'nowrap'` created a combined minimum width (~600-700px) that forced mobile browsers to zoom out
- The page used a different UI pattern than other admin pages (horizontal scroll buttons vs. vertical dropdowns)

### Solution Implemented
**File**: `components/admin/InvitesManagement.tsx`

#### Changes:
1. **Made filter buttons wrap** (lines 232-275):
   - Changed from horizontal scroll to flex-wrap layout
   - Removed `overflowX: 'auto'`, `WebkitOverflowScrolling`, `scrollSnapType`
   - Added `flexWrap: 'wrap'` to allow buttons to stack on multiple rows
   - Removed `scrollSnapAlign` and `flexShrink: 0` from individual buttons

2. **Fixed container width** (line 183):
   - Set `maxWidth: '100%'` and `width: '100%'`
   - Added `boxSizing: 'border-box'` to include padding in width calculation

3. **Removed extra padding**:
   - Removed `padding: '0 4px'` from header container (line 191)
   - Removed `padding: '0 8px'` from filter tabs container (line 237)

4. **Restructured card layout** (lines 342-602):
   - Changed from two-column (left/right split) to single-column layout
   - Moved status badge and delete button from right side to inline at bottom
   - Made all content left-aligned and compact

5. **Optimized copy buttons** (lines 420-487):
   - Made "Copy Token" and "Copy URL" buttons compact and inline
   - Reduced padding to `6px 10px`
   - Reduced font size to `0.75rem`
   - Icon size `14px`
   - Buttons sit side-by-side instead of full width

### Results
✅ Page loads at correct zoom level on mobile
✅ Filter buttons wrap to multiple rows naturally
✅ No wasted white space on right side
✅ Consistent responsive behavior across all admin pages
✅ Clean, compact mobile layout

---

## 2. Updated All References to AMA Citation Format

### Problem
The 10 references in the app were using informal citation styles with explanatory text mixed in, not following professional academic standards.

### Solution Implemented
**File**: `lib/references.ts`

Converted all `fullCitation` fields to proper AMA (American Medical Association) format while preserving all other fields (`id`, `shortLabel`, `url`, `notes`) and the complete `evidenceMap`.

#### AMA Format Applied:

**Journal Articles** (R5, R7, R8, R9):
```
Author(s). Title. Journal Abbrev. Year;volume(issue):pages. doi:xxxxx
```

**Websites** (R1, R3, R4, R10):
```
Organization/Author. Title. Website Name. Accessed Month Day, Year. URL
```

**Book Chapters** (R2):
```
Author(s). Chapter title. In: Book Title [Internet]. Publisher; Year. Accessed Month Day, Year. URL
```

**Figures** (R6):
```
Title [Figure]. Source. Accessed Month Day, Year. URL
```

#### Updated Citations:

**R1** - Northwestern Medicine (Website):
```
Northwestern Medicine. Why do I feel dizzy? HealthBeat. Accessed December 16, 2025. https://www.nm.org/healthbeat/healthy-tips/Why-Do-I-Feel-Dizzy
```

**R2** - StatPearls (Book Chapter):
```
Davis AJ, Pozun A. Evaluation of the dizzy and unbalanced patient. In: StatPearls [Internet]. StatPearls Publishing; 2024. Accessed December 16, 2025. https://www.ncbi.nlm.nih.gov/books/NBK589645/
```

**R3** - NeuroPT (Patient Fact Sheet):
```
Lacko J. After BPPV repositioning. Academy of Neurologic Physical Therapy, Vestibular Special Interest Group. Accessed December 16, 2025. https://www.neuropt.org/docs/default-source/vestibular-sig/vsig-english-pt-fact-sheets/after-bppv-repositioning1ca035a5390366a68a96ff00001fc240.pdf
```

**R4** - ScienceDirect Topics (Website):
```
Semicircular canal. ScienceDirect Topics. Accessed December 16, 2025. https://www.sciencedirect.com/topics/immunology-and-microbiology/semicircular-canal
```

**R5** - BMJ (Journal Article):
```
Kanagalingam J, Miller S, Dorward N. Vertigo. BMJ. 2005;330(7504):1360. doi:10.1136/bmj.330.7504.1360
```

**R6** - ResearchGate (Figure):
```
Modified Epley maneuver for treating right-sided BPPV [Figure]. ResearchGate. Accessed December 16, 2025. https://www.researchgate.net/figure/Modified-Epley-maneuver-for-treating-right-sided-BPPV_fig4_272710743
```

**R7** - Neurology (Journal Article):
```
Oh HJ, Kim JS, Han BI, Kim HJ. Predicting a successful treatment in posterior canal benign paroxysmal positional vertigo. Neurology. 2007;68(15):1219-1222. doi:10.1212/01.wnl.0000259037.76469.e4
```

**R8** - Otolaryngol Head Neck Surg (Journal Article):
```
Goebel JA, Sinks BC, Parker BE Jr, Richardson NT, Olowin AB, Chouhan N. Effectiveness of head-shake testing for diagnosis of vestibular system abnormalities. Otolaryngol Head Neck Surg. 2007;136(5):739-744. doi:10.1016/j.otohns.2006.12.003
```

**R9** - Audiology Research (Journal Article):
```
Tarnutzer AA, Edlow JA. Bedside testing in acute vestibular syndrome—evaluating HINTS plus and beyond—a critical review. Audiol Res. 2023;13(5):670-692. doi:10.3390/audiolres13050059
```

**R10** - Johns Hopkins Medicine (Website):
```
Johns Hopkins Medicine. Superior canal dehiscence syndrome (SCDS). Accessed December 16, 2025. https://www.hopkinsmedicine.org/health/conditions-and-diseases/superior-canal-dehiscence-syndrome-scds
```

### Results
✅ All 10 references now follow professional AMA citation format
✅ Proper journal abbreviations used
✅ DOIs included where available
✅ Consistent access dates for web sources
✅ References ready for academic/clinical publication standards

---

## Files Modified

1. `components/admin/InvitesManagement.tsx`
   - Fixed mobile viewport and layout issues
   - Optimized button sizes and positioning

2. `lib/references.ts`
   - Converted all 10 references to AMA format
   - Maintained all reference mappings in `evidenceMap`

---

## Next Steps / Future Considerations

- Consider implementing the References Drawer component to display these citations to users
- All reference mappings in `evidenceMap` are preserved and ready to use
- Mobile-first responsive design patterns now consistent across admin pages
