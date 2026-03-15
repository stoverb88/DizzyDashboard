// references.ts
// Centralized evidence / citation mapping for Dizzy Dashboard.
//
// This does NOT change any UI by itself. It just provides a registry
// that components (ManeuversTab, OculomotorExam, DiagnosticsTab, HintsTab)
// can optionally read from when you're ready to show references/footers.

export type ReferenceId =
  | "R1"
  | "R2"
  | "R3"
  | "R4"
  | "R5"
  | "R6"
  | "R7"
  | "R8"
  | "R9"
  | "R10";

export interface Reference {
  id: ReferenceId;
  shortLabel: string;   // what to show inline, e.g. "BMJ – Vertigo"
  fullCitation: string; // full text for a references drawer / modal
  url?: string;         // optional direct link
  notes?: string;       // optional extra explanation
}

// -------------
// MASTER LIST
// -------------

export const references: Record<ReferenceId, Reference> = {
  R1: {
    id: "R1",
    shortLabel: "Northwestern Medicine – Why Do I Feel Dizzy?",
    fullCitation:
      "Northwestern Medicine. Why do I feel dizzy? HealthBeat. Accessed December 16, 2025. https://www.nm.org/healthbeat/healthy-tips/Why-Do-I-Feel-Dizzy",
    url: "https://www.nm.org/healthbeat/healthy-tips/Why-Do-I-Feel-Dizzy",
  },
  R2: {
    id: "R2",
    shortLabel: "StatPearls – Evaluation of the Dizzy and Unbalanced Patient",
    fullCitation:
      "Davis AJ, Pozun A. Evaluation of the dizzy and unbalanced patient. In: StatPearls [Internet]. StatPearls Publishing; 2024. Accessed December 16, 2025. https://www.ncbi.nlm.nih.gov/books/NBK589645/",
    url: "https://www.ncbi.nlm.nih.gov/books/NBK589645/",
  },
  R3: {
    id: "R3",
    shortLabel: "NeuroPT – After BPPV Repositioning (patient fact sheet)",
    fullCitation:
      "Lacko J. After BPPV repositioning. Academy of Neurologic Physical Therapy, Vestibular Special Interest Group. Accessed December 16, 2025. https://www.neuropt.org/docs/default-source/vestibular-sig/vsig-english-pt-fact-sheets/after-bppv-repositioning1ca035a5390366a68a96ff00001fc240.pdf",
    url: "https://www.neuropt.org/docs/default-source/vestibular-sig/vsig-english-pt-fact-sheets/after-bppv-repositioning1ca035a5390366a68a96ff00001fc240.pdf",
  },
  R4: {
    id: "R4",
    shortLabel: "Semicircular Canal – ScienceDirect Topics",
    fullCitation:
      "Semicircular canal. ScienceDirect Topics. Accessed December 16, 2025. https://www.sciencedirect.com/topics/immunology-and-microbiology/semicircular-canal",
    url: "https://www.sciencedirect.com/topics/immunology-and-microbiology/semicircular-canal",
  },
  R5: {
    id: "R5",
    shortLabel: "BMJ – Vertigo (10-minute consultation)",
    fullCitation:
      "Kanagalingam J, Miller S, Dorward N. Vertigo. BMJ. 2005;330(7504):1360. doi:10.1136/bmj.330.7504.1360",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC552814/",
  },
  R6: {
    id: "R6",
    shortLabel: "Modified Epley maneuver figure (ResearchGate)",
    fullCitation:
      "Modified Epley maneuver for treating right-sided BPPV [Figure]. ResearchGate. Accessed December 16, 2025. https://www.researchgate.net/figure/Modified-Epley-maneuver-for-treating-right-sided-BPPV_fig4_272710743",
    url: "https://www.researchgate.net/figure/Modified-Epley-maneuver-for-treating-right-sided-BPPV_fig4_272710743",
  },
  R7: {
    id: "R7",
    shortLabel: "Neurology – Predicting successful treatment in posterior-canal BPPV",
    fullCitation:
      "Oh HJ, Kim JS, Han BI, Kim HJ. Predicting a successful treatment in posterior canal benign paroxysmal positional vertigo. Neurology. 2007;68(15):1219-1222. doi:10.1212/01.wnl.0000259037.76469.e4",
    url: "https://www.neurology.org/doi/full/10.1212/01.wnl.0000259037.76469.e4",
  },
  R8: {
    id: "R8",
    shortLabel: "Goebel – Predictive Capability of Historical Data for Diagnosis of Dizziness",
    fullCitation:
      "Goebel JA, Sinks BC, Parker BE Jr, Richardson NT, Olowin AB, Chouhan N. Effectiveness of head-shake testing for diagnosis of vestibular system abnormalities. Otolaryngol Head Neck Surg. 2007;136(5):739-744. doi:10.1016/j.otohns.2006.12.003",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3543606/",
  },
  R9: {
    id: "R9",
    shortLabel: "Tarnutzer & Edlow – HINTS+ Critical Review (2023)",
    fullCitation:
      "Tarnutzer AA, Edlow JA. Bedside testing in acute vestibular syndrome—evaluating HINTS plus and beyond—a critical review. Audiol Res. 2023;13(5):670-692. doi:10.3390/audiolres13050059",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10514811/",
  },
  R10: {
    id: "R10",
    shortLabel: "Hopkins Medicine – Superior Canal Dehiscence Syndrome",
    fullCitation:
      "Johns Hopkins Medicine. Superior canal dehiscence syndrome (SCDS). Accessed December 16, 2025. https://www.hopkinsmedicine.org/health/conditions-and-diseases/superior-canal-dehiscence-syndrome-scds",
    url: "https://www.hopkinsmedicine.org/health/conditions-and-diseases/superior-canal-dehiscence-syndrome-scds",
  },
};

