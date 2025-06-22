"use client"

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OculomotorExam } from "./OculomotorExam";
import { BottomNavBar } from "./BottomNavBar";
import { ClipboardIcon } from "./icons/ClipboardIcon";
import { EyeIcon } from "./icons/EyeIcon";
import { LightbulbIcon } from "./icons/LightbulbIcon";
import { BookIcon } from "./icons/BookIcon";
import { BandageIcon } from "./icons/BandageIcon";
import { ManeuversTab } from "./ManeuversTab";
import { HintsTab } from "./HintsTab";
import { DiagnosticsTab } from "./DiagnosticsTab";
import { EvalTab } from "./EvalTab";
import { SplashScreen } from './SplashScreen';
import { PostSplashOptions } from './PostSplashOptions';
import { FindChartNote } from './FindChartNote';
import "../styles/globals.css";

export default function VestibularScreeningApp() {
  const [activeTab, setActiveTab] = useState("questionnaire");
  const [isMobile, setIsMobile] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev' | null>(null);
  const [appState, setAppState] = useState<'splash' | 'options' | 'eval' | 'find-chart'>('splash');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [evalKey, setEvalKey] = useState(0); // Key to force EvalTab re-render
  const [isImmersiveMode, setIsImmersiveMode] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Add immersive mode CSS when activated
  useEffect(() => {
    if (isImmersiveMode) {
      // Add CSS to hide browser UI and make app more immersive
      const style = document.createElement('style');
      style.textContent = `
        body {
          overflow: hidden !important;
        }
        
        /* Hide address bar on mobile browsers */
        @media screen and (max-width: 768px) {
          html {
            height: -webkit-fill-available;
          }
          
          body {
            min-height: 100vh;
            min-height: -webkit-fill-available;
          }
        }
        
        /* Encourage browsers to hide UI */
        .immersive-app {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          height: -webkit-fill-available !important;
          z-index: 9999 !important;
          background: #f7fafc !important;
        }
      `;
      style.id = 'immersive-mode-styles';
      document.head.appendChild(style);
      
      // Scroll to top to hide address bar on mobile
      window.scrollTo(0, 1);
      setTimeout(() => window.scrollTo(0, 0), 100);
      
      return () => {
        const existingStyle = document.getElementById('immersive-mode-styles');
        if (existingStyle) {
          existingStyle.remove();
        }
        document.body.style.overflow = '';
      };
    }
  }, [isImmersiveMode]);

  const handleSplashDismiss = () => {
    // Enable immersive mode instead of browser fullscreen
    setIsImmersiveMode(true);
    setAppState('options');
  };

  const handleStartEval = () => {
    setAppState('eval');
  };

  const handleFindChart = () => {
    setAppState('find-chart');
  };

  const handleBackToOptions = () => {
    setAppState('options');
  };

  const handleLogoClick = () => {
    if (appState === 'eval') {
      setShowConfirmDialog(true);
    } else {
      setAppState('options');
    }
  };

  const handleConfirmReset = () => {
    setShowConfirmDialog(false);
    setActiveTab("questionnaire");
    setEvalKey(prev => prev + 1); // Force EvalTab to re-render with fresh state
    setAppState('options');
  };

  const handleCancelReset = () => {
    setShowConfirmDialog(false);
  };

  const tabs = [
    { id: "questionnaire", label: "Eval", icon: <ClipboardIcon /> },
    { id: "oculomotor", label: "Oculomotor", icon: <EyeIcon /> },
    { id: "hints", label: "HINTS", icon: <LightbulbIcon /> },
    { id: "diagnosticCriteria", label: "Diagnostics", icon: <BookIcon /> },
    { id: "maneuvers", label: "Maneuvers", icon: <BandageIcon /> }
  ];

  const handleTabChange = (direction: 'next' | 'prev') => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    let nextIndex;

    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    }
    
    setDirection(direction);
    setActiveTab(tabs[nextIndex].id);
  };

  const scale: React.CSSProperties = {
    scale: 0.8,
    opacity: 0.5
  };
  
  const cardStyle: React.CSSProperties = {
    backgroundColor: "white",
    boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.15)",
    position: 'relative',
    zIndex: 0,
    flex: 1,
  };

  const dynamicCardStyle: React.CSSProperties = { ...cardStyle };
  if (appState === 'eval') {
    dynamicCardStyle.overflowY = 'auto';
    if (activeTab !== 'oculomotor' && activeTab !== 'maneuvers') {
      dynamicCardStyle.padding = isMobile ? "20px 20px 90px 20px" : "32px 32px 90px 32px";
    } else {
      dynamicCardStyle.paddingBottom = "90px";
    }
  } else {
    dynamicCardStyle.overflowY = 'hidden';
  }

  const headerStyle = {
    color: "#1A202C",
    padding: isMobile ? "20px 10px" : "30px 20px",
    textAlign: 'center' as 'center',
    borderBottom: '1px solid #e2e8f0',
  };

  return (
    <>
      <div 
        className={isImmersiveMode ? 'immersive-app' : ''}
        style={{
          background: "#f7fafc",
          height: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
          <div style={headerStyle}>
             <div 
               onClick={handleLogoClick}
               style={{
                fontWeight: 700,
                fontSize: isMobile ? '1.5rem' : '1.8rem',
                letterSpacing: '0.02em',
                color: '#1A202C',
                cursor: 'pointer',
                userSelect: 'none'
             }}>
                <span style={{ fontWeight: 900 }}>DIZZY</span>
                <span style={{ fontWeight: 500 }}>DASHBOARD</span>
             </div>
          </div>

          <div style={{...dynamicCardStyle}}>
            <AnimatePresence mode="wait">
              {appState === 'splash' && (
                <SplashScreen key="splash" onDismiss={handleSplashDismiss} />
              )}
              {appState === 'options' && (
                  <PostSplashOptions key="options" onStartEval={handleStartEval} onFindChart={handleFindChart} />
              )}
              {appState === 'eval' && (
                <motion.div key="eval-content">
                  <AnimatePresence initial={false} custom={direction} mode="wait">
                    {activeTab === "questionnaire" && (
                      <motion.div
                        key="questionnaire"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <EvalTab key={evalKey} />
                      </motion.div>
                    )}

                    {activeTab === "oculomotor" && (
                      <motion.div
                        key="oculomotor"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ height: '100%' }}
                      >
                        <OculomotorExam />
                      </motion.div>
                    )}

                    {activeTab === "hints" && (
                      <motion.div
                        key="hints"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ height: '100%' }}
                      >
                        <HintsTab />
                      </motion.div>
                    )}
                    
                    {activeTab === "diagnosticCriteria" && (
                      <motion.div
                        key="diagnosticCriteria"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <DiagnosticsTab />
                      </motion.div>
                    )}

                    {activeTab === "maneuvers" && (
                      <motion.div
                        key="maneuvers"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ height: '100%' }}
                      >
                        <ManeuversTab />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
              {appState === 'find-chart' && (
                <FindChartNote key="find-chart" onBack={handleBackToOptions} />
              )}
            </AnimatePresence>
          </div>
      </div>
      {appState === 'eval' && <BottomNavBar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />}
      {showConfirmDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000,
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '12px',
              maxWidth: '400px',
              margin: '20px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              textAlign: 'center'
            }}
          >
            <h3 style={{ 
              color: '#1A202C', 
              marginBottom: '15px',
              fontSize: '1.2rem',
              fontWeight: '600'
            }}>
              Reset Evaluation?
            </h3>
            <p style={{ 
              color: '#4A5568', 
              marginBottom: '25px',
              lineHeight: '1.5'
            }}>
              This will clear all your current answers and return you to the main menu. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={handleCancelReset}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: 'white',
                  color: '#4A5568',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#667eea',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                }}
              >
                Reset Evaluation
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
} 