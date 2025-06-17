"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  shape: number // 0-9 for different irregular shapes
}

interface CanalSimulationProps {
  onClose: () => void
}

export function CanalSimulation({ onClose }: CanalSimulationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const [particles, setParticles] = useState<Particle[]>([])
  const [orientation, setOrientation] = useState({ beta: 0, gamma: 0 })
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const particlesRef = useRef<Particle[]>([])

  // Canvas dimensions
  const CANVAS_WIDTH = 350
  const CANVAS_HEIGHT = 600

  // Initialize particles in the canal cluster area (following user's drawing)
  const initializeParticles = useCallback(() => {
    const newParticles: Particle[] = []
    const centerX = CANVAS_WIDTH / 2
    const centerY = CANVAS_HEIGHT / 2
    
    // Start particles in the right side of the canal ring, away from cupula
    const clusterX = centerX + 90 // Right side of the canal ring
    const clusterY = centerY // Middle height of canal
    
    for (let i = 0; i < 10; i++) {
      newParticles.push({
        id: i,
        x: clusterX + (Math.random() - 0.5) * 15,
        y: clusterY + (Math.random() - 0.5) * 15,
        vx: 0,
        vy: 0,
        size: 3 + Math.random() * 2,
        shape: Math.floor(Math.random() * 10)
      })
    }
    
    setParticles(newParticles)
    particlesRef.current = newParticles
    setShowReset(false)
  }, [])

  // Request device orientation permission
  const requestOrientationPermission = async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && 'requestPermission' in DeviceOrientationEvent) {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission()
        if (permission === 'granted') {
          setPermissionGranted(true)
        }
      } catch (error) {
        console.error('Error requesting orientation permission:', error)
      }
    } else {
      // For non-iOS devices, assume permission is granted
      setPermissionGranted(true)
    }
  }

  // Handle device orientation
  useEffect(() => {
    if (!permissionGranted) return

    const handleOrientation = (event: DeviceOrientationEvent) => {
      setOrientation({
        beta: event.beta || 0,   // front-to-back tilt
        gamma: event.gamma || 0  // left-to-right tilt
      })
    }

    window.addEventListener('deviceorientation', handleOrientation)
    return () => window.removeEventListener('deviceorientation', handleOrientation)
  }, [permissionGranted])

  // Check if particle is inside canal boundaries (following user's drawing)
  const isInsideCanal = (x: number, y: number): boolean => {
    const centerX = CANVAS_WIDTH / 2
    const centerY = CANVAS_HEIGHT / 2

    // Main circular canal ring - this is the actual canal space
    const outerRadius = 120
    const innerRadius = 80
    const distFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)
    
    // Check if in the ring (between inner and outer radius)
    if (distFromCenter <= outerRadius && distFromCenter >= innerRadius) {
      // Block the cupula area - vertical flame-like barrier at bottom of canal
      // Cupula should be at the bottom (6 o'clock) but as a vertical barrier
      const cupulaX = centerX - 15 // Left edge of cupula
      const cupulaX2 = centerX + 15 // Right edge of cupula
      const cupulaY = centerY + 85 // Bottom of canal
      const cupulaY2 = centerY + 105 // Extends down slightly
      
      // Block particles from passing through the cupula barrier
      if (x >= cupulaX && x <= cupulaX2 && y >= cupulaY && y <= cupulaY2) {
        return false
      }
      
      return true
    }

    // Utricle region (left side) - connected to the ring
    if (x >= centerX - outerRadius - 20 && x <= centerX - innerRadius && 
        y >= centerY - 30 && y <= centerY + 30) {
      return true
    }

    return false
  }

  // Check if particle is in utricle (settling area)
  const isInUtricle = (x: number, y: number): boolean => {
    const centerX = CANVAS_WIDTH / 2
    const centerY = CANVAS_HEIGHT / 2
    // Utricle is the left rectangular region
    return x >= centerX - 160 && x <= centerX - 100 && y >= centerY - 30 && y <= centerY + 30
  }

  // Physics update
  const updatePhysics = useCallback(() => {
    if (!canvasRef.current) return

    const newParticles = particlesRef.current.map(particle => {
      // Apply gravity based on device orientation - reduced strength for fluid movement
      const gravityX = orientation.gamma * 0.08  // Reduced from 0.12
      const gravityY = Math.abs(orientation.gamma) * 0.02 + 0.05 // Reduced from 0.03 + 0.08

      // Update velocity
      let newVx = particle.vx + gravityX
      let newVy = particle.vy + gravityY

      // Apply damping for fluid-like movement
      newVx *= 0.995 // Less damping for more fluid movement
      newVy *= 0.995

      // Predict new position
      let newX = particle.x + newVx
      let newY = particle.y + newVy

      // Collision detection and response - gentler bouncing
      if (!isInsideCanal(newX, newY)) {
        // Try moving only in X direction
        if (isInsideCanal(newX, particle.y)) {
          newY = particle.y
          newVy *= -0.2 // Gentler bounce
        }
        // Try moving only in Y direction
        else if (isInsideCanal(particle.x, newY)) {
          newX = particle.x
          newVx *= -0.2 // Gentler bounce
        }
        // Can't move in either direction, gentle push back
        else {
          newX = particle.x + (Math.random() - 0.5) * 2 // Small random nudge
          newY = particle.y + (Math.random() - 0.5) * 2
          newVx *= -0.1
          newVy *= -0.1
        }
      }

      // Check if settled in utricle
      if (isInUtricle(newX, newY)) {
        newVx *= 0.8
        newVy *= 0.8
        if (Math.abs(newVx) < 0.05 && Math.abs(newVy) < 0.05) {
          setShowReset(true)
        }
      }

      return {
        ...particle,
        x: newX,
        y: newY,
        vx: newVx,
        vy: newVy
      }
    })

    particlesRef.current = newParticles
    setParticles(newParticles)
  }, [orientation])

  // Animation loop
  useEffect(() => {
    const animate = () => {
      updatePhysics()
      draw()
      animationRef.current = requestAnimationFrame(animate)
    }

    if (permissionGranted) {
      animate()
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [updatePhysics, permissionGranted])

  // Draw function
  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    const centerX = CANVAS_WIDTH / 2
    const centerY = CANVAS_HEIGHT / 2

    // Draw canal outline (following user's drawing)
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 3
    ctx.fillStyle = '#f8f8f8'

    // Main semicircular canal
    ctx.beginPath()
    ctx.arc(centerX, centerY, 120, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    // Inner canal space
    ctx.fillStyle = 'white'
    ctx.beginPath()
    ctx.arc(centerX, centerY, 100, 0, Math.PI * 2)
    ctx.fill()

    // Draw cupula as a vertical flame-like barrier at bottom of canal
    ctx.strokeStyle = '#333'
    ctx.fillStyle = '#ddd'
    ctx.lineWidth = 2
    
    // Draw flame-like cupula shape
    ctx.beginPath()
    const cupulaBaseX = centerX
    const cupulaBaseY = centerY + 95
    const cupulaHeight = 25
    const cupulaWidth = 12
    
    // Flame shape - curved upward
    ctx.moveTo(cupulaBaseX - cupulaWidth, cupulaBaseY)
    ctx.quadraticCurveTo(cupulaBaseX - cupulaWidth/2, cupulaBaseY - cupulaHeight, cupulaBaseX, cupulaBaseY - cupulaHeight - 5)
    ctx.quadraticCurveTo(cupulaBaseX + cupulaWidth/2, cupulaBaseY - cupulaHeight, cupulaBaseX + cupulaWidth, cupulaBaseY)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // Utricle (left side)
    ctx.fillStyle = '#f0f0f0'
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 3
    ctx.fillRect(centerX - 160, centerY - 30, 60, 60)
    ctx.strokeRect(centerX - 160, centerY - 30, 60, 60)

    // Labels
    ctx.fillStyle = '#333'
    ctx.font = '16px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('PSC', centerX, centerY - 140)
    ctx.fillText('UT', centerX - 130, centerY + 5)
    ctx.fillText('Cupula', centerX, centerY + 130)

    // Draw particles
    particlesRef.current.forEach(particle => {
      ctx.fillStyle = '#dc2626' // Red color like in user's drawing
      ctx.beginPath()
      
      // Draw irregular particle shapes
      const sides = 6 + (particle.shape % 4)
      const angleStep = (Math.PI * 2) / sides
      ctx.moveTo(
        particle.x + Math.cos(0) * particle.size,
        particle.y + Math.sin(0) * particle.size
      )
      
      for (let i = 1; i <= sides; i++) {
        const angle = i * angleStep
        const radius = particle.size * (0.8 + Math.random() * 0.4)
        ctx.lineTo(
          particle.x + Math.cos(angle) * radius,
          particle.y + Math.sin(angle) * radius
        )
      }
      
      ctx.closePath()
      ctx.fill()
    })
  }

  // Initialize particles on mount
  useEffect(() => {
    initializeParticles()
  }, [initializeParticles])

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'white',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Header */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '20px',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white'
      }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600' }}>
          Posterior Canal Simulation
        </h2>
        <button
          onClick={onClose}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            backgroundColor: 'white',
            cursor: 'pointer'
          }}
        >
          ← Back
        </button>
      </div>

      {/* Main content */}
      <div style={{ 
        marginTop: '80px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px'
      }}>
        {!permissionGranted ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h3>Enable Device Orientation</h3>
            <p style={{ marginBottom: '20px', color: '#666' }}>
              This simulation uses your device's orientation to move the otoconia particles.
            </p>
            <button
              onClick={requestOrientationPermission}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#667eea',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
              }}
            >
              Enable Orientation
            </button>
          </div>
        ) : (
          <>
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              style={{
                border: '2px solid #333',
                borderRadius: '8px',
                backgroundColor: 'white'
              }}
            />
            
            <div style={{ textAlign: 'center', maxWidth: '300px' }}>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                Hold your phone upright and roll it left or right to move the otoconia through the canal
              </p>
              
              {/* Orientation indicator */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                marginBottom: '10px',
                fontSize: '12px',
                color: '#888'
              }}>
                <span>Roll: </span>
                <div style={{
                  width: '100px',
                  height: '20px',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '10px',
                  margin: '0 10px',
                  position: 'relative',
                  border: '1px solid #ddd'
                }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    backgroundColor: '#667eea',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '2px',
                    left: `${Math.max(2, Math.min(82, 42 + orientation.gamma * 0.5))}px`,
                    transition: 'left 0.1s ease'
                  }} />
                </div>
                <span>{Math.round(orientation.gamma)}°</span>
              </div>
              
              {showReset && (
                <button
                  onClick={initializeParticles}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#10b981',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginTop: '10px'
                  }}
                >
                  Reset Particles
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
} 