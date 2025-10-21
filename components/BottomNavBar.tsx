import React, { useState } from 'react';
import { colors, transitions, shadows, touchTarget, zIndex } from '../styles/design-tokens';
import { triggerNavigationHaptic } from '../utils/haptics';

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface BottomNavBarProps {
  tabs: Tab[];
  activeTab: string;
  setActiveTab: (id: string) => void;
}

export function BottomNavBar({ tabs, activeTab, setActiveTab }: BottomNavBarProps) {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const handleTabClick = (tabId: string) => {
    // Trigger distinctive heartbeat navigation haptic on tab change
    if (tabId !== activeTab) {
      triggerNavigationHaptic();
    }
    setActiveTab(tabId);
  };

  const navStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'stretch',
    backgroundColor: colors.background.primary,
    boxShadow: shadows.lg,
    position: 'fixed',
    bottom: 0,
    width: '100%',
    height: '70px',
    zIndex: zIndex.nav,
    paddingLeft: '0',
    paddingRight: '0',
    borderTop: `1px solid ${colors.neutral[200]}`
  };

  const buttonWrapperStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    position: 'relative',
    minWidth: 0, // Allows flex item to shrink below content size
  };

  const getButtonStyle = (tabId: string): React.CSSProperties => {
    const isActive = activeTab === tabId;
    const isHovered = hoveredTab === tabId;

    return {
      background: 'none',
      border: 'none',
      color: isActive ? colors.primary[600] : colors.neutral[500],
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      flex: 1,
      height: '100%',
      transition: `all ${transitions.base}`,
      fontSize: '11px',
      padding: '8px 4px',
      fontWeight: isActive ? '600' : '500',
      transform: isHovered && !isActive ? 'scale(1.05)' : 'scale(1)',
      backgroundColor: isHovered && !isActive ? colors.neutral[50] : 'transparent',
      position: 'relative',
      minHeight: touchTarget.minimum,
    };
  };

  const activeIndicatorStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '40px',
    height: '3px',
    backgroundColor: colors.primary[600],
    borderRadius: '0 0 3px 3px',
    transition: `all ${transitions.fast}`,
  };

  const iconContainerStyle = (tabId: string): React.CSSProperties => {
    const isActive = activeTab === tabId;
    return {
      marginBottom: '4px',
      height: '24px',
      width: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: `transform ${transitions.fast}`,
      transform: isActive ? 'scale(1.1)' : 'scale(1)',
    };
  };

  return (
    <nav style={navStyle}>
      {tabs.map(tab => (
        <div key={tab.id} style={buttonWrapperStyle}>
          <button
            style={getButtonStyle(tab.id)}
            onClick={() => handleTabClick(tab.id)}
            onMouseEnter={() => setHoveredTab(tab.id)}
            onMouseLeave={() => setHoveredTab(null)}
            aria-label={tab.label}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            {/* Active indicator bar */}
            {activeTab === tab.id && <div style={activeIndicatorStyle} />}

            <div style={iconContainerStyle(tab.id)}>{tab.icon}</div>
            <span style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%',
              display: 'block'
            }}>
              {tab.label}
            </span>
          </button>
        </div>
      ))}
    </nav>
  );
} 