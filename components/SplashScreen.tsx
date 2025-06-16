import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLogo } from './icons/AppLogo';

interface SplashScreenProps {
  onDismiss: () => void;
}

export function SplashScreen({ onDismiss }: SplashScreenProps) {
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDisclaimer(true);
    }, 500); // 0.5 seconds delay
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      key="splash"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#f7fafc',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <motion.div
        animate={{ y: showDisclaimer ? -120 : 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        <AppLogo />
      </motion.div>

      <AnimatePresence>
        {showDisclaimer && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            style={{
              position: 'absolute',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                backgroundColor: 'white',
                padding: '40px',
                borderRadius: '20px',
                maxWidth: '500px',
                margin: '20px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ marginBottom: '20px', color: '#1A202C' }}>Disclaimer</h2>
              <p style={{ marginBottom: '30px', color: '#4A5568', lineHeight: '1.6' }}>
                The following application is intended for educational and training purposes only. 
                Vestibular assessment, diagnosis of condition and appropriate care require considerable 
                thought and training from licensed clinicians. All conclusions drawn from use of this 
                app must first consider clinical judgment and patient safety. 
                By continuing you confirm that you have read the above statement and are in agreement.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onDismiss}
                style={{
                  padding: '12px 30px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#2D3748',
                  color: 'white',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                I Understand and Agree
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 