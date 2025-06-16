import React from 'react';
import { motion } from 'framer-motion';

interface PostSplashOptionsProps {
  onStartEval: () => void;
  onFindChart: () => void;
}

export function PostSplashOptions({ onStartEval, onFindChart }: PostSplashOptionsProps) {
  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '20px',
    fontSize: '1.2rem',
    fontWeight: '600',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    marginBottom: '20px',
    transition: 'transform 0.2s',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        padding: '20px',
      }}
    >
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onStartEval}
        style={{
          ...buttonStyle,
          backgroundColor: '#2D3748',
          color: 'white',
        }}
      >
        Start an Eval
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onFindChart}
        style={{
          ...buttonStyle,
          backgroundColor: '#E2E8F0',
          color: '#2D3748',
        }}
      >
        Find my chart note
      </motion.button>
    </motion.div>
  );
} 