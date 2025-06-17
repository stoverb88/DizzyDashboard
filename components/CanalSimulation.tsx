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

  // Initialize particles in the canal cluster area (starting at bottom position)
  const initializeParticles = useCallback(() => {
    const newParticles: Particle[] = []
    const centerX = CANVAS_WIDTH / 2
    const centerY = CANVAS_HEIGHT / 2
    
    // Start particles at the bottom of the canal ring (6 o'clock position)
    const startRadius = 100 // Middle of the canal ring
    const startAngle = Math.PI / 2 // Bottom position (6 o'clock)
    
    for (let i = 0; i < 10; i++) {
      const angle = startAngle + (Math.random() - 0.5) * 0.3 // Small spread around bottom position
      const radius = startRadius + (Math.random() - 0.5) * 10 // Small radius variation
      
      newParticles.push({
        id: i,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
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

  // Check if particle is in utricle (enlarged settling area that overlaps canal)
  const isInUtricle = (x: number, y: number): boolean => {
    const centerX = CANVAS_WIDTH / 2
    const centerY = CANVAS_HEIGHT / 2
    // Enlarged utricle overlapping with canal on the left side
    return x >= centerX - 180 && x <= centerX - 60 && y >= centerY - 50 && y <= centerY + 50
  }

  // Physics update
  const updatePhysics = useCallback(() => {
    if (!canvasRef.current) return

    const newParticles = particlesRef.current.map((particle, index) => {
      // Strong bubble level style physics
      const gravityX = Math.sin((orientation.beta || 0) * Math.PI / 180) * 1.2  // Even stronger
      const gravityY = Math.cos((orientation.beta || 0) * Math.PI / 180) * 1.2  // Even stronger
      
      // Add gamma influence for left/right roll
      const rollInfluence = (orientation.gamma || 0) * 0.4  // Stronger influence

      // Update velocity
      let newVx = particle.vx + gravityX + rollInfluence
      let newVy = particle.vy + gravityY

      // Minimal damping to maintain momentum
      newVx *= 0.995  // Very minimal damping
      newVy *= 0.995

      // Predict new position
      let newX = particle.x + newVx
      let newY = particle.y + newVy

      // Simplified particle collision to prevent clustering
      particlesRef.current.forEach((otherParticle, otherIndex) => {
        if (index !== otherIndex) {
          const dx = newX - otherParticle.x
          const dy = newY - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const minDistance = particle.size + otherParticle.size
          
          if (distance < minDistance && distance > 0) {
            // Gentle separation
            const overlap = minDistance - distance
            const separationX = (dx / distance) * (overlap * 0.2)
            const separationY = (dy / distance) * (overlap * 0.2)
            
            newX += separationX
            newY += separationY
          }
        }
      })

      // Simple circular boundary - only keep particles in canal ring
      const centerX = CANVAS_WIDTH / 2
      const centerY = CANVAS_HEIGHT / 2
      const distFromCenter = Math.sqrt((newX - centerX) ** 2 + (newY - centerY) ** 2)
      
      // Very simple boundary check - just keep in ring, no complex bouncing
      if (distFromCenter > 120) {
        const angle = Math.atan2(newY - centerY, newX - centerX)
        newX = centerX + Math.cos(angle) * 118
        newY = centerY + Math.sin(angle) * 118
      } else if (distFromCenter < 80) {
        const angle = Math.atan2(newY - centerY, newX - centerX)
        newX = centerX + Math.cos(angle) * 82
        newY = centerY + Math.sin(angle) * 82
      }

      // Minimal cupula interaction - just a small obstacle
      const cupulaX = centerX
      const cupulaY = centerY + 100 // Bottom position
      const cupulaDistance = Math.sqrt((newX - cupulaX) ** 2 + (newY - cupulaY) ** 2)
      
      if (cupulaDistance < 12) {
        // Simple push away from cupula
        const pushAngle = Math.atan2(newY - cupulaY, newX - cupulaX)
        newX = cupulaX + Math.cos(pushAngle) * 15
        newY = cupulaY + Math.sin(pushAngle) * 15
      }

      // Check if in utricle
      if (isInUtricle(newX, newY)) {
        newVx *= 0.95
        newVy *= 0.95
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

    // Main semicircular canal - outer boundary
    ctx.beginPath()
    ctx.arc(centerX, centerY, 115, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    // Inner canal boundary
    ctx.fillStyle = 'white'
    ctx.beginPath()
    ctx.arc(centerX, centerY, 85, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    // Draw cupula as a vertical flame-like barrier at 6 o'clock position (bottom)
    ctx.strokeStyle = '#333'
    ctx.fillStyle = '#ff6b6b'
    ctx.lineWidth = 2
    
    // Position cupula at 6 o'clock position at bottom of canal
    const cupulaAngle = Math.PI / 2 // 90 degrees = 6 o'clock position (bottom)
    const cupulaRadius = 100 // Middle of canal ring
    const cupulaCenterX = centerX + Math.cos(cupulaAngle) * cupulaRadius
    const cupulaCenterY = centerY + Math.sin(cupulaAngle) * cupulaRadius
    const cupulaWidth = 18
    const cupulaHeight = 30
    
    // Calculate direction toward center for tip orientation
    const tipAngle = Math.atan2(centerY - cupulaCenterY, centerX - cupulaCenterX)
    const tipX = cupulaCenterX + Math.cos(tipAngle) * (cupulaHeight/2 + 5)
    const tipY = cupulaCenterY + Math.sin(tipAngle) * (cupulaHeight/2 + 5)
    
    // Draw flame-like cupula shape pointing toward center
    ctx.beginPath()
    // Base of cupula (away from center)
    const baseX1 = cupulaCenterX - Math.cos(tipAngle + Math.PI/2) * cupulaWidth/2
    const baseY1 = cupulaCenterY - Math.sin(tipAngle + Math.PI/2) * cupulaWidth/2
    const baseX2 = cupulaCenterX + Math.cos(tipAngle + Math.PI/2) * cupulaWidth/2
    const baseY2 = cupulaCenterY + Math.sin(tipAngle + Math.PI/2) * cupulaWidth/2
    
    ctx.moveTo(baseX1, baseY1)
    ctx.quadraticCurveTo(
      cupulaCenterX + Math.cos(tipAngle) * cupulaHeight/4,
      cupulaCenterY + Math.sin(tipAngle) * cupulaHeight/4,
      tipX,
      tipY
    )
    ctx.quadraticCurveTo(
      cupulaCenterX + Math.cos(tipAngle) * cupulaHeight/4,
      cupulaCenterY + Math.sin(tipAngle) * cupulaHeight/4,
      baseX2,
      baseY2
    )
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // Enlarged Utricle (left side) - overlapping with canal
    ctx.fillStyle = '#f0f0f0'
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 3
    ctx.fillRect(centerX - 180, centerY - 50, 120, 100)
    ctx.strokeRect(centerX - 180, centerY - 50, 120, 100)

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
                borderRadius: '8px',
                backgroundColor: 'white'
              }}
            />
            
            <div style={{ textAlign: 'center', maxWidth: '300px' }}>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                Hold your phone flat like a bubble level and tilt it forward/back to move the otoconia through the canal
              </p>
              
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