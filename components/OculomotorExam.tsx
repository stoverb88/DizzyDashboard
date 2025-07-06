import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player/youtube';
import { useSwipeable } from 'react-swipeable';
import { motion, AnimatePresence } from 'framer-motion';
import { VideoCarousel } from './VideoCarousel';

const oculomotorTests = [
  {
    title: "Spontaneous Nystagmus",
    abnormalFindings: "Central signs: Vertical or torsional nystagmus. Peripheral signs: Horizontal nystagmus (within 48-72h).",
    videos: [
      { name: "Vertical", url: "https://www.youtube.com/watch?v=_KtMS7hx5c4" },
      { name: "Torsional", url: "https://www.youtube.com/watch?v=i3N7Zhm42G0" },
      { name: "Horizontal", url: "https://www.youtube.com/watch?v=THhcZhobVYs" }
    ]
  },
  {
    title: "Gaze-Evoked Nystagmus",
    abnormalFindings: "Central signs: Direction changes with gaze direction. Peripheral signs: Direction-fixed, beats toward unaffected ear.",
    videos: [
      { name: "Direction-Changing (Central)", url: "https://www.youtube.com/watch?v=Dlwu6CpuHY4" },
      { name: "Direction-Fixed (Peripheral)", url: "https://www.youtube.com/watch?v=FEVNoEW38CI" }
    ]
  },
  {
    title: "Saccadic Eye Movements",
    abnormalFindings: "Hypermetric (overshoot) or hypometric (undershoot) saccades suggest central signs.",
    videos: [
      { name: "Saccade Testing", url: "https://www.youtube.com/watch?v=D_y56PQvZZA" }
    ]
  },
  {
    title: "VOR Cancellation",
    abnormalFindings: "Inability to suppress VOR suggests central signs.",
    videos: [
      { name: "VOR Cancellation Test", url: "https://www.youtube.com/watch?v=7Nw3TgieAjI" }
    ]
  },
  {
    title: "Head Impulse Test (HIT)",
    abnormalFindings: "Catch-up saccade when turning toward affected ear indicates peripheral signs.",
    videos: [
      { name: "HIT Technique", url: "https://www.youtube.com/watch?v=rr-MFxDcwWs" }
    ]
  },
  {
    title: "Test of Skew Deviation",
    abnormalFindings: "Vertical realignment when covering/uncovering either eye suggests central signs (brainstem).",
    videos: [
      { name: "Alternate Cover Test", url: "https://www.youtube.com/watch?v=zgqCXef-qPs" }
    ]
  }
];

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

function ChevronDownIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
  )
}

export function OculomotorExam() {
  const [testIndex, setTestIndex] = useState(0);
  const [openAbnormalIndex, setOpenAbnormalIndex] = useState<number | null>(null);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

  const handleNext = () => {
    setTestIndex((prev) => Math.min(prev + 1, oculomotorTests.length - 1));
  };

  const handlePrev = () => {
    setTestIndex((prev) => Math.max(0, prev - 1));
  };

  const handleAbnormalCardClick = (index: number) => {
    setOpenAbnormalIndex(openAbnormalIndex === index ? null : index);
  };

  const handleContentAreaClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
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

  const renderAbnormalContent = (item: any, index: number, isFlipped: boolean) => {
    if (isFlipped) {
      // PT Considerations side
      return (
        <div>
          <h4 style={{ color: '#1f2937', margin: '0 0 12px 0', fontWeight: '600', fontSize: '16px' }}>PT Considerations:</h4>
          {item.ptConsiderations.split('\n\n').map((section: string, i: number) => (
            <div key={i} style={{ marginBottom: '12px' }}>
              {section.split('\n').map((line: string, lineIdx: number) => (
                <p key={lineIdx} style={{ 
                  color: '#374151', 
                  margin: '0 0 6px 0', 
                  lineHeight: 1.6,
                  paddingLeft: line.startsWith('•') ? '0' : '0'
                }}>
                  {line.startsWith('•') ? line : (line.includes(':') && !line.startsWith('Direction-') ? <strong>{line}</strong> : line)}
                </p>
              ))}
            </div>
          ))}
        </div>
      );
    } else {
      // Conditions side
      return (
        <div>
          <h4 style={{ color: '#1f2937', margin: '0 0 12px 0', fontWeight: '600', fontSize: '16px' }}>Conditions:</h4>
          {item.conditions.split('\n\n').map((section: string, i: number) => (
            <div key={i} style={{ marginBottom: '12px' }}>
              {section.split('\n').map((line: string, lineIdx: number) => (
                <p key={lineIdx} style={{ 
                  color: '#374151', 
                  margin: '0 0 6px 0', 
                  lineHeight: 1.6,
                  paddingLeft: line.startsWith('•') ? '0' : '0'
                }}>
                  {line.startsWith('•') ? line : (line.includes('Key Distinction:') ? <strong>{line}</strong> : line)}
                </p>
              ))}
            </div>
          ))}
        </div>
      );
    }
  };
  
  const currentTest = oculomotorTests[testIndex];

  const buttonStyle: React.CSSProperties = {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: 'bold',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backgroundColor: '#667eea',
    color: 'white',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
  };

  const disabledButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#d1d5db',
    cursor: 'not-allowed',
    boxShadow: 'none'
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#f4f4f9' }}>
      <div style={{padding: '20px 20px 0 20px'}}>
        <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>{`Test ${testIndex + 1}: ${currentTest.title}`}</h2>
      </div>
      
      <VideoCarousel key={testIndex} videos={currentTest.videos} autoplayFirst={false} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
        <button
          onClick={handlePrev}
          disabled={testIndex === 0}
          style={testIndex === 0 ? disabledButtonStyle : buttonStyle}
        >
          &larr; Previous Test
        </button>
        <span style={{color: '#555', fontWeight: '600'}}>
          {testIndex + 1} / {oculomotorTests.length}
        </span>
        <button
          onClick={handleNext}
          disabled={testIndex === oculomotorTests.length - 1}
          style={testIndex === oculomotorTests.length - 1 ? disabledButtonStyle : buttonStyle}
        >
          Next Test &rarr;
        </button>
      </div>

      {/* Abnormal Findings Detailed Cards Section */}
      <div style={{ padding: '0 20px 20px 20px', backgroundColor: '#f4f4f9' }}>
        <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '20px', fontSize: '20px' }}>
          Detailed Abnormal Findings Reference
        </h2>
        {abnormalFindingsData.map((item, index) => (
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
              onClick={() => handleAbnormalCardClick(index)}
            >
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>{item.title}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {openAbnormalIndex === index && (
                  <span style={{ 
                    fontSize: '12px', 
                    color: '#6b7280', 
                    fontStyle: 'italic' 
                  }}>
                    {flippedCards.has(index) ? "Showing: PT Considerations" : "Showing: Conditions"} • Tap content to switch
                  </span>
                )}
                <motion.div animate={{ rotate: openAbnormalIndex === index ? 180 : 0 }}>
                  <ChevronDownIcon />
                </motion.div>
              </div>
            </motion.div>
            <AnimatePresence>
              {openAbnormalIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{ 
                    overflow: 'hidden', 
                    backgroundColor: item.bgColor, 
                    borderLeft: `5px solid ${item.color}`,
                    cursor: 'pointer'
                  }}
                  onClick={(e) => handleContentAreaClick(index, e)}
                >
                  <div style={{ padding: '20px' }}>
                    {renderAbnormalContent(item, index, flippedCards.has(index))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
} 