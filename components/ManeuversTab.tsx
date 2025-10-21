import React, { useState } from 'react';
import { VideoCarousel } from './VideoCarousel';
import { motion, AnimatePresence } from 'framer-motion';
import { CanalSimulation } from './CanalSimulation';
import { Button } from './ui/Button';

const maneuversData = [
  {
    title: "Posterior Canal BPPV (85-95%)",
    videos: [
      { name: "Epley Maneuver", url: "https://www.youtube.com/watch?v=9SLm76jQg3g" },
      { name: "Semont Maneuver", url: "https://www.youtube.com/watch?v=-omE6Vs6ZuU" }
    ]
  },
  {
    title: "Horizontal Canal BPPV (5-15%)",
    videos: [
      { name: "Left Gufoni", url: "https://www.youtube.com/watch?v=3VfgHZtgx_s" },
      { name: "Right Gufoni", url: "https://www.youtube.com/watch?v=DgKaWSuvpRs" }
    ]
  },
  {
    title: "Anterior Canal BPPV (<5%)",
    videos: [
      { name: "Deep Head Hang", url: "https://www.youtube.com/watch?v=ijyx5tVeaVo" }
    ]
  }
];

export function ManeuversTab() {
  const [maneuverIndex, setManeuverIndex] = useState(0);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [isRecurrenceOpen, setIsRecurrenceOpen] = useState(false);
  const [showSimulation, setShowSimulation] = useState(false);

  const handleNext = () => {
    setManeuverIndex((prev) => Math.min(prev + 1, maneuversData.length - 1));
  };

  const handlePrev = () => {
    setManeuverIndex((prev) => Math.max(0, prev - 1));
  };
  
  const currentManeuver = maneuversData[maneuverIndex];

  return (
    <>
      {showSimulation && (
        <CanalSimulation onClose={() => setShowSimulation(false)} />
      )}
      
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#f4f4f9' }}>
      <div style={{textAlign: 'center', padding: '20px 20px 0 20px'}}>
        <h2 style={{ color: '#333', margin: 0, paddingBottom: '10px' }}>{currentManeuver.title}</h2>
      </div>
      
      <div style={{ flexGrow: 1, minHeight: '250px' }}>
          <VideoCarousel key={maneuverIndex} videos={currentManeuver.videos} autoplayFirst={false} />
      </div>

      <div style={{ padding: '20px', backgroundColor: 'white', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <button
              onClick={() => setShowSimulation(true)}
              style={{
                padding: '14px 28px',
                borderRadius: '8px',
                border: '2px solid #3B82F6',
                backgroundColor: '#3B82F6',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.25)',
                transition: 'all 0.2s ease',
                width: '100%',
                maxWidth: '320px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2563EB';
                e.currentTarget.style.borderColor = '#2563EB';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#3B82F6';
                e.currentTarget.style.borderColor = '#3B82F6';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.25)';
              }}
            >
              Interactive Epley Trainer
            </button>
          </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <Button
            variant="primary"
            size="md"
            onClick={handlePrev}
            disabled={maneuverIndex === 0}
          >
            &larr; Previous
          </Button>
          <span style={{color: '#555', fontWeight: '600'}}>
            {maneuverIndex + 1} / {maneuversData.length}
          </span>
          <Button
            variant="primary"
            size="md"
            onClick={handleNext}
            disabled={maneuverIndex === maneuversData.length - 1}
          >
            Next Canal &rarr;
          </Button>
        </div>

        <div style={{
          padding: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '16px', marginBottom: '16px' }}>
            <h3 
              style={{ color: '#1E40AF', fontSize: '16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '600', margin: 0 }}
              onClick={() => setIsInstructionsOpen(!isInstructionsOpen)}
            >
              <span>Post-Treatment Instructions</span>
              <motion.div animate={{ rotate: isInstructionsOpen ? 180 : 0 }}>
                <ChevronDownIcon />
              </motion.div>
            </h3>
            <AnimatePresence>
            {isInstructionsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ height: 'auto', opacity: 1, marginTop: '10px' }}
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <p style={{ color: '#1D4ED8', lineHeight: 1.6, fontSize: '14px', margin: 0 }}>
                  Avoid rapid head movements for 24-48 hours, may sleep with extra 1-2 pillows or elevate HOB for first night, try and avoid sleeping on affected side. No restrictions on driving or normal activities.
                </p>
              </motion.div>
            )}
            </AnimatePresence>
          </div>

          <div>
            <h3 
              style={{ color: "#1E40AF", fontSize: "16px", cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '600', margin: 0 }}
              onClick={() => setIsRecurrenceOpen(!isRecurrenceOpen)}
            >
              <span>Can the dizziness come back?</span>
              <motion.div animate={{ rotate: isRecurrenceOpen ? 180 : 0 }}>
                <ChevronDownIcon />
              </motion.div>
            </h3>
            <AnimatePresence>
            {isRecurrenceOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ height: 'auto', opacity: 1, marginTop: '10px' }}
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <p style={{ color: "#1D4ED8", lineHeight: 1.6, fontSize: '14px', margin: "8px 0 0 0" }}>
                    In the three years after treatment, the symptoms return in 30% of people who had BPPV. If this happens, you should contact your Physical Therapist. If he or she finds that the crystals are back out of place, they may perform the maneuver again. Research shows that the best treatment is the maneuver, and it can work again and again, though sometimes more quickly or more slowly.
                </p>
                <p style={{ color: "#1D4ED8", lineHeight: 1.6, fontSize: '14px', margin: "8px 0 0 0" }}>
                    If the dizziness comes back, the crystals may be in a different place, so your next repositioning may be different than before. You should NEVER try to put the crystals back on your own unless your therapist decides you should and shows you how. Doing so can make your problem worse.
                </p>
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

function ChevronDownIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
  )
} 