'use client'

// InvitesManagement.tsx
// Create and manage patient invitation codes

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Copy, Check, Trash2, Mail, Calendar, User, AlertCircle } from 'lucide-react'
import { AdminLayout } from './AdminLayout'
import type { SessionData } from '@/lib/session'

interface InvitesManagementProps {
  session: SessionData
}

interface InviteData {
  id: string
  code?: string // For patient invites
  token?: string // For medical invites
  email?: string // For medical invites
  inviteUrl?: string // For medical invites
  type: 'PATIENT' | 'MEDICAL_PROFESSIONAL'
  createdById: string
  createdBy: {
    name: string | null
    email: string | null
  }
  usedAt: string | null
  usedBy: {
    name: string | null
    email: string | null
  } | null
  expiresAt: string
  createdAt: string
}

export default function InvitesManagement({ session }: InvitesManagementProps) {
  const [invites, setInvites] = useState<InviteData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'USED' | 'EXPIRED' | 'PATIENT' | 'MEDICAL_PROFESSIONAL'>('ALL')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [inviteType, setInviteType] = useState<'PATIENT' | 'MEDICAL_PROFESSIONAL'>('PATIENT')
  const [inviteEmail, setInviteEmail] = useState('')
  const [createError, setCreateError] = useState('')

  useEffect(() => {
    loadInvites()
  }, [])

  async function loadInvites() {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/invites')
      if (response.ok) {
        const data = await response.json()
        setInvites(data.invites)
      }
    } catch (error) {
      console.error('Failed to load invites:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function openCreateModal() {
    setShowCreateModal(true)
    setInviteType('PATIENT')
    setInviteEmail('')
    setCreateError('')
  }

  function closeCreateModal() {
    setShowCreateModal(false)
    setInviteType('PATIENT')
    setInviteEmail('')
    setCreateError('')
  }

  async function createInvite() {
    setCreateError('')

    // Validate email for medical invites
    if (inviteType === 'MEDICAL_PROFESSIONAL') {
      if (!inviteEmail.trim()) {
        setCreateError('Email is required for medical professional invitations')
        return
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(inviteEmail)) {
        setCreateError('Invalid email format')
        return
      }
    }

    setIsCreating(true)
    try {
      const body: any = { type: inviteType }
      if (inviteType === 'MEDICAL_PROFESSIONAL') {
        body.email = inviteEmail.trim()
      }

      const response = await fetch('/api/admin/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (response.ok) {
        await loadInvites()
        closeCreateModal()
      } else {
        setCreateError(data.error || 'Failed to create invite')
      }
    } catch (error) {
      console.error('Failed to create invite:', error)
      setCreateError('An unexpected error occurred')
    } finally {
      setIsCreating(false)
    }
  }

  async function deleteInvite(inviteId: string) {
    // Find the invite to determine type
    const invite = invites.find(i => i.id === inviteId)

    const confirmMessage = invite?.type === 'MEDICAL_PROFESSIONAL'
      ? `Delete medical invite for ${invite.email}? This will allow re-inviting this email address.`
      : 'Are you sure you want to delete this patient invitation code?'

    if (!confirm(confirmMessage)) {
      return
    }

    try {
      // Use appropriate endpoint based on invite type
      const endpoint = invite?.type === 'MEDICAL_PROFESSIONAL'
        ? `/api/admin/invites/medical/${inviteId}`
        : `/api/admin/invites/${inviteId}`

      const response = await fetch(endpoint, {
        method: 'DELETE',
      })

      if (response.ok) {
        const data = await response.json()

        // Show success message if medical invite
        if (invite?.type === 'MEDICAL_PROFESSIONAL') {
          console.log(`Successfully deleted medical invite for ${data.deletedEmail}`)
        }

        await loadInvites()
      }
    } catch (error) {
      console.error('Failed to delete invite:', error)
    }
  }

  function copyToClipboard(code: string) {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  function getInviteStatus(invite: InviteData): 'USED' | 'EXPIRED' | 'ACTIVE' {
    if (invite.usedAt) return 'USED'
    if (new Date(invite.expiresAt) < new Date()) return 'EXPIRED'
    return 'ACTIVE'
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'ACTIVE':
        return { bg: '#10B98120', color: '#10B981' }
      case 'USED':
        return { bg: '#3B82F620', color: '#3B82F6' }
      case 'EXPIRED':
        return { bg: '#EF444420', color: '#EF4444' }
      default:
        return { bg: '#6B728020', color: '#6B7280' }
    }
  }

  const filteredInvites = invites.filter((invite) => {
    // Type filters
    if (filterStatus === 'PATIENT' || filterStatus === 'MEDICAL_PROFESSIONAL') {
      return invite.type === filterStatus
    }

    // Status filters
    const status = getInviteStatus(invite)
    if (filterStatus === 'ALL') return true
    return status === filterStatus
  })

  return (
    <AdminLayout session={session} currentPage="invites">
      <div style={{
        padding: '16px',
        maxWidth: '100%',
        width: '100%',
        margin: '0 auto',
        boxSizing: 'border-box',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '20px',
          gap: '12px',
        }}>
          <div>
            <h1 style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#1A202C',
              marginBottom: '8px',
            }}>
              Invitation Codes
            </h1>
            <p style={{ color: '#6B7280', fontSize: '0.8125rem' }}>
              Create and manage patient invitation codes ({filteredInvites.length} {filteredInvites.length === 1 ? 'invite' : 'invites'})
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openCreateModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 24px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#2D3748',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              width: '100%',
            }}
          >
            <Plus size={18} />
            Create New Invite
          </motion.button>
        </div>

        {/* Filter Tabs */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '16px',
        }}>
          {(['ALL', 'PATIENT', 'MEDICAL_PROFESSIONAL', 'ACTIVE', 'USED', 'EXPIRED'] as const).map((status) => {
            let count: number

            if (status === 'ALL') {
              count = invites.length
            } else if (status === 'PATIENT' || status === 'MEDICAL_PROFESSIONAL') {
              count = invites.filter((i) => i.type === status).length
            } else {
              count = invites.filter((i) => getInviteStatus(i) === status).length
            }

            const displayName = status === 'MEDICAL_PROFESSIONAL' ? 'CLINICIAN' : status

            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: '1px solid #E5E7EB',
                  backgroundColor: filterStatus === status ? '#1A202C' : '#FFFFFF',
                  color: filterStatus === status ? '#FFFFFF' : '#6B7280',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                }}
              >
                {displayName} ({count})
              </button>
            )
          })}
        </div>

        {/* Invites List */}
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
                  height: '120px',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                }}
              />
            ))}
          </div>
        ) : filteredInvites.length === 0 ? (
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '16px',
            padding: '48px',
            border: '1px solid #E5E7EB',
            textAlign: 'center',
          }}>
            <Mail size={48} color="#D1D5DB" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1A202C', marginBottom: '8px' }}>
              No invitation codes found
            </h3>
            <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
              {filterStatus === 'ALL'
                ? 'Create your first invite code to get started'
                : `No ${filterStatus.toLowerCase()} invites`}
            </p>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            {filteredInvites.map((invite, index) => {
              const status = getInviteStatus(invite)
              const statusColors = getStatusColor(status)

              return (
                <motion.div
                  key={invite.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid #E5E7EB',
                    boxSizing: 'border-box',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}>
                    {/* Main Content Section */}
                    <div style={{ width: '100%' }}>
                      {/* Display based on invite type */}
                      {invite.type === 'PATIENT' ? (
                        // Patient Invite Code Display
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '12px',
                          flexWrap: 'wrap',
                        }}>
                          <div style={{
                            fontFamily: 'monospace',
                            fontSize: '1rem',
                            fontWeight: 700,
                            color: '#1A202C',
                            letterSpacing: '0.1em',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}>
                            {invite.code}
                          </div>
                          <button
                            onClick={() => copyToClipboard(invite.code!)}
                            style={{
                              padding: '6px',
                              borderRadius: '6px',
                              border: '1px solid #E5E7EB',
                              backgroundColor: '#FFFFFF',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#F3F4F6'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#FFFFFF'
                            }}
                          >
                            {copiedCode === invite.code ? (
                              <Check size={16} color="#10B981" />
                            ) : (
                              <Copy size={16} color="#6B7280" />
                            )}
                          </button>
                        </div>
                      ) : (
                        // Medical Professional Invite Display
                        <div style={{ marginBottom: '12px' }}>
                          {/* Email Address */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '12px',
                          }}>
                            <Mail size={16} color="#3B82F6" />
                            <div style={{
                              fontSize: '1rem',
                              fontWeight: 700,
                              color: '#1A202C',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}>
                              {invite.email}
                            </div>
                          </div>

                          {/* Copy Buttons - Compact Inline Style */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            flexWrap: 'wrap',
                          }}>
                            <button
                              onClick={() => copyToClipboard(invite.token!)}
                              style={{
                                padding: '6px 10px',
                                borderRadius: '6px',
                                border: '1px solid #E5E7EB',
                                backgroundColor: '#FFFFFF',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: '#374151',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#F3F4F6'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#FFFFFF'
                              }}
                            >
                              {copiedCode === invite.token ? (
                                <Check size={14} color="#10B981" />
                              ) : (
                                <Copy size={14} color="#6B7280" />
                              )}
                              Copy Token
                            </button>
                            <button
                              onClick={() => copyToClipboard(invite.inviteUrl!)}
                              style={{
                                padding: '6px 10px',
                                borderRadius: '6px',
                                border: '1px solid #E5E7EB',
                                backgroundColor: '#FFFFFF',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: '#374151',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#F3F4F6'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#FFFFFF'
                              }}
                            >
                              {copiedCode === invite.inviteUrl ? (
                                <Check size={14} color="#10B981" />
                              ) : (
                                <Copy size={14} color="#6B7280" />
                              )}
                              Copy URL
                            </button>
                          </div>
                        </div>
                      )}

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.75rem',
                        color: '#6B7280',
                        marginBottom: '8px',
                        flexWrap: 'wrap',
                      }}>
                        <User size={14} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          Created by {invite.createdBy.name || invite.createdBy.email}
                        </span>
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.875rem',
                        color: '#6B7280',
                      }}>
                        <Calendar size={14} />
                        {status === 'USED'
                          ? `Used on ${new Date(invite.usedAt!).toLocaleDateString()}`
                          : status === 'EXPIRED'
                          ? `Expired on ${new Date(invite.expiresAt).toLocaleDateString()}`
                          : `Expires ${new Date(invite.expiresAt).toLocaleDateString()}`}
                      </div>

                      {invite.usedBy && (
                        <div style={{
                          marginTop: '8px',
                          padding: '8px 12px',
                          backgroundColor: '#F3F4F6',
                          borderRadius: '8px',
                          fontSize: '0.875rem',
                          color: '#374151',
                        }}>
                          Used by: {invite.usedBy.name || invite.usedBy.email}
                        </div>
                      )}
                    </div>

                    {/* Status and Actions - Inline */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flexWrap: 'wrap',
                    }}>
                      <div style={{
                        padding: '6px 12px',
                        backgroundColor: statusColors.bg,
                        color: statusColors.color,
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}>
                        {status}
                      </div>

                      {/* Show delete for: active patient invites OR any medical invite */}
                      {(status === 'ACTIVE' || invite.type === 'MEDICAL_PROFESSIONAL') && (
                        <button
                          onClick={() => deleteInvite(invite.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px solid #FCA5A5',
                            backgroundColor: '#FFFFFF',
                            color: '#EF4444',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#FEE2E2'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#FFFFFF'
                          }}
                          title={invite.type === 'MEDICAL_PROFESSIONAL'
                            ? 'Delete medical professional invite'
                            : 'Delete patient invitation code'}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Create Invite Modal */}
        {showCreateModal && (
          <>
            {/* Backdrop */}
            <div
              onClick={closeCreateModal}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 9998,
              }}
            />

            {/* Modal */}
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                zIndex: 9999,
                pointerEvents: 'none',
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '24px',
                  maxWidth: '450px',
                  width: '100%',
                  maxHeight: 'calc(100vh - 32px)',
                  overflowY: 'auto',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  pointerEvents: 'auto',
                }}
              >
                <h2 style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#1A202C',
                  marginBottom: '20px',
                }}>
                  Create New Invitation
                </h2>

                {/* Invite Type Selection */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '8px',
                  }}>
                    Invitation Type
                  </label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => setInviteType('PATIENT')}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '10px',
                        border: `2px solid ${inviteType === 'PATIENT' ? '#3B82F6' : '#E5E7EB'}`,
                        backgroundColor: inviteType === 'PATIENT' ? '#EFF6FF' : '#FFFFFF',
                        color: inviteType === 'PATIENT' ? '#3B82F6' : '#6B7280',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      Patient Code
                    </button>
                    <button
                      onClick={() => setInviteType('MEDICAL_PROFESSIONAL')}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '10px',
                        border: `2px solid ${inviteType === 'MEDICAL_PROFESSIONAL' ? '#3B82F6' : '#E5E7EB'}`,
                        backgroundColor: inviteType === 'MEDICAL_PROFESSIONAL' ? '#EFF6FF' : '#FFFFFF',
                        color: inviteType === 'MEDICAL_PROFESSIONAL' ? '#3B82F6' : '#6B7280',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      Clinician Invite
                    </button>
                  </div>
                </div>

                {/* Email Input (only for medical professional invites) */}
                {inviteType === 'MEDICAL_PROFESSIONAL' && (
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#374151',
                      marginBottom: '8px',
                    }}>
                      Email Address <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="clinician@hospital.com"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #E5E7EB',
                        fontSize: '0.875rem',
                        outline: 'none',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#3B82F6'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#E5E7EB'
                      }}
                    />
                  </div>
                )}

                {/* Info Text */}
                <div style={{
                  padding: '12px',
                  backgroundColor: '#F3F4F6',
                  borderRadius: '8px',
                  marginBottom: '20px',
                }}>
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#6B7280',
                    margin: 0,
                  }}>
                    {inviteType === 'PATIENT'
                      ? 'Creates a 6-digit code that patients can use to register and access exercises. Valid for 30 days.'
                      : 'Creates a secure invitation link for a clinician to register. Valid for 7 days.'}
                  </p>
                </div>

                {/* Error Message */}
                {createError && (
                  <div style={{
                    padding: '12px',
                    backgroundColor: '#FEE2E2',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <AlertCircle size={16} color="#EF4444" />
                    <p style={{
                      fontSize: '0.875rem',
                      color: '#DC2626',
                      margin: 0,
                    }}>
                      {createError}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  marginTop: '24px',
                }}>
                  <button
                    onClick={closeCreateModal}
                    disabled={isCreating}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '10px',
                      border: '1px solid #E5E7EB',
                      backgroundColor: '#FFFFFF',
                      color: '#6B7280',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: isCreating ? 'not-allowed' : 'pointer',
                      opacity: isCreating ? 0.5 : 1,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createInvite}
                    disabled={isCreating}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: isCreating ? '#9CA3AF' : '#3B82F6',
                      color: 'white',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: isCreating ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isCreating ? 'Creating...' : 'Create Invitation'}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
