import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReferenceId, references } from '../lib/references';

interface ReferencesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  referenceIds?: ReferenceId[]; // Now optional since we show all references
}

export function ReferencesDrawer({ isOpen, onClose }: ReferencesDrawerProps) {
  // Always show all 10 master references in order (R1-R10)
  const allReferenceIds: ReferenceId[] = ["R1", "R2", "R3", "R4", "R5", "R6", "R7", "R8", "R9", "R10"];

  // Map reference IDs to actual reference objects
  const referencesToShow = allReferenceIds.map(id => references[id]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 998,
            }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              maxHeight: '70vh',
              backgroundColor: 'white',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
              zIndex: 999,
              overflowY: 'auto',
              padding: '20px',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              borderBottom: '2px solid #e2e8f0',
              paddingBottom: '12px',
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: '700',
                color: '#1f2937',
              }}>
                References
              </h2>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '28px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '0',
                  lineHeight: '1',
                }}
                aria-label="Close references"
              >
                ×
              </button>
            </div>

            {/* References List */}
            <div style={{ paddingBottom: '20px' }}>
              {referencesToShow.map((ref, index) => (
                <div
                  key={ref.id}
                  style={{
                    marginBottom: '20px',
                    paddingBottom: '16px',
                    borderBottom: index < referencesToShow.length - 1 ? '1px solid #e5e7eb' : 'none',
                  }}
                >
                  {/* Reference Number */}
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start',
                  }}>
                    <span style={{
                      fontWeight: '700',
                      color: '#3b82f6',
                      fontSize: '14px',
                      minWidth: '24px',
                    }}>
                      {ref.id.replace('R', '')}.
                    </span>
                    <div style={{ flex: 1 }}>
                      {/* Short Label */}
                      <div style={{
                        fontWeight: '600',
                        color: '#1f2937',
                        fontSize: '14px',
                        marginBottom: '6px',
                      }}>
                        {ref.shortLabel}
                      </div>

                      {/* Full Citation */}
                      <div style={{
                        color: '#4b5563',
                        fontSize: '13px',
                        lineHeight: '1.6',
                        marginBottom: '8px',
                      }}>
                        {ref.fullCitation}
                      </div>

                      {/* URL Link */}
                      {ref.url && (
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#3b82f6',
                            fontSize: '12px',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          View Source
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                          </svg>
                        </a>
                      )}

                      {/* Optional Notes */}
                      {ref.notes && (
                        <div style={{
                          marginTop: '8px',
                          padding: '8px 12px',
                          backgroundColor: '#f3f4f6',
                          borderRadius: '6px',
                          fontSize: '12px',
                          color: '#374151',
                          fontStyle: 'italic',
                          lineHeight: '1.5',
                        }}>
                          <strong>Note:</strong> {ref.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
