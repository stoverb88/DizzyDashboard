'use client'

// PatientInviteModal.tsx
// Compact modal for medical professionals to generate patient invite codes

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Check } from 'lucide-react'

interface PatientInviteModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PatientInviteModal({ isOpen, onClose }: PatientInviteModalProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState(false)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)

  async function generateInvite() {
    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/invites', {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        setGeneratedCode(data.code)
      } else {
        setError(data.error || 'Failed to generate code')
      }
    } catch (err) {
      console.error('Error generating invite:', err)
      setError('Failed to generate code')
    } finally {
      setIsGenerating(false)
    }
  }

  function copyCode(code: string) {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      return
    }
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    }).catch((err) => {
      console.error('Failed to copy code:', err)
    })
  }

  function handleClose() {
    setGeneratedCode(null)
    setError(null)
    setCopiedCode(false)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
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
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: '380px',
              marginLeft: 'auto',
              marginRight: 'auto',
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '24px',
              paddingBottom: '32px',
              zIndex: 9999,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              maxHeight: '70vh',
              overflowY: 'auto',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#1A202C',
                margin: 0,
              }}>
                Patient Invite Code
              </h2>
              <button
                onClick={handleClose}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: '#6B7280',
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            {!generatedCode ? (
              <>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6B7280',
                  marginBottom: '20px',
                  lineHeight: 1.5,
                }}>
                  Generate a 6-digit code for your patient to use during registration.
                </p>

                {error && (
                  <div style={{
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FCA5A5',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '16px',
                  }}>
                    <p style={{
                      color: '#991B1B',
                      fontSize: '0.875rem',
                      margin: 0,
                    }}>
                      {error}
                    </p>
                  </div>
                )}

                <button
                  onClick={generateInvite}
                  disabled={isGenerating}
                  style={{
                    width: '100%',
                    padding: '14px',
                    backgroundColor: isGenerating ? '#9CA3AF' : '#2D3748',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: isGenerating ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isGenerating ? 'Generating...' : 'Generate Code'}
                </button>
              </>
            ) : (
              <>
                <div style={{
                  backgroundColor: '#D1FAE5',
                  border: '2px solid #10B981',
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '20px',
                  textAlign: 'center',
                }}>
                  <div style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#065F46',
                    marginBottom: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    Share this code with your patient
                  </div>
                  <div style={{
                    fontSize: '2.5rem',
                    fontWeight: 700,
                    color: '#065F46',
                    fontFamily: 'monospace',
                    letterSpacing: '0.15em',
                    marginBottom: '8px',
                  }}>
                    {generatedCode}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#059669',
                  }}>
                    Expires in 30 days
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '12px',
                }}>
                  <button
                    onClick={() => copyCode(generatedCode)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: copiedCode ? '#10B981' : 'white',
                      color: copiedCode ? 'white' : '#10B981',
                      border: `2px solid #10B981`,
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    {copiedCode ? (
                      <>
                        <Check size={16} />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        Copy Code
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleClose}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: '#2D3748',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Done
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
