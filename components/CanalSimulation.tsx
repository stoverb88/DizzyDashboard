"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  inAmpulla: boolean
  dissolving: boolean
  originalRadius: number
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
  const [epleyComplete, setEpleyComplete] = useState(false)
  const particlesRef = useRef<Particle[]>([])

  // Canvas dimensions - optimized for mobile (made larger)
  const CANVAS_WIDTH = 400  // Increased from 320
  const CANVAS_HEIGHT = 400 // Increased from 320
  const CENTER_X = CANVAS_WIDTH / 2
  const CENTER_Y = CANVAS_HEIGHT / 2
  
  // Ring dimensions
  const OUTER_RADIUS = 140  // Increased proportionally
  const INNER_RADIUS = 100  // Increased proportionally
  const TUBE_WIDTH = OUTER_RADIUS - INNER_RADIUS
  const PARTICLE_RADIUS = Math.floor(TUBE_WIDTH / 8) // 1/8th tube width

  // Vestibule dimensions (large bulbous chamber at 4 o'clock position)
  const VESTIBULE_ANGLE = Math.PI / 3 // 4 o'clock position (60 degrees)
  const VESTIBULE_CENTER_X = CENTER_X + Math.cos(VESTIBULE_ANGLE) * (OUTER_RADIUS + 50)  // Adjusted for larger canvas
  const VESTIBULE_CENTER_Y = CENTER_Y + Math.sin(VESTIBULE_ANGLE) * (OUTER_RADIUS + 50)  // Adjusted for larger canvas
  const VESTIBULE_RADIUS = 70 // Increased proportionally

  // Initialize 4 particles clustered on LEFT side of cupula
  const initializeParticles = useCallback(() => {
    const newParticles: Particle[] = []
    const cupulaAngle = Math.PI / 2 // Bottom of ring (6 o'clock)
    const leftSideAngle = cupulaAngle + Math.PI / 6 // LEFT side of cupula (30 degrees right of bottom = 7-8 o'clock)
    const ringCenter = (OUTER_RADIUS + INNER_RADIUS) / 2 // Middle of tube
    
    for (let i = 0; i < 4; i++) {
      // Cluster all particles tightly on LEFT side of cupula
      const angle = leftSideAngle + (i - 1.5) * 0.05 // Tight clustering
      newParticles.push({
        id: i,
        x: CENTER_X + Math.cos(angle) * ringCenter,
        y: CENTER_Y + Math.sin(angle) * ringCenter,
        vx: 0,
        vy: 0,
        radius: PARTICLE_RADIUS,
        inAmpulla: false,
        dissolving: false,
        originalRadius: PARTICLE_RADIUS
      })
    }
    
    setParticles(newParticles)
    particlesRef.current = newParticles
    setEpleyComplete(false)
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

  // Check collision with cupula (vertical barrier at bottom of ring - flush with outer border)
  const checkCupulaCollision = (x: number, y: number, radius: number): boolean => {
    // Cupula positioned flush with outer border of ring (moved down)
    const cupulaX = CENTER_X
    const cupulaY = CENTER_Y + OUTER_RADIUS - (TUBE_WIDTH * 0.3) // Moved down to be flush with outer border
    const cupulaWidth = TUBE_WIDTH * 1.4  // Much wider - increased to 140% to fill the green area
    const cupulaHeight = TUBE_WIDTH * 0.6 // Vertical barrier
    
    // Rectangular collision for cupula
    return (
      x - radius < cupulaX + cupulaWidth / 2 &&
      x + radius > cupulaX - cupulaWidth / 2 &&
      y - radius < cupulaY + cupulaHeight / 2 &&
      y + radius > cupulaY - cupulaHeight / 2
    )
  }

  // Check if point is inside the vestibule (expanded area including connection region)
  const isInsideVestibule = (x: number, y: number): boolean => {
    // Main vestibule chamber
    const distFromVestibuleCenter = Math.sqrt((x - VESTIBULE_CENTER_X) ** 2 + (y - VESTIBULE_CENTER_Y) ** 2)
    if (distFromVestibuleCenter <= VESTIBULE_RADIUS) return true
    
    // Extended vestibule area (the green shaded region) - connection bridge area
    const connectionX = CENTER_X + Math.cos(VESTIBULE_ANGLE) * OUTER_RADIUS
    const connectionY = CENTER_Y + Math.sin(VESTIBULE_ANGLE) * OUTER_RADIUS
    const connectionWidth = 50
    const connectionHeight = 40
    
    // Check if point is in the connection/bridge area (rotated rectangle)
    const dx = x - connectionX
    const dy = y - connectionY
    const rotatedX = dx * Math.cos(-VESTIBULE_ANGLE) - dy * Math.sin(-VESTIBULE_ANGLE)
    const rotatedY = dx * Math.sin(-VESTIBULE_ANGLE) + dy * Math.cos(-VESTIBULE_ANGLE)
    
    return Math.abs(rotatedX) <= connectionWidth / 2 && Math.abs(rotatedY) <= connectionHeight / 2
  }

  // Check if point is in valid canal space (ring or vestibule)
  const isInValidSpace = (x: number, y: number): boolean => {
    return isInsideRing(x, y) || isInsideVestibule(x, y)
  }

  // Physics update
  const updatePhysics = useCallback(() => {
    if (!canvasRef.current) return

    const newParticles = particlesRef.current.map((particle, index) => {
      // If particle is dissolving, just shrink it
      if (particle.dissolving) {
        const newRadius = Math.max(0, particle.radius - 0.02)
        return {
          ...particle,
          radius: newRadius
        }
      }

      // Convert device orientation to gravity vector
      const gravityStrength = 0.08  // Much slower - reduced from 0.15 to simulate thick fluid
      
      // Detect if device is roughly horizontal (gamma close to ±90 degrees)
      const isHorizontal = Math.abs(Math.abs(orientation.gamma || 0) - 90) < 30
      
      let gravityX, gravityY
      
      if (isHorizontal) {
        // When horizontal, use gamma for left-right gravity, but reduce beta interference
        gravityX = Math.sin((orientation.gamma || 0) * Math.PI / 180) * gravityStrength
        // Greatly reduce beta influence when horizontal to prevent upward acceleration
        gravityY = Math.sin((orientation.beta || 0) * Math.PI / 180) * gravityStrength * 0.1
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

      // Check if particle is in vestibule
      const nowInVestibule = isInsideVestibule(newX, newY)
      
      // If particle just entered vestibule, mark it
      if (nowInVestibule && !particle.inAmpulla) {
        particle.inAmpulla = true
      }

      // Boundary checks for ring
      const distFromCenter = Math.sqrt((newX - CENTER_X) ** 2 + (newY - CENTER_Y) ** 2)
      
      if (isInsideRing(newX, newY)) {
        // Particle is in ring - check ring boundaries
        if (distFromCenter > OUTER_RADIUS - particle.radius) {
          // Check if particle is trying to enter vestibule connection area
          const angleToParticle = Math.atan2(newY - CENTER_Y, newX - CENTER_X)
          const vestibuleConnectionStart = VESTIBULE_ANGLE - 0.4
          const vestibuleConnectionEnd = VESTIBULE_ANGLE + 0.4
          
          // Normalize angles to handle wraparound
          let normalizedAngle = angleToParticle
          if (normalizedAngle < 0) normalizedAngle += Math.PI * 2
          
          let normalizedStart = vestibuleConnectionStart
          if (normalizedStart < 0) normalizedStart += Math.PI * 2
          
          let normalizedEnd = vestibuleConnectionEnd
          if (normalizedEnd < 0) normalizedEnd += Math.PI * 2
          
          // Check if particle is in vestibule connection area - if so, don't apply wall collision
          const inConnectionArea = (normalizedAngle >= normalizedStart && normalizedAngle <= normalizedEnd)
          
          if (!inConnectionArea) {
            // Hit outer wall (but not in connection area)
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
          }
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
      } else if (isInsideVestibule(newX, newY)) {
        // Particle is in vestibule - check vestibule boundaries (only for main chamber, not connection area)
        const distFromVestibuleCenter = Math.sqrt((newX - VESTIBULE_CENTER_X) ** 2 + (newY - VESTIBULE_CENTER_Y) ** 2)
        
        // Only apply vestibule wall collision if particle is in the main circular chamber
        if (distFromVestibuleCenter <= VESTIBULE_RADIUS && distFromVestibuleCenter > VESTIBULE_RADIUS - particle.radius) {
          // Hit vestibule wall
          const angle = Math.atan2(newY - VESTIBULE_CENTER_Y, newX - VESTIBULE_CENTER_X)
          newX = VESTIBULE_CENTER_X + Math.cos(angle) * (VESTIBULE_RADIUS - particle.radius)
          newY = VESTIBULE_CENTER_Y + Math.sin(angle) * (VESTIBULE_RADIUS - particle.radius)
          
          // Bounce off wall with more damping in vestibule
          const normalX = Math.cos(angle)
          const normalY = Math.sin(angle)
          const dotProduct = newVx * normalX + newVy * normalY
          newVx = newVx - 2 * dotProduct * normalX
          newVy = newVy - 2 * dotProduct * normalY
          newVx *= 0.5 // More energy loss in vestibule
          newVy *= 0.5
        }
        
        // Start dissolving if particle has low velocity in vestibule
        if (Math.abs(newVx) < 0.1 && Math.abs(newVy) < 0.1) {
          particle.dissolving = true
        }
      } else if (!isInValidSpace(newX, newY)) {
        // Particle is outside valid space - push back to nearest valid area
        if (isInsideRing(particle.x, particle.y)) {
          // Was in ring, push back to ring
          const angle = Math.atan2(newY - CENTER_Y, newX - CENTER_X)
          newX = CENTER_X + Math.cos(angle) * (OUTER_RADIUS - particle.radius)
          newY = CENTER_Y + Math.sin(angle) * (OUTER_RADIUS - particle.radius)
        } else {
          // Push to vestibule
          const angle = Math.atan2(newY - VESTIBULE_CENTER_Y, newX - VESTIBULE_CENTER_X)
          newX = VESTIBULE_CENTER_X + Math.cos(angle) * (VESTIBULE_RADIUS - particle.radius)
          newY = VESTIBULE_CENTER_Y + Math.sin(angle) * (VESTIBULE_RADIUS - particle.radius)
        }
        newVx *= 0.5
        newVy *= 0.5
      }

      // Check cupula collision (but allow passage to vestibule)
      if (checkCupulaCollision(newX, newY, particle.radius) && !nowInVestibule) {
        // Push particle away from cupula if not entering vestibule
        const cupulaX = CENTER_X
        const cupulaY = CENTER_Y + OUTER_RADIUS - (TUBE_WIDTH * 0.3)
        const pushAngle = Math.atan2(newY - cupulaY, newX - cupulaX)
        const pushDistance = particle.radius + TUBE_WIDTH * 0.5
        newX = cupulaX + Math.cos(pushAngle) * pushDistance
        newY = cupulaY + Math.sin(pushAngle) * pushDistance
        
        // Reduce velocity
        newVx *= 0.5
        newVy *= 0.5
      }

      // Particle-to-particle collision
      particlesRef.current.forEach((otherParticle, otherIndex) => {
        if (index !== otherIndex && !particle.dissolving && !otherParticle.dissolving) {
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

    // Check if all particles are in vestibule
    const allParticlesInVestibule = newParticles.every(p => p.inAmpulla)
    
    if (allParticlesInVestibule && !epleyComplete) {
      setEpleyComplete(true)
    }

    // Remove fully dissolved particles
    const activeParticles = newParticles.filter(p => p.radius > 0)

    particlesRef.current = newParticles
    setParticles(newParticles)
  }, [orientation, epleyComplete])

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

  // Handle Epley Complete click
  const handleEpleyCompleteClick = () => {
    initializeParticles()
  }

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

    // Draw vestibule (large bulbous chamber at 4 o'clock position)
    ctx.fillStyle = '#87CEEB' // Same light blue
    ctx.beginPath()
    ctx.arc(VESTIBULE_CENTER_X, VESTIBULE_CENTER_Y, VESTIBULE_RADIUS, 0, Math.PI * 2)
    ctx.fill()

    // Draw connection between ring and vestibule (moved to 4 o'clock)
    const connectionX = CENTER_X + Math.cos(VESTIBULE_ANGLE) * OUTER_RADIUS
    const connectionY = CENTER_Y + Math.sin(VESTIBULE_ANGLE) * OUTER_RADIUS
    const connectionWidth = 40
    const connectionHeight = 30
    
    ctx.fillStyle = '#87CEEB'
    ctx.save()
    ctx.translate(connectionX, connectionY)
    ctx.rotate(VESTIBULE_ANGLE)
    ctx.fillRect(-5, -connectionHeight/2, connectionWidth, connectionHeight)
    ctx.restore()

    // Draw ring borders (but skip the connection area to avoid collision)
    ctx.strokeStyle = '#4682B4'
    ctx.lineWidth = 2
    
    // Draw outer ring border in segments, skipping vestibule connection area
    ctx.beginPath()
    // First segment: from 0 to connection start
    const connectionStartAngle = VESTIBULE_ANGLE - 0.3
    const connectionEndAngle = VESTIBULE_ANGLE + 0.3
    ctx.arc(CENTER_X, CENTER_Y, OUTER_RADIUS, 0, connectionStartAngle)
    ctx.stroke()
    
    // Second segment: from connection end to 2π
    ctx.beginPath()
    ctx.arc(CENTER_X, CENTER_Y, OUTER_RADIUS, connectionEndAngle, Math.PI * 2)
    ctx.stroke()
    
    // Inner ring border (full circle - no connection issues)
    ctx.beginPath()
    ctx.arc(CENTER_X, CENTER_Y, INNER_RADIUS, 0, Math.PI * 2)
    ctx.stroke()

    // Draw vestibule border (but skip the connection area)
    ctx.beginPath()
    // Calculate the angle range that connects to the ring
    const ringConnectionAngle = Math.atan2(connectionY - VESTIBULE_CENTER_Y, connectionX - VESTIBULE_CENTER_X)
    const skipStartAngle = ringConnectionAngle - 0.4
    const skipEndAngle = ringConnectionAngle + 0.4
    
    // Draw vestibule border in two segments, skipping connection area
    ctx.arc(VESTIBULE_CENTER_X, VESTIBULE_CENTER_Y, VESTIBULE_RADIUS, skipEndAngle, skipStartAngle + Math.PI * 2)
    ctx.stroke()

    // Draw cupula (vertical barrier at bottom of ring - flush with outer border)
    const cupulaX = CENTER_X
    const cupulaY = CENTER_Y + OUTER_RADIUS - (TUBE_WIDTH * 0.3) // Moved down to be flush with outer border
    const cupulaWidth = TUBE_WIDTH * 1.4  // Much wider - increased to 140% to fill the green area
    const cupulaHeight = TUBE_WIDTH * 0.6 // Vertical barrier
    
    ctx.fillStyle = '#8B4513' // Brown color for cupula
    ctx.fillRect(
      cupulaX - cupulaWidth / 2,
      cupulaY - cupulaHeight / 2,
      cupulaWidth,
      cupulaHeight
    )
    
    // Draw cupula wavy hair-like structures on top
    ctx.strokeStyle = '#654321'
    ctx.lineWidth = 2
    for (let i = 0; i < 8; i++) {
      const hairX = cupulaX - cupulaWidth / 2 + (cupulaWidth / 7) * i
      ctx.beginPath()
      ctx.moveTo(hairX, cupulaY - cupulaHeight / 2)
      // Make wavy hairs
      const waveHeight = 12 + Math.sin(i * 0.8) * 4
      const waveX = hairX + Math.sin(i * 1.2) * 3
      ctx.lineTo(waveX, cupulaY - cupulaHeight / 2 - waveHeight)
      ctx.stroke()
    }

    // Draw particles (purple)
    ctx.fillStyle = '#8A2BE2' // Purple
    particlesRef.current.forEach(particle => {
      if (particle.radius > 0) {
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fill()
      }
    })

    // Draw "Epley Complete" success indicator
    if (epleyComplete) {
      // Green circle with checkmark
      ctx.fillStyle = '#10B981'
      ctx.beginPath()
      ctx.arc(CENTER_X, CENTER_Y, 25, 0, Math.PI * 2)
      ctx.fill()
      
      // White checkmark
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(CENTER_X - 10, CENTER_Y)
      ctx.lineTo(CENTER_X - 3, CENTER_Y + 7)
      ctx.lineTo(CENTER_X + 10, CENTER_Y - 7)
      ctx.stroke()
      
      // Add text below
      ctx.fillStyle = '#10B981'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('Epley Complete', CENTER_X, CENTER_Y + 45)
      ctx.fillText('Tap to Reset', CENTER_X, CENTER_Y + 60)
    }

    // Draw labels
    ctx.fillStyle = '#333'
    ctx.font = '14px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('Semicircular Canal', CENTER_X, CENTER_Y - OUTER_RADIUS - 20)
    ctx.fillText('Cupula', cupulaX, cupulaY + cupulaHeight / 2 + 20)
    ctx.fillText('Vestibule', VESTIBULE_CENTER_X, VESTIBULE_CENTER_Y + VESTIBULE_RADIUS + 15)
  }

  // Handle canvas click for Epley Complete reset
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!epleyComplete) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const clickY = event.clientY - rect.top
    
    // Check if click is on the green circle
    const distFromCenter = Math.sqrt((clickX - CENTER_X) ** 2 + (clickY - CENTER_Y) ** 2)
    if (distFromCenter <= 25) {
      handleEpleyCompleteClick()
    }
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
              onClick={handleCanvasClick}
              style={{
                border: '2px solid #ddd',
                borderRadius: '8px',
                backgroundColor: 'white',
                cursor: epleyComplete ? 'pointer' : 'default'
              }}
            />
            
            <div style={{ textAlign: 'center', maxWidth: '300px' }}>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                Tilt your device to guide particles into the vestibule. 
                Complete the Epley maneuver by getting all particles to dissolve in the vestibule chamber.
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