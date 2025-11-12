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
import { ActivityIcon } from "./icons/ActivityIcon";
import { ManeuversTab } from "./ManeuversTab";
import { HintsTab } from "./HintsTab";
import { DiagnosticsTab } from "./DiagnosticsTab";
import { EvalTab } from "./EvalTab";
import { ExercisesTab } from "./ExercisesTab";
import { SplashScreen } from './SplashScreen';
import { PostSplashOptions } from './PostSplashOptions';
import { FindChartNote } from './FindChartNote';
import { EvalProvider, useEvalContext } from '../contexts/EvalContext';
import { Button } from './ui/Button';
import {
  isFullscreenSupported,
  isFullscreen as checkIsFullscreen,
  requestFullscreen,
  exitFullscreen as exitFullscreenUtil,
  addFullscreenChangeListener
} from '../utils/fullscreenUtils';
import { useSession } from '../lib/use-session';
import "../styles/globals.css";

function VestibularScreeningAppContent() {
  const { resetEvalForm } = useEvalContext();
  const { user, loading: sessionLoading } = useSession();
  const [activeTab, setActiveTab] = useState("questionnaire");
  const [isMobile, setIsMobile] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev' | null>(null);
  const [appState, setAppState] = useState<'splash' | 'options' | 'eval' | 'find-chart' | 'exercises'>('splash');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmDialogType, setConfirmDialogType] = useState<'reset' | 'logout'>('reset');
  const [evalKey, setEvalKey] = useState(0); // Key to force EvalTab re-render
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isPatient = user?.role === 'PATIENT';

  console.log('[CLIENT] VestibularScreeningApp render:', {
    sessionLoading,
    userRole: user?.role,
    isPatient,
    appState,
  });

  // Skip splash/options for patients and go directly to exercises
  useEffect(() => {
    console.log('[CLIENT] useEffect fired:', {
      sessionLoading,
      hasUser: !!user,
      userRole: user?.role,
      isPatient,
      willSetExercises: !sessionLoading && user && isPatient,
    });

    if (!sessionLoading && user) {
      if (isPatient) {
        console.log('[CLIENT] Setting appState to exercises for PATIENT');
        setAppState('exercises');
        setActiveTab('exercises');
      }
    }
  }, [sessionLoading, user, isPatient]);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fullscreen change detection with cross-browser support
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(checkIsFullscreen());
    };

    // Add cross-browser fullscreen change listeners
    const cleanup = addFullscreenChangeListener(handleFullscreenChange);

    return cleanup;
  }, []);

  // Pinch-to-exit fullscreen gesture detection
  useEffect(() => {
    if (!isFullscreen) return;

    let touches: TouchList | null = null;
    let initialDistance = 0;
    let gestureStartTime = 0;

    const getTouchDistance = (touches: TouchList): number => {
      if (touches.length !== 2) return 0;
      const touch1 = touches[0];
      const touch2 = touches[1];
      return Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        touches = e.touches;
        initialDistance = getTouchDistance(e.touches);
        gestureStartTime = Date.now();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && touches && initialDistance > 0) {
        const currentDistance = getTouchDistance(e.touches);
        const distanceChange = initialDistance - currentDistance;
        const timeElapsed = Date.now() - gestureStartTime;
        
        // Detect pinch-in gesture: fingers moving closer together
        // Thresholds: minimum 50px decrease in distance, minimum 200ms gesture duration
        if (distanceChange > 50 && timeElapsed > 200) {
          // Exit fullscreen using cross-browser utility
          exitFullscreenUtil();
          // Reset gesture tracking
          touches = null;
          initialDistance = 0;
        }
      }
    };

    const handleTouchEnd = () => {
      touches = null;
      initialDistance = 0;
      gestureStartTime = 0;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isFullscreen]);

  const handleSplashDismiss = async () => {
    // Only request fullscreen if not already in fullscreen and API is supported
    if (!isFullscreen && isFullscreenSupported()) {
      const success = await requestFullscreen();
      if (!success) {
        console.warn('Could not enter fullscreen mode. Continuing anyway.');
      }
    } else if (!isFullscreenSupported()) {
      console.info('Fullscreen API not supported on this device/browser');
    }
    setAppState('options');
  };

  const handleStartEval = () => {
    // Clear form data but keep HIPAA flags for modal trigger
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vestibularFormData');
      localStorage.removeItem('evalCurrentStep');
      // Don't remove evalHasReset here - we need it for HIPAA modal
    }

    // Force EvalTab to re-render with fresh state
    setEvalKey(prev => prev + 1);

    // Reset active tab to start of evaluation
    setActiveTab("questionnaire");

    setAppState('eval');

    // Small delay to ensure localStorage is cleared before calling reset function
    setTimeout(() => {
      if (resetEvalForm) {
        resetEvalForm();
      }
    }, 50);
  };

  const handleFindChart = () => {
    setAppState('find-chart');
  };

  const handleBackToOptions = () => {
    setAppState('options');
  };

  const handleLogoClick = () => {
    // Patients should see logout dialog when clicking logo from exercises
    if (isPatient) {
      setConfirmDialogType('logout');
      setShowConfirmDialog(true);
      return;
    }

    if (appState === 'eval') {
      setConfirmDialogType('reset');
      setShowConfirmDialog(true);
    } else if (appState === 'options') {
      // On options page, clicking logo triggers logout
      setConfirmDialogType('logout');
      setShowConfirmDialog(true);
    } else {
      setAppState('options');
    }
  };

  const handleConfirmReset = () => {
    setShowConfirmDialog(false);
    setActiveTab("questionnaire");

    // Call the reset function from EvalTab using context
    if (resetEvalForm) {
      resetEvalForm();
    }

    setEvalKey(prev => prev + 1); // Force EvalTab to re-render with fresh state
    setAppState('options');
  };

  const handleCancelReset = () => {
    setShowConfirmDialog(false);
  };

  const handleLogout = async () => {
    setShowConfirmDialog(false);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
      // Still redirect to login even if API call fails
      window.location.href = '/login';
    }
  };

  const tabs = [
    { id: "questionnaire", label: "Eval", icon: <ClipboardIcon /> },
    { id: "oculomotor", label: "Oculomotor", icon: <EyeIcon /> },
    { id: "hints", label: "HINTS", icon: <LightbulbIcon /> },
    { id: "diagnosticCriteria", label: "Diagnostics", icon: <BookIcon /> },
    { id: "maneuvers", label: "Maneuvers", icon: <BandageIcon /> },
    { id: "exercises", label: "Exercises", icon: <ActivityIcon /> }
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
    // Calculate available height considering header and bottom nav
    const headerHeight = isMobile ? 75 : 85; // Approximate header height
    const bottomNavHeight = 70; // Bottom navigation height
    const availableHeight = `calc(100vh - ${headerHeight}px - ${bottomNavHeight}px)`;
    
    dynamicCardStyle.height = availableHeight;
    dynamicCardStyle.maxHeight = availableHeight;
    
    // Only force overflow for tabs that need it, not for EvalTab
    if (activeTab !== 'questionnaire') {
      dynamicCardStyle.overflowY = 'auto';
    } else {
      // Ensure EvalTab doesn't scroll vertically
      dynamicCardStyle.overflowY = 'hidden';
    }
    if (activeTab !== 'oculomotor' && activeTab !== 'maneuvers' && activeTab !== 'questionnaire') {
      dynamicCardStyle.padding = isMobile ? "20px 20px 20px 20px" : "32px 32px 20px 32px";
    } else {
      dynamicCardStyle.paddingBottom = "20px";
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
      <div style={{
        background: "#f7fafc",
        height: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
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
              {appState === 'splash' && !isPatient && (
                <SplashScreen key="splash" onDismiss={handleSplashDismiss} />
              )}
              {appState === 'options' && !isPatient && (
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

                    {activeTab === "exercises" && (
                      <motion.div
                        key="exercises"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ height: '100%' }}
                      >
                        <ExercisesTab />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
              {appState === 'find-chart' && (
                <FindChartNote key="find-chart" onBack={handleBackToOptions} />
              )}
              {appState === 'exercises' && (
                <motion.div
                  key="exercises-only"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ height: '100%' }}
                >
                  <ExercisesTab />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
      </div>
      {appState === 'eval' && !isPatient && <BottomNavBar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />}
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
              {confirmDialogType === 'reset' ? 'Reset Evaluation?' : 'Logout?'}
            </h3>
            <p style={{
              color: '#4A5568',
              marginBottom: '25px',
              lineHeight: '1.5'
            }}>
              {confirmDialogType === 'reset'
                ? 'This will clear all your current answers and return you to the main menu. This action cannot be undone.'
                : 'Are you sure you want to logout?'}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Button
                variant="outline"
                size="md"
                onClick={handleCancelReset}
              >
                {confirmDialogType === 'reset' ? 'Cancel' : 'No'}
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={confirmDialogType === 'reset' ? handleConfirmReset : handleLogout}
              >
                {confirmDialogType === 'reset' ? 'Reset Evaluation' : 'Yes'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

// Wrapper component with EvalProvider
export default function VestibularScreeningApp() {
  return (
    <EvalProvider>
      <VestibularScreeningAppContent />
    </EvalProvider>
  );
} 