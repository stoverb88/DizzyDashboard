import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from './ui/Button'

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
    // Remove hyphens and spaces for validation
    const cleanedId = chartId.replace(/[-\s]/g, '')

    if (cleanedId.length !== 8) {
      setError('Please enter a valid 8-character ID.')
      return
    }

    setError('')
    setIsLoading(true)
    setNarrative('')

    try {
      const response = await fetch(`/api/notes/${cleanedId}`)
      const data = await response.json()

      if (response.ok) {
        setNarrative(data.narrative)
      } else {
        // Handle rate limiting messages
        if (response.status === 429) {
          if (data.resetAt) {
            const resetDate = new Date(data.resetAt)
            const minutesRemaining = Math.ceil((resetDate.getTime() - Date.now()) / 60000)
            setError(`${data.error} Please wait ${minutesRemaining} minute(s).`)
          } else {
            setError(data.error || 'Too many requests. Please try again later.')
          }
        } else {
          setError(data.error || 'Failed to retrieve chart note.')
        }
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyNote = async () => {
    try {
      await navigator.clipboard.writeText(narrative)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      // Fallback for when clipboard API fails
      const textArea = document.createElement('textarea')
      textArea.value = narrative
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      } catch (fallbackErr) {
        setError('Failed to copy to clipboard. Please copy manually.')
      }
      document.body.removeChild(textArea)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFetchNote()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '20px',
        paddingTop: '40px',
        maxWidth: '600px',
        margin: '0 auto',
        boxSizing: 'border-box',
        width: '100%'
      }}
    >
      <div style={{
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        width: '100%',
        border: '1px solid #E2E8F0',
        boxSizing: 'border-box'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '32px',
              fontWeight: '900',
              cursor: 'pointer',
              color: '#1e293b',
              padding: '8px',
              borderRadius: '6px',
              transition: 'all 0.2s',
              lineHeight: 1,
              marginRight: '15px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ←
          </button>
          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: '700',
            color: '#1A202C',
            margin: 0,
            flex: 1
          }}>
            Find My Chart Note
          </h2>
        </div>
        
        <p style={{
          color: '#718096',
          textAlign: 'center',
          marginBottom: '30px',
          lineHeight: '1.5'
        }}>
          Enter your 8-character ID to retrieve your chart note.
          Notes are available for 72 hours after creation.
        </p>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '600',
            color: '#2D3748',
            textAlign: 'center'
          }}>
            Chart ID
          </label>
          <input
            type="text"
            value={chartId}
            onChange={(e) => {
              // Auto-format with hyphen: A3X9-K2M7
              let value = e.target.value.toUpperCase().replace(/[-\s]/g, '')
              if (value.length > 4) {
                value = value.slice(0, 4) + '-' + value.slice(4, 8)
              }
              setChartId(value)
            }}
            onKeyPress={handleKeyPress}
            maxLength={9} // 8 chars + 1 hyphen
            placeholder="A3X9-K2M7"
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
              letterSpacing: '0.1em',
              boxSizing: 'border-box'
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

        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleFetchNote}
          disabled={isLoading || chartId.replace(/[-\s]/g, '').length !== 8}
          style={{ marginBottom: '20px' }}
        >
          {isLoading ? 'Retrieving...' : 'Retrieve Chart Note'}
        </Button>

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
              <Button
                variant={isCopied ? "secondary" : "primary"}
                size="sm"
                onClick={handleCopyNote}
              >
                {isCopied ? '✓ Copied!' : 'Copy'}
              </Button>
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
                backgroundColor: 'white',
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  )
} 