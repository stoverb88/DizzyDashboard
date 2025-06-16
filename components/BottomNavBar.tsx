import React from 'react';

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
  const navStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
    position: 'fixed',
    bottom: 0,
    width: '100%',
    height: '70px',
    zIndex: 1000,
  };

  const buttonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: '#888',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flex: 1,
    height: '100%',
    transition: 'color 0.2s ease-in-out',
    fontSize: '12px'
  };

  const activeButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    color: '#2D3748',
    fontWeight: '600'
  };

  const iconContainerStyle: React.CSSProperties = {
    marginBottom: '4px',
    height: '28px',
    width: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  return (
    <nav style={navStyle}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          style={activeTab === tab.id ? activeButtonStyle : buttonStyle}
          onClick={() => setActiveTab(tab.id)}
        >
          <div style={iconContainerStyle}>{tab.icon}</div>
          {tab.label}
        </button>
      ))}
    </nav>
  );
} 