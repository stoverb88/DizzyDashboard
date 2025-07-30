import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { OptionBubbles } from "./ui/OptionBubbles";
import { CustomDropdown } from "./ui/CustomDropdown";

const steps = [
  "Red Flag Screening",
  "History of Present Illness",
  "Hearing & Ear Health",
  "Associated Symptoms",
  "Oculomotor Exam",
  "Positional Testing",
  "Treatment Provided",
  "Clinical Snapshot",
  "Plan of Care",
  "Narrative Summary",
  "Export"
];

const yesNoOptions = [ { value: "Yes", label: "Yes" }, { value: "No", label: "No" }];
const sideOptions = [ { value: "Left", label: "Left" }, { value: "Right", label: "Right" }, { value: "Bilateral", label: "Bilateral" }];
const symptomTypeOptions = [ 
  { value: "Vertigo (spinning)", label: "Vertigo (spinning)" }, 
  { value: "Faint (Pre-Syncope)", label: "Faint (Pre-Syncope)" }, 
  { value: "Imbalance", label: "Imbalance" }
];
const durationOptions = [ { value: "seconds", label: "Seconds" }, { value: "minutes", label: "Minutes" }, { value: "hours", label: "Hours" }, { value: "days", label: "Days" }, { value: "weeks", label: "Weeks" }];
const frequencyOptions = [ { value: "Episodic", label: "Episodic" }, { value: "Constant", label: "Constant" }];
const onsetOptions = [ { value: "Abrupt", label: "Abrupt" }, { value: "Gradual", label: "Gradual" }];
const onsetTimingOptions = [ 
  { value: "1-3 days ago", label: "1-3 days ago" }, 
  { value: "4-7 days ago", label: "4-7 days ago" }, 
  { value: "1-2 weeks ago", label: "1-2 weeks ago" }, 
  { value: "3-4 weeks ago", label: "3-4 weeks ago" }, 
  { value: "1-2 months ago", label: "1-2 months ago" }, 
  { value: "3-6 months ago", label: "3-6 months ago" }, 
  { value: "More than 6 months ago", label: "More than 6 months ago" }
];
const triggerOptions = [ { value: "Spontaneous", label: "Spontaneous" }, { value: "Positional Changes", label: "Positional Changes" }, { value: "Head Motion", label: "Head Motion" }, { value: "Pressure Changes", label: "Pressure Changes" }, { value: "Other", label: "Other" }];

const planOfCareOptions = [
  { value: "peripheral_education", label: "Suspect peripheral vestibular cause (<strong>Neuritis, Labrynthitis, Bilateral Vestibulopathy</strong>). Patient Education on symptom management and referral to outpatient vestibular therapy services for further followup care" },
  { value: "peripheral_crm", label: "Suspect peripheral vestibular cause (<strong>BPPV</strong>). Perform Canalith repositioning manuevers. Patient Education on symptom management and referral to outpatient vestibular therapy services for further followup care if symptoms persist" },
  { value: "mixed_lifestyle", label: "Suspect peripheral/central cause (<strong>Meniere's, Vestibular Migraine, SCD, PLF, PPPD</strong>). Patient Education on lifestyle modification and medication management, referral to PCP or ENT for further followup care" },
  { value: "central_workup", label: "Suspect central cause (<strong>CVA, Other Central/Vascular Pathology</strong>). Recommend further medical workup based on severity or variability in symptoms (RED Flags)" },
];

const treatmentManeuverOptions = [
    { value: "modified_epley", label: "Modified Epley maneuver (Posterior Canal BPPV)" },
    { value: "gufoni_h_canalithiasis", label: "Gufoni maneuver (Horizontal Canalithiasis BPPV)" },
    { value: "gufoni_h_cupulolithiasis", label: "Gufoni maneuver (Horizontal Cupulolithiasis)" },
    { value: "deep_head_hang", label: "Deep head hang maneuver (Anterior Canalithiasis BPPV)" },
];

const treatmentRepetitionOptions = [ { value: "1", label: "1" }, { value: "2", label: "2" }, { value: "3", label: "3" }];
const treatmentSideOptions = [ { value: "Left", label: "Left" }, { value: "Right", label: "Right" }];
const treatmentToleranceOptions = [ { value: "well", label: "Well" }, { value: "with difficulty/modifications", label: "With difficulty/modifications" }];

const planOfCareNarrativeMap = {
  peripheral_education: "Plan of Care: Suspect peripheral vestibular cause. Patient was educated on symptom management strategies and referred to outpatient vestibular therapy services for further follow-up care.",
  peripheral_crm: "Plan of Care: Suspect peripheral vestibular cause. Canalith repositioning maneuvers were performed.",
  mixed_lifestyle: "Plan of Care: Suspect peripheral/central cause. Patient was educated on lifestyle modifications and medication management. A referral to their Primary Care Provider or an ENT specialist will be made for further follow-up care.",
  central_workup: "Plan of Care: Suspect central cause. It is recommended that the patient undergoes further medical workup based on the severity and variability of their symptoms, including the presence of red flags.",
};

const treatmentNarrativeMap = {
    modified_epley: {
        maneuver: "Modified Epley maneuver",
        condition: "to address posterior canal BPPV"
    },
    gufoni_h_canalithiasis: {
        maneuver: "Gufoni maneuver",
        condition: "to address horizontal canalithiasis BPPV"
    },
    gufoni_h_cupulolithiasis: {
        maneuver: "Gufoni maneuver",
        condition: "to address horizontal cupulolithiasis to convert to canalithiasis and treat remaining BPPV"
    },
    deep_head_hang: {
        maneuver: "Deep head hang maneuver",
        condition: "to address anterior canalithiasis BPPV"
    },
};

const associatedSymptomsList = [
    { category: "Vestibular", items: ["Nausea", "Vomiting", "Oscillopsia (visual world moving)", "Unsteadiness walking"] },
    { category: "Neurologic", items: ["Headache", "Visual loss", "Sensory disturbances", "Hiccups", "Facial numbness"] },
    { category: "Migraine-Associated", items: ["Photophobia (light sensitivity)", "Phonophobia (sound sensitivity)", "Osmophobia (smell sensitivity)", "Visual aura", "Unilateral headache"] },
];

const redFlagList = [
  { id: "doubleVision", label: "Double vision" },
  { id: "slurredSpeech", label: "Slurred speech or trouble finding words" },
  { id: "difficultySwallowing", label: "Difficulty swallowing" },
  { id: "hiccups", label: "Uncontrollable hiccups" },
  { id: "weaknessOrNumbness", label: "Weakness or numbness on one side" },
  { id: "incoordination", label: "Incoordination" },
  { id: "lostConsciousness", label: "Loss of consciousness" },
  { id: "chestPain", label: "Chest Pain" },
];

// Diagnostic criteria data from DiagnosticsTab
const diagnosticCriteria = [
  {
    title: "BPPV",
    color: "#3B82F6",
    bgColor: "#EFF6FF",
    criteria: [
      "Episodes of vertigo or dizziness triggered by a change in position, typically lying down or rolling onto the side from a supine position",
      "Attacks last < 1 min",
      "The Dix-Hallpike test produces torsional and vertical nystagmus towards the affected ear after a few seconds."
    ],
    treatment: [
      "Repositioning maneuvers (e.g., Epley, Semont, Lempert for horizontal canal) are first-line treatment.",
      "Education on avoiding provoking positions for 24–48 hours post-maneuver (depending on protocol).",
      "Follow-up reassessment in 1 week if symptoms persist.",
      "Rarely, canalith jam or cupulolithiasis may require modified maneuvers or referral."
    ]
  },
  {
    title: "Meniere disease",
    color: "#0891B2",
    bgColor: "#F0F9FF",
    criteria: [
      "Two or more episodes of spontaneous vertigo lasting 30 minutes to 12 hours",
      "Low- to medium-frequency sensorineural hearing loss",
      "Unilateral tinnitus, ear fullness, and hearing loss in the affected ear may fluctuate"
    ],
    treatment: [
      "Dietary modification (low-sodium, caffeine/alcohol reduction).",
      "Vestibular suppressants (e.g., meclizine, diazepam) during acute attacks.",
      "Diuretics to reduce endolymphatic pressure.",
      "Vestibular rehabilitation therapy (VRT) for chronic imbalance.",
      "Intratympanic steroid or gentamicin injections, or surgical options in refractory cases."
    ]
  },
  {
    title: "Vestibular neuritis",
    color: "#059669",
    bgColor: "#ECFDF5",
    criteria: [
      "Sudden onset of vertigo lasting at least 24 hours, often accompanied by oscillopsia, nausea, and a tendency to fall",
      "Absence of cochlear symptoms",
      "Absence of associated neurological symptoms and signs"
    ],
    treatment: [
      "Corticosteroids within 72 hours of symptom onset may improve recovery.",
      "Vestibular suppressants (short-term, during acute phase only).",
      "Begin vestibular rehab therapy (VRT) early for compensation.",
      "Educate on gradual return to activity and importance of motion exposure."
    ]
  },
  {
    title: "Vestibular labyrinthitis",
    color: "#A855F7",
    bgColor: "#F3E8FF",
    criteria: [
      "Vestibular neuritis plus hearing loss",
      "occurs commonly after a viral illness such as a URI or otitis media"
    ],
    treatment: [
      "Similar to vestibular neuritis, but also includes hearing loss.",
      "Treat with antibiotics/antivirals if infectious etiology suspected.",
      "Corticosteroids may reduce inflammation.",
      "VRT post-acute phase for persistent dizziness.",
      "Audiology referral for hearing management."
    ]
  },
  {
    title: "Vestibular migraine",
    color: "#D97706",
    bgColor: "#FFFBEB",
    criteria: [
      "Five or more episodes of vertigo or dizziness with nausea",
      "Symptoms of moderate-severe intensity lasting 5 minutes to 72 hours.",
      "At least 50% of the episodes should be accompanied by migraine features such as unilateral headache, photophobia, phonophobia, or aura.",
      "Current or previous history of migraine"
    ],
    treatment: [
      "Migraine lifestyle management: sleep, hydration, diet consistency.",
      "Preventive medications: beta-blockers, tricyclics, calcium channel blockers.",
      "Abortive medications for headache phase.",
      "VRT if motion sensitivity or imbalance persists.",
      "Patient education: not all episodes have headache; triggers vary."
    ]
  }
];

