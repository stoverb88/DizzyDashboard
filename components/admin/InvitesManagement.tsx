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
  code: string
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
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'USED' | 'EXPIRED'>('ALL')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

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

  async function createInvite() {
    setIsCreating(true)
    try {
      const response = await fetch('/api/admin/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'PATIENT' }),
      })

      if (response.ok) {
        await loadInvites()
      }
    } catch (error) {
      console.error('Failed to create invite:', error)
    } finally {
      setIsCreating(false)
    }
  }

  async function deleteInvite(inviteId: string) {
    if (!confirm('Are you sure you want to delete this invite code?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/invites/${inviteId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
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
    const status = getInviteStatus(invite)
    if (filterStatus === 'ALL') return true
    return status === filterStatus
  })

  return (
    <AdminLayout session={session} currentPage="invites">
      <div style={{ padding: '16px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '24px',
          gap: '12px',
          padding: '0 8px',
        }}>
          <div>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#1A202C',
              marginBottom: '8px',
            }}>
              Invitation Codes
            </h1>
            <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
              Create and manage patient invitation codes ({filteredInvites.length} {filteredInvites.length === 1 ? 'invite' : 'invites'})
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={createInvite}
            disabled={isCreating}
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
              cursor: isCreating ? 'not-allowed' : 'pointer',
              opacity: isCreating ? 0.5 : 1,
              width: '100%',
            }}
          >
            <Plus size={18} />
            {isCreating ? 'Creating...' : 'Create New Invite'}
          </motion.button>
        </div>

        {/* Filter Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: 'x mandatory',
          padding: '0 8px',
        }}>
          {(['ALL', 'ACTIVE', 'USED', 'EXPIRED'] as const).map((status) => {
            const count = status === 'ALL'
              ? invites.length
              : invites.filter((i) => getInviteStatus(i) === status).length

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
                  scrollSnapAlign: 'start',
                  flexShrink: 0,
                }}
              >
                {status} ({count})
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
                    padding: '20px',
                    border: '1px solid #E5E7EB',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '16px',
                    flexWrap: 'wrap',
                  }}>
                    {/* Left Section - Code and Status */}
                    <div style={{ flex: 1, minWidth: '0', width: '100%' }}>
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
                          onClick={() => copyToClipboard(invite.code)}
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

                    {/* Right Section - Status and Actions */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: '12px',
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

                      {status === 'ACTIVE' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => deleteInvite(invite.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #FCA5A5',
                            backgroundColor: '#FFFFFF',
                            color: '#EF4444',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={14} />
                          Delete
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
