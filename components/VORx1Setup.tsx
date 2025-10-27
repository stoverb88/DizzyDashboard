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

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleCadenceChange = (value: number) => {
    setCadence(Math.max(60, Math.min(120, value)));
  };

  const handleDurationChange = (value: number) => {
    setDuration(Math.max(30, Math.min(120, value)));
  };

  const allContraindicationsChecked = contraindicationsChecked.every(checked => checked);

  const handleStartExercise = () => {
    if (!allContraindicationsChecked) {
      setShowContraindications(true);
      return;
    }

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
    padding: isMobile ? '20px' : '32px',
    overflowY: 'auto',
  };

  const headerStyle: React.CSSProperties = {
    fontSize: isMobile ? '1.5rem' : '1.8rem',
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: '8px',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#2D3748',
    marginTop: '24px',
    marginBottom: '12px',
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: isMobile ? '20px' : '24px',
    marginBottom: '16px',
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
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
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
          fontSize: '0.95rem',
          color: '#718096',
          marginBottom: '24px',
          lineHeight: '1.5',
        }}>
          Configure parameters for gaze stabilization exercise. Patient maintains visual focus on a stationary target while turning the head at a controlled cadence.
        </p>

        {/* Parameter Card */}
        <div style={cardStyle}>
          {/* Target Symbol */}
          <h3 style={sectionTitleStyle}>Target Symbol</h3>
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
          <div style={sliderContainerStyle}>
            <button
              style={incrementButtonStyle}
              onClick={() => handleCadenceChange(cadence - 10)}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F7FAFC'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
            >
              −
            </button>
            <div style={valueDisplayStyle}>{cadence}</div>
            <button
              style={incrementButtonStyle}
              onClick={() => handleCadenceChange(cadence + 10)}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F7FAFC'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
            >
              +
            </button>
          </div>
          <div style={{ marginTop: '12px' }}>
            <input
              type="range"
              min="60"
              max="120"
              step="5"
              value={cadence}
              onChange={(e) => handleCadenceChange(parseInt(e.target.value))}
              style={sliderStyle}
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

          {/* Duration */}
          <h3 style={sectionTitleStyle}>Duration (Seconds)</h3>
          <div style={sliderContainerStyle}>
            <button
              style={incrementButtonStyle}
              onClick={() => handleDurationChange(duration - 10)}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F7FAFC'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
            >
              −
            </button>
            <div style={valueDisplayStyle}>{duration}s</div>
            <button
              style={incrementButtonStyle}
              onClick={() => handleDurationChange(duration + 10)}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F7FAFC'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
            >
              +
            </button>
          </div>
          <div style={{ marginTop: '12px' }}>
            <input
              type="range"
              min="30"
              max="120"
              step="10"
              value={duration}
              onChange={(e) => handleDurationChange(parseInt(e.target.value))}
              style={durationSliderStyle}
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

          {/* Audio Cues */}
          <h3 style={sectionTitleStyle}>Audio Cues</h3>
          <div style={buttonGroupStyle}>
            <button
              style={radioButtonStyle(audioType === 'voice')}
              onClick={() => setAudioType('voice')}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
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
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
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
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <line x1="23" y1="9" x2="17" y2="15"></line>
                  <line x1="17" y1="9" x2="23" y2="15"></line>
                </svg>
                <span>Silent</span>
              </div>
            </button>
          </div>
        </div>

        {/* Contraindications Checklist */}
        <div style={{
          ...cardStyle,
          backgroundColor: showContraindications && !allContraindicationsChecked ? '#FEF2F2' : '#ffffff',
          borderColor: showContraindications && !allContraindicationsChecked ? '#FECACA' : '#E2E8F0',
        }}>
          <h3 style={{
            ...sectionTitleStyle,
            marginTop: 0,
            color: showContraindications && !allContraindicationsChecked ? '#DC2626' : '#2D3748',
          }}>
            ⚠️ Before Starting
          </h3>
          <p style={{
            fontSize: '0.9rem',
            color: '#4A5568',
            marginBottom: '16px',
            lineHeight: '1.5',
          }}>
            Verify the following criteria before beginning exercise:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '0.9rem',
              color: '#2D3748',
              cursor: 'pointer',
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
                }}
              />
              Patient has been cleared for vestibular rehabilitation
            </label>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '0.9rem',
              color: '#2D3748',
              cursor: 'pointer',
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
                }}
              />
              No active BPPV or cervical spine instability
            </label>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '0.9rem',
              color: '#2D3748',
              cursor: 'pointer',
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
                }}
              />
              Patient understands exercise instructions
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '24px',
          flexDirection: isMobile ? 'column' : 'row',
        }}>
          <Button
            variant="outline"
            size="lg"
            onClick={onBack}
            style={{ flex: 1 }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={handleStartExercise}
            style={{ flex: 1 }}
            disabled={!allContraindicationsChecked}
          >
            {allContraindicationsChecked ? 'Start Exercise →' : 'Complete Checklist First'}
          </Button>
        </div>

        {/* Preview Target */}
        <div style={{
          marginTop: '32px',
          padding: '40px',
          backgroundColor: '#F7FAFC',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: '0.8rem',
            color: '#718096',
            marginBottom: '16px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: '600',
          }}>
            Target Preview
          </p>
          <div style={{
            fontSize: '72px',
            fontWeight: '700',
            color: '#1A202C',
            fontFamily: 'monospace',
          }}>
            {targetSymbol}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