// Abnormal findings data from OculomotorExam
const abnormalFindingsData = [
  {
    title: "Spontaneous Nystagmus (Abnormal)",
    color: "#D97706",
    bgColor: "#FFFBEB",
    conditions: "Vertical nystagmus, torsion nystagmus, or nystagmus which changes in direction on eccentric gaze suggests central causes like brainstem or cerebellar lesions. Horizontal unidirectional nystagmus typically indicates peripheral vestibular dysfunction.",
    ptConsiderations: "Central causes require medical referral; peripheral causes may benefit from vestibular rehabilitation, gaze stabilization exercises, and habituation training."
  },
  {
    title: "Gaze-Evoked Nystagmus (Abnormal)",
    color: "#0891B2",
    bgColor: "#F0F9FF",
    conditions: "In a peripheral lesion, nystagmus should be direction fixed in nature. According to Alexander's law, the nystagmus associated with peripheral lesions becomes more pronounced with gaze toward the side of the fast-beating component; with central nystagmus, the direction of the fast component is directed toward the side of gaze.\n\nKey Distinction:\n• Direction-fixed gaze-evoked nystagmus = Peripheral vestibular lesion\n• Direction-changing gaze-evoked nystagmus (beats in direction of gaze) = Central pathology",
    ptConsiderations: "Direction-fixed: Good candidate for vestibular rehabilitation including gaze stabilization exercises, adaptation training, and habituation protocols\n\nDirection-changing: Requires medical referral for central pathology evaluation before proceeding with any vestibular rehabilitation"
  },
  {
    title: "Abnormal Saccadic Eye Movements",
    color: "#059669",
    bgColor: "#ECFDF5",
    conditions: "Versional dysfunction and ocular misalignment can occur, particularly after concussion or stroke. May indicate brainstem pathology or oculomotor nerve dysfunction.",
    ptConsiderations: "Vision therapy focusing on saccadic training, reading rehabilitation, and computer work tolerance. Important for return-to-work/school planning."
  },
  {
    title: "Abnormal VOR Cancellation",
    color: "#A855F7",
    bgColor: "#F3E8FF",
    conditions: "Indicates difficulty suppressing the vestibulo-ocular reflex, often seen in central vestibular disorders or cerebellar dysfunction.",
    ptConsiderations: "Requires adaptation exercises, smooth pursuit training, and may need occupational therapy referral for functional visual tasks."
  },
  {
    title: "Abnormal Head Impulse Test (HIT)",
    color: "#3B82F6",
    bgColor: "#EFF6FF",
    conditions: "A positive test indicates disruption to the vestibulo-ocular reflex with corrective saccades, typically indicating unilateral peripheral vestibular loss. Has 90-99% specificity for peripheral vestibular disease.",
    ptConsiderations: "Strong candidate for vestibular rehabilitation including gaze stabilization exercises, balance training, and habituation protocols."
  },
  {
    title: "Positive Test of Skew",
    color: "#DC2626",
    bgColor: "#FEF2F2",
    conditions: "Vertical ocular misalignment suggesting brainstem pathology, particularly in the brainstem tegmentum. Part of the HINTS examination for distinguishing central from peripheral vestibular disorders.",
    ptConsiderations: "Requires immediate medical referral as it suggests central pathology. Physical therapy should be deferred until medical clearance."
  }
];

const oculomotorExamQuestions = [
    { id: "spontaneousNystagmus", label: "Spontaneous Nystagmus", options: ["None", "Horizontal", "Vertical", "Torsional"] },
    { id: "gazeEvokedNystagmus", label: "Gaze-Evoked Nystagmus", options: ["None", "Direction-Fixed (Peripheral)", "Direction-Changing (Central)"] },
    { id: "saccadicEyeMovements", label: "Saccadic Eye Movements", options: ["Normal", "Hypermetric (Overshoot)", "Hypometric (Undershoot)"] },
    { id: "vorCancellation", label: "VOR Cancellation", options: ["Normal", "Impaired (Corrective Saccades)"] },
    { id: "headImpulseTest", label: "Head Impulse Test (HIT)", options: ["Normal", "Abnormal (Corrective Saccade)"] },
    { id: "testOfSkew", label: "Test of Skew", options: ["Negative", "Positive (Vertical Realignment)"] },
];

const positionalTestingQuestions = [
    { id: "dixHallpikeLeft", label: "Dix-Hallpike Left", options: ["Not Performed", "Negative", "Positive"] },
    { id: "dixHallpikeRight", label: "Dix-Hallpike Right", options: ["Not Performed", "Negative", "Positive"] },
    { id: "supineRollLeft", label: "Supine Roll Test Left", options: ["Not Performed", "Negative", "Positive"] },
    { id: "supineRollRight", label: "Supine Roll Test Right", options: ["Not Performed", "Negative", "Positive"] },
];

// Define the FormData type
interface FormData {
  redFlags: {
    doubleVision: boolean;
    slurredSpeech: boolean;
    difficultySwallowing: boolean;
    hiccups: boolean;
    weaknessOrNumbness: boolean;
    incoordination: boolean;
    lostConsciousness: boolean;
    chestPain: boolean;
  };
  hearingChanges: string;
  hearingLoss: string;
  hearingSide: string;
  tinnitus: string;
  tinnitusType: string;
  tinnitusGradual: string;
  audiogram: string;
  earFullness: string;
  earFullnessSide: string;
  mri: boolean;
  ctScan: boolean;
  smoke: string;
  drink: string;
  onsetDate: string;
  onsetType: string;
  activity: string;
  symptomType: string;
  trigger: string;
  triggerOther: string;
  worseWith: string[];
  symptomFrequency: string;
  episodeDuration: string;
  episodeDurationSpecific: string;
  spontaneousVsTriggered: string;
  dixHallpikeResult: string;
  orthostaticVitals: string;
  associatedSymptoms: string[];
  oscillopsia: boolean;
  tendencyToFall: boolean;
  nausea: boolean;
  vomiting: boolean;
  orthostaticBP: string;
  chestPainDetails: string;
  palpitations: boolean;
  boneConduction: boolean;
  soundInducedVertigo: boolean;
  pulsatileTinnitus: boolean;
  autophony: boolean;
  barotrauma: boolean;
  viralIllness: boolean;
  functionalImpairment: string;
  visualStimuli: boolean;
  darknessWorse: boolean;
  unevenGroundWorse: boolean;
  planOfCare: string;
  treatmentManeuver: string;
  treatmentRepetitions: string;
  treatmentSide: string;
  treatmentTolerance: string;
  chartId: string;
  oculomotorExam: {
    spontaneousNystagmus: string;
    gazeEvokedNystagmus: string;
    saccadicEyeMovements: string;
    vorCancellation: string;
    headImpulseTest: string;
    testOfSkew: string;
  };
  positionalTesting: {
    dixHallpikeLeft: string;
    dixHallpikeRight: string;
    supineRollLeft: string;
    supineRollRight: string;
  };
}

// Utility function to strip descriptive text in parentheses for clinical documentation
const stripDescriptors = (text: string): string => {
  if (!text) return '';
  return text.replace(/\s*\([^)]*\)/g, '').trim();
};

