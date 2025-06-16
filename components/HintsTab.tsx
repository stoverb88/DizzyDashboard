import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

const hintsData = [
  {
    id: 'hi',
    name: 'Head Impulse',
    title: 'Head Impulse',
    peripheralFinding: 'Corrective Saccade',
    peripheralInfo: 'Indicates a peripheral vestibular lesion (e.g., vestibular neuritis).',
    centralFinding: 'Normal Head Impulse',
    centralInfo: 'In a patient with ongoing vertigo, a normal test is a red flag for a central cause like a stroke.'
  },
  {
    id: 'n',
    name: 'Nystagmus',
    title: 'Nystagmus',
    peripheralFinding: 'Unidirectional Nystagmus',
    peripheralInfo: 'Horizontal nystagmus that does not change direction with gaze.',
    centralFinding: 'Direction-Changing Nystagmus',
    centralInfo: 'Nystagmus changes direction with gaze, or is purely vertical/torsional.'
  },
  {
    id: 'ts',
    name: 'Test of Skew',
    title: 'Test of Skew',
    peripheralFinding: 'No Skew Deviation',
    peripheralInfo: 'Eyes remain aligned, which is a normal finding.',
    centralFinding: 'Skew Deviation Present',
    centralInfo: 'Vertical misalignment of the eyes when one is covered, suggesting a central lesion.'
  }
];

type Selection = 'peripheral' | 'central' | null;

interface PeripheralCentralSliderProps {
  id: string;
  value: Selection;
  onChange: (value: 'peripheral' | 'central') => void;
}

function PeripheralCentralSlider({ id, value, onChange }: PeripheralCentralSliderProps) {
  const trackStyle: React.CSSProperties = {
    width: '100%',
    height: '50px',
    backgroundColor: '#e5e7eb',
    borderRadius: '25px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 10px',
    position: 'relative',
    cursor: 'pointer',
  };

  const knobStyle: React.CSSProperties = {
    width: 'calc(50% - 5px)',
    height: '40px',
    borderRadius: '20px',
    backgroundColor: 'white',
    position: 'absolute',
    top: '5px',
    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  };

  const peripheralSelected = value === 'peripheral';
  const centralSelected = value === 'central';

  const knobTransform = peripheralSelected ? 'translateX(0%)' : 'translateX(100%)';

  const knobColor = peripheralSelected ? '#34d399' : (centralSelected ? '#f87171' : '#ffffff');

  const textStyle: React.CSSProperties = {
    fontWeight: 600,
    zIndex: 1,
    width: '50%',
    textAlign: 'center',
  };

  return (
    <div style={trackStyle}>
      {!value && <div style={{...knobStyle, width: '40px', left: 'calc(50% - 20px)', backgroundColor: '#9ca3af'}} />}
      {value && <motion.div style={{...knobStyle, backgroundColor: knobColor, transform: knobTransform }} layoutId={id} />}
      <div style={{ ...textStyle, color: peripheralSelected ? 'white' : 'black' }} onClick={() => onChange('peripheral')}>Peripheral</div>
      <div style={{ ...textStyle, color: centralSelected ? 'white' : 'black' }} onClick={() => onChange('central')}>Central</div>
    </div>
  );
}

export function HintsTab() {
  const [selections, setSelections] = useState<{ [key: string]: Selection }>({
    hi: null,
    n: null,
    ts: null,
  });

  const handleSelection = (id: string, value: 'peripheral' | 'central') => {
    setSelections(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const nextSteps = useMemo(() => {
    const { hi, n, ts } = selections;
    const isComplete = hi && n && ts;

    if (!isComplete) {
      return {
        title: "Complete the exam",
        text: "Select a finding for each component of the HINTS exam to see the clinical implications.",
        color: "#6b7280"
      };
    }
    
    // HINTS to INFARCT rule: One central finding is enough
    const isCentral = hi === 'central' || n === 'central' || ts === 'central';
    
    if (isCentral) {
      return {
        title: "High Risk - Possible Stroke",
        text: "The presence of one or more central signs in the HINTS exam is highly suggestive of a central cause, such as a stroke. This patient requires an URGENT referral to the Emergency Department for immediate neurological evaluation and imaging.",
        color: "#ef4444"
      };
    }
    
    return {
      title: "Low Risk - Likely Peripheral",
      text: "The combination of an abnormal Head Impulse, unidirectional Nystagmus, and no Skew Deviation points towards a peripheral cause like vestibular neuritis. The patient can be managed with supportive care and vestibular rehabilitation.",
      color: "#22c55e"
    };
  }, [selections]);


  return (
    <div style={{ 
      padding: '15px 10px', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      backgroundColor: '#f4f4f9',
      maxWidth: '100%',
      overflow: 'hidden'
    }}>
      {hintsData.map(item => (
        <div key={item.id} style={{ 
          marginBottom: '12px', 
          backgroundColor: 'white', 
          padding: '15px 12px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          borderRadius: '8px',
          maxWidth: '100%',
          overflow: 'hidden'
        }}>
          <h2 style={{ textAlign: 'center', color: '#333', margin: '0 0 12px 0', fontSize: '1.25rem', fontWeight: 'bold' }}>{item.title}</h2>
          <PeripheralCentralSlider 
            id={item.id}
            value={selections[item.id]}
            onChange={(val) => handleSelection(item.id, val)}
          />
          <div style={{
            display: 'flex', 
            justifyContent: 'space-between', 
            marginTop: '12px', 
            fontSize: '13px',
            gap: '8px'
          }}>
            <div style={{
              flex: '1', 
              textAlign: 'center', 
              color: '#4b5563',
              minWidth: 0, // Allow shrinking
              padding: '0 4px'
            }}>
                <strong style={{display: 'block', marginBottom: '4px'}}>{item.peripheralFinding}</strong>
                <p style={{
                  margin: '0', 
                  fontSize: '11px', 
                  lineHeight: '1.3',
                  wordWrap: 'break-word',
                  hyphens: 'auto'
                }}>{item.peripheralInfo}</p>
            </div>
            <div style={{
              flex: '1', 
              textAlign: 'center', 
              color: '#4b5563',
              minWidth: 0, // Allow shrinking
              padding: '0 4px'
            }}>
                <strong style={{display: 'block', marginBottom: '4px'}}>{item.centralFinding}</strong>
                <p style={{
                  margin: '0', 
                  fontSize: '11px', 
                  lineHeight: '1.3',
                  wordWrap: 'break-word',
                  hyphens: 'auto'
                }}>{item.centralInfo}</p>
            </div>
          </div>
        </div>
      ))}

      <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', fontSize: '1.1rem', color: '#1f2937', margin: '0 0 8px 10px' }}>
          <input type="checkbox" checked={!!selections.hi || !!selections.n || !!selections.ts} readOnly style={{width: '18px', height: '18px', marginRight: '10px'}}/>
          Next Steps:
        </h3>
        <div style={{ backgroundColor: 'white', padding: '15px', borderLeft: `5px solid ${nextSteps.color}` }}>
          <h4 style={{margin: '0 0 8px 0', color: nextSteps.color, fontSize: '1rem', fontWeight: 'bold'}}>{nextSteps.title}</h4>
          <p style={{margin: 0, color: '#4b5563', lineHeight: 1.5, fontSize: '13px' }}>{nextSteps.text}</p>
        </div>
      </div>
    </div>
  );
} 