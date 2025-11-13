// Client-side hook to fetch current user session
'use client'

import { useState, useEffect } from 'react'

export interface User {
  id: string
  email?: string
  name?: string
  role: 'PATIENT' | 'MEDICAL_PROFESSIONAL' | 'ADMIN'
}

export function useSession() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSession() {
      try {
        const response = await fetch('/api/auth/session', {
          credentials: 'include', // Required for SameSite=None cookies
        })
        if (!response.ok) {
          throw new Error('Failed to fetch session')
        }
        const data = await response.json()
        setUser(data.user)
      } catch (err) {
        console.error('Session fetch error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchSession()
  }, [])

  return { user, loading, error }
}
