import React from 'react'

export function LeftEarIcon({ className }: { className?: string }) {
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
      {/* Left ear outline - mirror of right ear */}
      <path d="M16 6c2.5 0 4.5 2 4.5 4.5v3c0 2.5-2 4.5-4.5 4.5-1.5 0-2.8-.8-3.5-2" />
      <path d="M12.5 16c-.7 1.2-2 2-3.5 2-2.5 0-4.5-2-4.5-4.5v-3c0-2.5 2-4.5 4.5-4.5" />
      <path d="M9 10v4" />
    </svg>
  )
} 