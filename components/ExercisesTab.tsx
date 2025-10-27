"use client"

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function ExercisesTab() {
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    // TODO: Navigate to VORx1 setup screen
    console.log('VORx1 clicked');
  };

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

        {/* Disclaimer Notice */}
        <div style={{
          backgroundColor: '#FEF3C7',
          border: '1px solid #FCD34D',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
        }}>
          <p style={{
            fontSize: '0.9rem',
            color: '#92400E',
            margin: 0,
            lineHeight: '1.5',
          }}>
            <strong>Clinical Support Tool:</strong> This module provides guided exercise timing and documentation support.
            It does not diagnose conditions or prescribe treatment. All exercise parameters must be determined by a qualified healthcare professional.
          </p>
        </div>

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
                marginBottom: '12px',
                lineHeight: '1.5',
              }}>
                Patient maintains visual focus on a stationary target while turning the head at a controlled cadence.
              </p>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
              }}>
                <span style={{
                  fontSize: '0.8rem',
                  backgroundColor: '#EBF8FF',
                  color: '#2C5282',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontWeight: '500',
                }}>
                  Customizable Cadence
                </span>
                <span style={{
                  fontSize: '0.8rem',
                  backgroundColor: '#EBF8FF',
                  color: '#2C5282',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontWeight: '500',
                }}>
                  Audio Cues
                </span>
                <span style={{
                  fontSize: '0.8rem',
                  backgroundColor: '#EBF8FF',
                  color: '#2C5282',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontWeight: '500',
                }}>
                  Auto Note
                </span>
              </div>
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
      </motion.div>
    </div>
  );
}