// -------------
// EVIDENCE MAP
// -------------

// High-level intent:
//   evidenceMap[tabId][cardKey] = ReferenceId[]
//
// `cardKey` doesn't have to match a specific component yet; Claude can
// adapt these keys to whatever config / card structure already exists
// in ManeuversTab.tsx, OculomotorExam.tsx, DiagnosticsTab.tsx, HintsTab.tsx.

export type TabId =
  | "ManeuversTab"
  | "OculomotorExam"
  | "DiagnosticsTab"
  | "HintsTab";

export type EvidenceMap = Record<TabId, Record<string, ReferenceId[]>>;

export const evidenceMap: EvidenceMap = {
  // -------------------
  // ManeuversTab.tsx
  // -------------------
  ManeuversTab: {
    // Posterior / horizontal / anterior canal BPPV maneuver cards
    posteriorCanalBPPVCard: ["R1", "R2", "R4", "R5", "R6", "R7"],
    horizontalCanalBPPVCard: ["R1", "R2", "R4", "R5", "R6", "R7"],
    anteriorCanalBPPVCard: ["R2", "R4", "R5", "R6", "R7"],

    // Interactive Epley trainer / canal simulation
    epleyTrainerCard: ["R1", "R2", "R4", "R5", "R6", "R7"],

    // Post-maneuver precautions / what to expect (same-day & short-term)
    postManeuverAdviceCard: ["R3"],

    // Recurrence + "don't self-treat" messaging
    recurrenceInfoCard: ["R3", "R7"],
  },

  // -------------------
  // OculomotorExam.tsx
  // -------------------
  OculomotorExam: {
    // Nystagmus pattern cards
    spontaneousNystagmusCard: ["R2", "R5"],
    gazeEvokedNystagmusCard: ["R2", "R5"],

    // Central oculomotor findings
    saccadesCard: ["R2", "R5"],
    smoothPursuitCard: ["R2", "R5"],
    convergenceCard: ["R2", "R5"],
    oknCard: ["R2", "R5"],

    // VOR / Head Impulse Test and central vs peripheral logic
    vorCancellationCard: ["R2", "R5", "R9"],
    headImpulseTestCard: ["R2", "R5", "R9"],

    // Mapping from abnormal findings to suspected conditions / rehab candidacy
    examFindingsToConditionsCard: ["R2", "R5", "R8"],
  },

  // -------------------
  // DiagnosticsTab.tsx
  // -------------------
  DiagnosticsTab: {
    bppvCard: ["R2", "R5", "R7"],

    menieresDiseaseCard: ["R2", "R5"],

    vestibularNeuritisCard: ["R1", "R2", "R5"],

    vestibularLabyrinthitisCard: ["R2", "R5"],

    vestibularMigraineCard: ["R1", "R2"],

    superiorCanalDehiscenceCard: ["R2", "R10"],

    pppdCard: ["R2", "R8"],

    bilateralVestibulopathyCard: ["R2", "R8"],
  },

  // -------------------
  // HintsTab.tsx
  // -------------------
  HintsTab: {
    // General explanation of HINTS (HIT, nystagmus, skew; central vs peripheral)
    hintsOverviewCard: ["R2", "R5", "R9"],

    // The HINTS / HINTS-Plus "accuracy" block that explicitly
    // talks about sensitivity/specificity and MRI comparison
    hintsAccuracyCard: ["R9"],
  },
};
