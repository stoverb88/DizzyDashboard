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
      "The Dix-Hallpike test produces torsional and vertical nystagmus towards the affected ear after a few seconds.[7][8]"
    ]
  },
  {
    title: "Meniere disease",
    color: "#0891B2",
    bgColor: "#F0F9FF",
    criteria: [
      "Two or more episodes of spontaneous vertigo lasting 30 minutes to 12 hours",
      "Low- to medium-frequency sensorineural hearing loss",
      "Unilateral tinnitus, ear fullness, and hearing loss in the affected ear may fluctuate [9]"
    ]
  },
  {
    title: "Vestibular neuritis",
    color: "#059669",
    bgColor: "#ECFDF5",
    criteria: [
      "Sudden onset of vertigo lasting at least 24 hours, often accompanied by oscillopsia, nausea, and a tendency to fall",
      "Absence of cochlear symptoms",
      "Absence of associated neurological symptoms and signs [10]"
    ]
  },
  {
    title: "Vestibular labyrinthitis",
    color: "#A855F7",
    bgColor: "#F3E8FF",
    criteria: [
      "Vestibular neuritis plus hearing loss",
      "occurs commonly after a viral illness such as a URI or otitis media"
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
      "Current or previous history of migraine [11]"
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
          "Autophony (hearing one's internal bodily sounds loudly) [12]"
        ]
      },
      {
        heading: "At least 1 of the following signs or diagnostic tests",
        points: [
          "Nystagmus evoked by sound or by changes in the middle ear or intracranial pressure",
          "Low-frequency negative bone conduction thresholds on pure tone audiometry",
          "Low cervical Vestibular Evoked Myogenic Potential (VEMP) thresholds or high ocular VEMP amplitudes",
          "Evidence of dehiscence of the superior semicircular canal on temporal bone CT [12]"
        ]
      }
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
      "Symptoms cause significant functional impairment and distress [13]"
    ]
  },
  {
    title: "Bilateral vestibulopathy",
    color: "#0891B2",
    bgColor: "#F0F9FF",
    criteria: [
      "Disequilibrium and oscillopsia when walking or standing worsened in darkness or on uneven ground",
      "Asymptomatic while sitting or lying down under static conditions",
      "Reduced or absent angular vestibulo-ocular reflex function bilaterally [14]"
    ]
  },
  {
    title: "Perilymphatic fistula",
    color: "#059669",
    bgColor: "#ECFDF5",
    criteria: [
      "Loss of hearing (sensorineural), tinnitus, ear fullness, or dizziness following barotrauma that either",
      "Associated with perilymph biomarker testing with high sensitivity and specificity or",
      "Associated with the visualization of perilymph leakage in the middle ear, symptoms resolve after treatment of the leak [15]"
    ]
  }
];

function ChevronDownIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
  )
}

export function DiagnosticsTab() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleCardClick = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
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
            <motion.div animate={{ rotate: openIndex === index ? 180 : 0 }}>
              <ChevronDownIcon />
            </motion.div>
          </motion.div>
          <AnimatePresence>
            {openIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{ overflow: 'hidden', backgroundColor: item.bgColor, borderLeft: `5px solid ${item.color}` }}
              >
                <div style={{ padding: '20px' }}>
                  {item.criteria.map((criterion, i) => {
                    if (typeof criterion === 'string') {
                      return <p key={i} style={{ color: '#374151', margin: '0 0 12px 0', lineHeight: 1.6 }}>&bull; {criterion}</p>
                    }
                    return (
                      <div key={i} style={{ marginBottom: '16px' }}>
                        <h4 style={{ color: '#1f2937', margin: '0 0 8px 0', fontWeight: '600' }}>{criterion.heading}:</h4>
                        {criterion.points.map((point, pIdx) => (
                          <p key={pIdx} style={{ color: '#374151', margin: '0 0 8px 12px', lineHeight: 1.6 }}>- {point}</p>
                        ))}
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
} 