import React, { createContext, useContext, useRef } from 'react'

interface EvalContextType {
  resetEvalForm: (() => void) | null
  setResetFunction: (fn: () => void) => void
}

const EvalContext = createContext<EvalContextType | undefined>(undefined)

export function EvalProvider({ children }: { children: React.ReactNode }) {
  const resetFunctionRef = useRef<(() => void) | null>(null)

  const setResetFunction = (fn: () => void) => {
    resetFunctionRef.current = fn
  }

  const resetEvalForm = () => {
    if (resetFunctionRef.current) {
      resetFunctionRef.current()
    }
  }

  return (
    <EvalContext.Provider value={{ resetEvalForm, setResetFunction }}>
      {children}
    </EvalContext.Provider>
  )
}

export function useEvalContext() {
  const context = useContext(EvalContext)
  if (context === undefined) {
    throw new Error('useEvalContext must be used within an EvalProvider')
  }
  return context
}
