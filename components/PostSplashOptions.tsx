import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/Button';

interface PostSplashOptionsProps {
  onStartEval: () => void;
  onFindChart: () => void;
}

export function PostSplashOptions({ onStartEval, onFindChart }: PostSplashOptionsProps) {
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
        gap: '16px',
        maxWidth: '500px',
        margin: '0 auto',
      }}
    >
      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={onStartEval}
      >
        Start an Eval
      </Button>
      <Button
        variant="secondary"
        size="lg"
        fullWidth
        onClick={onFindChart}
      >
        Find my chart note
      </Button>
    </motion.div>
  );
} 