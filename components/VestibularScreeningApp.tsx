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

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSplashDismiss = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    }
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
      <div style={{
        background: "#f7fafc",
        height: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
          <div style={headerStyle}>
             <div style={{
                fontWeight: 700,
                fontSize: isMobile ? '1.5rem' : '1.8rem',
                letterSpacing: '0.02em',
                color: '#1A202C'
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
                        <EvalTab />
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
    </>
  );
} 