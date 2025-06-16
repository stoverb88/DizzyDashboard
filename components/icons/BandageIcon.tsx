// components/icons/BandageIcon.tsx
import React from 'react';

export function BandageIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path
        d="M16.903,7.97a1,1,0,0,0-1.414,0L12,11.455,8.515,7.97a1,1,0,0,0-1.414,0,1,1,0,0,0,0,1.414L10.586,12,7.1,15.485a1,1,0,0,0,0,1.414,1,1,0,0,0,1.414,0L12,13.414l3.485,3.485a1,1,0,0,0,1.414,0,1,1,0,0,0,0-1.414L13.414,12l3.489-3.485A1,1,0,0,0,16.903,7.97Z"
      />
    </svg>
  );
}