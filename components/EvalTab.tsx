import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { OptionBubbles } from "./ui/OptionBubbles";

const steps = [
  "Red Flag Screening",
  "History of Present Illness",
  "Hearing & Ear Health",
  "Associated Symptoms",
  "Oculomotor Exam",
  "Plan of Care",
  "Treatment Provided",
  "Narrative Summary",
  "Conclusion"
];

const yesNoOptions = [ { value: "Yes", label: "Yes" }, { value: "No", label: "No" }];
const sideOptions = [ { value: "Left", label: "Left" }, { value: "Right", label: "Right" }, { value: "Bilateral", label: "Bilateral" }];
const symptomTypeOptions = [ { value: "Vertigo (spinning)", label: "Vertigo (spinning)" }, { value: "Faint (light head/pass out)", label: "Faint (light head/pass out)" }, { value: "Imbalance", label: "Imbalance" }, { value: "Oscillopsia", label: "Oscillopsia" }];
const durationOptions = [ { value: "seconds", label: "Seconds" }, { value: "minutes", label: "Minutes" }, { value: "hours", label: "Hours" }, { value: "days", label: "Days" }, { value: "weeks", label: "Weeks" }];
const onsetOptions = [ { value: "Abrupt", label: "Abrupt" }, { value: "Gradual", label: "Gradual" }];
const triggerOptions = [ { value: "Spontaneous", label: "Spontaneous" }, { value: "Positional Changes", label: "Positional Changes" }, { value: "Head Motion", label: "Head Motion" }, { value: "Pressure Changes", label: "Pressure Changes" }];

const planOfCareOptions = [
  { value: "peripheral_education", label: "Suspect peripheral vestibular cause. Patient Education on symptom management and referral to outpatient vestibular therapy services for further followup care" },
  { value: "peripheral_crm", label: "Suspect peripheral vestibular cause. Perform Canalith repositioning manuevers" },
  { value: "mixed_lifestyle", label: "Suspect peripheral/central cause. Patient Education on lifestyle modification and medication management, referral to PCP or ENT for further followup care" },
  { value: "central_workup", label: "Suspect central cause. Recommend further medical workup based on severity or variability in symptoms (RED Flags)" },
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
    { category: "Cardiovascular", items: ["Chest pain", "Palpitations", "Shortness of breath", "Fatigue", "Syncope/near-syncope"] },
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
  { id: "syncopalEpisode", label: "Syncopal Episode" },
];

const oculomotorExamQuestions = [
    { id: "spontaneousNystagmus", label: "Spontaneous Nystagmus", options: ["None", "Horizontal", "Vertical", "Torsional"] },
    { id: "gazeEvokedNystagmus", label: "Gaze-Evoked Nystagmus", options: ["None", "Direction-Fixed (Peripheral)", "Direction-Changing (Central)"] },
    { id: "saccadicEyeMovements", label: "Saccadic Eye Movements", options: ["Normal", "Hypermetric (Overshoot)", "Hypometric (Undershoot)"] },
    { id: "vorCancellation", label: "VOR Cancellation", options: ["Normal", "Impaired (Corrective Saccades)"] },
    { id: "headImpulseTest", label: "Head Impulse Test (HIT)", options: ["Normal", "Abnormal (Corrective Saccade)"] },
    { id: "testOfSkew", label: "Test of Skew", options: ["Negative", "Positive (Vertical Realignment)"] },
];

