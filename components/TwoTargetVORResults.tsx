"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TwoTargetVORParameters } from './TwoTargetVORSetup';

export interface TwoTargetVORResultsData {
  dizzyRating: number;        // 0-10
  position: 'seated' | 'standing';
  surfaceType?: 'firm' | 'soft';  // Only if standing
  footPosition?: 'feet-together' | 'semi-tandem' | 'tandem';  // Only if standing
}

interface TwoTargetVORResultsProps {
  params: TwoTargetVORParameters;
  onComplete: (results: TwoTargetVORResultsData) => void;
}

export function TwoTargetVORResults({ params, onComplete }: TwoTargetVORResultsProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [dizzyRating, setDizzyRating] = useState(0);
  const [position, setPosition] = useState<'seated' | 'standing'>('seated');
  const [surfaceType, setSurfaceType] = useState<'firm' | 'soft'>('firm');
  const [footPosition, setFootPosition] = useState<'feet-together' | 'semi-tandem' | 'tandem'>('feet-together');

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleReturnToMenu = () => {
    const results: TwoTargetVORResultsData = {
      dizzyRating,
      position,
      ...(position === 'standing' && { surfaceType, footPosition })
    };
    onComplete(results);
  };

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
    gridTemplateColumns: 'repeat(2, 1fr)',
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

  const actionButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 24px',
    borderRadius: '10px',
    backgroundColor: '#2D3748',
    color: 'white',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: 'none',
  };

  return (
    <div style={containerStyle}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>&#10003;</div>
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
          <div style={buttonGroupStyle}>
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

        {/* Action Button */}
        <div style={{ marginTop: '24px' }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleReturnToMenu}
            style={actionButtonStyle}
          >
            Return to Exercise Menu
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
