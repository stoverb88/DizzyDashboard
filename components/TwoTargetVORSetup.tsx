"use client"

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSession } from '@/lib/use-session';
import { TTSEngine } from '../utils/TTSEngine';

interface TwoTargetVORSetupProps {
  onBack: () => void;
  onStartExercise: (params: TwoTargetVORParameters) => void;
}

export interface TwoTargetVORParameters {
  duration: 30 | 60 | 90;
  audioType: 'tts' | 'custom' | 'silent';
}

// 12-hour threshold for checklist reset (new patient session)
const CHECKLIST_EXPIRY_MS = 12 * 60 * 60 * 1000;

export function TwoTargetVORSetup({ onBack, onStartExercise }: TwoTargetVORSetupProps) {
  const { user } = useSession();
  const [isMobile, setIsMobile] = useState(false);
  const [duration, setDuration] = useState<30 | 60 | 90>(60);
  const [audioType, setAudioType] = useState<'tts' | 'custom' | 'silent'>('tts');
  const [showContraindications, setShowContraindications] = useState(false);
  const [contraindicationsChecked, setContraindicationsChecked] = useState<boolean[]>([false, false, false]);
  const [checklistCompleted, setChecklistCompleted] = useState(false);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const previewTTSRef = useRef<TTSEngine | null>(null);

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
    const isPatient = user?.role === 'PATIENT';

    if (isPatient) {
      setChecklistCompleted(true);
      setContraindicationsChecked([true, true, true]);
      return;
    }

    try {
      const timestampStr = localStorage.getItem('twotarget-checklist-completed-timestamp');
      if (timestampStr) {
        const timestamp = parseInt(timestampStr, 10);
        const now = Date.now();
        const elapsed = now - timestamp;

        if (elapsed < CHECKLIST_EXPIRY_MS) {
          setChecklistCompleted(true);
          setContraindicationsChecked([true, true, true]);
        } else {
          localStorage.removeItem('twotarget-checklist-completed-timestamp');
        }
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }, [user]);

  // Cleanup preview on unmount
  React.useEffect(() => {
    return () => {
      if (previewTTSRef.current) {
        previewTTSRef.current.cancel();
        previewTTSRef.current.dispose();
      }
    };
  }, []);

  const handleTTSPreview = () => {
    if (isPreviewPlaying) {
      if (previewTTSRef.current) {
        previewTTSRef.current.cancel();
        previewTTSRef.current.dispose();
        previewTTSRef.current = null;
      }
      setIsPreviewPlaying(false);
    } else {
      previewTTSRef.current = new TTSEngine();
      setIsPreviewPlaying(true);

      // Play sample cue sequence
      previewTTSRef.current.speak("Eyes Left", () => {
        setTimeout(() => {
          if (previewTTSRef.current) {
            previewTTSRef.current.speak("Head Left", () => {
              setIsPreviewPlaying(false);
              if (previewTTSRef.current) {
                previewTTSRef.current.dispose();
                previewTTSRef.current = null;
              }
            });
          }
        }, 1500);
      });
    }
  };

  const allContraindicationsChecked = contraindicationsChecked.every(checked => checked);

  const handleStartExercise = () => {
    if (checklistCompleted) {
      onStartExercise({ duration, audioType });
      return;
    }

    if (!allContraindicationsChecked) {
      setShowContraindications(true);
      return;
    }

    onStartExercise({ duration, audioType });
  };

  const handleModalStartExercise = () => {
    if (!allContraindicationsChecked) return;

    try {
      const timestamp = Date.now().toString();
      localStorage.setItem('twotarget-checklist-completed-timestamp', timestamp);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }

    onStartExercise({ duration, audioType });
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
          <h2 style={headerStyle}>Two-Target VOR Setup</h2>
        </div>

        <p style={{
          fontSize: '0.9rem',
          color: '#718096',
          marginBottom: '12px',
          lineHeight: '1.4',
        }}>
          Train the VOR by shifting eyes to a target first, then turning the head to meet that target.
          Audio cues guide the timing: "Eyes Left" → pause → "Head Left" → "Eyes Right" → pause → "Head Right".
        </p>

        {/* Parameter Card */}
        <div style={cardStyle}>
          {/* Duration */}
          <h3 style={{ ...sectionTitleStyle, marginTop: 0 }}>Duration</h3>
          <div style={buttonGroupStyle}>
            <button
              style={radioButtonStyle(duration === 30)}
              onClick={() => setDuration(30)}
            >
              30 sec
            </button>
            <button
              style={radioButtonStyle(duration === 60)}
              onClick={() => setDuration(60)}
            >
              60 sec
            </button>
            <button
              style={radioButtonStyle(duration === 90)}
              onClick={() => setDuration(90)}
            >
              90 sec
            </button>
          </div>

          {/* Audio Type */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={sectionTitleStyle}>Audio Cues</h3>
            {audioType === 'tts' && (
              <button
                onClick={handleTTSPreview}
                style={{
                  background: 'transparent',
                  border: `1.5px solid ${isPreviewPlaying ? '#EF4444' : '#CBD5E0'}`,
                  borderRadius: '6px',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  padding: '0',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = isPreviewPlaying ? '#DC2626' : '#A0AEC0';
                  e.currentTarget.style.backgroundColor = '#F7FAFC';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isPreviewPlaying ? '#EF4444' : '#CBD5E0';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {isPreviewPlaying ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#EF4444">
                    <rect x="5" y="5" width="14" height="14" rx="2" />
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#4A5568">
                    <polygon points="6 4 20 12 6 20" />
                  </svg>
                )}
              </button>
            )}
          </div>
          <div style={buttonGroupStyle}>
            <button
              style={radioButtonStyle(audioType === 'tts')}
              onClick={() => setAudioType('tts')}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 6v12"></path>
                  <path d="M6 12h12"></path>
                  <circle cx="12" cy="12" r="10"></circle>
                </svg>
                <span>Voice (TTS)</span>
              </div>
            </button>
            <button
              style={radioButtonStyle(audioType === 'custom')}
              onClick={() => setAudioType('custom')}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18V5l12-2v13"></path>
                  <circle cx="6" cy="18" r="3"></circle>
                  <circle cx="18" cy="16" r="3"></circle>
                </svg>
                <span>Custom Audio</span>
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
          {audioType === 'custom' && (
            <p style={{
              fontSize: '0.8rem',
              color: '#718096',
              marginTop: '8px',
              fontStyle: 'italic',
            }}>
              Custom audio files not yet configured. The exercise will use visual cues only.
            </p>
          )}
        </div>

        {/* Action Button */}
        <div style={{ marginTop: '16px', overflow: 'hidden' }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
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
      {showContraindications && (
        <div
          style={{
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
          }}
          onClick={(e) => e.stopPropagation()}
        >
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
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#DC2626',
              marginBottom: '16px',
            }}>
              Safety Checklist Required
            </h3>
            <p style={{
              fontSize: '1rem',
              color: '#4A5568',
              marginBottom: '24px',
              lineHeight: '1.6',
            }}>
              Please complete all safety checks before starting the exercise.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              {[
                'Patient has been cleared for vestibular rehabilitation',
                'No active BPPV or cervical spine instability',
                'Patient understands exercise instructions'
              ].map((text, index) => (
                <label key={index} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  fontSize: '0.95rem',
                  color: '#2D3748',
                  cursor: 'pointer',
                  padding: '12px',
                  backgroundColor: contraindicationsChecked[index] ? '#F0FDF4' : '#F7FAFC',
                  borderRadius: '8px',
                  border: `2px solid ${contraindicationsChecked[index] ? '#10B981' : '#E2E8F0'}`,
                  transition: 'all 0.2s',
                }}>
                  <input
                    type="checkbox"
                    checked={contraindicationsChecked[index]}
                    onChange={(e) => {
                      const newChecked = [...contraindicationsChecked];
                      newChecked[index] = e.target.checked;
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
                  <span>{text}</span>
                </label>
              ))}
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
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleModalStartExercise();
                }}
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
                  pointerEvents: allContraindicationsChecked ? 'auto' : 'none',
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
