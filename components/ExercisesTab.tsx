"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { VORx1Setup, VORx1Parameters } from './VORx1Setup';
import { VORx1Running } from './VORx1Running';
import { VORx1Results, VORx1ResultsData } from './VORx1Results';
import { PatientDashboard } from './PatientDashboard';
import { useSession } from '@/lib/use-session';

type ExerciseView = 'library' | 'vorx1-setup' | 'vorx1-running' | 'vorx1-results';

export function ExercisesTab() {
  const { user } = useSession();
  const [isMobile, setIsMobile] = useState(false);
  const [currentView, setCurrentView] = useState<ExerciseView>('library');
  const [exerciseParams, setExerciseParams] = useState<VORx1Parameters | null>(null);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check if user has seen the disclaimer
  // Patients are pre-screened by clinicians, so automatically bypass for them
  React.useEffect(() => {
    const isPatient = user?.role === 'PATIENT';

    if (isPatient) {
      // Patients don't need to see the disclaimer - they're already clinically cleared
      localStorage.setItem('exercises-disclaimer-seen', 'true');
      return;
    }

    // For medical professionals, check if they've seen it before
    const disclaimerSeen = localStorage.getItem('exercises-disclaimer-seen');
    if (disclaimerSeen !== 'true') {
      setShowDisclaimerModal(true);
    }
  }, [user]);

  const handleDisclaimerAccept = () => {
    localStorage.setItem('exercises-disclaimer-seen', 'true');
    setShowDisclaimerModal(false);
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

  const subtitleStyle: React.CSSProperties = {
    fontSize: '0.95rem',
    color: '#718096',
    marginBottom: '24px',
    lineHeight: '1.5',
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: isMobile ? '20px' : '24px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const handleVORx1Click = () => {
    setCurrentView('vorx1-setup');
  };

  const handleBackToLibrary = () => {
    setCurrentView('library');
    setExerciseParams(null);
  };

  const handleStartExercise = (params: VORx1Parameters) => {
    console.log('ExercisesTab: handleStartExercise called with params:', params);
    // Set params first, then view in a callback to ensure params are set
    setExerciseParams(params);
    // Use setTimeout to ensure state update completes before changing view
    setTimeout(() => {
      setCurrentView('vorx1-running');
      console.log('ExercisesTab: Set view to vorx1-running');
    }, 0);
  };

  const handleExerciseComplete = () => {
    setCurrentView('vorx1-results');
  };

  const handleExerciseStop = () => {
    // Go back to setup to allow adjustments
    setCurrentView('vorx1-setup');
  };

  const handleResultsComplete = async (results: VORx1ResultsData) => {
    console.log('Exercise results:', results);

    // Save exercise session to database
    try {
      const response = await fetch('/api/exercises/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseType: 'VORx1',
          params: exerciseParams,
          results: results,
          actualDuration: exerciseParams?.duration,
          beatCount: exerciseParams ? Math.floor((exerciseParams.duration * exerciseParams.cadence) / 60) : 0
        })
      });

      if (!response.ok) {
        console.error('Failed to save exercise session');
      }
    } catch (error) {
      console.error('Error saving exercise session:', error);
    }

    // Return to exercise library
    handleBackToLibrary();
  };

  const handleRepeatOtherDirection = (keepSameCadence: boolean) => {
    if (!exerciseParams) return;

    // Switch orientation
    const newOrientation = exerciseParams.orientation === 'horizontal' ? 'vertical' : 'horizontal';

    // Create new parameters with switched orientation
    const newParams: VORx1Parameters = {
      ...exerciseParams,
      orientation: newOrientation,
      // Keep or reset cadence based on user choice
      ...(keepSameCadence ? {} : { cadence: 60 }) // Default to 60 if choosing new
    };

    // If not keeping same cadence, go back to setup for selection
    if (keepSameCadence) {
      setExerciseParams(newParams);
      // Go directly to running phase with same parameters
      setTimeout(() => {
        setCurrentView('vorx1-running');
      }, 0);
    } else {
      // Go to setup screen with new orientation pre-selected
      setExerciseParams(newParams);
      setCurrentView('vorx1-setup');
    }
  };

  // Render different views based on state
  if (currentView === 'vorx1-setup') {
    return <VORx1Setup onBack={handleBackToLibrary} onStartExercise={handleStartExercise} />;
  }

  if (currentView === 'vorx1-running' && exerciseParams) {
    return (
      <VORx1Running
        params={exerciseParams}
        onComplete={handleExerciseComplete}
        onStop={handleExerciseStop}
      />
    );
  }

  if (currentView === 'vorx1-results' && exerciseParams) {
    return (
      <VORx1Results
        params={exerciseParams}
        onComplete={handleResultsComplete}
        onRepeatOtherDirection={handleRepeatOtherDirection}
      />
    );
  }

  // Default: Exercise Library View
  return (
    <div style={containerStyle}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 style={headerStyle}>Vestibular Exercises</h2>
        <p style={subtitleStyle}>
          Clinician-guided rehabilitation exercises with customizable parameters and audio cues.
        </p>

        {/* VORx1 Exercise Card */}
        <motion.div
          style={cardStyle}
          onClick={handleVORx1Click}
          whileHover={{
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-2px)',
          }}
          whileTap={{ scale: 0.98 }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}>
            <div style={{ flex: 1 }}>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                color: '#1A202C',
                marginBottom: '8px',
              }}>
                VOR × 1 Gaze Stabilization
              </h3>
              <p style={{
                fontSize: '0.9rem',
                color: '#4A5568',
                marginBottom: '0',
                lineHeight: '1.5',
              }}>
                Patient maintains visual focus on a stationary target while turning the head at a controlled cadence.
              </p>
            </div>
            <div style={{
              fontSize: '1.5rem',
              color: '#A0AEC0',
              marginLeft: '16px',
            }}>
              →
            </div>
          </div>
        </motion.div>

        {/* Future Exercises (Placeholder) */}
        <div style={{
          ...cardStyle,
          opacity: 0.5,
          cursor: 'not-allowed',
          backgroundColor: '#F7FAFC',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}>
            <div style={{ flex: 1 }}>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                color: '#718096',
                marginBottom: '8px',
              }}>
                Additional Exercises
              </h3>
              <p style={{
                fontSize: '0.9rem',
                color: '#A0AEC0',
                marginBottom: '0',
                lineHeight: '1.5',
              }}>
                More rehabilitation exercises coming soon...
              </p>
            </div>
          </div>
        </div>

        {/* Generate Patient Code Button - Only for Medical Professionals */}
        {user?.role === 'MEDICAL_PROFESSIONAL' && (
          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <button
              onClick={async () => {
                setIsGenerating(true);
                try {
                  const response = await fetch('/api/invites', { method: 'POST' });
                  const data = await response.json();
                  if (response.ok) {
                    setGeneratedCode(data.code);
                  }
                } catch (err) {
                  console.error('Error generating invite:', err);
                } finally {
                  setIsGenerating(false);
                }
              }}
              disabled={isGenerating}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: 'white',
                color: '#3b82f6',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                opacity: isGenerating ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isGenerating) {
                  e.currentTarget.style.backgroundColor = '#eff6ff';
                  e.currentTarget.style.borderColor = '#3b82f6';
                }
              }}
              onMouseLeave={(e) => {
                if (!isGenerating) {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <line x1="19" y1="8" x2="19" y2="14"></line>
                <line x1="22" y1="11" x2="16" y2="11"></line>
              </svg>
              {isGenerating ? 'Generating...' : 'Generate Patient Code'}
            </button>

            {/* Display generated code */}
            {generatedCode && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginTop: '24px',
                  textAlign: 'center',
                }}
              >
                <div style={{
                  fontSize: '3rem',
                  fontWeight: '700',
                  color: '#3b82f6',
                  fontFamily: 'monospace',
                  letterSpacing: '0.1em',
                  marginBottom: '16px',
                }}>
                  {generatedCode}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedCode);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: '1px solid #3b82f6',
                    backgroundColor: copiedCode ? '#3b82f6' : 'white',
                    color: copiedCode ? 'white' : '#3b82f6',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {copiedCode ? 'Copied!' : 'Copy Code'}
                </button>
              </motion.div>
            )}
          </div>
        )}

        {/* Patient Dashboard - Only for Medical Professionals */}
        {user?.role === 'MEDICAL_PROFESSIONAL' && (
          <PatientDashboard />
        )}
      </motion.div>

      {/* Disclaimer Modal */}
      {showDisclaimerModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
              color: '#1A202C',
              marginBottom: '16px',
            }}>
              Clinical Support Tool
            </h3>
            <p style={{
              fontSize: '1rem',
              color: '#4A5568',
              marginBottom: '24px',
              lineHeight: '1.6',
            }}>
              This module provides guided exercise timing and documentation support. It does not diagnose conditions or prescribe treatment. All exercise parameters must be determined by a qualified healthcare professional.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDisclaimerAccept}
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
              I Understand
            </motion.button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
