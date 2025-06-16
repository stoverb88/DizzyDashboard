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
      {/* First bandage */}
      <rect x="3" y="8" width="18" height="8" rx="4" ry="4" fill="currentColor" opacity="0.8"/>
      {/* Second bandage (overlapping) */}
      <rect x="8" y="3" width="8" height="18" rx="4" ry="4" fill="currentColor" opacity="0.6"/>
      {/* Cross pattern on first bandage */}
      <circle cx="7" cy="12" r="1" fill="white"/>
      <circle cx="12" cy="12" r="1" fill="white"/>
      <circle cx="17" cy="12" r="1" fill="white"/>
      {/* Cross pattern on second bandage */}
      <circle cx="12" cy="7" r="1" fill="white"/>
      <circle cx="12" cy="17" r="1" fill="white"/>
    </svg>
  );
}