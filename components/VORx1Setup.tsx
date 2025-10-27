"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/Button';

interface VORx1SetupProps {
  onBack: () => void;
  onStartExercise: (params: VORx1Parameters) => void;
}

export interface VORx1Parameters {
  targetSymbol: 'A' | 'X';
  orientation: 'horizontal' | 'vertical';
  cadence: number; // 60-120 BPM
  duration: number; // 30-120 seconds
  audioType: 'voice' | 'beep' | 'silent';
}

export function VORx1Setup({ onBack, onStartExercise }: VORx1SetupProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [targetSymbol, setTargetSymbol] = useState<'A' | 'X'>('A');
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [cadence, setCadence] = useState(90); // BPM
  const [duration, setDuration] = useState(60); // seconds
  const [audioType, setAudioType] = useState<'voice' | 'beep' | 'silent'>('voice');
  const [showContraindications, setShowContraindications] = useState(false);
  const [contraindicationsChecked, setContraindicationsChecked] = useState<boolean[]>([false, false, false]);
  const [checklistCompleted, setChecklistCompleted] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load checklist completion status from localStorage on mount
  React.useEffect(() => {
    try {
      const completed = localStorage.getItem('vorx1-checklist-completed');
      console.log('Loading checklist status from localStorage:', completed);
      if (completed === 'true') {
        setChecklistCompleted(true);
        setContraindicationsChecked([true, true, true]);
        console.log('Checklist already completed - will skip modal');
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }, []);

  const handleCadenceChange = (value: number) => {
    setCadence(Math.max(60, Math.min(120, value)));
  };

  const handleDurationChange = (value: number) => {
    setDuration(Math.max(30, Math.min(120, value)));
  };

  const allContraindicationsChecked = contraindicationsChecked.every(checked => checked);

  const handleStartExercise = () => {
    console.log('Start Exercise clicked, checklistCompleted:', checklistCompleted, 'allChecked:', allContraindicationsChecked);

    // If checklist already completed (from localStorage), start immediately
    if (checklistCompleted) {
      console.log('Checklist was previously completed, starting exercise immediately');
      onStartExercise({
        targetSymbol,
        orientation,
        cadence,
        duration,
        audioType
      });
      return;
    }

    // Otherwise, show checklist modal if not all checked
    if (!allContraindicationsChecked) {
      console.log('Not all items checked, showing modal');
      setShowContraindications(true);
      return;
    }

    // All checked, start exercise immediately
    console.log('All items checked, starting exercise');
    onStartExercise({
      targetSymbol,
      orientation,
      cadence,
      duration,
      audioType
    });
  };

  const handleModalStartExercise = () => {
    console.log('Modal Start Exercise clicked, all checked:', allContraindicationsChecked);

    if (!allContraindicationsChecked) {
      console.log('Not all items checked, returning');
      return;
    }

    // Save completion status to localStorage
    console.log('Saving checklist completion to localStorage');
    localStorage.setItem('vorx1-checklist-completed', 'true');

    // Start exercise immediately - this will unmount this component
    console.log('Starting exercise with params:', { targetSymbol, orientation, cadence, duration, audioType });
    onStartExercise({
      targetSymbol,
      orientation,
      cadence,
      duration,
      audioType
    });
  };

  const containerStyle: React.CSSProperties = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: isMobile ? '12px' : '20px',
    overflowY: 'auto',
  };

  const headerStyle: React.CSSProperties = {
    fontSize: isMobile ? '1.5rem' : '1.8rem',
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: '4px',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#2D3748',
    marginTop: '16px',
    marginBottom: '8px',
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: isMobile ? '16px' : '20px',
    marginBottom: '12px',
  };

  const sliderContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '12px',
    width: '100%',
  };

  const sliderStyle: React.CSSProperties = {
    flex: 1,
    height: '8px',
    borderRadius: '4px',
    appearance: 'none',
    background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${((cadence - 60) / 60) * 100}%, #E2E8F0 ${((cadence - 60) / 60) * 100}%, #E2E8F0 100%)`,
    outline: 'none',
    cursor: 'pointer',
    minWidth: 0,
  };

  const durationSliderStyle: React.CSSProperties = {
    ...sliderStyle,
    background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${((duration - 30) / 90) * 100}%, #E2E8F0 ${((duration - 30) / 90) * 100}%, #E2E8F0 100%)`,
  };

  const buttonGroupStyle: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
  };

  const radioButtonStyle = (isSelected: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '12px',
    border: `2px solid ${isSelected ? '#3B82F6' : '#E2E8F0'}`,
    borderRadius: '8px',
    backgroundColor: isSelected ? '#EBF8FF' : '#ffffff',
    color: isSelected ? '#2C5282' : '#4A5568',
    fontWeight: isSelected ? '600' : '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'center',
  });

  const incrementButtonStyle: React.CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    border: '1px solid #CBD5E0',
    backgroundColor: '#ffffff',
    color: '#4A5568',
    fontSize: '1.2rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const valueDisplayStyle: React.CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1A202C',
    minWidth: '70px',
    textAlign: 'center',
    flexShrink: 0,
  };

  return (
    <div style={containerStyle}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '32px',
              fontWeight: '900',
              cursor: 'pointer',
              color: '#1e293b',
              padding: '8px',
              borderRadius: '6px',
              transition: 'all 0.2s',
              lineHeight: 1,
              marginRight: '15px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ←
          </button>
          <h2 style={headerStyle}>VOR × 1 Exercise Setup</h2>
        </div>

        <p style={{
          fontSize: '0.9rem',
          color: '#718096',
          marginBottom: '12px',
          lineHeight: '1.4',
        }}>
          Configure parameters for gaze stabilization exercise. Patient maintains visual focus on a stationary target while turning the head at a controlled cadence.
        </p>

        {/* Parameter Card */}
        <div style={cardStyle}>
          {/* Target Symbol */}
          <h3 style={{ ...sectionTitleStyle, marginTop: 0 }}>Target Symbol</h3>
          <div style={buttonGroupStyle}>
            <button
              style={radioButtonStyle(targetSymbol === 'A')}
              onClick={() => setTargetSymbol('A')}
            >
              A
            </button>
            <button
              style={radioButtonStyle(targetSymbol === 'X')}
              onClick={() => setTargetSymbol('X')}
            >
              X
            </button>
          </div>

          {/* Orientation */}
          <h3 style={sectionTitleStyle}>Orientation</h3>
          <div style={buttonGroupStyle}>
            <button
              style={radioButtonStyle(orientation === 'horizontal')}
              onClick={() => setOrientation('horizontal')}
            >
              ← Horizontal →
            </button>
            <button
              style={radioButtonStyle(orientation === 'vertical')}
              onClick={() => setOrientation('vertical')}
            >
              ↑ Vertical ↓
            </button>
          </div>

          {/* Cadence */}
          <h3 style={sectionTitleStyle}>Cadence (Beats Per Minute)</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginTop: '12px' }}>
            <button
              style={incrementButtonStyle}
              onClick={() => handleCadenceChange(cadence - 10)}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F7FAFC'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
            >
              −
            </button>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={valueDisplayStyle}>{cadence}</div>
              <div style={{ width: '100%', marginTop: '8px' }}>
                <input
                  type="range"
                  min="60"
                  max="120"
                  step="5"
                  value={cadence}
                  onChange={(e) => handleCadenceChange(parseInt(e.target.value))}
                  style={{ ...sliderStyle, width: '100%' }}
                />
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  color: '#A0AEC0',
                  marginTop: '4px',
                }}>
                  <span>60 BPM</span>
                  <span>120 BPM</span>
                </div>
              </div>
            </div>
            <button
              style={incrementButtonStyle}
              onClick={() => handleCadenceChange(cadence + 10)}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F7FAFC'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
            >
              +
            </button>
          </div>

          {/* Duration */}
          <h3 style={sectionTitleStyle}>Duration (Seconds)</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginTop: '12px' }}>
            <button
              style={incrementButtonStyle}
              onClick={() => handleDurationChange(duration - 10)}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F7FAFC'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
            >
              −
            </button>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={valueDisplayStyle}>{duration}s</div>
              <div style={{ width: '100%', marginTop: '8px' }}>
                <input
                  type="range"
                  min="30"
                  max="120"
                  step="10"
                  value={duration}
                  onChange={(e) => handleDurationChange(parseInt(e.target.value))}
                  style={{ ...durationSliderStyle, width: '100%' }}
                />
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  color: '#A0AEC0',
                  marginTop: '4px',
                }}>
                  <span>30 sec</span>
                  <span>120 sec</span>
                </div>
              </div>
            </div>
            <button
              style={incrementButtonStyle}
              onClick={() => handleDurationChange(duration + 10)}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F7FAFC'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
            >
              +
            </button>
          </div>

          {/* Audio Cues */}
          <h3 style={sectionTitleStyle}>Audio Cues</h3>
          <div style={buttonGroupStyle}>
            <button
              style={radioButtonStyle(audioType === 'voice')}
              onClick={() => setAudioType('voice')}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {/* Side profile - forehead to top of head */}
                  <path d="M10 4 Q8 3 6 4"></path>
                  {/* Back of head */}
                  <path d="M6 4 Q4 6 4 10 L4 14"></path>
                  {/* Back of neck to chin */}
                  <path d="M4 14 Q4 16 5 17 Q6 18 8 18"></path>
                  {/* Chin to jaw */}
                  <path d="M8 18 Q11 18 13 16"></path>
                  {/* Jaw to mouth area */}
                  <path d="M13 16 L13 13"></path>
                  {/* Mouth (open) */}
                  <path d="M13 13 Q14 13 14 12 Q14 11 13 11"></path>
                  {/* Mouth to nose */}
                  <path d="M13 11 L13 9"></path>
                  {/* Nose */}
                  <path d="M13 9 Q15 9 15 8 L14 7"></path>
                  {/* Nose bridge to forehead */}
                  <path d="M13 9 L12 6 Q11 4 10 4"></path>
                  {/* Sound waves from mouth */}
                  <path d="M16 11 Q18 12 16 13"></path>
                  <path d="M19 10 Q22 12 19 14"></path>
                </svg>
                <span>Voice</span>
              </div>
            </button>
            <button
              style={radioButtonStyle(audioType === 'beep')}
              onClick={() => setAudioType('beep')}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {/* Speaker */}
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  {/* Sound waves */}
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                </svg>
                <span>Beep</span>
              </div>
            </button>
            <button
              style={radioButtonStyle(audioType === 'silent')}
              onClick={() => setAudioType('silent')}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {/* Speaker */}
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  {/* X through speaker */}
                  <line x1="23" y1="9" x2="17" y2="15"></line>
                  <line x1="17" y1="9" x2="23" y2="15"></line>
                </svg>
                <span>Silent</span>
              </div>
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div style={{
          marginTop: '16px',
        }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStartExercise}
            style={{
              width: '100%',
              padding: '12px 30px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#2D3748',
              color: 'white',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            Start Exercise →
          </motion.button>
        </div>

      </motion.div>

      {/* Contraindications Modal */}
      {showContraindications && !allContraindicationsChecked && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: isMobile ? '24px' : '32px',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
          >
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#DC2626',
              marginBottom: '16px',
            }}>
              ⚠️ Safety Checklist Required
            </h3>
            <p style={{
              fontSize: '1rem',
              color: '#4A5568',
              marginBottom: '24px',
              lineHeight: '1.6',
            }}>
              Please complete all safety checks before starting the exercise. This ensures patient safety and appropriate use of vestibular rehabilitation.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                fontSize: '0.95rem',
                color: '#2D3748',
                cursor: 'pointer',
                padding: '12px',
                backgroundColor: contraindicationsChecked[0] ? '#F0FDF4' : '#F7FAFC',
                borderRadius: '8px',
                border: `2px solid ${contraindicationsChecked[0] ? '#10B981' : '#E2E8F0'}`,
                transition: 'all 0.2s',
              }}>
                <input
                  type="checkbox"
                  checked={contraindicationsChecked[0]}
                  onChange={(e) => {
                    const newChecked = [...contraindicationsChecked];
                    newChecked[0] = e.target.checked;
                    setContraindicationsChecked(newChecked);
                  }}
                  style={{
                    width: '20px',
                    height: '20px',
                    marginRight: '12px',
                    cursor: 'pointer',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                />
                <span>Patient has been cleared for vestibular rehabilitation</span>
              </label>
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                fontSize: '0.95rem',
                color: '#2D3748',
                cursor: 'pointer',
                padding: '12px',
                backgroundColor: contraindicationsChecked[1] ? '#F0FDF4' : '#F7FAFC',
                borderRadius: '8px',
                border: `2px solid ${contraindicationsChecked[1] ? '#10B981' : '#E2E8F0'}`,
                transition: 'all 0.2s',
              }}>
                <input
                  type="checkbox"
                  checked={contraindicationsChecked[1]}
                  onChange={(e) => {
                    const newChecked = [...contraindicationsChecked];
                    newChecked[1] = e.target.checked;
                    setContraindicationsChecked(newChecked);
                  }}
                  style={{
                    width: '20px',
                    height: '20px',
                    marginRight: '12px',
                    cursor: 'pointer',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                />
                <span>No active BPPV or cervical spine instability</span>
              </label>
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                fontSize: '0.95rem',
                color: '#2D3748',
                cursor: 'pointer',
                padding: '12px',
                backgroundColor: contraindicationsChecked[2] ? '#F0FDF4' : '#F7FAFC',
                borderRadius: '8px',
                border: `2px solid ${contraindicationsChecked[2] ? '#10B981' : '#E2E8F0'}`,
                transition: 'all 0.2s',
              }}>
                <input
                  type="checkbox"
                  checked={contraindicationsChecked[2]}
                  onChange={(e) => {
                    const newChecked = [...contraindicationsChecked];
                    newChecked[2] = e.target.checked;
                    setContraindicationsChecked(newChecked);
                  }}
                  style={{
                    width: '20px',
                    height: '20px',
                    marginRight: '12px',
                    cursor: 'pointer',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                />
                <span>Patient understands exercise instructions</span>
              </label>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowContraindications(false)}
                style={{
                  flex: 1,
                  padding: '12px 30px',
                  borderRadius: '10px',
                  border: '2px solid #E2E8F0',
                  backgroundColor: 'white',
                  color: '#2D3748',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Go Back
              </motion.button>
              <motion.button
                whileHover={{ scale: allContraindicationsChecked ? 1.05 : 1 }}
                whileTap={{ scale: allContraindicationsChecked ? 0.95 : 1 }}
                onClick={handleModalStartExercise}
                disabled={!allContraindicationsChecked}
                style={{
                  flex: 1,
                  padding: '12px 30px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: allContraindicationsChecked ? '#2D3748' : '#CBD5E0',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: allContraindicationsChecked ? 'pointer' : 'not-allowed',
                  opacity: allContraindicationsChecked ? 1 : 0.6,
                }}
              >
                {allContraindicationsChecked ? 'Start Exercise →' : 'Complete All Items'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