export function EvalTab() {
  const [currentStep, setCurrentStep] = useState(() => {
    // Load saved step position from localStorage (for seamless tab switching)
    if (typeof window !== 'undefined') {
      const savedStep = localStorage.getItem('evalCurrentStep');
      if (savedStep) {
        const stepNum = parseInt(savedStep, 10);
        // Validate step is within bounds
        if (stepNum >= 0 && stepNum < 11) { // 0-10 are valid steps
          return stepNum;
        }
      }
    }
    return 0; // Default to Red Flag Screening
  });
  const [editableNarrative, setEditableNarrative] = useState('');
  const [showHipaaModal, setShowHipaaModal] = useState(false);
  const [hasSeenHipaaAfterReset, setHasSeenHipaaAfterReset] = useState(false);
  const [hasReset, setHasReset] = useState(() => {
    // Load reset state from localStorage
    if (typeof window !== 'undefined') {
      const savedReset = localStorage.getItem('evalHasReset');
      return savedReset === 'true';
    }
    return false;
  });
  
  // Initialize formData with localStorage if available
  const [formData, setFormData] = useState<FormData>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vestibularFormData');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Error parsing saved form data:', e);
        }
      }
    }
    return {
      redFlags: {
        doubleVision: false,
        slurredSpeech: false,
        difficultySwallowing: false,
        hiccups: false,
        weaknessOrNumbness: false,
        incoordination: false,
        lostConsciousness: false,
        chestPain: false,
      },
      hearingChanges: "", hearingLoss: "", hearingSide: "", tinnitus: "", tinnitusType: "", tinnitusGradual: "", audiogram: "", earFullness: "", earFullnessSide: "", mri: false, ctScan: false, smoke: "", drink: "", onsetDate: "", onsetType: "", activity: "", symptomType: "", trigger: "", triggerOther: "", worseWith: [] as string[], symptomFrequency: "", episodeDuration: "", episodeDurationSpecific: "", spontaneousVsTriggered: "", dixHallpikeResult: "", orthostaticVitals: "", associatedSymptoms: [] as string[], oscillopsia: false, tendencyToFall: false, nausea: false, vomiting: false, orthostaticBP: "", chestPainDetails: "", palpitations: false, boneConduction: false, soundInducedVertigo: false, pulsatileTinnitus: false, autophony: false, barotrauma: false, viralIllness: false, functionalImpairment: "", visualStimuli: false, darknessWorse: false, unevenGroundWorse: false,
      planOfCare: "",
      treatmentManeuver: "",
      treatmentRepetitions: "1",
      treatmentSide: "",
      treatmentTolerance: "",
      chartId: "",
      oculomotorExam: {
        spontaneousNystagmus: "", gazeEvokedNystagmus: "", saccadicEyeMovements: "", vorCancellation: "", headImpulseTest: "", testOfSkew: ""
      },
      positionalTesting: {
        dixHallpikeLeft: "Not Performed", dixHallpikeRight: "Not Performed", supineRollLeft: "Not Performed", supineRollRight: "Not Performed"
      }
    };
  });
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [isUploading, setIsUploading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeSection, setActiveSection] = useState<'summary' | 'references'>('summary');

  // Mobile detection with proper hydration handling
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Save to localStorage whenever formData changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vestibularFormData', JSON.stringify(formData));
    }
  }, [formData]);

  // Save currentStep to localStorage for seamless tab switching
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('evalCurrentStep', currentStep.toString());
    }
  }, [currentStep]);

  // Save hasReset state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('evalHasReset', hasReset.toString());
    }
  }, [hasReset]);

  // Function to clear form data (called from parent component when logo is clicked)
  const resetFormData = () => {
    console.log('Reset function called - setting HIPAA flags');
    // Set reset flag to trigger HIPAA modal on next narrative visit
    setHasReset(true);
    setHasSeenHipaaAfterReset(false);
    setEditableNarrative('');
    
    const initialData: FormData = {
      redFlags: {
        doubleVision: false,
        slurredSpeech: false,
        difficultySwallowing: false,
        hiccups: false,
        weaknessOrNumbness: false,
        incoordination: false,
        lostConsciousness: false,
        chestPain: false,
      },
      hearingChanges: "", hearingLoss: "", hearingSide: "", tinnitus: "", tinnitusType: "", tinnitusGradual: "", audiogram: "", earFullness: "", earFullnessSide: "", mri: false, ctScan: false, smoke: "", drink: "", onsetDate: "", onsetType: "", activity: "", symptomType: "", trigger: "", triggerOther: "", worseWith: [] as string[], symptomFrequency: "", episodeDuration: "", episodeDurationSpecific: "", spontaneousVsTriggered: "", dixHallpikeResult: "", orthostaticVitals: "", associatedSymptoms: [] as string[], oscillopsia: false, tendencyToFall: false, nausea: false, vomiting: false, orthostaticBP: "", chestPainDetails: "", palpitations: false, boneConduction: false, soundInducedVertigo: false, pulsatileTinnitus: false, autophony: false, barotrauma: false, viralIllness: false, functionalImpairment: "", visualStimuli: false, darknessWorse: false, unevenGroundWorse: false,
      planOfCare: "",
      treatmentManeuver: "",
      treatmentRepetitions: "1",
      treatmentSide: "",
      treatmentTolerance: "",
      chartId: "",
      oculomotorExam: {
        spontaneousNystagmus: "", gazeEvokedNystagmus: "", saccadicEyeMovements: "", vorCancellation: "", headImpulseTest: "", testOfSkew: ""
      },
      positionalTesting: {
        dixHallpikeLeft: "Not Performed", dixHallpikeRight: "Not Performed", supineRollLeft: "Not Performed", supineRollRight: "Not Performed"
      }
    };
    setFormData(initialData);
    setCurrentStep(0);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vestibularFormData');
      localStorage.removeItem('evalCurrentStep'); // Clear saved step position on reset
      // Don't remove evalHasReset here - we want it to persist until modal is shown
    }
  };

  // Initialize editable narrative when reaching step 9
  useEffect(() => {
    if (currentStep === 9 && !editableNarrative) {
      setEditableNarrative(generateNarrative());
    }
  }, [currentStep, formData]);

  // Show HIPAA modal on first narrative visit after reset
  useEffect(() => {
    console.log('HIPAA Modal Check:', { currentStep, hasReset, hasSeenHipaaAfterReset });
    if (currentStep === 9 && hasReset && !hasSeenHipaaAfterReset) {
      console.log('Showing HIPAA modal');
      setShowHipaaModal(true);
    }
  }, [currentStep, hasReset, hasSeenHipaaAfterReset]);

  // Expose resetFormData to parent component
  useEffect(() => {
    (window as any).resetEvalForm = resetFormData;
    return () => {
      delete (window as any).resetEvalForm;
    };
  }, []);

  const generateChartId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  const updateFormData = (field: string, value: any, section: string | null = null) => {
    if (section) {
      setFormData((prev: FormData) => ({ ...prev, [section]: { ...(prev as any)[section], [field]: value } }));
    } else {
      setFormData((prev: FormData) => ({ ...prev, [field]: value }));
    }

    if (field === 'planOfCare' && !formData.chartId) {
      setFormData((prev: FormData) => ({ ...prev, chartId: generateChartId() }));
    }
  };

  const updateArrayField = (field: string, value: string, checked: boolean) => {
    setFormData((prev: FormData) => {
      const currentArray = (prev as any)[field] || [];
      if (checked) {
        return { ...prev, [field]: [...currentArray, value] };
      } else {
        return { ...prev, [field]: currentArray.filter((item: string) => item !== value) };
      }
    });
  };

  const handleHearNote = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const narrativeText = editableNarrative || generateNarrative();
    const utterance = new SpeechSynthesisUtterance(narrativeText);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleCopyNote = () => {
    const narrativeText = editableNarrative || generateNarrative();
    navigator.clipboard.writeText(narrativeText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const generateNarrative = () => {
    const { redFlags, onsetType, symptomType, trigger, symptomFrequency, episodeDuration, hearingChanges, hearingLoss, hearingSide, tinnitus, tinnitusType, earFullness, associatedSymptoms, oculomotorExam, positionalTesting, planOfCare, treatmentManeuver, treatmentRepetitions, treatmentSide, treatmentTolerance } = formData;
    let narrative = "Patient presenting with complaints of ";
    if (onsetType) narrative += `${onsetType.toLowerCase()} onset of `; else narrative += "(onset type) ";
    if (symptomType) {
      const cleanedSymptoms = symptomType.split(',').map(s => stripDescriptors(s.trim())).join(', ').toLowerCase();
      narrative += `${cleanedSymptoms}`;
    } else {
      narrative += "(type of symptoms)";
    }
    if (formData.onsetDate) narrative += ` that began ${formData.onsetDate}. `; else narrative += ". ";
    if (trigger) {
      const cleanedTriggers = trigger.split(',').map(t => stripDescriptors(t.trim())).join(', ').toLowerCase();
      let triggerText = cleanedTriggers;
      
      // Add custom "Other" trigger if specified
      if (trigger.includes('Other') && formData.triggerOther) {
        triggerText = triggerText.replace('other', formData.triggerOther.toLowerCase());
      }
      
      if (symptomFrequency === 'Constant') {
        narrative += `These symptoms are worsened by ${triggerText} `;
      } else {
        narrative += `These symptoms are triggered by ${triggerText} `;
      }
    } else {
      if (symptomFrequency === 'Constant') {
        narrative += "These symptoms are worsened by (factors) ";
      } else {
        narrative += "These symptoms are triggered by (trigger) ";
      }
    }
    
    // Handle symptom frequency and duration
    if (symptomFrequency === 'Constant') {
      narrative += "with constant symptoms.";
    } else if (symptomFrequency === 'Episodic' && episodeDuration) {
      const durations = episodeDuration.split(',');
      if (durations.length > 1) {
        // Create range from first to last selected duration
        const durationOrder = ['seconds', 'minutes', 'hours', 'days', 'weeks'];
        const selectedIndices = durations.map(d => durationOrder.indexOf(d.toLowerCase())).filter(i => i !== -1).sort((a, b) => a - b);
        if (selectedIndices.length > 1) {
          narrative += `with episodic symptoms that last for ${durationOrder[selectedIndices[0]]} to ${durationOrder[selectedIndices[selectedIndices.length - 1]]}.`;
        } else {
          narrative += `with episodic symptoms that last for ${durations.join(', ').toLowerCase()}.`;
        }
      } else {
        narrative += `with episodic symptoms that last for ${episodeDuration.toLowerCase()}.`;
      }
    } else if (symptomFrequency === 'Episodic') {
      narrative += "with episodic symptoms of unspecified duration.";
    } else if (episodeDuration) {
      // Fallback for legacy data without frequency
      const durations = episodeDuration.split(',');
      if (durations.length > 1) {
        const durationOrder = ['seconds', 'minutes', 'hours', 'days', 'weeks'];
        const selectedIndices = durations.map(d => durationOrder.indexOf(d.toLowerCase())).filter(i => i !== -1).sort((a, b) => a - b);
        if (selectedIndices.length > 1) {
          narrative += `and last for ${durationOrder[selectedIndices[0]]} to ${durationOrder[selectedIndices[selectedIndices.length - 1]]}.`;
        } else {
          narrative += `and last for ${durations.join(', ').toLowerCase()}.`;
        }
      } else {
        narrative += `and last for ${episodeDuration.toLowerCase()}.`;
      }
    } else {
      narrative += "and last for (duration to be specified).";
    }
    
    const redFlagLabels = {
        doubleVision: "double vision",
        slurredSpeech: "slurred speech or trouble finding words",
        difficultySwallowing: "difficulty swallowing",
        hiccups: "uncontrollable hiccups",
        weaknessOrNumbness: "weakness or numbness on one side",
        incoordination: "incoordination",
        lostConsciousness: "loss of consciousness",
        chestPain: "chest pain",
    };

    const selectedRedFlags = Object.entries(redFlags)
      .filter(([, value]) => value === true)
      .map(([key]) => redFlagLabels[key as keyof typeof redFlagLabels]);
    
    narrative += "\n\n";
    if (selectedRedFlags.length === 0) narrative += "Patient screening completed for neurologic and cardiovascular red flags, no concerns reported."; else narrative += "Patient screened for neurologic and cardiovascular red flags and reports the following concerning symptoms that will require further medical evaluation: " + selectedRedFlags.join(', ') + ".";
    narrative += "\n\n";
    if (hearingChanges === "No") narrative += "Patient denies any changes to hearing, denies tinnitus, denies aural fullness/pressure and reports that ear health is generally good.";
    else if (hearingChanges === "Yes") {
      narrative += "Patient reports the following ear related symptoms:\n";
      if (hearingLoss === "Yes") narrative += `- Hearing Loss: Yes, on the ${hearingSide.toLowerCase()} side.\n`; else if (hearingLoss === "No") narrative += "- Hearing Loss: No.\n";
      if (tinnitus && tinnitus !== "None") {
        narrative += `- Tinnitus: Yes, on the ${tinnitus.toLowerCase()} side.`;
        if (tinnitusType) narrative += ` Character: ${tinnitusType.toLowerCase()}.\n`; else narrative += "\n";
      } else if (tinnitus === "None") narrative += "- Tinnitus: No.\n";
      if (earFullness && earFullness !== "None") narrative += `- Ear Fullness/Pressure: Yes, on the ${earFullness.toLowerCase()} side.\n`; else if (earFullness === "None") narrative += "- Ear Fullness/Pressure: No.\n";
    }
    const vestibularSymptomsList = ["Nausea", "Vomiting", "Oscillopsia (visual world moving)", "Unsteadiness walking"];
    const neurologicSymptomsList = ["Headache", "Visual loss", "Sensory disturbances", "Hiccups", "Facial numbness"];
    const migraineFeaturesList = ["Photophobia (light sensitivity)", "Phonophobia (sound sensitivity)", "Osmophobia (smell sensitivity)", "Visual aura", "Unilateral headache"];
    const presentVestibular = vestibularSymptomsList.filter(symptom => associatedSymptoms.includes(symptom)).map(symptom => stripDescriptors(symptom));
    const presentNeurologic = neurologicSymptomsList.filter(symptom => associatedSymptoms.includes(symptom)).map(symptom => stripDescriptors(symptom));
    const presentMigraine = migraineFeaturesList.filter(symptom => associatedSymptoms.includes(symptom)).map(symptom => stripDescriptors(symptom));
    if (associatedSymptoms.length > 0) {
      narrative += "\n\nAssociated Symptoms:\n";
      if (presentVestibular.length > 0) narrative += `- Vestibular: ${presentVestibular.join(', ')}\n`;
      if (presentNeurologic.length > 0) narrative += `- Neurologic: ${presentNeurologic.join(', ')}\n`;
      if (presentMigraine.length > 0) narrative += `- Migraine-Associated: ${presentMigraine.join(', ')}\n`;
    }
    const oculomotorTests = [ 
      { label: "Spontaneous Nystagmus", value: oculomotorExam.spontaneousNystagmus }, 
      { label: "Gaze-Evoked Nystagmus", value: oculomotorExam.gazeEvokedNystagmus }, 
      { label: "Saccadic Eye Movements", value: oculomotorExam.saccadicEyeMovements }, 
      { label: "VOR Cancellation", value: oculomotorExam.vorCancellation }, 
      { label: "Head Impulse Test (HIT)", value: oculomotorExam.headImpulseTest }, 
      { label: "Test of Skew Deviation", value: oculomotorExam.testOfSkew }
    ];
    const presentOculomotor = oculomotorTests.filter(test => test.value);
    if (presentOculomotor.length > 0) {
      narrative += "\n\nOculomotor Exam Findings:\n";
      presentOculomotor.forEach(test => { narrative += `- ${test.label}: ${stripDescriptors(test.value)}\n`; });
    }

    const positionalTests = [
      { label: "Dix-Hallpike Left", value: positionalTesting.dixHallpikeLeft },
      { label: "Dix-Hallpike Right", value: positionalTesting.dixHallpikeRight },
      { label: "Supine Roll Test Left", value: positionalTesting.supineRollLeft },
      { label: "Supine Roll Test Right", value: positionalTesting.supineRollRight }
    ];
    
    // Only show positive findings in narrative
    const positivePositional = positionalTests.filter(test => test.value === "Positive");
    const performedPositional = positionalTests.filter(test => test.value && test.value !== "Not Performed");
    
    if (performedPositional.length > 0) {
      narrative += "\n\nPositional Testing Results:\n";
      if (positivePositional.length > 0) {
        positivePositional.forEach(test => { narrative += `- ${test.label}: ${test.value}\n`; });
      } else {
        narrative += "- All positional tests completed with no abnormal findings\n";
      }
    }

    if (planOfCare && planOfCareNarrativeMap[planOfCare as keyof typeof planOfCareNarrativeMap]) {
        narrative += `\n\n${planOfCareNarrativeMap[planOfCare as keyof typeof planOfCareNarrativeMap]}`;
    }


    if (hasPositivePositionalTesting() && treatmentManeuver && treatmentNarrativeMap[treatmentManeuver as keyof typeof treatmentNarrativeMap]) {
        const { maneuver, condition } = treatmentNarrativeMap[treatmentManeuver as keyof typeof treatmentNarrativeMap];
        narrative += `Treatment Provided: ${maneuver} completed x${treatmentRepetitions} for the ${treatmentSide.toLowerCase()} ear ${condition}. Patient tolerated treatment ${treatmentTolerance}.\n\n`;
    }

    return narrative;
  };

  // Helper function to detect positive positional testing
  const hasPositivePositionalTesting = () => {
    return formData.positionalTesting.dixHallpikeLeft === 'Positive' ||
           formData.positionalTesting.dixHallpikeRight === 'Positive' ||
           formData.positionalTesting.supineRollLeft === 'Positive' ||
           formData.positionalTesting.supineRollRight === 'Positive';
  };

  // Helper function to detect central pathology risk using HINTS-to-INFARCT logic
  const hasCentralRisk = () => {
    // Check red flags first (5 Ds of posterior circulation stroke)
    const hasRedFlags = Object.values(formData.redFlags).some(flag => flag === true);
    
    // HINTS examination - any ONE central finding = high stroke risk
    const hintsFindings = {
      // Head Impulse: Normal HIT in acute vertigo = central (stroke risk)
      headImpulse: formData.oculomotorExam.headImpulseTest === 'Normal',
      
      // Nystagmus: Direction-changing or vertical/torsional = central
      nystagmus: formData.oculomotorExam.gazeEvokedNystagmus === 'Direction-Changing (Central)' ||
                 formData.oculomotorExam.spontaneousNystagmus === 'Vertical' ||
                 formData.oculomotorExam.spontaneousNystagmus === 'Torsional',
      
      // Test of Skew: Positive skew deviation = central
      testOfSkew: formData.oculomotorExam.testOfSkew === 'Positive (Vertical Realignment)'
    };

    // HINTS-to-INFARCT rule: ANY central finding = high stroke risk
    const hasCentralHintsFindings = Object.values(hintsFindings).some(finding => finding === true);
    
    // Additional concerning oculomotor findings
    const otherConcerningFindings = 
      formData.oculomotorExam.saccadicEyeMovements === 'Hypermetric (Overshoot)' ||
      formData.oculomotorExam.saccadicEyeMovements === 'Hypometric (Undershoot)' ||
      formData.oculomotorExam.vorCancellation === 'Impaired (Corrective Saccades)';

    return hasRedFlags || hasCentralHintsFindings || otherConcerningFindings;
  };

  // Get HINTS assessment details
  const getHintsAssessment = () => {
    const hintsFindings = {
      headImpulse: formData.oculomotorExam.headImpulseTest === 'Normal' ? 'central' : 'peripheral',
      nystagmus: (formData.oculomotorExam.gazeEvokedNystagmus === 'Direction-Changing (Central)' ||
                  formData.oculomotorExam.spontaneousNystagmus === 'Vertical' ||
                  formData.oculomotorExam.spontaneousNystagmus === 'Torsional') ? 'central' : 'peripheral',
      testOfSkew: formData.oculomotorExam.testOfSkew === 'Positive (Vertical Realignment)' ? 'central' : 'peripheral'
    };

    const centralFindings = Object.values(hintsFindings).filter(finding => finding === 'central').length;
    
    return {
      findings: hintsFindings,
      centralCount: centralFindings,
      interpretation: centralFindings > 0 ? 'central' : 'peripheral',
      strokeRisk: centralFindings > 0 ? 'high' : 'low'
    };
  };


  // Generate clinical summary for the new step
  const generateClinicalSummary = () => {
    const summary = [];
    
    // Red Flag Assessment
    const redFlagCount = Object.values(formData.redFlags).filter(flag => flag === true).length;
    if (redFlagCount > 0) {
      const redFlagLabels = {
        doubleVision: "double vision", slurredSpeech: "slurred speech", 
        difficultySwallowing: "difficulty swallowing", hiccups: "uncontrollable hiccups",
        weaknessOrNumbness: "weakness/numbness on one side", incoordination: "incoordination",
        lostConsciousness: "loss of consciousness", chestPain: "chest pain"
      };
      
      const presentRedFlags = Object.entries(formData.redFlags)
        .filter(([, value]) => value === true)
        .map(([key]) => redFlagLabels[key as keyof typeof redFlagLabels]);
      
      summary.push({
        category: 'Red Flags',
        summary: `${redFlagCount} present: ${presentRedFlags.join(', ')}`,
        hasFindings: true,
        urgent: true
      });
    } else {
      summary.push({
        category: 'Red Flags',
        summary: 'No neurological or cardiovascular red flags reported',
        hasFindings: false,
        urgent: false
      });
    }

    // History Summary
    let historyText = '';
    if (formData.onsetType) historyText += `${formData.onsetType} onset`;
    if (formData.symptomType) historyText += ` of ${stripDescriptors(formData.symptomType).toLowerCase()}`;
    if (formData.onsetDate) historyText += `, began ${formData.onsetDate}`;
    if (formData.symptomFrequency) {
      if (formData.symptomFrequency === 'Constant') {
        historyText += `, constant symptoms`;
      } else if (formData.symptomFrequency === 'Episodic' && formData.episodeDuration) {
        historyText += `, episodic lasting ${formData.episodeDuration}`;
      } else if (formData.symptomFrequency === 'Episodic') {
        historyText += `, episodic symptoms`;
      }
    } else if (formData.episodeDuration) {
      // Fallback for legacy data
      historyText += `, lasting ${formData.episodeDuration}`;
    }
    if (formData.trigger) {
      let triggerText = stripDescriptors(formData.trigger).toLowerCase();
      
      // Add custom "Other" trigger if specified
      if (formData.trigger.includes('Other') && formData.triggerOther) {
        triggerText = triggerText.replace('other', formData.triggerOther.toLowerCase());
      }
      
      if (formData.symptomFrequency === 'Constant') {
        historyText += `, worsened by ${triggerText}`;
      } else {
        historyText += `, triggered by ${triggerText}`;
      }
    }
    
    summary.push({
      category: 'History',
      summary: historyText || 'History details pending completion',
      hasFindings: !!historyText,
      urgent: false
    });

    // Hearing/Ear Health - Enhanced with more detail
    if (formData.hearingChanges === 'Yes' || (formData.tinnitus && formData.tinnitus !== 'None') || (formData.earFullness && formData.earFullness !== 'None')) {
      let hearingDetails = [];
      if (formData.hearingLoss === 'Yes' && formData.hearingSide) {
        hearingDetails.push(`hearing loss (${formData.hearingSide})`);
      }
      if (formData.tinnitus && formData.tinnitus !== 'None') {
        hearingDetails.push(`tinnitus (${formData.tinnitus})`);
      }
      if (formData.earFullness && formData.earFullness !== 'None') {
        hearingDetails.push(`ear fullness (${formData.earFullness})`);
      }
      if (formData.pulsatileTinnitus) hearingDetails.push('pulsatile tinnitus');
      if (formData.autophony) hearingDetails.push('autophony');
      
      summary.push({
        category: 'Hearing/Ear',
        summary: hearingDetails.join(', '),
        hasFindings: true,
        urgent: false
      });
    } else {
      summary.push({
        category: 'Hearing/Ear',
        summary: 'No hearing changes or ear symptoms reported',
        hasFindings: false,
        urgent: false
      });
    }

    // Oculomotor Examination - Enhanced with specific findings
    const oculomotorFindings = Object.values(formData.oculomotorExam).filter(value => value && value !== '').length;
    const hintsAssessment = getHintsAssessment();
    
    if (oculomotorFindings > 0) {
      let findingDetails = [];
      
      if (formData.oculomotorExam.spontaneousNystagmus && formData.oculomotorExam.spontaneousNystagmus !== 'None') {
        findingDetails.push(`spontaneous nystagmus: ${stripDescriptors(formData.oculomotorExam.spontaneousNystagmus)}`);
      }
      if (formData.oculomotorExam.gazeEvokedNystagmus && formData.oculomotorExam.gazeEvokedNystagmus !== 'None') {
        findingDetails.push(`gaze-evoked: ${stripDescriptors(formData.oculomotorExam.gazeEvokedNystagmus)}`);
      }
      if (formData.oculomotorExam.saccadicEyeMovements && formData.oculomotorExam.saccadicEyeMovements !== 'Normal') {
        findingDetails.push(`saccades: ${stripDescriptors(formData.oculomotorExam.saccadicEyeMovements)}`);
      }
      if (formData.oculomotorExam.vorCancellation && formData.oculomotorExam.vorCancellation !== 'Normal') {
        findingDetails.push(`VOR cancellation: ${stripDescriptors(formData.oculomotorExam.vorCancellation)}`);
      }
      if (formData.oculomotorExam.headImpulseTest && formData.oculomotorExam.headImpulseTest !== 'Normal') {
        findingDetails.push(`HIT: ${stripDescriptors(formData.oculomotorExam.headImpulseTest)}`);
      }
      if (formData.oculomotorExam.testOfSkew && formData.oculomotorExam.testOfSkew !== 'Negative') {
        findingDetails.push(`skew deviation: ${stripDescriptors(formData.oculomotorExam.testOfSkew)}`);
      }
      
      let oculomotorText = findingDetails.length > 0 ? findingDetails.join('; ') : `${oculomotorFindings} test(s) completed - all normal`;
      if (hintsAssessment.centralCount > 0) {
        oculomotorText += ` [${hintsAssessment.centralCount} CENTRAL FINDING(S)]`;
      }
      
      summary.push({
        category: 'Oculomotor Exam',
        summary: oculomotorText,
        hasFindings: true,
        urgent: hintsAssessment.centralCount > 0
      });
    } else {
      summary.push({
        category: 'Oculomotor Exam',
        summary: 'Examination pending or not completed',
        hasFindings: false,
        urgent: false
      });
    }

    // Positional Testing - Show only positive findings or clean summary
    const positionalTests = Object.values(formData.positionalTesting);
    const performedTests = positionalTests.filter(test => test !== 'Not Performed' && test !== '').length;
    const positiveTests = positionalTests.filter(test => test === 'Positive').length;
    
    if (performedTests > 0) {
      let positionalText = '';
      let hasFindings = false;
      
      // Only show positive findings
      const positiveFindings = [];
      if (formData.positionalTesting.dixHallpikeLeft === 'Positive') {
        positiveFindings.push('Dix-Hallpike Left: Positive');
      }
      if (formData.positionalTesting.dixHallpikeRight === 'Positive') {
        positiveFindings.push('Dix-Hallpike Right: Positive');
      }
      if (formData.positionalTesting.supineRollLeft === 'Positive') {
        positiveFindings.push('Supine Roll Left: Positive');
      }
      if (formData.positionalTesting.supineRollRight === 'Positive') {
        positiveFindings.push('Supine Roll Right: Positive');
      }
      
      if (positiveFindings.length > 0) {
        positionalText = positiveFindings.join('; ');
        hasFindings = true;
      } else {
        positionalText = 'Positional testing completed - no abnormal findings';
        hasFindings = false;
      }
      
      summary.push({
        category: 'Positional Testing',
        summary: positionalText,
        hasFindings: hasFindings,
        urgent: false
      });
    } else {
      summary.push({
        category: 'Positional Testing',
        summary: 'Testing not yet performed',
        hasFindings: false,
        urgent: false
      });
    }

    // Associated Symptoms - New section
    if (formData.associatedSymptoms && formData.associatedSymptoms.length > 0) {
      const cleanedSymptoms = formData.associatedSymptoms.map(symptom => stripDescriptors(symptom));
      summary.push({
        category: 'Associated Symptoms',
        summary: cleanedSymptoms.join(', '),
        hasFindings: true,
        urgent: false
      });
    }

    return summary;
  };

  // Get relevant reference cards based on clinical findings
  const getRelevantReferenceCards = () => {
    const cards = [];
    const hintsAssessment = getHintsAssessment();
    
    // Enhanced BPPV detection - trigger on positional symptoms or short episodes
    if (hasPositivePositionalTesting() || 
        formData.trigger === 'Positional Changes' || 
        formData.episodeDuration === 'seconds' ||
        formData.symptomType === 'Vertigo (spinning)' && formData.trigger === 'Head Motion') {
      cards.push({ type: 'diagnostic', title: 'BPPV', data: diagnosticCriteria[0] });
    }
    
    // Enhanced Meniere's detection - hearing symptoms + episodic pattern
    if ((formData.hearingChanges === 'Yes' || formData.tinnitus === 'Yes') && 
        (formData.earFullness !== 'None' || formData.episodeDuration === 'minutes' || formData.episodeDuration === 'hours')) {
      cards.push({ type: 'diagnostic', title: 'Meniere disease', data: diagnosticCriteria[1] });
    }
    
    // Enhanced Vestibular Neuritis/Labyrinthitis detection
    if (formData.onsetType === 'Abrupt' && 
        (formData.symptomFrequency === 'Constant' || 
         formData.episodeDuration === 'hours' || formData.episodeDuration === 'days' || formData.episodeDuration === 'weeks')) {
      if (formData.hearingChanges !== 'Yes' && formData.tinnitus !== 'Yes') {
        cards.push({ type: 'diagnostic', title: 'Vestibular neuritis', data: diagnosticCriteria[2] });
      } else {
        cards.push({ type: 'diagnostic', title: 'Vestibular labyrinthitis', data: diagnosticCriteria[3] });
      }
    }
    
    // Enhanced Vestibular Migraine detection - migraine features + episodic dizziness
    if (formData.associatedSymptoms?.includes('Photophobia (light sensitivity)') || 
        formData.associatedSymptoms?.includes('Phonophobia (sound sensitivity)') ||
        formData.associatedSymptoms?.includes('Headache') ||
        formData.associatedSymptoms?.includes('Visual aura') ||
        formData.associatedSymptoms?.includes('Unilateral headache') ||
        ((formData.episodeDuration === 'minutes' || formData.episodeDuration === 'hours') && formData.associatedSymptoms?.includes('Nausea'))) {
      cards.push({ type: 'diagnostic', title: 'Vestibular migraine', data: diagnosticCriteria[4] });
    }
    
    // Superior Canal Dehiscence detection
    if (formData.boneConduction || formData.soundInducedVertigo || formData.pulsatileTinnitus || formData.autophony) {
      // Find SCD in diagnosticCriteria array (would need to add this)
      const scdData = diagnosticCriteria.find(item => item.title.includes('Superior canal dehiscence'));
      if (scdData) {
        cards.push({ type: 'diagnostic', title: 'Superior canal dehiscence', data: scdData });
      }
    }
    
    // PPPD detection - chronic dizziness with motion sensitivity
    if ((formData.episodeDuration === 'weeks' || formData.visualStimuli || formData.darknessWorse || formData.unevenGroundWorse) &&
        formData.functionalImpairment) {
      // Find PPPD in diagnosticCriteria array
      const pppdData = diagnosticCriteria.find(item => item.title.includes('Persistent postural-perceptual'));
      if (pppdData) {
        cards.push({ type: 'diagnostic', title: 'Persistent postural-perceptual dizziness', data: pppdData });
      }
    }
    
    // Bilateral Vestibulopathy detection
    if (formData.oscillopsia && formData.darknessWorse && formData.unevenGroundWorse) {
      const bilateralData = diagnosticCriteria.find(item => item.title.includes('Bilateral vestibulopathy'));
      if (bilateralData) {
        cards.push({ type: 'diagnostic', title: 'Bilateral vestibulopathy', data: bilateralData });
      }
    }
    
    // Perilymphatic Fistula detection
    if (formData.barotrauma && (formData.hearingChanges === 'Yes' || formData.tinnitus === 'Yes' || formData.earFullness !== 'None')) {
      const plfData = diagnosticCriteria.find(item => item.title.includes('Perilymphatic fistula'));
      if (plfData) {
        cards.push({ type: 'diagnostic', title: 'Perilymphatic fistula', data: plfData });
      }
    }
    
    // Include relevant oculomotor abnormal findings cards (with enhanced detection)
    if (formData.oculomotorExam.spontaneousNystagmus && formData.oculomotorExam.spontaneousNystagmus !== 'None') {
      cards.push({ type: 'oculomotor', title: 'Spontaneous Nystagmus (Abnormal)', data: abnormalFindingsData[0] });
    }
    
    if (formData.oculomotorExam.gazeEvokedNystagmus && formData.oculomotorExam.gazeEvokedNystagmus !== 'None') {
      cards.push({ type: 'oculomotor', title: 'Gaze-Evoked Nystagmus (Abnormal)', data: abnormalFindingsData[1] });
    }
    
    if (formData.oculomotorExam.saccadicEyeMovements && formData.oculomotorExam.saccadicEyeMovements !== 'Normal') {
      cards.push({ type: 'oculomotor', title: 'Abnormal Saccadic Eye Movements', data: abnormalFindingsData[2] });
    }
    
    if (formData.oculomotorExam.vorCancellation && formData.oculomotorExam.vorCancellation !== 'Normal') {
      cards.push({ type: 'oculomotor', title: 'Abnormal VOR Cancellation', data: abnormalFindingsData[3] });
    }
    
    if (formData.oculomotorExam.headImpulseTest && formData.oculomotorExam.headImpulseTest !== 'Normal') {
      cards.push({ type: 'oculomotor', title: 'Abnormal Head Impulse Test (HIT)', data: abnormalFindingsData[4] });
    }
    
    if (formData.oculomotorExam.testOfSkew && formData.oculomotorExam.testOfSkew !== 'Negative') {
      cards.push({ type: 'oculomotor', title: 'Positive Test of Skew', data: abnormalFindingsData[5] });
    }
    
    // Remove duplicates and return
    const uniqueCards = cards.filter((card, index, self) => 
      index === self.findIndex(c => c.title === card.title)
    );
    
    return uniqueCards;
  };

  // Simplified ReferenceCard component with clean list layout
  const ReferenceCard = ({ card }: { card: any }) => {
    const [activeTab, setActiveTab] = useState<'criteria' | 'treatment' | 'conditions' | 'pt'>('criteria');
    const [isExpanded, setIsExpanded] = useState(false);

    const handleCardClick = () => {
      setIsExpanded(!isExpanded);
    };

    const getDiagnosticTabs = () => {
      const tabs = [{ id: 'criteria', label: 'Criteria' }];
      if (card.data.treatment) {
        tabs.push({ id: 'treatment', label: 'Treatment' });
      }
      return tabs;
    };

    const getOculomotorTabs = () => [
      { id: 'conditions', label: 'Conditions' },
      { id: 'pt', label: 'PT Considerations' }
    ];

    const renderTabContent = () => {
      if (card.type === 'diagnostic') {
        if (activeTab === 'treatment' && card.data.treatment) {
          return (
            <div>
              {card.data.treatment.map((treatment: string, i: number) => (
                <p key={i} style={{ 
                  color: '#374151', 
                  margin: '0 0 12px 0', 
                  lineHeight: 1.6, 
                  fontSize: '15px',
                  paddingLeft: '12px'
                }}>
                  • {treatment}
                </p>
              ))}
            </div>
          );
        } else {
          return (
            <div>
              {card.data.criteria.map((criterion: string, i: number) => (
                <p key={i} style={{ 
                  color: '#374151', 
                  margin: '0 0 12px 0', 
                  lineHeight: 1.6, 
                  fontSize: '15px',
                  paddingLeft: '12px'
                }}>
                  • {criterion}
                </p>
              ))}
            </div>
          );
        }
      } else {
        if (activeTab === 'pt') {
          return (
            <p style={{ 
              color: '#374151', 
              margin: 0, 
              lineHeight: 1.6, 
              fontSize: '15px',
              paddingLeft: '12px'
            }}>
              {card.data.ptConsiderations}
            </p>
          );
        } else {
          return (
            <p style={{ 
              color: '#374151', 
              margin: 0, 
              lineHeight: 1.6, 
              fontSize: '15px',
              paddingLeft: '12px'
            }}>
              {card.data.conditions}
            </p>
          );
        }
      }
    };

    const availableTabs = card.type === 'diagnostic' ? getDiagnosticTabs() : getOculomotorTabs();

    return (
      <div style={{ marginBottom: '16px' }}>
        <motion.div
          style={{
            backgroundColor: '#ffffff',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          whileHover={{ 
            borderColor: '#3b82f6',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)'
          }}
          onClick={handleCardClick}
        >
          <div style={{
            padding: isMobile ? '16px' : '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ 
              margin: 0, 
              fontSize: isMobile ? '16px' : '18px', 
              fontWeight: '600',
              color: '#1f2937'
            }}>
              {card.data.title}
            </h3>
            <motion.div 
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              style={{ color: '#6b7280' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </motion.div>
          </div>
        </motion.div>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{
                backgroundColor: '#f9fafb',
                border: '2px solid #e5e7eb',
                borderTop: 'none',
                borderRadius: '0 0 8px 8px',
                padding: isMobile ? '16px' : '20px'
              }}>
                {availableTabs.length > 1 && (
                  <div style={{
                    display: 'flex',
                    marginBottom: '16px',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    {availableTabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTab(tab.id as any);
                        }}
                        style={{
                          padding: '8px 16px',
                          border: 'none',
                          backgroundColor: 'transparent',
                          color: activeTab === tab.id ? '#3b82f6' : '#6b7280',
                          fontWeight: activeTab === tab.id ? '600' : '500',
                          fontSize: '14px',
                          cursor: 'pointer',
                          borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                          marginRight: '16px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                )}
                {renderTabContent()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const handleNext = () => {
    // Generate chart ID when leaving Plan of Care step (now step 8)
    if (currentStep === 8) {
      if (!formData.chartId) {
        setFormData((prev: FormData) => ({ ...prev, chartId: generateChartId() }));
      }
    }

    // Handle conditional Treatment step after Positional Testing (step 5)
    if (currentStep === 5 && !hasPositivePositionalTesting()) {
      // Skip Treatment step if no positive positional testing (jump to Clinical Snapshot, now step 7)
      setCurrentStep(7);
    } else {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };
  const handleBack = () => {
    if (currentStep === 7 && !hasPositivePositionalTesting()) {
      setCurrentStep(5); // Go back to Positional Testing if treatment was skipped
    } else {
      setCurrentStep(prev => Math.max(prev - 1, 0));
    }
  };

  const sectionStyle = { 
    backgroundColor: "#fff", 
    border: "1px solid #E2E8F0", 
    padding: isMobile ? "12px" : "24px", 
    marginBottom: "8px" 
  };
  const labelStyle = { fontWeight: '600', color: '#334155', marginBottom: '6px', display: 'block' };
  const checkboxLabelStyle = { display: 'flex', alignItems: 'center', marginBottom: '6px', cursor: 'pointer' };
  const checkboxStyle = { marginRight: '8px', height: '18px', width: '18px' };
  const selectStyle = { width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #D1D5DB", backgroundColor: "white", fontSize: '1rem' };
  const buttonStyle: React.CSSProperties = {
    padding: '15px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'background-color 0.2s'
  };

  const saveNarrativeToServer = async () => {
    if (!formData.chartId) return;
    
    setIsUploading(true);
    setUploadStatus('idle');

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chartId: formData.chartId,
          narrative: editableNarrative || generateNarrative()
        })
      });

      const data = await response.json();

      if (response.ok) {
        setUploadStatus('success');
      } else {
        console.error('Failed to save note:', data.error);
        setUploadStatus('error');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentStep < steps.length - 1) {
        if (currentStep === 8) {
          if (!formData.chartId) {
            setFormData((prev: FormData) => ({ ...prev, chartId: generateChartId() }));
          }
        }

        if (currentStep === 5 && !hasPositivePositionalTesting()) {
          setCurrentStep(7);
        } else {
          setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
        }
      }
    },
    onSwipedRight: () => {
      if (currentStep > 0) {
        if (currentStep === 7 && !hasPositivePositionalTesting()) {
          setCurrentStep(5);
        } else {
          setCurrentStep(prev => Math.max(prev - 1, 0));
        }
      }
    },
    trackMouse: false,
    preventScrollOnSwipe: false,
    delta: 50,
  });

  const isAssociatedSymptomsPage = currentStep === 3;
  const shouldAllowScroll = isAssociatedSymptomsPage;

  // Calculate effective progress based on whether treatment step is shown
  const getEffectiveProgress = () => {
    const totalSteps = steps.length;
    const showTreatmentStep = hasPositivePositionalTesting();
    
    if (!showTreatmentStep) {
      // If treatment step is not shown, adjust progress calculation
      if (currentStep <= 5) {
        // Before treatment step, normal calculation
        return (currentStep / (totalSteps - 2)) * 100; // -2 because we skip treatment step
      } else if (currentStep >= 7) {
        // After treatment step (which was skipped), adjust the calculation
        return ((currentStep - 1) / (totalSteps - 2)) * 100;
      }
    }
    
    // Normal calculation when treatment step is shown
    return (currentStep / (totalSteps - 1)) * 100;
  };

  return (
    <div 
      {...swipeHandlers} 
      style={{ 
        height: isMobile ? 'calc(100vh - 130px)' : 'calc(100vh - 154px)', // Subtract padding from viewport height
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden',
        padding: isMobile ? "20px 20px 90px 20px" : "32px 32px 90px 32px"
      }}
    >
      {/* Progress Bar */}
      <div style={{ 
        position: 'relative', 
        height: '4px', 
        backgroundColor: '#e2e8f0', 
        marginBottom: isMobile ? '15px' : '25px', 
        borderRadius: '2px',
        flexShrink: 0
      }}>
        <motion.div
          style={{ position: 'absolute', height: '100%', backgroundColor: '#2D3748', borderRadius: '2px' }}
          animate={{ width: `${getEffectiveProgress()}%` }}
          transition={{ ease: "easeInOut", duration: 0.5 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: isMobile ? '12px' : '20px',
            flexShrink: 0
          }}>
            <h2 style={{color: '#1e293b', margin: 0, flex: 1, fontSize: isMobile ? '1.3rem' : '1.5rem'}}>{steps[currentStep]}</h2>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: isMobile ? '32px' : '28px',
                  fontWeight: '900',
                  cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
                  color: currentStep === 0 ? '#d1d5db' : '#1e293b',
                  padding: '8px',
                  borderRadius: '6px',
                  transition: 'all 0.2s',
                  opacity: currentStep === 0 ? 0.3 : 1,
                  lineHeight: 1
                }}
                onMouseEnter={(e) => {
                  if (currentStep > 0) {
                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                ←
              </button>
              <button
                onClick={handleNext}
                disabled={currentStep === steps.length - 1}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: isMobile ? '32px' : '28px',
                  fontWeight: '900',
                  cursor: currentStep === steps.length - 1 ? 'not-allowed' : 'pointer',
                  color: currentStep === steps.length - 1 ? '#d1d5db' : '#1e293b',
                  padding: '8px',
                  borderRadius: '6px',
                  transition: 'all 0.2s',
                  opacity: currentStep === steps.length - 1 ? 0.3 : 1,
                  lineHeight: 1
                }}
                onMouseEnter={(e) => {
                  if (currentStep < steps.length - 1) {
                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                →
              </button>
            </div>
          </div>

          <div style={{
            flex: 1,
            overflow: 'auto',
            paddingRight: isMobile ? '2px' : '4px'
          }}>

          {currentStep === 0 && (
             <div style={sectionStyle}>
              {redFlagList.map(flag => (
                <label key={flag.id} style={checkboxLabelStyle}>
                  <input type="checkbox" style={checkboxStyle} checked={formData.redFlags[flag.id as keyof typeof formData.redFlags]} onChange={(e) => updateFormData(flag.id, e.target.checked, 'redFlags')} />
                  <span>{flag.label}</span>
                </label>
              ))}
              <p style={{
                textAlign: 'center',
                fontSize: '14px',
                color: '#6b7280',
                fontStyle: 'italic',
                margin: '20px 0 0 0'
              }}>
                If no red flags present then swipe or click → to continue
              </p>
            </div>
          )}

          {currentStep === 1 && (
            <div>
              <div style={sectionStyle}>
                <label style={labelStyle}>Symptom Onset</label>
                <OptionBubbles name="onsetType" options={onsetOptions} value={formData.onsetType} onChange={(val) => updateFormData('onsetType', val)} />
              </div>
              <div style={sectionStyle}>
                <label style={labelStyle}>When did symptoms begin?</label>
                <CustomDropdown
                  options={onsetTimingOptions}
                  value={formData.onsetDate}
                  onChange={(val) => updateFormData('onsetDate', val)}
                  placeholder="Select timeframe..."
                  style={selectStyle}
                />
              </div>
              <div style={sectionStyle}>
                <label style={labelStyle}>Primary Symptom Type</label>
                <OptionBubbles name="symptomType" options={symptomTypeOptions} value={formData.symptomType} onChange={(val) => updateFormData('symptomType', val)} multiSelect />
              </div>
               <div style={sectionStyle}>
                <label style={labelStyle}>Symptom Frequency</label>
                <OptionBubbles name="symptomFrequency" options={frequencyOptions} value={formData.symptomFrequency} onChange={(val) => updateFormData('symptomFrequency', val)} />
              </div>
              <div style={sectionStyle}>
                <label style={labelStyle}>
                  {formData.symptomFrequency === 'Constant' ? 'Symptoms Worsened By' : 'Symptom Trigger'}
                </label>
                <OptionBubbles name="trigger" options={triggerOptions} value={formData.trigger} onChange={(val) => updateFormData('trigger', val)} multiSelect />
                
                {/* Show text input when "Other" is selected */}
                {formData.trigger.includes('Other') && (
                  <div style={{ marginTop: '12px' }}>
                    <label style={labelStyle}>Please specify:</label>
                    <input
                      type="text"
                      value={formData.triggerOther}
                      onChange={(e) => updateFormData('triggerOther', e.target.value)}
                      placeholder="Describe the specific trigger..."
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #3B82F6',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontFamily: 'inherit',
                        backgroundColor: '#ffffff',
                        boxSizing: 'border-box',
                        outline: 'none',
                        transition: 'border-color 0.2s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#1D4ED8'}
                      onBlur={(e) => e.target.style.borderColor = '#3B82F6'}
                    />
                  </div>
                )}
              </div>
               
               {formData.symptomFrequency === 'Episodic' && (
                 <div style={{
                   ...sectionStyle,
                   marginBottom: isMobile ? '80px' : '40px' // Extra bottom margin to prevent cutoff
                 }}>
                   <label style={labelStyle}>Episode Duration</label>
                   <OptionBubbles name="episodeDuration" options={durationOptions} value={formData.episodeDuration} onChange={(val) => updateFormData('episodeDuration', val)} multiSelect />
                 </div>
               )}
            </div>
          )}
          
          {currentStep === 2 && (
            <div>
              <div style={sectionStyle}>
                <label style={labelStyle}>Any changes to your hearing?</label>
                <OptionBubbles name="hearingChanges" options={yesNoOptions} value={formData.hearingChanges} onChange={(val) => updateFormData('hearingChanges', val)} />
              </div>
              {formData.hearingChanges === 'Yes' && (
                <motion.div initial={{opacity: 0, y: -10}} animate={{opacity: 1, y: 0}}>
                  <div style={sectionStyle}>
                    <label style={labelStyle}>Do you have hearing loss?</label>
                    <OptionBubbles name="hearingLoss" options={yesNoOptions} value={formData.hearingLoss} onChange={(val) => updateFormData('hearingLoss', val)} />
                    {formData.hearingLoss === 'Yes' && 
                      <motion.div initial={{opacity: 0, y: -10}} animate={{opacity: 1, y: 0}} style={{marginTop: '20px'}}>
                        <label style={labelStyle}>Which side?</label>
                        <OptionBubbles name="hearingSide" options={sideOptions} value={formData.hearingSide} onChange={(val) => updateFormData('hearingSide', val)} />
                      </motion.div>
                    }
                  </div>
                  <div style={sectionStyle}>
                    <label style={labelStyle}>Do you have tinnitus (ringing in ears)?</label>
                    <OptionBubbles name="tinnitus" options={sideOptions.concat({value: "None", label: "None"})} value={formData.tinnitus} onChange={(val) => updateFormData('tinnitus', val)} />
                  </div>
                   <div style={sectionStyle}>
                    <label style={labelStyle}>Do you have ear fullness/pressure?</label>
                    <OptionBubbles name="earFullness" options={sideOptions.concat({value: "None", label: "None"})} value={formData.earFullness} onChange={(val) => updateFormData('earFullness', val)} />
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div>
              {associatedSymptomsList.map(({ category, items }) => (
                <div key={category} style={sectionStyle}>
                  <h3 style={{...labelStyle, fontSize: '1.1rem'}}>{category}</h3>
                  {items.map(item => (
                    <label key={item} style={checkboxLabelStyle}>
                      <input type="checkbox" style={checkboxStyle} checked={formData.associatedSymptoms.includes(item)} onChange={(e) => updateArrayField('associatedSymptoms', item, e.target.checked)} />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          )}

          {currentStep === 4 && (
            <div>
                {oculomotorExamQuestions.map(q => (
                    <div key={q.id} style={sectionStyle}>
                        <label style={labelStyle}>{q.label}</label>
                        <CustomDropdown
                            options={q.options.map(opt => ({ value: opt, label: opt }))}
                            value={formData.oculomotorExam[q.id as keyof typeof formData.oculomotorExam]}
                            onChange={(val) => updateFormData(q.id, val, 'oculomotorExam')}
                            placeholder="Select..."
                            style={selectStyle}
                        />
                    </div>
                ))}
            </div>
          )}

          {currentStep === 5 && (
            <div>
                {positionalTestingQuestions.map(q => (
                    <div key={q.id} style={sectionStyle}>
                        <label style={labelStyle}>{q.label}</label>
                        <CustomDropdown
                            options={q.options.map(opt => ({ value: opt, label: opt }))}
                            value={formData.positionalTesting[q.id as keyof typeof formData.positionalTesting]}
                            onChange={(val) => updateFormData(q.id, val, 'positionalTesting')}
                            placeholder="Select..."
                            style={selectStyle}
                        />
                    </div>
                ))}
            </div>
          )}

          {/* Treatment Provided - Step 6 */}
          {currentStep === 6 && hasPositivePositionalTesting() && (
            <div>
              <div style={sectionStyle}>
                <label style={labelStyle}>Treatment Maneuver</label>
                <CustomDropdown
                  options={treatmentManeuverOptions}
                  value={formData.treatmentManeuver}
                  onChange={(val) => updateFormData('treatmentManeuver', val)}
                  placeholder="Select maneuver..."
                  style={selectStyle}
                />
              </div>

              <div style={sectionStyle}>
                <label style={labelStyle}>Number of Repetitions</label>
                <CustomDropdown
                  options={treatmentRepetitionOptions}
                  value={formData.treatmentRepetitions}
                  onChange={(val) => updateFormData('treatmentRepetitions', val)}
                  placeholder="Select repetitions..."
                  style={selectStyle}
                />
              </div>

              <div style={sectionStyle}>
                <label style={labelStyle}>Treatment Side</label>
                <CustomDropdown
                  options={treatmentSideOptions}
                  value={formData.treatmentSide}
                  onChange={(val) => updateFormData('treatmentSide', val)}
                  placeholder="Select side..."
                  style={selectStyle}
                />
              </div>

              <div style={sectionStyle}>
                <label style={labelStyle}>Patient Tolerance</label>
                <CustomDropdown
                  options={treatmentToleranceOptions}
                  value={formData.treatmentTolerance}
                  onChange={(val) => updateFormData('treatmentTolerance', val)}
                  placeholder="Select tolerance..."
                  style={selectStyle}
                />
              </div>
            </div>
          )}

          {/* Clinical Snapshot - Step 7 */}
          {currentStep === 7 && (
            <div>
              <div style={sectionStyle}>
                {(() => {
                  const clinicalSummary = generateClinicalSummary();
                  const relevantCards = getRelevantReferenceCards();
                  
                  const toggleSection = (section: 'summary' | 'references') => {
                    setActiveSection(section);
                  };

                  const sectionHeaderStyle = (isActive: boolean) => ({
                    backgroundColor: isActive ? '#3b82f6' : '#f8fafc',
                    color: isActive ? '#ffffff' : '#1f2937',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: isMobile ? '16px' : '20px',
                    cursor: 'pointer',
                    fontSize: isMobile ? '16px' : '18px',
                    fontWeight: '600',
                    textAlign: 'center' as const,
                    marginBottom: isActive ? '0' : '8px',
                    transition: 'all 0.3s ease',
                    boxShadow: isActive ? '0 4px 12px rgba(59, 130, 246, 0.15)' : 'none'
                  });
                  
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      
                      {/* Assessment Summary Section */}
                      <div>
                        <div 
                          style={sectionHeaderStyle(activeSection === 'summary')}
                          onClick={() => toggleSection('summary')}
                        >
                          Assessment Summary
                        </div>
                        <AnimatePresence>
                          {activeSection === 'summary' && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              style={{ overflow: 'hidden' }}
                            >
                              <div style={{
                                backgroundColor: '#ffffff',
                                border: '2px solid #e5e7eb',
                                borderTop: 'none',
                                borderRadius: '0 0 8px 8px',
                                padding: isMobile ? '16px' : '20px'
                              }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  {clinicalSummary.map((item, idx) => (
                                    <div key={idx} style={{
                                      padding: isMobile ? '16px' : '20px',
                                      backgroundColor: item.urgent ? '#fef2f2' : '#ffffff',
                                      border: item.urgent ? '2px solid #ef4444' : '1px solid #e5e7eb',
                                      borderRadius: '8px',
                                      borderLeft: item.hasFindings ? '4px solid #3b82f6' : '4px solid #e5e7eb',
                                      transition: 'all 0.2s ease'
                                    }}>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                          <span style={{ 
                                            fontSize: isMobile ? '14px' : '16px', 
                                            fontWeight: '700',
                                            color: item.urgent ? '#dc2626' : '#1f2937',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                          }}>
                                            {item.category}
                                          </span>
                                          {item.hasFindings && (
                                            <span style={{
                                              fontSize: '12px',
                                              fontWeight: '600',
                                              color: '#3b82f6',
                                              backgroundColor: '#dbeafe',
                                              padding: '2px 8px',
                                              borderRadius: '12px'
                                            }}>
                                              FINDINGS
                                            </span>
                                          )}
                                          {item.urgent && (
                                            <span style={{
                                              fontSize: '12px',
                                              fontWeight: '700',
                                              color: '#ffffff',
                                              backgroundColor: '#ef4444',
                                              padding: '2px 8px',
                                              borderRadius: '12px'
                                            }}>
                                              URGENT
                                            </span>
                                          )}
                                        </div>
                                        <p style={{ 
                                          fontSize: isMobile ? '14px' : '15px', 
                                          color: '#4b5563',
                                          margin: 0,
                                          lineHeight: 1.5
                                        }}>
                                          {item.summary}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Clinical References Section */}
                      <div>
                        <div 
                          style={sectionHeaderStyle(activeSection === 'references')}
                          onClick={() => toggleSection('references')}
                        >
                          Clinical References
                        </div>
                        <AnimatePresence>
                          {activeSection === 'references' && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              style={{ overflow: 'hidden' }}
                            >
                              <div style={{
                                backgroundColor: '#ffffff',
                                border: '2px solid #e5e7eb',
                                borderTop: 'none',
                                borderRadius: '0 0 8px 8px',
                                padding: isMobile ? '16px' : '20px'
                              }}>
                                <p style={{ 
                                  fontSize: isMobile ? '14px' : '15px', 
                                  color: '#6b7280', 
                                  margin: '0 0 20px 0',
                                  fontWeight: '500'
                                }}>
                                  Based on clinical findings:
                                </p>
                                
                                {(() => {
                                  if (relevantCards.length === 0) {
                                    return (
                                      <div style={{
                                        textAlign: 'center',
                                        padding: '24px',
                                        backgroundColor: '#f9fafb',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '8px'
                                      }}>
                                        <p style={{ color: '#6b7280', fontSize: '15px', margin: 0, fontWeight: '500' }}>
                                          Complete examination to view reference cards.
                                        </p>
                                      </div>
                                    );
                                  }

                                  return (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                                      {relevantCards.map((card, index) => (
                                        <ReferenceCard 
                                          key={`${card.type}-${index}`}
                                          card={card}
                                        />
                                      ))}
                                    </div>
                                  );
                                })()}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Plan of Care - Step 8 */}
          {currentStep === 8 && (
            <div>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: isMobile ? '16px' : '20px'
              }}>
                {planOfCareOptions.map(option => (
                  <label 
                    key={option.value} 
                    style={{ 
                      ...checkboxLabelStyle, 
                      alignItems: 'flex-start',
                      padding: isMobile ? '12px' : '16px',
                      backgroundColor: formData.planOfCare === option.value ? '#F8FAFC' : 'transparent',
                      border: formData.planOfCare === option.value ? '2px solid #3B82F6' : '1px solid #E2E8F0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      marginBottom: '0'
                    }}
                  >
                    <input
                      type="radio"
                      name="planOfCare"
                      value={option.value}
                      checked={formData.planOfCare === option.value}
                      onChange={(e) => updateFormData('planOfCare', e.target.value)}
                      style={{ 
                        ...checkboxStyle, 
                        marginTop: '6px',
                        marginRight: '12px',
                        flexShrink: 0
                      }}
                    />
                    <span style={{
                      fontSize: isMobile ? '14px' : '15px',
                      lineHeight: '1.5',
                      color: '#374151'
                    }}
                    dangerouslySetInnerHTML={{ __html: option.label }}
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Narrative Summary - Step 9 */}
          {currentStep === 9 && (
             <div style={sectionStyle}>
              {formData.chartId && <p style={{fontWeight: 'bold', marginBottom: '15px'}}>Chart ID: {formData.chartId}</p>}
              <p style={{
                fontSize: '14px',
                color: '#4b5563',
                marginBottom: '15px',
                fontWeight: '500'
              }}>
                📝 <strong>Editable Narrative:</strong> You can modify this summary to add additional details before uploading with your 6-digit code.
              </p>
              <textarea
                value={editableNarrative}
                onChange={(e) => setEditableNarrative(e.target.value)}
                placeholder="Your clinical narrative will appear here..."
                style={{
                  width: '100%', 
                  height: isMobile ? '60vh' : '70vh', 
                  padding: '15px', 
                  border: '2px solid #3B82F6', 
                  borderRadius: '8px',
                  resize: 'none', 
                  marginBottom: '20px',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  fontFamily: 'inherit',
                  backgroundColor: '#ffffff',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#1D4ED8'}
                onBlur={(e) => e.target.style.borderColor = '#3B82F6'}
              />
              <p style={{
                textAlign: 'center',
                fontSize: '14px',
                color: '#6b7280',
                fontStyle: 'italic',
                margin: '0'
              }}>
                Swipe to choose export method
              </p>
            </div>
          )}

          {/* Export - Step 10 */}
          {currentStep === 10 && (
            <div style={sectionStyle}>
              {formData.chartId && <p style={{fontWeight: 'bold', marginBottom: '20px', textAlign: 'center'}}>Chart ID: {formData.chartId}</p>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <button
                  onClick={saveNarrativeToServer}
                  style={{...buttonStyle, backgroundColor: isUploading ? '#f56565' : '#2D3748', color: 'white'}}
                >
                  {isUploading ? 'Saving...' : 'Save My Note'}
                </button>
                <button
                  onClick={handleHearNote}
                  style={{...buttonStyle, backgroundColor: isSpeaking ? '#f56565' : '#2D3748', color: 'white'}}
                >
                  {isSpeaking ? 'Stop' : 'Hear My Note'}
                </button>
                <button
                  onClick={handleCopyNote}
                  style={{...buttonStyle, backgroundColor: isCopied ? '#48bb78' : '#2D3748', color: 'white'}}
                >
                  {isCopied ? 'Copied!' : 'Copy My Note to Clipboard'}
                </button>
              </div>
              
              {uploadStatus === 'success' && (
                <div style={{
                  marginTop: '15px',
                  padding: '12px',
                  backgroundColor: '#F0FFF4',
                  border: '1px solid #68D391',
                  borderRadius: '8px',
                  color: '#2F855A',
                  textAlign: 'center'
                }}>
                  ✅ Your chart note has been saved! It will be available for 24 hours using ID: <strong>{formData.chartId}</strong>
                </div>
              )}
              
              {uploadStatus === 'error' && (
                <div style={{
                  marginTop: '15px',
                  padding: '12px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '8px',
                  color: '#DC2626',
                  textAlign: 'center'
                }}>
                  ❌ Failed to save chart note. Please try again or copy the note manually.
                </div>
              )}
            </div>
          )}

          </div>
        </motion.div>
      </AnimatePresence>
      
      {/* Professional HIPAA Compliance Modal */}
      {showHipaaModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: isMobile ? '20px' : '40px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: isMobile ? '24px' : '32px',
            maxWidth: isMobile ? '90vw' : '500px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '16px'
              }}>🛡️</div>
              <h2 style={{
                fontSize: isMobile ? '20px' : '24px',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 8px 0'
              }}>
                HIPAA Compliance Notice
              </h2>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: 0
              }}>
                Important Privacy & Security Information
              </p>
            </div>
            
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.6',
                color: '#374151',
                margin: '0 0 12px 0',
                fontWeight: '500'
              }}>
                ⚠️ <strong>Protected Health Information (PHI) Warning:</strong>
              </p>
              <p style={{
                fontSize: '14px',
                lineHeight: '1.5',
                color: '#4b5563',
                margin: 0
              }}>
                The generated narrative summary is PHI-free. <strong>If you choose to make additional edits</strong>, ensure any additions comply with HIPAA requirements and do not include patient identifiers (Name, Address, DOB, MRN, SSN, etc.) until entered into your final HIPAA-compliant documentation system.
              </p>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => {
                  setShowHipaaModal(false);
                  setHasSeenHipaaAfterReset(true);
                  setHasReset(false);
                  // Clear from localStorage when modal is dismissed
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('evalHasReset');
                  }
                }}
                style={{
                  backgroundColor: '#3B82F6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                  outline: 'none'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1D4ED8'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3B82F6'}
              >
                I Understand & Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 