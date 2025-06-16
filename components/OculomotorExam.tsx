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

export function OculomotorExam() {
  const [testIndex, setTestIndex] = useState(0);

  const handleNext = () => {
    setTestIndex((prev) => Math.min(prev + 1, oculomotorTests.length - 1));
  };

  const handlePrev = () => {
    setTestIndex((prev) => Math.max(0, prev - 1));
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
      
      <VideoCarousel key={testIndex} videos={currentTest.videos} />

      <div style={{
        padding: '16px 20px',
        backgroundColor: 'white',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        margin: '20px',
        flexGrow: 1
      }}>
        <h3 style={{ color: '#d9534f', marginBottom: '10px', fontSize: '16px' }}>Abnormal Findings:</h3>
        <p style={{ color: '#555', lineHeight: 1.6, fontSize: '14px' }}>{currentTest.abnormalFindings}</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px 20px 20px' }}>
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
    </div>
  );
} 