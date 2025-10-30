"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { VORx1Parameters } from './VORx1Setup';

export interface VORx1ResultsData {
  dizzyRating: number;        // 0-10
  position: 'seated' | 'standing';
  surfaceType?: 'firm' | 'soft';  // Only if standing
  footPosition?: 'feet-together' | 'semi-tandem' | 'tandem';  // Only if standing
}

interface VORx1ResultsProps {
  params: VORx1Parameters;
  onComplete: (results: VORx1ResultsData) => void;
  onRepeatOtherDirection: (keepSameCadence: boolean) => void;
}

export function VORx1Results({ params, onComplete, onRepeatOtherDirection }: VORx1ResultsProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [dizzyRating, setDizzyRating] = useState(0);
  const [position, setPosition] = useState<'seated' | 'standing'>('seated');
  const [surfaceType, setSurfaceType] = useState<'firm' | 'soft'>('firm');
  const [footPosition, setFootPosition] = useState<'feet-together' | 'semi-tandem' | 'tandem'>('feet-together');
  const [showCadencePrompt, setShowCadencePrompt] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleReturnToMenu = () => {
    const results: VORx1ResultsData = {
      dizzyRating,
      position,
      ...(position === 'standing' && { surfaceType, footPosition })
    };
    onComplete(results);
  };

  const handleRepeatOtherDirection = () => {
    setShowCadencePrompt(true);
  };

  const handleCadenceChoice = (keepSameCadence: boolean) => {
    onRepeatOtherDirection(keepSameCadence);
  };

  const otherOrientation = params.orientation === 'horizontal' ? 'vertical' : 'horizontal';

  const containerStyle: React.CSSProperties = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: isMobile ? '20px' : '32px',
    overflowY: 'auto',
    backgroundColor: '#F7FAFC',
  };

  const headerStyle: React.CSSProperties = {
    fontSize: isMobile ? '1.5rem' : '1.8rem',
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: '8px',
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: isMobile ? '20px' : '24px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: '12px',
    marginTop: '16px',
  };

  const buttonGroupStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: position === 'standing' && footPosition ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
    gap: '8px',
    marginTop: '8px',
  };

  const radioButtonStyle = (isSelected: boolean): React.CSSProperties => ({
    padding: '12px 16px',
    border: `2px solid ${isSelected ? '#3B82F6' : '#E2E8F0'}`,
    borderRadius: '8px',
    backgroundColor: isSelected ? '#EBF8FF' : '#ffffff',
    color: isSelected ? '#2C5282' : '#4A5568',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'center',
  });

  const actionButtonStyle = (isPrimary: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '14px 24px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: isPrimary ? '#2D3748' : '#ffffff',
    color: isPrimary ? 'white' : '#2D3748',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: isPrimary ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none',
    border: isPrimary ? 'none' : '2px solid #E2E8F0',
  });

  return (
    <div style={containerStyle}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✓</div>
          <h2 style={headerStyle}>Exercise Complete!</h2>
          <p style={{ fontSize: '0.9rem', color: '#718096' }}>
            Please rate your symptoms and provide additional details
          </p>
        </div>

        {/* Results Card */}
        <div style={cardStyle}>
          {/* Dizziness Rating */}
          <h3 style={{ ...sectionTitleStyle, marginTop: 0 }}>Dizziness / Symptom Intensity</h3>
          <p style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '16px' }}>
            Rate from 0 (no symptoms) to 10 (severe symptoms)
          </p>

          {/* Rating Scale */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(11, 1fr)',
            gap: '6px',
            marginBottom: '8px',
          }}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
              <button
                key={rating}
                onClick={() => setDizzyRating(rating)}
                style={{
                  padding: '10px 4px',
                  border: `2px solid ${dizzyRating === rating ? '#3B82F6' : '#E2E8F0'}`,
                  borderRadius: '8px',
                  backgroundColor: dizzyRating === rating ? '#3B82F6' : '#ffffff',
                  color: dizzyRating === rating ? '#ffffff' : '#4A5568',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {rating}
              </button>
            ))}
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: '#A0AEC0',
            marginTop: '4px',
          }}>
            <span>No symptoms</span>
            <span>Severe</span>
          </div>

          {/* Position Selection */}
          <h3 style={sectionTitleStyle}>Exercise Position</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            <button
              style={radioButtonStyle(position === 'seated')}
              onClick={() => setPosition('seated')}
            >
              Seated
            </button>
            <button
              style={radioButtonStyle(position === 'standing')}
              onClick={() => setPosition('standing')}
            >
              Standing
            </button>
          </div>

          {/* Conditional: Surface Type (only for standing) */}
          {position === 'standing' && (
            <>
              <h3 style={sectionTitleStyle}>Surface Type</h3>
              <div style={buttonGroupStyle}>
                <button
                  style={radioButtonStyle(surfaceType === 'firm')}
                  onClick={() => setSurfaceType('firm')}
                >
                  Firm Surface
                </button>
                <button
                  style={radioButtonStyle(surfaceType === 'soft')}
                  onClick={() => setSurfaceType('soft')}
                >
                  Soft Surface
                </button>
              </div>

              {/* Conditional: Foot Position (only for standing) */}
              <h3 style={sectionTitleStyle}>Foot Position</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <button
                  style={radioButtonStyle(footPosition === 'feet-together')}
                  onClick={() => setFootPosition('feet-together')}
                >
                  Feet Together
                </button>
                <button
                  style={radioButtonStyle(footPosition === 'semi-tandem')}
                  onClick={() => setFootPosition('semi-tandem')}
                >
                  Semi-Tandem
                </button>
                <button
                  style={radioButtonStyle(footPosition === 'tandem')}
                  onClick={() => setFootPosition('tandem')}
                >
                  Tandem
                </button>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRepeatOtherDirection}
            style={actionButtonStyle(true)}
          >
            Repeat in {otherOrientation === 'horizontal' ? 'Horizontal' : 'Vertical'} Direction
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleReturnToMenu}
            style={actionButtonStyle(false)}
          >
            Return to Exercise Menu
          </motion.button>
        </div>
      </motion.div>

      {/* Cadence Prompt Modal */}
      {showCadencePrompt && (
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
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{
              fontSize: '1.3rem',
              fontWeight: '700',
              color: '#1A202C',
              marginBottom: '12px',
            }}>
              Keep Same Cadence?
            </h3>
            <p style={{
              fontSize: '0.95rem',
              color: '#4A5568',
              marginBottom: '24px',
              lineHeight: '1.5',
            }}>
              Would you like to use the same cadence ({params.cadence} BPM) for the {otherOrientation} exercise?
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCadenceChoice(true)}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#3B82F6',
                  color: 'white',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Yes, Keep {params.cadence} BPM
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCadenceChoice(false)}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  borderRadius: '10px',
                  border: '2px solid #E2E8F0',
                  backgroundColor: '#ffffff',
                  color: '#2D3748',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                No, Choose New
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
