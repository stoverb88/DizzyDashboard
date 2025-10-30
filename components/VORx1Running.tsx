"use client"

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';
import { VORx1Parameters } from './VORx1Setup';
import { MetronomeEngine } from '../utils/MetronomeEngine';

interface VORx1RunningProps {
  params: VORx1Parameters;
  onComplete: () => void;
  onStop: () => void;
}

type ExercisePhase = 'countdown' | 'running' | 'complete';

export function VORx1Running({ params, onComplete, onStop }: VORx1RunningProps) {
  const [phase, setPhase] = useState<ExercisePhase>('countdown');
  const [countdown, setCountdown] = useState(3);
  const [elapsed, setElapsed] = useState(0);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [isPulsing, setIsPulsing] = useState(false);
  const [currentDirection, setCurrentDirection] = useState<'left' | 'right' | 'up' | 'down'>('left');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const beatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const wakeLockRef = useRef<any>(null);
  const metronomeRef = useRef<MetronomeEngine | null>(null);

  const totalBeats = Math.floor((params.duration * params.cadence) / 60);
  const beatInterval = 60000 / params.cadence; // milliseconds per beat

  // Request wake lock to prevent screen from sleeping
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
          console.log('Wake lock acquired');
        }
      } catch (err) {
        console.log('Wake lock error:', err);
      }
    };

    requestWakeLock();

    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        console.log('Wake lock released');
      }
    };
  }, []);

  // Countdown phase
  useEffect(() => {
    if (phase === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (phase === 'countdown' && countdown === 0) {
      // Start the exercise
      setPhase('running');
      // Initialize direction
      setCurrentDirection(params.orientation === 'horizontal' ? 'left' : 'up');
    }
  }, [phase, countdown, params.orientation]);

  // Exercise running phase
  useEffect(() => {
    if (phase === 'running') {
      // Initialize metronome
      if (!metronomeRef.current && params.audioType !== 'silent') {
        metronomeRef.current = new MetronomeEngine(params.cadence);
        console.log('MetronomeEngine initialized at', params.cadence, 'BPM');
      }

      // Timer for elapsed time
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => {
          const newElapsed = prev + 100; // Update every 100ms for smooth progress

          // Check if exercise is complete
          if (newElapsed >= params.duration * 1000) {
            setPhase('complete');
            if (metronomeRef.current) {
              metronomeRef.current.stop();
            }
            return params.duration * 1000;
          }

          // Play halfway cue (double beep at higher pitch)
          const seconds = Math.floor(newElapsed / 1000);
          const halfwayPoint = Math.floor(params.duration / 2);
          if (seconds === halfwayPoint && newElapsed % 1000 < 100) {
            if (metronomeRef.current && params.audioType !== 'silent') {
              metronomeRef.current.playCue();
              console.log('Halfway point reached');
            }
          }

          return newElapsed;
        });
      }, 100);

      // Start audio metronome with callback for visual sync
      if (metronomeRef.current && params.audioType !== 'silent') {
        metronomeRef.current.start((beatNumber) => {
          setCurrentBeat(beatNumber);

          // Alternate direction with each beat
          if (params.orientation === 'horizontal') {
            setCurrentDirection(beatNumber % 2 === 1 ? 'left' : 'right');
          } else {
            setCurrentDirection(beatNumber % 2 === 1 ? 'up' : 'down');
          }

          // Visual pulse
          setIsPulsing(true);
          setTimeout(() => setIsPulsing(false), 100);
        });
      } else {
        // Fallback visual metronome for silent mode
        beatIntervalRef.current = setInterval(() => {
          setCurrentBeat((prev) => {
            const nextBeat = prev + 1;

            // Alternate direction with each beat
            if (params.orientation === 'horizontal') {
              setCurrentDirection(nextBeat % 2 === 1 ? 'left' : 'right');
            } else {
              setCurrentDirection(nextBeat % 2 === 1 ? 'up' : 'down');
            }

            return nextBeat;
          });
          setIsPulsing(true);
          setTimeout(() => setIsPulsing(false), 100);
        }, beatInterval);
      }

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (beatIntervalRef.current) clearInterval(beatIntervalRef.current);
        if (metronomeRef.current) {
          metronomeRef.current.stop();
        }
      };
    }
  }, [phase, params.duration, params.cadence, params.audioType, params.orientation, beatInterval]);

  // Auto-complete when exercise finishes
  useEffect(() => {
    if (phase === 'complete') {
      const timer = setTimeout(() => {
        onComplete();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [phase, onComplete]);

  const handleStop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (beatIntervalRef.current) clearInterval(beatIntervalRef.current);
    if (metronomeRef.current) {
      metronomeRef.current.stop();
      metronomeRef.current.dispose();
      metronomeRef.current = null;
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

  const targetStyle: React.CSSProperties = {
    fontSize: '120px',
    fontWeight: '700',
    color: '#1A202C',
    fontFamily: 'monospace',
    userSelect: 'none',
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
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: params.orientation === 'horizontal' ? '60px' : '0',
              flexDirection: params.orientation === 'horizontal' ? 'row' : 'column',
            }}
          >
            {/* Left/Up arrow */}
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke={
                isPulsing &&
                ((params.orientation === 'horizontal' && currentDirection === 'left') ||
                 (params.orientation === 'vertical' && currentDirection === 'up'))
                  ? '#2D3748'
                  : '#A0AEC0'
              }
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                opacity:
                  isPulsing &&
                  ((params.orientation === 'horizontal' && currentDirection === 'left') ||
                   (params.orientation === 'vertical' && currentDirection === 'up'))
                    ? 0.9
                    : 0.3,
                transition: 'all 0.1s ease',
              }}
            >
              {params.orientation === 'horizontal' ? (
                <>
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </>
              ) : (
                <>
                  <line x1="12" y1="19" x2="12" y2="5"></line>
                  <polyline points="5 12 12 5 19 12"></polyline>
                </>
              )}
            </svg>

            {/* Target Symbol */}
            <div style={targetStyle}>
              {params.targetSymbol}
            </div>

            {/* Right/Down arrow */}
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke={
                isPulsing &&
                ((params.orientation === 'horizontal' && currentDirection === 'right') ||
                 (params.orientation === 'vertical' && currentDirection === 'down'))
                  ? '#2D3748'
                  : '#A0AEC0'
              }
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                opacity:
                  isPulsing &&
                  ((params.orientation === 'horizontal' && currentDirection === 'right') ||
                   (params.orientation === 'vertical' && currentDirection === 'down'))
                    ? 0.9
                    : 0.3,
                transition: 'all 0.1s ease',
              }}
            >
              {params.orientation === 'horizontal' ? (
                <>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </>
              ) : (
                <>
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <polyline points="19 12 12 19 5 12"></polyline>
                </>
              )}
            </svg>
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
            ✓ Complete!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar - only show during running phase */}
      {phase === 'running' && (
        <>

          {/* Progress Bar with Embedded Timer */}
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
