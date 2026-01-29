'use client'

// MedicalManagement.tsx
// Invite and manage medical professional accounts

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Mail, Shield, Calendar, Trash2, X } from 'lucide-react'
import { AdminLayout } from './AdminLayout'
import type { SessionData } from '@/lib/session'

interface MedicalManagementProps {
  session: SessionData
}

interface MedicalProfessional {
  id: string
  email: string | null
  name: string | null
  createdAt: string
  lastLoginAt: string | null
  inviteCode: string | null
  inviteUsedAt: string | null
  invitedBy: {
    id: string
    name: string | null
    email: string | null
  } | null
  activeReset: {
    id: string
    createdAt: string
    expiresAt: string
  } | null
  patientsCount: number
}

export default function MedicalManagement({ session }: MedicalManagementProps) {
  const [professionals, setProfessionals] = useState<MedicalProfessional[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    name: '',
  })
  const [error, setError] = useState('')
  const [resettingId, setResettingId] = useState<string | null>(null)
  const [resetNotices, setResetNotices] = useState<Record<string, { token: string; expiresAt: string }>>({})
  const [resetError, setResetError] = useState('')
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [deleteConfirmProfessional, setDeleteConfirmProfessional] = useState<MedicalProfessional | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadProfessionals()
  }, [])

  async function loadProfessionals() {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/medical')
      if (response.ok) {
        const data = await response.json()
        setProfessionals(data.professionals)
      }
    } catch (error) {
      console.error('Failed to load medical professionals:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function formatDate(value: string | null, fallback = 'Not recorded') {
    if (!value) return fallback
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return fallback
    return date.toLocaleDateString()
  }

  function formatDateTime(value: string | null, fallback = 'Not recorded') {
    if (!value) return fallback
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return fallback
    return date.toLocaleString()
  }

  async function triggerPasswordReset(userId: string) {
    setResetError('')
    setResettingId(userId)
    try {
      const response = await fetch(`/api/admin/medical/${userId}/password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (!response.ok) {
        setResetError(data.error || 'Failed to create password reset window')
        return
      }

      setResetNotices((prev) => ({
        ...prev,
        [userId]: {
          token: data.resetToken,
          expiresAt: data.expiresAt,
        },
      }))

      await loadProfessionals()
    } catch (err) {
      console.error('Failed to create password reset window:', err)
      setResetError('An unexpected error occurred')
    } finally {
      setResettingId(null)
    }
  }

  function copyToken(token: string) {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      return
    }
    navigator.clipboard.writeText(token).then(() => {
      setCopiedToken(token)
      setTimeout(() => setCopiedToken(null), 2000)
    }).catch((err) => {
      console.error('Failed to copy token:', err)
    })
  }

  async function handleAddProfessional(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!formData.email) {
      setError('Email is required')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Invalid email format')
      return
    }

    setIsAdding(true)
    try {
      // Create invite instead of direct account
      const response = await fetch('/api/admin/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'MEDICAL_PROFESSIONAL',
          email: formData.email,
          expiresInDays: 7,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to send invitation')
        setIsAdding(false)
        return
      }

      // Success - reset form and show message
      setFormData({ email: '', name: '' })
      setShowAddForm(false)
      setError('')

      // Show success notification based on email delivery
      if (data.emailSent) {
        alert(`✅ Invitation email sent to ${formData.email}\n\nThe clinician will receive an email with a secure registration link valid for 7 days.`)
      } else {
        alert(`⚠️ Invitation created for ${formData.email}\n\nEmail delivery failed. Please share this URL manually:\n\n${data.invitation?.inviteUrl || 'Check the Invites tab for the URL'}`)
      }

      // No need to reload professionals list - they'll appear after registration
    } catch (error) {
      console.error('Failed to create invitation:', error)
      setError('An unexpected error occurred')
    } finally {
      setIsAdding(false)
    }
  }

  async function handleDeleteProfessional(professional: MedicalProfessional) {
    setDeleteConfirmProfessional(professional)
    setDeleteError(null)
  }

  async function confirmDelete() {
    if (!deleteConfirmProfessional) return

    setIsDeleting(true)
    setDeleteError(null)

    try {
      const response = await fetch(`/api/admin/medical/${deleteConfirmProfessional.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        setDeleteSuccess(`Successfully deleted medical professional: ${deleteConfirmProfessional.name || deleteConfirmProfessional.email}`)
        setDeleteConfirmProfessional(null)
        await loadProfessionals()

        // Clear success message after 3 seconds
        setTimeout(() => setDeleteSuccess(null), 3000)
      } else {
        setDeleteError(data.error || 'Failed to delete medical professional')
      }
    } catch (error) {
      console.error('Error deleting medical professional:', error)
      setDeleteError('Failed to delete medical professional. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  function cancelDelete() {
    setDeleteConfirmProfessional(null)
    setDeleteError(null)
  }

  return (
    <AdminLayout session={session} currentPage="medical">
      <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: '#1A202C',
              marginBottom: '8px',
            }}>
              Medical Professionals
            </h1>
            <p style={{ color: '#6B7280', fontSize: '1rem' }}>
              Add and manage clinician accounts ({professionals.length} {professionals.length === 1 ? 'professional' : 'professionals'})
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#2D3748',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Plus size={18} />
            Invite Medical Professional
          </motion.button>
        </div>

        {/* Success Message */}
        <AnimatePresence>
          {deleteSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                backgroundColor: '#D1FAE5',
                border: '1px solid #10B981',
                borderRadius: '12px',
                padding: '12px 16px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
              }} />
              <span style={{ color: '#065F46', fontSize: '0.875rem', fontWeight: 500 }}>
                {deleteSuccess}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {resetError && (
          <div style={{
            marginBottom: '24px',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #FCA5A5',
            backgroundColor: '#FEF2F2',
            color: '#991B1B',
            fontSize: '0.875rem',
          }}>
            {resetError}
          </div>
        )}

        {/* Add Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
              border: '1px solid #E5E7EB',
            }}
          >
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: 600,
              color: '#1A202C',
              marginBottom: '16px',
            }}>
              Invite Medical Professional
            </h3>

            {error && (
              <div style={{
                marginBottom: '16px',
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#991B1B',
                fontSize: '0.875rem',
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleAddProfessional}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px',
                marginBottom: '16px',
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '6px',
                  }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="doctor@clinic.org"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid #E5E7EB',
                      fontSize: '0.875rem',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '6px',
                  }}>
                    Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Dr. Jane Smith"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid #E5E7EB',
                      fontSize: '0.875rem',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Info box explaining the invite process */}
              <div style={{
                marginBottom: '16px',
                padding: '12px 16px',
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: '10px',
              }}>
                <p style={{
                  fontSize: '0.8125rem',
                  color: '#1E40AF',
                  margin: 0,
                  lineHeight: '1.5',
                }}>
                  📧 An invitation email will be sent to this address with a secure registration link. The clinician will set their own password during registration. The invitation expires in 7 days.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setError('')
                    setFormData({ email: '', name: '' })
                  }}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    backgroundColor: '#FFFFFF',
                    color: '#374151',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#2D3748',
                    color: '#FFFFFF',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: isAdding ? 'not-allowed' : 'pointer',
                    opacity: isAdding ? 0.5 : 1,
                  }}
                >
                  {isAdding ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Professionals List */}
        {isLoading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #E5E7EB',
                  height: '100px',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                }}
              />
            ))}
          </div>
        ) : professionals.length === 0 ? (
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '16px',
            padding: '48px',
            border: '1px solid #E5E7EB',
            textAlign: 'center',
          }}>
            <Shield size={48} color="#D1D5DB" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1A202C', marginBottom: '8px' }}>
              No medical professionals yet
            </h3>
            <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
              Add your first clinician account to get started
            </p>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            {professionals.map((professional, index) => (
              <motion.div
                key={professional.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #E5E7EB',
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}>
                  {/* Professional Info */}
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: '#1A202C',
                      marginBottom: '4px',
                    }}>
                      {professional.name || professional.email || 'Unnamed Professional'}
                    </div>
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#6B7280',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}>
                      <Mail size={14} />
                      {professional.email || 'No email'}
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    fontSize: '0.875rem',
                    flexWrap: 'wrap',
                  }}>
                    <div style={{ textAlign: 'center', minWidth: '80px' }}>
                      <div style={{ fontWeight: 700, color: '#1A202C', fontSize: '1.25rem' }}>
                        {professional.patientsCount}
                      </div>
                      <div style={{ color: '#6B7280', fontSize: '0.75rem' }}>Patients</div>
                    </div>
                  </div>

                  {/* Meta grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '12px',
                    width: '100%',
                  }}>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      fontSize: '0.875rem',
                      color: '#374151',
                    }}>
                      <span style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Joined</span>
                      <span><Calendar size={14} style={{ marginRight: '6px' }} /> {formatDate(professional.createdAt, '—')}</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      fontSize: '0.875rem',
                      color: '#374151',
                    }}>
                      <span style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Login</span>
                      <span>{professional.lastLoginAt ? formatDate(professional.lastLoginAt) : 'Never signed in'}</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      fontSize: '0.875rem',
                      color: '#374151',
                    }}>
                      <span style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Invite Code</span>
                      <span>
                        {professional.inviteCode
                          ? `${professional.inviteCode}${professional.inviteUsedAt ? ` • Redeemed ${formatDate(professional.inviteUsedAt)}` : ''}`
                          : 'Manual account'}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      fontSize: '0.875rem',
                      color: '#374151',
                    }}>
                      <span style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Invited By</span>
                      <span>{professional.invitedBy?.name || professional.invitedBy?.email || '—'}</span>
                    </div>
                  </div>

                  {/* Password reset controls */}
                  <div style={{
                    marginTop: '16px',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}>
                    {resetNotices[professional.id] ? (
                      <div style={{
                        padding: '12px',
                        borderRadius: '10px',
                        backgroundColor: '#ECFDF5',
                        border: '1px solid #A7F3D0',
                        color: '#065F46',
                        fontSize: '0.875rem',
                      }}>
                        <strong style={{ display: 'block', marginBottom: '4px' }}>Reset window created</strong>
                        Share this token with the clinician: <code style={{ fontSize: '0.95rem' }}>{resetNotices[professional.id].token}</code>
                        <div style={{ marginTop: '6px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                          <button
                            onClick={() => copyToken(resetNotices[professional.id].token)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '8px',
                              border: '1px solid #059669',
                              backgroundColor: '#D1FAE5',
                              color: '#065F46',
                              fontWeight: 600,
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                            }}
                          >
                            {copiedToken === resetNotices[professional.id].token ? 'Copied!' : 'Copy token'}
                          </button>
                          <span style={{ fontSize: '0.75rem' }}>
                            Expires {formatDateTime(resetNotices[professional.id].expiresAt, 'soon')}
                          </span>
                        </div>
                      </div>
                    ) : professional.activeReset ? (
                      <div style={{
                        padding: '12px',
                        borderRadius: '10px',
                        backgroundColor: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        color: '#1D4ED8',
                        fontSize: '0.875rem',
                      }}>
                        Reset window active until {formatDateTime(professional.activeReset.expiresAt)}
                      </div>
                    ) : (
                      <div style={{
                        padding: '12px',
                        borderRadius: '10px',
                        backgroundColor: '#F3F4F6',
                        color: '#4B5563',
                        fontSize: '0.875rem',
                      }}>
                        No reset window active
                      </div>
                    )}

                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      flexWrap: 'wrap',
                    }}>
                      <button
                        onClick={() => triggerPasswordReset(professional.id)}
                        disabled={resettingId === professional.id}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          border: '1px solid #1F2937',
                          backgroundColor: '#1F2937',
                          color: '#FFFFFF',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          cursor: resettingId === professional.id ? 'not-allowed' : 'pointer',
                          opacity: resettingId === professional.id ? 0.6 : 1,
                        }}
                      >
                        {resettingId === professional.id ? 'Creating window...' : 'Start 24h reset window'}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteProfessional(professional)
                        }}
                        disabled={professional.id === session.userId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          border: '1px solid #DC2626',
                          backgroundColor: professional.id === session.userId ? '#F3F4F6' : '#FEE2E2',
                          color: professional.id === session.userId ? '#9CA3AF' : '#DC2626',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          cursor: professional.id === session.userId ? 'not-allowed' : 'pointer',
                          opacity: professional.id === session.userId ? 0.5 : 1,
                        }}
                        title={professional.id === session.userId ? 'Cannot delete your own account' : 'Delete medical professional'}
                      >
                        <Trash2 size={14} />
                        Delete Professional
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmProfessional && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={cancelDelete}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              zIndex: 1000,
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '24px',
                maxWidth: '500px',
                width: '100%',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#1A202C',
                }}>
                  Delete Medical Professional
                </h3>
                <button
                  onClick={cancelDelete}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    color: '#6B7280',
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{
                marginBottom: '20px',
                color: '#374151',
                fontSize: '0.9375rem',
                lineHeight: '1.6',
              }}>
                <p style={{ marginBottom: '12px' }}>
                  Are you sure you want to delete{' '}
                  <strong>{deleteConfirmProfessional.name || deleteConfirmProfessional.email}</strong>?
                </p>

                <div style={{
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  marginBottom: '12px',
                }}>
                  <p style={{ color: '#991B1B', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>
                    This action will permanently delete:
                  </p>
                  <ul style={{
                    color: '#991B1B',
                    fontSize: '0.875rem',
                    marginLeft: '20px',
                    lineHeight: '1.6',
                  }}>
                    <li>The medical professional account</li>
                    <li>All active sessions for this user</li>
                    <li>All password reset requests</li>
                    <li>Any invite codes created by this user</li>
                    {deleteConfirmProfessional.patientsCount > 0 && (
                      <li style={{ fontWeight: 600 }}>
                        Association with {deleteConfirmProfessional.patientsCount} patient{deleteConfirmProfessional.patientsCount === 1 ? '' : 's'}
                      </li>
                    )}
                  </ul>
                </div>

                <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                  This action cannot be undone.
                </p>
              </div>

              {deleteError && (
                <div style={{
                  marginBottom: '16px',
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  color: '#991B1B',
                  fontSize: '0.875rem',
                }}>
                  {deleteError}
                </div>
              )}

              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
              }}>
                <button
                  onClick={cancelDelete}
                  disabled={isDeleting}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    backgroundColor: '#FFFFFF',
                    color: '#374151',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                    opacity: isDeleting ? 0.5 : 1,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#DC2626',
                    color: '#FFFFFF',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                    opacity: isDeleting ? 0.5 : 1,
                  }}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Professional'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  )
}
