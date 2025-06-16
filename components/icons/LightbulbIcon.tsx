import React from 'react';

export function LightbulbIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 2a7 7 0 0 0-7 7c0 2.03 1.04 4.3 3 5.5v2.5a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.5c1.96-1.2 3-3.47 3-5.5a7 7 0 0 0-7-7z"/>
      <line x1="12" y1="19" x2="12" y2="22"/>
      <line x1="9" y1="16" x2="15" y2="16"/>
    </svg>
  );
} 