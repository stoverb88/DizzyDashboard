"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  radius: number
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
  const particlesRef = useRef<Particle[]>([])

  // Canvas dimensions - optimized for mobile
  const CANVAS_WIDTH = 320
  const CANVAS_HEIGHT = 320
  const CENTER_X = CANVAS_WIDTH / 2
  const CENTER_Y = CANVAS_HEIGHT / 2
  
  // Ring dimensions
  const OUTER_RADIUS = 120
  const INNER_RADIUS = 80
  const TUBE_WIDTH = OUTER_RADIUS - INNER_RADIUS
  const PARTICLE_RADIUS = Math.floor(TUBE_WIDTH / 8) // 1/8th tube width

  // Initialize 4 particles at bottom of ring
  const initializeParticles = useCallback(() => {
    const newParticles: Particle[] = []
    const startAngle = Math.PI / 2 // Bottom of ring (6 o'clock)
    const ringCenter = (OUTER_RADIUS + INNER_RADIUS) / 2 // Middle of tube
    
    for (let i = 0; i < 4; i++) {
      const angle = startAngle + (i - 1.5) * 0.1 // Spread particles slightly
      newParticles.push({
        id: i,
        x: CENTER_X + Math.cos(angle) * ringCenter,
        y: CENTER_Y + Math.sin(angle) * ringCenter,
        vx: 0,
        vy: 0,
        radius: PARTICLE_RADIUS
      })
    }
    
    setParticles(newParticles)
    particlesRef.current = newParticles
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

  // Check if point is inside the ring tube
  const isInsideRing = (x: number, y: number): boolean => {
    const distFromCenter = Math.sqrt((x - CENTER_X) ** 2 + (y - CENTER_Y) ** 2)
    return distFromCenter >= INNER_RADIUS && distFromCenter <= OUTER_RADIUS
  }

  // Check collision with cupula (at bottom of ring)
  const checkCupulaCollision = (x: number, y: number, radius: number): boolean => {
    // Cupula positioned at bottom of ring (6 o'clock)
    const cupulaX = CENTER_X
    const cupulaY = CENTER_Y + (OUTER_RADIUS + INNER_RADIUS) / 2
    const cupulaWidth = TUBE_WIDTH * 0.6
    const cupulaHeight = TUBE_WIDTH * 0.4
    
    // Simple rectangular collision for cupula
    return (
      x - radius < cupulaX + cupulaWidth / 2 &&
      x + radius > cupulaX - cupulaWidth / 2 &&
      y - radius < cupulaY + cupulaHeight / 2 &&
      y + radius > cupulaY - cupulaHeight / 2
    )
  }

  // Physics update
  const updatePhysics = useCallback(() => {
    if (!canvasRef.current) return

    const newParticles = particlesRef.current.map((particle, index) => {
      // Convert device orientation to gravity vector
      const gravityStrength = 0.3
      
      // Detect if device is roughly horizontal (gamma close to ±90 degrees)
      const isHorizontal = Math.abs(Math.abs(orientation.gamma || 0) - 90) < 30
      
      // When horizontal, primarily use gamma for gravity direction and minimize beta influence
      let gravityX, gravityY
      
      if (isHorizontal) {
        // When horizontal, use gamma as primary gravity direction
        // Determine if we're in left-horizontal (gamma ~90) or right-horizontal (gamma ~-90)
        const isLeftHorizontal = (orientation.gamma || 0) > 0
        
        if (isLeftHorizontal) {
          // Left side down: gravity points left
          gravityX = -gravityStrength
          gravityY = 0
        } else {
          // Right side down: gravity points right  
          gravityX = gravityStrength
          gravityY = 0
        }
        
        // Add minimal beta influence only for fine-tuning
        gravityY += Math.sin((orientation.beta || 0) * Math.PI / 180) * gravityStrength * 0.2
        
      } else {
        // When vertical (normal portrait/landscape), use both gamma and beta normally
        gravityX = Math.sin((orientation.gamma || 0) * Math.PI / 180) * gravityStrength
        gravityY = Math.sin((orientation.beta || 0) * Math.PI / 180) * gravityStrength
      }

      // Update velocity with gravity
      let newVx = particle.vx + gravityX
      let newVy = particle.vy + gravityY

      // Apply damping
      newVx *= 0.98
      newVy *= 0.98

      // Predict new position
      let newX = particle.x + newVx
      let newY = particle.y + newVy

      // Keep particle in ring boundaries
      const distFromCenter = Math.sqrt((newX - CENTER_X) ** 2 + (newY - CENTER_Y) ** 2)
      
      if (distFromCenter > OUTER_RADIUS - particle.radius) {
        // Hit outer wall
        const angle = Math.atan2(newY - CENTER_Y, newX - CENTER_X)
        newX = CENTER_X + Math.cos(angle) * (OUTER_RADIUS - particle.radius)
        newY = CENTER_Y + Math.sin(angle) * (OUTER_RADIUS - particle.radius)
        
        // Bounce off wall
        const normalX = Math.cos(angle)
        const normalY = Math.sin(angle)
        const dotProduct = newVx * normalX + newVy * normalY
        newVx = newVx - 2 * dotProduct * normalX
        newVy = newVy - 2 * dotProduct * normalY
        newVx *= 0.7 // Energy loss
        newVy *= 0.7
      } else if (distFromCenter < INNER_RADIUS + particle.radius) {
        // Hit inner wall
        const angle = Math.atan2(newY - CENTER_Y, newX - CENTER_X)
        newX = CENTER_X + Math.cos(angle) * (INNER_RADIUS + particle.radius)
        newY = CENTER_Y + Math.sin(angle) * (INNER_RADIUS + particle.radius)
        
        // Bounce off wall
        const normalX = -Math.cos(angle)
        const normalY = -Math.sin(angle)
        const dotProduct = newVx * normalX + newVy * normalY
        newVx = newVx - 2 * dotProduct * normalX
        newVy = newVy - 2 * dotProduct * normalY
        newVx *= 0.7
        newVy *= 0.7
      }

      // Check cupula collision
      if (checkCupulaCollision(newX, newY, particle.radius)) {
        // Push particle away from cupula
        const cupulaX = CENTER_X
        const cupulaY = CENTER_Y + (OUTER_RADIUS + INNER_RADIUS) / 2
        const pushAngle = Math.atan2(newY - cupulaY, newX - cupulaX)
        const pushDistance = particle.radius + TUBE_WIDTH * 0.3
        newX = cupulaX + Math.cos(pushAngle) * pushDistance
        newY = cupulaY + Math.sin(pushAngle) * pushDistance
        
        // Reduce velocity
        newVx *= 0.5
        newVy *= 0.5
      }

      // Particle-to-particle collision
      particlesRef.current.forEach((otherParticle, otherIndex) => {
        if (index !== otherIndex) {
          const dx = newX - otherParticle.x
          const dy = newY - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const minDistance = particle.radius + otherParticle.radius
          
          if (distance < minDistance && distance > 0) {
            // Separate particles
            const overlap = minDistance - distance
            const separationX = (dx / distance) * (overlap * 0.5)
            const separationY = (dy / distance) * (overlap * 0.5)
            
            newX += separationX
            newY += separationY
            
            // Elastic collision
            const normalX = dx / distance
            const normalY = dy / distance
            const relativeVelocityX = newVx - otherParticle.vx
            const relativeVelocityY = newVy - otherParticle.vy
            const velocityAlongNormal = relativeVelocityX * normalX + relativeVelocityY * normalY
            
            if (velocityAlongNormal > 0) return // Particles separating
            
            const restitution = 0.8
            const impulse = -(1 + restitution) * velocityAlongNormal / 2
            newVx += impulse * normalX
            newVy += impulse * normalY
          }
        }
      })

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

    // Draw outer ring (light blue fluid)
    ctx.fillStyle = '#87CEEB' // Light blue
    ctx.beginPath()
    ctx.arc(CENTER_X, CENTER_Y, OUTER_RADIUS, 0, Math.PI * 2)
    ctx.fill()

    // Draw inner hole (white)
    ctx.fillStyle = 'white'
    ctx.beginPath()
    ctx.arc(CENTER_X, CENTER_Y, INNER_RADIUS, 0, Math.PI * 2)
    ctx.fill()

    // Draw ring border
    ctx.strokeStyle = '#4682B4'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(CENTER_X, CENTER_Y, OUTER_RADIUS, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(CENTER_X, CENTER_Y, INNER_RADIUS, 0, Math.PI * 2)
    ctx.stroke()

    // Draw cupula (at bottom of ring)
    const cupulaX = CENTER_X
    const cupulaY = CENTER_Y + (OUTER_RADIUS + INNER_RADIUS) / 2
    const cupulaWidth = TUBE_WIDTH * 0.6
    const cupulaHeight = TUBE_WIDTH * 0.4
    
    ctx.fillStyle = '#8B4513' // Brown color for cupula
    ctx.fillRect(
      cupulaX - cupulaWidth / 2,
      cupulaY - cupulaHeight / 2,
      cupulaWidth,
      cupulaHeight
    )
    
    // Draw cupula hair-like structures
    ctx.strokeStyle = '#654321'
    ctx.lineWidth = 1
    for (let i = 0; i < 5; i++) {
      const hairX = cupulaX - cupulaWidth / 2 + (cupulaWidth / 4) * (i + 1)
      ctx.beginPath()
      ctx.moveTo(hairX, cupulaY - cupulaHeight / 2)
      ctx.lineTo(hairX + (Math.random() - 0.5) * 4, cupulaY - cupulaHeight / 2 - 8)
      ctx.stroke()
    }

    // Draw particles (purple)
    ctx.fillStyle = '#8A2BE2' // Purple
    particlesRef.current.forEach(particle => {
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
      ctx.fill()
    })

    // Draw labels
    ctx.fillStyle = '#333'
    ctx.font = '14px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('Semicircular Canal', CENTER_X, CENTER_Y - OUTER_RADIUS - 20)
    ctx.fillText('Cupula', CENTER_X, CENTER_Y + OUTER_RADIUS + 20)
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
          Canal Ring Simulation
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
              Tilt your device to move the particles through the canal ring.
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
                border: '2px solid #ddd',
                borderRadius: '8px',
                backgroundColor: 'white'
              }}
            />
            
            <div style={{ textAlign: 'center', maxWidth: '300px' }}>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                Tilt your device to see how particles move through the semicircular canal. 
                This demonstrates how BPPV occurs when otoconia become displaced.
              </p>
              
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
            </div>
          </>
        )}
      </div>
    </div>
  )
} 