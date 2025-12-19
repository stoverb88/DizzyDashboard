'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, User, Calendar, Activity } from 'lucide-react'

interface Patient {
  id: string
  name: string | null
  email: string | null
  inviteCode: string | null
  inviteUsedAt: Date
  lastLoginAt: Date | null
  createdAt: Date
  _count: {
    exerciseSessions: number
  }
}

interface ExerciseSession {
  id: string
  userId: string
  exerciseType: string
  targetSymbol: string
  orientation: string
  cadence: number
  duration: number
  audioType: string
  completedAt: Date
  actualDuration: number | null
  beatCount: number | null
  dizzyRating: number
  position: string
  surfaceType: string | null
  footPosition: string | null
  createdAt: Date
  updatedAt: Date
}

export function PatientDashboard() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedPatientId, setExpandedPatientId] = useState<string | null>(null)
  const [sessions, setSessions] = useState<Record<string, ExerciseSession[]>>({})
  const [loadingSessions, setLoadingSessions] = useState<Record<string, boolean>>({})
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    loadPatients()
  }, [])

  async function loadPatients() {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/exercises/patients')
      if (response.ok) {
        const data = await response.json()
        setPatients(data.patients)
      } else {
        setError('Failed to load patients')
      }
    } catch (err) {
      console.error('Failed to load patients:', err)
      setError('Failed to load patients. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function loadSessions(patientId: string) {
    if (sessions[patientId]) {
      // Already loaded
      return
    }

    setLoadingSessions(prev => ({ ...prev, [patientId]: true }))
    try {
      const response = await fetch(`/api/exercises/patients/${patientId}/sessions`)
      if (response.ok) {
        const data = await response.json()
        setSessions(prev => ({ ...prev, [patientId]: data.sessions }))
      }
    } catch (err) {
      console.error('Failed to load sessions:', err)
    } finally {
      setLoadingSessions(prev => ({ ...prev, [patientId]: false }))
    }
  }

  function togglePatientExpansion(patientId: string) {
    if (expandedPatientId === patientId) {
      setExpandedPatientId(null)
    } else {
      setExpandedPatientId(patientId)
      loadSessions(patientId)
    }
  }

  function formatDate(date: Date | null | undefined): string {
    if (!date) return 'Never'
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function formatDateShort(date: Date | null | undefined): string {
    if (!date) return 'Never'
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const containerStyle: React.CSSProperties = {
    width: '100%',
    marginTop: '24px',
  }

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  }

  const titleStyle: React.CSSProperties = {
    fontSize: isMobile ? '1.25rem' : '1.5rem',
    fontWeight: '700',
    color: '#1A202C',
    margin: 0,
  }

  const countBadgeStyle: React.CSSProperties = {
    backgroundColor: '#3B82F6',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '0.875rem',
    fontWeight: '600',
  }

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '12px',
    padding: isMobile ? '16px' : '20px',
    border: '1px solid #E5E7EB',
    marginBottom: '12px',
    transition: 'all 0.2s',
    cursor: 'pointer',
  }

  const cardHoverStyle: React.CSSProperties = {
    ...cardStyle,
    borderColor: '#3B82F6',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
  }

  const emptyStateStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '48px',
    color: '#718096',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
  }

  const skeletonStyle: React.CSSProperties = {
    height: '80px',
    backgroundColor: '#F7FAFC',
    borderRadius: '12px',
    marginBottom: '12px',
    animation: 'pulse 2s infinite',
  }

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <Activity size={24} color="#3B82F6" />
          <h2 style={titleStyle}>My Patients</h2>
        </div>
        <div>
          {[1, 2, 3].map(i => (
            <div key={i} style={skeletonStyle} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <Activity size={24} color="#3B82F6" />
          <h2 style={titleStyle}>My Patients</h2>
        </div>
        <div style={{ ...emptyStateStyle, color: '#EF4444' }}>
          <p>{error}</p>
          <button
            onClick={loadPatients}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (patients.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <Activity size={24} color="#3B82F6" />
          <h2 style={titleStyle}>My Patients</h2>
          <span style={countBadgeStyle}>0</span>
        </div>
        <div style={emptyStateStyle}>
          <User size={48} color="#CBD5E0" style={{ margin: '0 auto 16px' }} />
          <p style={{ margin: 0, fontSize: '1rem' }}>
            No patients yet. Generate a patient code above to invite your first patient.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <Activity size={24} color="#3B82F6" />
        <h2 style={titleStyle}>My Patients</h2>
        <span style={countBadgeStyle}>{patients.length}</span>
      </div>

      <div>
        {patients.map((patient) => {
          const isExpanded = expandedPatientId === patient.id
          const patientSessions = sessions[patient.id] || []
          const isLoadingSessions = loadingSessions[patient.id]

          return (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div
                style={cardStyle}
                onMouseEnter={(e) => {
                  Object.assign(e.currentTarget.style, cardHoverStyle)
                }}
                onMouseLeave={(e) => {
                  Object.assign(e.currentTarget.style, cardStyle)
                }}
                onClick={() => togglePatientExpansion(patient.id)}
              >
                {/* Header Row */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flexWrap: 'wrap',
                    }}>
                      <h3 style={{
                        margin: 0,
                        fontSize: isMobile ? '1rem' : '1.1rem',
                        fontWeight: '600',
                        color: '#1A202C',
                      }}>
                        {patient.name || `Patient ${patient.inviteCode}`}
                      </h3>
                    </div>
                    {patient.email && (
                      <p style={{
                        margin: '4px 0 0 0',
                        fontSize: '0.875rem',
                        color: '#718096',
                      }}>
                        {patient.email}
                      </p>
                    )}
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={20} color="#3B82F6" />
                  ) : (
                    <ChevronDown size={20} color="#718096" />
                  )}
                </div>

                {/* Metrics Row */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: '12px',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <Calendar size={16} color="#718096" />
                    <span style={{ fontSize: '0.875rem', color: '#4A5568' }}>
                      Last login: <strong>{formatDateShort(patient.lastLoginAt)}</strong>
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <Activity size={16} color="#718096" />
                    <span style={{ fontSize: '0.875rem', color: '#4A5568' }}>
                      Total sessions: <strong>{patient._count.exerciseSessions}</strong>
                    </span>
                  </div>
                </div>

                {/* Expanded Session List */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        marginTop: '16px',
                        paddingTop: '16px',
                        borderTop: '1px solid #E5E7EB',
                      }}
                    >
                      {isLoadingSessions ? (
                        <div style={{
                          textAlign: 'center',
                          padding: '16px',
                          color: '#718096',
                        }}>
                          Loading sessions...
                        </div>
                      ) : patientSessions.length === 0 ? (
                        <div style={{
                          padding: '16px',
                          color: '#718096',
                          fontSize: '0.9rem',
                          textAlign: 'center',
                        }}>
                          This patient hasn't completed any exercises yet.
                        </div>
                      ) : (
                        <div>
                          <h4 style={{
                            margin: '0 0 12px 0',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            color: '#4A5568',
                          }}>
                            Recent Sessions ({patientSessions.length})
                          </h4>
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                          }}>
                            {patientSessions.slice(0, 10).map((session) => (
                              <div
                                key={session.id}
                                style={{
                                  backgroundColor: '#F7FAFC',
                                  borderRadius: '8px',
                                  padding: '12px',
                                  fontSize: '0.875rem',
                                }}
                              >
                                <div style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  marginBottom: '4px',
                                }}>
                                  <span style={{ fontWeight: '600', color: '#2D3748' }}>
                                    {session.exerciseType}
                                  </span>
                                  <span style={{ color: '#718096', fontSize: '0.8rem' }}>
                                    {formatDate(session.completedAt)}
                                  </span>
                                </div>
                                <div style={{
                                  display: 'grid',
                                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                                  gap: '8px',
                                  color: '#4A5568',
                                }}>
                                  <div>Cadence: <strong>{session.cadence} BPM</strong></div>
                                  <div>Duration: <strong>{session.duration}s</strong></div>
                                  <div>Orientation: <strong>{session.orientation}</strong></div>
                                </div>
                                <div style={{
                                  marginTop: '4px',
                                  display: 'flex',
                                  flexWrap: 'wrap',
                                  gap: '16px',
                                  color: '#4A5568',
                                }}>
                                  <div>Dizzy Rating: <strong>{session.dizzyRating}/10</strong></div>
                                  <div>Position: <strong>{session.position}</strong></div>
                                  {session.position === 'standing' && session.surfaceType && (
                                    <div>Surface: <strong>{session.surfaceType}</strong></div>
                                  )}
                                  {session.position === 'standing' && session.footPosition && (
                                    <div>Foot Position: <strong>{session.footPosition}</strong></div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
