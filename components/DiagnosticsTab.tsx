import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
    ],
    vrt: [
      "Primary treatment is repositioning maneuvers, but VRT may be indicated post-resolution for residual dizziness or balance issues.",
      "VRT Focus: Balance retraining (static and dynamic), Gaze stabilization (if lingering oscillopsia), Habituation to positional triggers",
      "Sample Exercises: Gaze Stabilization (X1 viewing → progress to X2, add head movements), Postural Stability (Romberg → semi-tandem → tandem → foam surface), Habituation (Repeated head movements that trigger mild symptoms)",
      "Progression: Begin with low-provocation head movements, Increase challenge using unstable surfaces or visual input disruption, Add dynamic gait tasks (e.g., turns, narrow walking)"
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
    ],
    vrt: [
      "Compensation is the goal. VRT begins as soon as the acute phase resolves (typically 3–5 days in).",
      "VRT Focus: Gaze stabilization, Postural control and balance, Motion sensitivity",
      "Sample Exercises: Gaze Stabilization (X1 viewing → X2, on firm surface → foam → walking), Balance/Gait (Walking with head turns, obstacle navigation), Habituation (Turn in place, stairs, rolling in bed)",
      "Progression: Increase head speed during gaze stabilization, Add background distraction (e.g., busy visual fields), Encourage outdoor/community ambulation with variable surfaces"
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
    ],
    vrt: [
      "Similar to neuritis, but includes unilateral hearing loss — so patient may need both VRT and audiological support.",
      "VRT Focus: Compensation through neuroplasticity, Multisensory integration (reliance on proprioception, vision)",
      "Sample Exercises: Same as vestibular neuritis, but emphasize auditory awareness, Add dual-task balance (walking while counting, etc.)",
      "Progression: Pair balance work with listening exercises (e.g., identifying directional sound if any hearing remains), Gradually reduce visual reliance"
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
    ],
    vrt: [
      "This population is sensitive to sensory input, so treatment should start cautiously and include lifestyle education.",
      "VRT Focus: Visual-vestibular integration, Balance training under various sensory conditions, Head motion habituation",
      "Sample Exercises: Visual Motion Tolerance (Watch rotating patterns, scrolling text), Balance (Foam surface eyes closed → visual conflict environments), Gaze Stability (X1 viewing with pauses between reps)",
      "Progression: Gradual exposure to triggers (e.g., screens, crowds), Incorporate graded aerobic activity (stationary bike, walking), Add migraine diary to identify patterns with symptom flares"
    ]
  },
  {
    title: "Superior canal dehiscence",
    color: "#DC2626",
    bgColor: "#FEF2F2",
    criteria: [
      {
        heading: "At least 1 of the following symptoms",
        points: [
          "Bone conduction hyperacusis",
          "Sound or pressure-induced vertigo or oscillopsia (illusion of an unstable visual world) time-locked to the stimulus",
          "Pulsatile tinnitus",
          "Autophony (hearing one's internal bodily sounds loudly)"
        ]
      },
      {
        heading: "At least 1 of the following signs or diagnostic tests",
        points: [
          "Nystagmus evoked by sound or by changes in the middle ear or intracranial pressure",
          "Low-frequency negative bone conduction thresholds on pure tone audiometry",
          "Low cervical Vestibular Evoked Myogenic Potential (VEMP) thresholds or high ocular VEMP amplitudes",
          "Evidence of dehiscence of the superior semicircular canal on temporal bone CT"
        ]
      }
    ],
    treatment: [
      "Avoidance of triggers (loud noises, straining).",
      "Vestibular and audiologic monitoring.",
      "Surgery (canal plugging/resurfacing) if symptoms are disabling.",
      "Educate on symptoms: autophony, sound/pressure-induced vertigo, oscillopsia."
    ]
  },
  {
    title: "Persistent postural-perceptual dizziness",
    color: "#3B82F6",
    bgColor: "#EFF6FF",
    criteria: [
      "Dizziness, vertigo, or unsteadiness are present for 15 out of 30 days for 3 or months.",
      "Symptoms last several hours, may wax and wane, and become worse as the day progresses",
      "Symptoms occur without provocation but are exacerbated by Upright posture, active or passive motion, and exposure to moving visual stimuli or complex visual patterns",
      "Symptoms cause significant functional impairment and distress"
    ],
    treatment: [
      "Education on functional dizziness – not structural damage.",
      "CBT or other psychological therapy for anxiety/perception re-training.",
      "SSRIs/SNRIs often effective (e.g., sertraline, venlafaxine).",
      "VRT focused on habituation and visual-vestibular integration."
    ],
    vrt: [
      "VRT is used as a behavioral retraining tool. It works best in combination with CBT and medication management.",
      "VRT Focus: Sensory reweighting, Desensitization to motion and visual environments, Posture and gait normalization",
      "Sample Exercises: Walking in busy settings (malls, supermarkets), Exposure (Use of videos simulating motion - trains, cars), Balance Training (Head movement on foam, eyes open → closed)",
      "Progression: Add multitasking (walking while reading), Gradually increase time in stimulus-rich environments, Encourage daily functional activity"
    ]
  },
  {
    title: "Bilateral vestibulopathy",
    color: "#0891B2",
    bgColor: "#F0F9FF",
    criteria: [
      "Disequilibrium and oscillopsia when walking or standing worsened in darkness or on uneven ground",
      "Asymptomatic while sitting or lying down under static conditions",
      "Reduced or absent angular vestibulo-ocular reflex function bilaterally"
    ],
    treatment: [
      "Balance training with VRT: focus on proprioceptive and visual cues.",
      "Avoid ototoxic medications (aminoglycosides).",
      "May need assistive devices (e.g., cane) for mobility safety.",
      "Limited role for pharmacological treatment.",
      "Consider safety during low-visibility conditions."
    ],
    vrt: [
      "The goal is to compensate with vision and somatosensation. Patients may never fully recover normal function but can improve stability and reduce falls.",
      "VRT Focus: Postural control using proprioception, Compensatory strategies, Fall risk education",
      "Sample Exercises: Gaze Stabilization (limited effectiveness - Practice anticipatory eye movements), Balance/Gait (Walking with cane or poles on uneven ground), Functional Strengthening (Sit-to-stand, stair training)",
      "Progression: Safety first - Train on low-light navigation and dual-tasking, Introduce assistive device selection and training, Encourage use of bright lighting and contrast cues at home"
    ]
  },
  {
    title: "Perilymphatic fistula",
    color: "#059669",
    bgColor: "#ECFDF5",
    criteria: [
      "Loss of hearing (sensorineural), tinnitus, ear fullness, or dizziness following barotrauma that either",
      "Associated with perilymph biomarker testing with high sensitivity and specificity or",
      "Associated with the visualization of perilymph leakage in the middle ear, symptoms resolve after treatment of the leak"
    ],
    treatment: [
      "Initial bed rest with activity restrictions.",
      "Avoid lifting, straining, or flying during healing.",
      "Surgical patching if no spontaneous healing.",
      "Audiology referral if hearing loss is present.",
      "Educate on early recognition of recurrent symptoms."
    ],
    vrt: [
      "VRT may be used post-surgical or after healing of the fistula, NOT during the acute leakage phase.",
      "VRT Focus: Gentle progressive motion, Visual tracking and balance retraining, Avoidance of straining and high-pressure activities",
      "Sample Exercises: Begin with seated gaze stabilization, Progress to standing balance and slow ambulation, Avoid exercises that involve Valsalva (e.g., sit-ups, straining)",
      "Progression: Build tolerance for walking and light aerobic activity, Educate patient on avoiding barotrauma (e.g., sneezing with mouth closed)"
    ]
  }
];

function ChevronDownIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
  )
}

export function DiagnosticsTab() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [expandedVRT, setExpandedVRT] = useState<Set<number>>(new Set());

  const handleCardClick = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleContentAreaClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!diagnosticCriteria[index].treatment) return;
    
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleVRTToggle = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedVRT(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const renderContent = (item: any, index: number, isFlipped: boolean) => {
    if (isFlipped) {
      // Treatment side
      return (
        <div>
          <h4 style={{ color: '#1f2937', margin: '0 0 12px 0', fontWeight: '600', fontSize: '16px' }}>Treatment Recommendations:</h4>
          {item.treatment?.map((treatment: string, i: number) => (
            <p key={i} style={{ color: '#374151', margin: '0 0 12px 0', lineHeight: 1.6 }}>&bull; {treatment}</p>
          ))}
          
          {item.vrt && (
            <>
              <div 
                onClick={(e) => handleVRTToggle(index, e)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  marginTop: '16px',
                  marginBottom: '8px',
                  padding: '8px',
                  backgroundColor: 'rgba(255,255,255,0.5)',
                  borderRadius: '6px',
                  border: `1px solid ${item.color}20`
                }}
              >
                <motion.div 
                  animate={{ rotate: expandedVRT.has(index) ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRightIcon />
                </motion.div>
                <h4 style={{ color: '#1f2937', margin: '0 0 0 8px', fontWeight: '600', fontSize: '15px' }}>
                  Vestibular Rehabilitation Therapy (VRT)
                </h4>
              </div>
              
              <AnimatePresence>
                {expandedVRT.has(index) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ paddingLeft: '12px', paddingTop: '8px' }}>
                      {item.vrt.map((vrt: string, i: number) => (
                        <p key={i} style={{ color: '#374151', margin: '0 0 12px 0', lineHeight: 1.6 }}>&bull; {vrt}</p>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      );
    } else {
      // Diagnostic criteria side
      return (
        <div>
          {item.criteria.map((criterion: any, i: number) => {
            if (typeof criterion === 'string') {
              return <p key={i} style={{ color: '#374151', margin: '0 0 12px 0', lineHeight: 1.6 }}>&bull; {criterion}</p>
            }
            return (
              <div key={i} style={{ marginBottom: '16px' }}>
                <h4 style={{ color: '#1f2937', margin: '0 0 8px 0', fontWeight: '600' }}>{criterion.heading}:</h4>
                {criterion.points.map((point: string, pIdx: number) => (
                  <p key={pIdx} style={{ color: '#374151', margin: '0 0 8px 12px', lineHeight: 1.6 }}>- {point}</p>
                ))}
              </div>
            )
          })}
        </div>
      );
    }
  };

  return (
    <div style={{ padding: '0 20px 20px 20px', backgroundColor: '#f4f4f9' }}>
      {diagnosticCriteria.map((item, index) => (
        <div key={item.title} style={{ marginBottom: '15px' }}>
          <motion.div
            style={{
              backgroundColor: 'white',
              color: '#333',
              cursor: 'pointer',
              padding: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderLeft: `5px solid ${item.color}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}
            onClick={() => handleCardClick(index)}
          >
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>{item.title}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {item.treatment && openIndex === index && (
                <span style={{ 
                  fontSize: '12px', 
                  color: '#6b7280', 
                  fontStyle: 'italic' 
                }}>
                  {flippedCards.has(index) ? "Showing: Treatment" : "Showing: Criteria"} • Tap content to switch
                </span>
              )}
              <motion.div animate={{ rotate: openIndex === index ? 180 : 0 }}>
                <ChevronDownIcon />
              </motion.div>
            </div>
          </motion.div>
          <AnimatePresence>
            {openIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{ 
                  overflow: 'hidden', 
                  backgroundColor: item.bgColor, 
                  borderLeft: `5px solid ${item.color}`,
                  cursor: item.treatment ? 'pointer' : 'default'
                }}
                onClick={(e) => handleContentAreaClick(index, e)}
              >
                <div style={{ padding: '20px' }}>
                  {renderContent(item, index, flippedCards.has(index))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
} 