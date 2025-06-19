import React from 'react'

export function RightEarIcon({ className }: { className?: string }) {
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
      {/* Right ear outline */}
      <path d="M8 6c-2.5 0-4.5 2-4.5 4.5v3c0 2.5 2 4.5 4.5 4.5 1.5 0 2.8-.8 3.5-2" />
      <path d="M11.5 16c.7 1.2 2 2 3.5 2 2.5 0 4.5-2 4.5-4.5v-3c0-2.5-2-4.5-4.5-4.5" />
      <path d="M15 10v4" />
    </svg>
  )
} 