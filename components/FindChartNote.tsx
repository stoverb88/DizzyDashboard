import React, { useState } from 'react'
import { motion } from 'framer-motion'

interface FindChartNoteProps {
  onBack: () => void
}

export function FindChartNote({ onBack }: FindChartNoteProps) {
  const [chartId, setChartId] = useState('')
  const [narrative, setNarrative] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isCopied, setIsCopied] = useState(false)

  const handleFetchNote = async () => {
    if (chartId.length !== 6) {
      setError('Please enter a valid 6-digit ID.')
      return
    }

    setError('')
    setIsLoading(true)
    setNarrative('')

    try {
      const response = await fetch(`/api/notes/${chartId}`)
      const data = await response.json()

      if (response.ok) {
        setNarrative(data.narrative)
      } else {
        setError(data.error || 'Failed to retrieve chart note.')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyNote = () => {
    navigator.clipboard.writeText(narrative)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFetchNote()
    }
  }

  const buttonStyle: React.CSSProperties = {
    padding: '12px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'all 0.2s'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        padding: '20px',
        maxWidth: '600px',
        margin: '0 auto'
      }}
    >
      <button
        onClick={onBack}
        style={{
          ...buttonStyle,
          backgroundColor: '#E2E8F0',
          color: '#2D3748',
          alignSelf: 'flex-start',
          marginBottom: '20px'
        }}
      >
        ← Back
      </button>

      <div style={{
        backgroundColor: '#fff',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        width: '100%',
        border: '1px solid #E2E8F0'
      }}>
        <h2 style={{
          fontSize: '1.8rem',
          fontWeight: '700',
          color: '#1A202C',
          marginBottom: '8px',
          textAlign: 'center'
        }}>
          Find My Chart Note
        </h2>
        
        <p style={{
          color: '#718096',
          textAlign: 'center',
          marginBottom: '30px',
          lineHeight: '1.5'
        }}>
          Enter your 6-digit ID to retrieve your chart note. 
          Notes are available for 24 hours after creation.
        </p>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '600',
            color: '#2D3748'
          }}>
            Chart ID
          </label>
          <input
            type="text"
            value={chartId}
            onChange={(e) => setChartId(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            maxLength={6}
            placeholder="Enter 6-digit ID"
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #E2E8F0',
              borderRadius: '8px',
              outline: 'none',
              transition: 'border-color 0.2s',
              textAlign: 'center',
              fontFamily: 'monospace',
              fontSize: '1.2rem',
              letterSpacing: '0.1em'
            }}
          />
        </div>

        {error && (
          <div style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#DC2626',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <button
          onClick={handleFetchNote}
          disabled={isLoading || chartId.length !== 6}
          style={{
            ...buttonStyle,
            backgroundColor: isLoading || chartId.length !== 6 ? '#CBD5E0' : '#2D3748',
            color: 'white',
            width: '100%',
            marginBottom: '20px'
          }}
        >
          {isLoading ? 'Retrieving...' : 'Retrieve Chart Note'}
        </button>

        {narrative && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: '20px',
              padding: '20px',
              backgroundColor: '#F7FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px'
            }}>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                color: '#2D3748',
                margin: 0
              }}>
                Your Chart Note
              </h3>
              <button
                onClick={handleCopyNote}
                style={{
                  ...buttonStyle,
                  backgroundColor: isCopied ? '#48BB78' : '#2D3748',
                  color: 'white',
                  padding: '8px 16px',
                  fontSize: '0.9rem'
                }}
              >
                {isCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            
            <textarea
              readOnly
              value={narrative}
              style={{
                width: '100%',
                minHeight: '300px',
                padding: '15px',
                border: '1px solid #CBD5E0',
                borderRadius: '6px',
                resize: 'vertical',
                fontFamily: 'inherit',
                fontSize: '0.95rem',
                lineHeight: '1.6',
                backgroundColor: 'white'
              }}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  )
} 