export function EvalTab() {
  const [currentStep, setCurrentStep] = useState(0);
  
  const [formData, setFormData] = useState({
    redFlags: {
      doubleVision: false,
      slurredSpeech: false,
      difficultySwallowing: false,
      hiccups: false,
      weaknessOrNumbness: false,
      incoordination: false,
      lostConsciousness: false,
      chestPain: false,
      syncopalEpisode: false,
    },
    hearingChanges: "", hearingLoss: "", hearingSide: "", tinnitus: "", tinnitusType: "", tinnitusGradual: "", audiogram: "", earFullness: "", earFullnessSide: "", mri: false, ctScan: false, smoke: "", drink: "", onsetDate: "", onsetType: "", activity: "", symptomType: "", trigger: "", worseWith: [] as string[], episodeDuration: "", episodeDurationSpecific: "", spontaneousVsTriggered: "", dixHallpikeResult: "", orthostaticVitals: "", associatedSymptoms: [] as string[], oscillopsia: false, tendencyToFall: false, nausea: false, vomiting: false, orthostaticBP: "", chestPainDetails: "", palpitations: false, boneConduction: false, soundInducedVertigo: false, pulsatileTinnitus: false, autophony: false, barotrauma: false, viralIllness: false, functionalImpairment: "", visualStimuli: false, darknessWorse: false, unevenGroundWorse: false,
    planOfCare: "",
    treatmentManeuver: "",
    treatmentRepetitions: "1",
    treatmentSide: "",
    treatmentTolerance: "",
    chartId: "",
    oculomotorExam: {
      spontaneousNystagmus: "", gazeEvokedNystagmus: "", saccadicEyeMovements: "", vorCancellation: "", headImpulseTest: "", testOfSkew: ""
    }
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const generateChartId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  const updateFormData = (field: string, value: any, section: string | null = null) => {
    if (section) {
      setFormData(prev => ({ ...prev, [section]: { ...(prev as any)[section], [field]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }

    if (field === 'planOfCare' && !formData.chartId) {
      setFormData(prev => ({ ...prev, chartId: generateChartId() }));
    }
  };

  const updateArrayField = (field: string, value: string, checked: boolean) => {
    setFormData(prev => {
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
    const narrativeText = generateNarrative();
    const utterance = new SpeechSynthesisUtterance(narrativeText);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleCopyNote = () => {
    const narrativeText = generateNarrative();
    navigator.clipboard.writeText(narrativeText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const generateNarrative = () => {
    const { redFlags, onsetType, symptomType, trigger, episodeDuration, hearingChanges, hearingLoss, hearingSide, tinnitus, tinnitusType, earFullness, associatedSymptoms, oculomotorExam, planOfCare, treatmentManeuver, treatmentRepetitions, treatmentSide, treatmentTolerance } = formData;
    let narrative = "Patient presenting with complaints of ";
    if (onsetType) narrative += `${onsetType.toLowerCase()} onset of `; else narrative += "(onset type) ";
    if (symptomType) narrative += `${symptomType.split(',').join(', ').toLowerCase()}. `; else narrative += "(type of symptoms). ";
    if (trigger) narrative += `These symptoms are triggered by ${trigger.split(',').join(', ').toLowerCase()} `; else narrative += "These symptoms are triggered by (trigger) ";
    if (episodeDuration) narrative += `and last for ${episodeDuration.toLowerCase()}.`; else narrative += "and last for (episode duration).";
    
    const redFlagLabels = {
        doubleVision: "double vision",
        slurredSpeech: "slurred speech or trouble finding words",
        difficultySwallowing: "difficulty swallowing",
        hiccups: "uncontrollable hiccups",
        weaknessOrNumbness: "weakness or numbness on one side",
        incoordination: "incoordination",
        lostConsciousness: "loss of consciousness",
        chestPain: "chest pain",
        syncopalEpisode: "syncopal episode",
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
    const cardiovascularSymptomsList = ["Chest pain", "Palpitations", "Shortness of breath", "Fatigue", "Syncope/near-syncope"];
    const presentVestibular = vestibularSymptomsList.filter(symptom => associatedSymptoms.includes(symptom));
    const presentNeurologic = neurologicSymptomsList.filter(symptom => associatedSymptoms.includes(symptom));
    const presentMigraine = migraineFeaturesList.filter(symptom => associatedSymptoms.includes(symptom));
    const presentCardiovascular = cardiovascularSymptomsList.filter(symptom => associatedSymptoms.includes(symptom));
    if (associatedSymptoms.length > 0) {
      narrative += "\n\nAssociated Symptoms:\n";
      if (presentVestibular.length > 0) narrative += `- Vestibular: ${presentVestibular.join(', ')}\n`;
      if (presentNeurologic.length > 0) narrative += `- Neurologic: ${presentNeurologic.join(', ')}\n`;
      if (presentMigraine.length > 0) narrative += `- Migraine-Associated: ${presentMigraine.join(', ')}\n`;
      if (presentCardiovascular.length > 0) narrative += `- Cardiovascular: ${presentCardiovascular.join(', ')}\n`;
    }
    const oculomotorTests = [ { label: "Spontaneous Nystagmus", value: oculomotorExam.spontaneousNystagmus }, { label: "Gaze-Evoked Nystagmus", value: oculomotorExam.gazeEvokedNystagmus }, { label: "Saccadic Eye Movements", value: oculomotorExam.saccadicEyeMovements }, { label: "VOR Cancellation", value: oculomotorExam.vorCancellation }, { label: "Head Impulse Test (HIT)", value: oculomotorExam.headImpulseTest }, { label: "Test of Skew Deviation", value: oculomotorExam.testOfSkew } ];
    const presentOculomotor = oculomotorTests.filter(test => test.value);
    if (presentOculomotor.length > 0) {
      narrative += "\n\nOculomotor Exam Findings:\n";
      presentOculomotor.forEach(test => { narrative += `- ${test.label}: ${test.value}\n`; });
    }

    if (planOfCare && planOfCareNarrativeMap[planOfCare as keyof typeof planOfCareNarrativeMap]) {
        narrative += `\n\n${planOfCareNarrativeMap[planOfCare as keyof typeof planOfCareNarrativeMap]}`;
    }

    if (planOfCare === 'peripheral_crm' && treatmentManeuver && treatmentNarrativeMap[treatmentManeuver as keyof typeof treatmentNarrativeMap]) {
        const { maneuver, condition } = treatmentNarrativeMap[treatmentManeuver as keyof typeof treatmentNarrativeMap];
        narrative += `\n\nTreatment Provided: ${maneuver} completed x${treatmentRepetitions} for the ${treatmentSide.toLowerCase()} ear ${condition}. Patient tolerated treatment ${treatmentTolerance}.`;
    }

    return narrative;
  };

  const handleNext = () => {
    if (currentStep === 5 && formData.planOfCare !== 'peripheral_crm') {
      setCurrentStep(7); // Skip to Narrative Summary
    } else if (currentStep === 7) {
      if (!formData.chartId) {
        setFormData(prev => ({ ...prev, chartId: generateChartId() }));
      }
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
    else {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };
  const handleBack = () => {
     if (currentStep === 7 && formData.planOfCare !== 'peripheral_crm') {
      setCurrentStep(5); // Go back to Plan of Care
    } else {
      setCurrentStep(prev => Math.max(prev - 1, 0));
    }
  };

  const sectionStyle = { 
    backgroundColor: "#fff", 
    border: "1px solid #E2E8F0", 
    padding: window.innerWidth <= 768 ? "12px" : "24px", 
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
          narrative: generateNarrative()
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
        if (currentStep === 5 && formData.planOfCare !== 'peripheral_crm') {
          setCurrentStep(7);
        } else if (currentStep === 7) {
          if (!formData.chartId) {
            setFormData(prev => ({ ...prev, chartId: generateChartId() }));
          }
          setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
        } else {
          setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
        }
      }
    },
    onSwipedRight: () => {
      if (currentStep > 0) {
        if (currentStep === 7 && formData.planOfCare !== 'peripheral_crm') {
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

  const isMobile = window.innerWidth <= 768;
  const isAssociatedSymptomsPage = currentStep === 3;
  const shouldAllowScroll = isAssociatedSymptomsPage;

  return (
    <div 
      {...swipeHandlers} 
      style={{ 
        minHeight: '100vh', 
        maxHeight: isMobile && !shouldAllowScroll ? '100vh' : 'none',
        overflow: isMobile && !shouldAllowScroll ? 'hidden' : 'auto',
        display: 'flex', 
        flexDirection: 'column' 
      }}
    >
      {/* Progress Bar */}
      <div style={{ position: 'relative', height: '4px', backgroundColor: '#e2e8f0', marginBottom: isMobile ? '15px' : '25px', borderRadius: '2px' }}>
        <motion.div
          style={{ position: 'absolute', height: '100%', backgroundColor: '#2D3748', borderRadius: '2px' }}
          animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
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
            minHeight: '400px',
            overflow: isMobile && !shouldAllowScroll ? 'hidden' : 'auto'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? '12px' : '20px' }}>
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

          {currentStep === 0 && (
             <div style={sectionStyle}>
              {redFlagList.map(flag => (
                <label key={flag.id} style={checkboxLabelStyle}>
                  <input type="checkbox" style={checkboxStyle} checked={formData.redFlags[flag.id as keyof typeof formData.redFlags]} onChange={(e) => updateFormData(flag.id, e.target.checked, 'redFlags')} />
                  <span>{flag.label}</span>
                </label>
              ))}
            </div>
          )}

          {currentStep === 1 && (
            <div>
              <div style={sectionStyle}>
                <label style={labelStyle}>Symptom Onset</label>
                <OptionBubbles name="onsetType" options={onsetOptions} value={formData.onsetType} onChange={(val) => updateFormData('onsetType', val)} />
              </div>
              <div style={sectionStyle}>
                <label style={labelStyle}>Primary Symptom Type</label>
                <OptionBubbles name="symptomType" options={symptomTypeOptions} value={formData.symptomType} onChange={(val) => updateFormData('symptomType', val)} multiSelect />
              </div>
              <div style={sectionStyle}>
                <label style={labelStyle}>Symptom Trigger</label>
                <OptionBubbles name="trigger" options={triggerOptions} value={formData.trigger} onChange={(val) => updateFormData('trigger', val)} multiSelect />
              </div>
               <div style={sectionStyle}>
                <label style={labelStyle}>Episode Duration</label>
                <OptionBubbles name="episodeDuration" options={durationOptions} value={formData.episodeDuration} onChange={(val) => updateFormData('episodeDuration', val)} />
              </div>
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
                        <select
                            style={selectStyle}
                            value={formData.oculomotorExam[q.id as keyof typeof formData.oculomotorExam]}
                            onChange={(e) => updateFormData(q.id, e.target.value, 'oculomotorExam')}
                        >
                            {q.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                ))}
            </div>
          )}

          {currentStep === 5 && (
            <div style={sectionStyle}>
              <h3 style={{...labelStyle, fontSize: '1.1rem'}}>Plan of Care</h3>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {planOfCareOptions.map(option => (
                  <label key={option.value} style={{ ...checkboxLabelStyle, alignItems: 'flex-start' }}>
                    <input
                      type="radio"
                      name="planOfCare"
                      value={option.value}
                      checked={formData.planOfCare === option.value}
                      onChange={(e) => updateFormData('planOfCare', e.target.value)}
                      style={{ ...checkboxStyle, marginTop: '5px' }}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {currentStep === 6 && formData.planOfCare === 'peripheral_crm' && (
            <div>
                <div style={sectionStyle}>
                    <label style={labelStyle}>Treatment Maneuver</label>
                    <OptionBubbles name="treatmentManeuver" options={treatmentManeuverOptions} value={formData.treatmentManeuver} onChange={(val) => updateFormData('treatmentManeuver', val)} />
                </div>
                <div style={sectionStyle}>
                    <label style={labelStyle}>Repetitions</label>
                    <OptionBubbles name="treatmentRepetitions" options={treatmentRepetitionOptions} value={formData.treatmentRepetitions} onChange={(val) => updateFormData('treatmentRepetitions', val)} />
                </div>
                 <div style={sectionStyle}>
                    <label style={labelStyle}>Side</label>
                    <OptionBubbles name="treatmentSide" options={treatmentSideOptions} value={formData.treatmentSide} onChange={(val) => updateFormData('treatmentSide', val)} />
                </div>
                <div style={sectionStyle}>
                    <label style={labelStyle}>Patient Tolerance</label>
                    <OptionBubbles name="treatmentTolerance" options={treatmentToleranceOptions} value={formData.treatmentTolerance} onChange={(val) => updateFormData('treatmentTolerance', val)} />
                </div>
            </div>
          )}

          {currentStep === 7 && (
             <div style={sectionStyle}>
              <h3 style={{...labelStyle, fontSize: '1.1rem'}}>Narrative Summary</h3>
              {formData.chartId && <p style={{fontWeight: 'bold', marginBottom: '10px'}}>Chart ID: {formData.chartId}</p>}
              <textarea
                readOnly
                value={generateNarrative()}
                style={{width: '100%', height: '400px', padding: '10px', border: '1px solid #ccc', resize: 'none' }}
              />
            </div>
          )}

          {currentStep === 8 && (
            <div style={sectionStyle}>
              <h3 style={{...labelStyle, fontSize: '1.1rem'}}>Conclusion</h3>
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

        </motion.div>
      </AnimatePresence>
    </div>
  );
} 