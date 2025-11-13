// Main Application Page (Protected Route)
// Requires authentication to access

import { Suspense } from 'react'
import VestibularScreeningApp from '@/components/VestibularScreeningApp'

export default function AppPage() {
  return (
    <main className="min-h-screen">
      <Suspense fallback={<div>Loading...</div>}>
        <VestibularScreeningApp />
      </Suspense>
    </main>
  )
}
