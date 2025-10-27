import React from 'react';

export function ActivityIcon({ className }: { className?: string }) {
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
      {/* Ear side profile - represents vestibular/inner ear rehabilitation */}
      {/* Outer ear (auricle) - main C-shape */}
      <path d="M17 6 C17 4, 15 3, 13 3 C9 3, 7 6, 7 12 C7 18, 9 21, 13 21 C15 21, 17 20, 17 18"></path>
      {/* Inner helix curve */}
      <path d="M15 8 C14 7, 12 7, 11 9 C10 11, 10 13, 11 15 C12 16, 13 16, 14 15"></path>
      {/* Ear canal entrance */}
      <path d="M12 12 L14 12"></path>
    </svg>
  );
}
