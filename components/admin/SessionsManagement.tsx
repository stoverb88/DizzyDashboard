'use client'

// SessionsManagement.tsx
// View active user sessions

import React from 'react'
import { Activity, Info } from 'lucide-react'
import { AdminLayout } from './AdminLayout'
import type { SessionData } from '@/lib/session'

interface SessionsManagementProps {
  session: SessionData
}

export default function SessionsManagement({ session }: SessionsManagementProps) {
  return (
    <AdminLayout session={session} currentPage="sessions">
      <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#1A202C',
            marginBottom: '8px',
          }}>
            Active Sessions
          </h1>
          <p style={{ color: '#6B7280', fontSize: '1rem' }}>
            Monitor user authentication sessions
          </p>
        </div>

        {/* Info Banner */}
        <div style={{
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          border: '1px solid #93C5FD',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start',
        }}>
          <Info size={20} color="#3B82F6" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.875rem', color: '#1E40AF' }}>
            <strong>Note:</strong> This system uses iron-session for encrypted cookie-based sessions.
            Active session tracking requires an external session store like Redis.
          </div>
        </div>

        {/* Empty State */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '16px',
          padding: '48px',
          border: '1px solid #E5E7EB',
          textAlign: 'center',
        }}>
          <Activity size={48} color="#D1D5DB" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1A202C', marginBottom: '8px' }}>
            Session tracking unavailable
          </h3>
          <p style={{ color: '#6B7280', fontSize: '0.875rem', maxWidth: '400px', margin: '0 auto' }}>
            Configure an external session store like Redis to enable real-time session monitoring
          </p>
        </div>
      </div>
    </AdminLayout>
  )
}
