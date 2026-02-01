"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TwoTargetVORParameters } from './TwoTargetVORSetup';
import { TTSEngine } from '../utils/TTSEngine';

interface TwoTargetVORRunningProps {
  params: TwoTargetVORParameters;
  onComplete: () => void;
  onStop: () => void;
}

type ExercisePhase = 'countdown' | 'running' | 'complete';

// Cue sequence state machine
type CueType = 'eyes-left' | 'head-left' | 'eyes-right' | 'head-right' | 'pause';

interface CueStep {
  type: CueType;
  text?: string;
  target?: 'left' | 'right';
  duration?: number; // for pauses
}

const CUE_SEQUENCE: CueStep[] = [
  { type: 'eyes-left', text: 'Eyes Left', target: 'left' },
  { type: 'pause', duration: 1000 },
  { type: 'head-left', text: 'Head Left', target: 'left' },
  { type: 'pause', duration: 800 },
  { type: 'eyes-right', text: 'Eyes Right', target: 'right' },
  { type: 'pause', duration: 1000 },
  { type: 'head-right', text: 'Head Right', target: 'right' },
  { type: 'pause', duration: 800 },
];

export function TwoTargetVORRunning({ params, onComplete, onStop }: TwoTargetVORRunningProps) {
  const [phase, setPhase] = useState<ExercisePhase>('countdown');
  const [countdown, setCountdown] = useState(3);
  const [elapsed, setElapsed] = useState(0);
  const [activeTarget, setActiveTarget] = useState<'left' | 'right' | null>(null);
  const [currentCueText, setCurrentCueText] = useState<string>('');
  const [cueIndex, setCueIndex] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const ttsRef = useRef<TTSEngine | null>(null);
  const cueTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRunningRef = useRef(false);

  // Request wake lock to prevent screen from sleeping
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        console.log('Wake lock error:', err);
      }
    };

    requestWakeLock();

    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
      }
    };
  }, []);

  // Initialize TTS engine
  useEffect(() => {
    if (params.audioType === 'tts') {
      ttsRef.current = new TTSEngine();
    }

    return () => {
      if (ttsRef.current) {
        ttsRef.current.dispose();
        ttsRef.current = null;
      }
    };
  }, [params.audioType]);

  // Countdown phase
  useEffect(() => {
    if (phase === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (phase === 'countdown' && countdown === 0) {
      setPhase('running');
      isRunningRef.current = true;
    }
  }, [phase, countdown]);

  // Process current cue
  const processCue = useCallback(() => {
    if (!isRunningRef.current) return;

    const currentCue = CUE_SEQUENCE[cueIndex % CUE_SEQUENCE.length];

    if (currentCue.type === 'pause') {
      // Clear cue text during pause
      setCurrentCueText('');

      cueTimeoutRef.current = setTimeout(() => {
        if (isRunningRef.current) {
          setCueIndex(prev => prev + 1);
        }
      }, currentCue.duration);
    } else {
      // Spoken cue
      if (currentCue.target) {
        setActiveTarget(currentCue.target);
      }
      setCurrentCueText(currentCue.text || '');

      if (params.audioType === 'tts' && ttsRef.current && currentCue.text) {
        ttsRef.current.speak(currentCue.text, () => {
          if (isRunningRef.current) {
            setCueIndex(prev => prev + 1);
          }
        });
      } else if (params.audioType === 'custom') {
        // Custom audio not implemented yet - use timing fallback
        cueTimeoutRef.current = setTimeout(() => {
          if (isRunningRef.current) {
            setCueIndex(prev => prev + 1);
          }
        }, 800);
      } else {
        // Silent mode - use fixed timing
        cueTimeoutRef.current = setTimeout(() => {
          if (isRunningRef.current) {
            setCueIndex(prev => prev + 1);
          }
        }, 800);
      }
    }
  }, [cueIndex, params.audioType]);

  // Exercise running phase - start cue sequence
  useEffect(() => {
    if (phase === 'running') {
      // Start elapsed time tracking
      intervalRef.current = setInterval(() => {
        setElapsed(prev => {
          const newElapsed = prev + 100;

          if (newElapsed >= params.duration * 1000) {
            setPhase('complete');
            isRunningRef.current = false;
            return params.duration * 1000;
          }

          return newElapsed;
        });
      }, 100);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [phase, params.duration]);

  // Process cues when cueIndex changes
  useEffect(() => {
    if (phase === 'running' && isRunningRef.current) {
      processCue();
    }

    return () => {
      if (cueTimeoutRef.current) {
        clearTimeout(cueTimeoutRef.current);
      }
    };
  }, [phase, cueIndex, processCue]);

  // Auto-complete when exercise finishes
  useEffect(() => {
    if (phase === 'complete') {
      if (ttsRef.current) {
        ttsRef.current.cancel();
      }
      const timer = setTimeout(() => {
        onComplete();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [phase, onComplete]);

  const handleStop = () => {
    isRunningRef.current = false;
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (cueTimeoutRef.current) clearTimeout(cueTimeoutRef.current);
    if (ttsRef.current) {
      ttsRef.current.cancel();
      ttsRef.current.dispose();
      ttsRef.current = null;
    }
    onStop();
  };

  const progress = phase === 'running' ? (elapsed / (params.duration * 1000)) * 100 : 0;
  const remainingSeconds = Math.ceil((params.duration * 1000 - elapsed) / 1000);

  const containerStyle: React.CSSProperties = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7FAFC',
    position: 'relative',
    overflow: 'hidden',
  };

  const leftTargetStyle: React.CSSProperties = {
    position: 'fixed',
    left: '10%',
    top: '50%',
    transform: `translateY(-50%) ${activeTarget === 'left' ? 'scale(1.1)' : 'scale(1)'}`,
    fontSize: activeTarget === 'left' ? '120px' : '100px',
    fontWeight: '700',
    fontFamily: 'monospace',
    color: activeTarget === 'left' ? '#1A202C' : '#CBD5E0',
    transition: 'all 0.3s ease',
    userSelect: 'none',
    textShadow: activeTarget === 'left' ? '0 0 20px rgba(59, 130, 246, 0.3)' : 'none',
    zIndex: 10,
  };

  const rightTargetStyle: React.CSSProperties = {
    position: 'fixed',
    right: '10%',
    top: '50%',
    transform: `translateY(-50%) ${activeTarget === 'right' ? 'scale(1.1)' : 'scale(1)'}`,
    fontSize: activeTarget === 'right' ? '120px' : '100px',
    fontWeight: '700',
    fontFamily: 'monospace',
    color: activeTarget === 'right' ? '#1A202C' : '#CBD5E0',
    transition: 'all 0.3s ease',
    userSelect: 'none',
    textShadow: activeTarget === 'right' ? '0 0 20px rgba(59, 130, 246, 0.3)' : 'none',
    zIndex: 10,
  };

  const cueTextStyle: React.CSSProperties = {
    position: 'absolute',
    top: '25%',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '2rem',
    fontWeight: '600',
    color: '#3B82F6',
    textAlign: 'center',
    opacity: currentCueText ? 1 : 0,
    transition: 'opacity 0.2s ease',
  };

  const progressBarContainerStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '600px',
    height: '50px',
    backgroundColor: '#E2E8F0',
    borderRadius: '8px',
    position: 'fixed',
    bottom: '180px',
    left: '50%',
    transform: 'translateX(-50%)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
  };

  const progressBarStyle: React.CSSProperties = {
    height: '100%',
    backgroundColor: '#3B82F6',
    transition: 'width 0.1s linear',
    width: `${progress}%`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: '16px',
    borderRadius: '8px',
  };

  const stopButtonStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '100px',
    left: '50%',
    transform: 'translateX(-50%)',
  };

  return (
    <div style={containerStyle}>
      <AnimatePresence mode="wait">
        {phase === 'countdown' && (
          <motion.div
            key="countdown"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              fontSize: '150px',
              fontWeight: '700',
              color: '#3B82F6',
            }}
          >
            {countdown > 0 ? countdown : 'GO!'}
          </motion.div>
        )}

        {phase === 'running' && (
          <motion.div
            key="running"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={cueTextStyle}
          >
            {currentCueText}
          </motion.div>
        )}

        {phase === 'complete' && (
          <motion.div
            key="complete"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              fontSize: '3rem',
              fontWeight: '700',
              color: '#10B981',
              textAlign: 'center',
            }}
          >
            Complete!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Targets - show during countdown and running phases */}
      {(phase === 'countdown' || phase === 'running') && (
        <>
          <div style={leftTargetStyle}>
            X
          </div>
          <div style={rightTargetStyle}>
            X
          </div>
        </>
      )}

      {/* Progress Bar - only show during running phase */}
      {phase === 'running' && (
        <>
          <div style={progressBarContainerStyle}>
            <div style={progressBarStyle}>
              {progress > 15 && (
                <span style={{
                  color: 'white',
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  fontFamily: 'monospace',
                }}>
                  {remainingSeconds}s
                </span>
              )}
            </div>
            {progress <= 15 && (
              <span style={{
                position: 'absolute',
                right: '16px',
                color: '#718096',
                fontSize: '1.2rem',
                fontWeight: '600',
                fontFamily: 'monospace',
              }}>
                {remainingSeconds}s
              </span>
            )}
          </div>

          {/* Stop Button */}
          <div style={stopButtonStyle}>
            <button
              onClick={handleStop}
              style={{
                backgroundColor: '#EF4444',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '16px 32px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#DC2626';
                e.currentTarget.style.transform = 'scale(0.98)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#EF4444';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Stop Exercise
            </button>
          </div>
        </>
      )}
    </div>
  );
}
