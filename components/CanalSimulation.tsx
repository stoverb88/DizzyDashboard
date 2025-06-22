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

type EarType = 'right' | 'left' | null

export function CanalSimulation({ onClose }: CanalSimulationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const [particles, setParticles] = useState<Particle[]>([])
  const [orientation, setOrientation] = useState({ beta: 0, gamma: 0 })
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [epleyComplete, setEpleyComplete] = useState(false)
  const [selectedEar, setSelectedEar] = useState<EarType>(null)
  const [orientationLockPrompted, setOrientationLockPrompted] = useState(false)
  const [orientationSetupComplete, setOrientationSetupComplete] = useState(false)
  const particlesRef = useRef<Particle[]>([])
  const lastBetaRef = useRef<number | null>(null)
  const lastGammaRef = useRef<number | null>(null)

  // Canvas dimensions - optimized for mobile
  const CANVAS_WIDTH = 400
  const CANVAS_HEIGHT = 400
  const CENTER_X = CANVAS_WIDTH / 2
  const CENTER_Y = CANVAS_HEIGHT / 2
  
  // Ring dimensions
  const OUTER_RADIUS = 140
  const INNER_RADIUS = 100
  const TUBE_WIDTH = OUTER_RADIUS - INNER_RADIUS
  const PARTICLE_RADIUS = Math.floor(TUBE_WIDTH / 8) // 1/8th tube width

  // Get vestibule configuration based on ear type
  const getVestibuleConfig = () => {
    if (selectedEar === 'left') {
      // Left ear: vestibule at 4 o'clock position (120 degrees)
      const VESTIBULE_ANGLE = Math.PI * 2/3 // 4 o'clock position (120 degrees)
      return {
        angle: VESTIBULE_ANGLE,
        centerX: CENTER_X + Math.cos(VESTIBULE_ANGLE) * (OUTER_RADIUS + 50),
        centerY: CENTER_Y + Math.sin(VESTIBULE_ANGLE) * (OUTER_RADIUS + 50),
        radius: 70
      }
    } else {
      // Right ear: vestibule at 4 o'clock position (original)
      const VESTIBULE_ANGLE = Math.PI / 3 // 4 o'clock position (60 degrees)
      return {
        angle: VESTIBULE_ANGLE,
        centerX: CENTER_X + Math.cos(VESTIBULE_ANGLE) * (OUTER_RADIUS + 50),
        centerY: CENTER_Y + Math.sin(VESTIBULE_ANGLE) * (OUTER_RADIUS + 50),
        radius: 70
      }
    }
  }

  // Initialize particles based on ear type
  const initializeParticles = useCallback(() => {
    if (!selectedEar) return
    
    const newParticles: Particle[] = []
    const cupulaAngle = Math.PI / 2 // Bottom of ring (6 o'clock)
    const ringCenter = (OUTER_RADIUS + INNER_RADIUS) / 2 // Middle of tube
    
    let particleAngle
    if (selectedEar === 'left') {
      // Left ear: particles spawn on RIGHT side of cupula (4-5 o'clock position)
      particleAngle = cupulaAngle - Math.PI / 6 // RIGHT side of cupula (30 degrees left of bottom = 4-5 o'clock)
    } else {
      // Right ear: particles spawn on LEFT side of cupula (7-8 o'clock position) - original
      particleAngle = cupulaAngle + Math.PI / 6 // LEFT side of cupula (30 degrees right of bottom = 7-8 o'clock)
    }
    
    for (let i = 0; i < 4; i++) {
      // Cluster all particles tightly on appropriate side of cupula
      const angle = particleAngle + (i - 1.5) * 0.05 // Tight clustering
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
  }, [selectedEar])

  // Try to lock orientation
  const lockOrientation = async () => {
    try {
      // Type assertion for screen orientation lock (not all browsers support this)
      if (screen.orientation && (screen.orientation as any).lock) {
        await (screen.orientation as any).lock('portrait')
        return true
      }
    } catch (error) {
      console.log('Orientation lock not supported or failed:', error)
    }
    return false
  }

  // Request device orientation permission
  const requestOrientationPermission = async () => {
    // Only show orientation setup if not already completed
    if (!orientationSetupComplete) {
      // First try to lock orientation
      const lockSuccess = await lockOrientation()
      
      if (!lockSuccess && !orientationLockPrompted) {
        setOrientationLockPrompted(true)
        return // Show manual instruction first
      }
    }

    if (typeof DeviceOrientationEvent !== 'undefined' && 'requestPermission' in DeviceOrientationEvent) {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission()
        if (permission === 'granted') {
          setPermissionGranted(true)
          setOrientationSetupComplete(true)
        }
      } catch (error) {
        console.error('Error requesting orientation permission:', error)
      }
    } else {
      setPermissionGranted(true)
      setOrientationSetupComplete(true)
    }
  }

  // Handle manual orientation lock acknowledgment
  const handleOrientationLockAck = () => {
    setOrientationLockPrompted(false)
    requestOrientationPermission()
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

  // Check collision with cupula
  const checkCupulaCollision = (x: number, y: number, radius: number): boolean => {
    const cupulaX = CENTER_X
    const cupulaWidth = TUBE_WIDTH * 0.7
    const cupulaHeight = TUBE_WIDTH * 0.95
    const cupulaY = CENTER_Y + OUTER_RADIUS - cupulaHeight / 2
    
    return (
      x - radius < cupulaX + cupulaWidth / 2 &&
      x + radius > cupulaX - cupulaWidth / 2 &&
      y - radius < cupulaY + cupulaHeight / 2 &&
      y + radius > cupulaY - cupulaHeight / 2
    )
  }

  // Check if point is inside the vestibule
  const isInsideVestibule = (x: number, y: number): boolean => {
    const vestibuleConfig = getVestibuleConfig()
    
    // Main vestibule chamber
    const distFromVestibuleCenter = Math.sqrt((x - vestibuleConfig.centerX) ** 2 + (y - vestibuleConfig.centerY) ** 2)
    if (distFromVestibuleCenter <= vestibuleConfig.radius) return true
    
    // Extended vestibule area - connection bridge area
    const connectionX = CENTER_X + Math.cos(vestibuleConfig.angle) * OUTER_RADIUS
    const connectionY = CENTER_Y + Math.sin(vestibuleConfig.angle) * OUTER_RADIUS
    const connectionWidth = 50
    const connectionHeight = 40
    
    // Check if point is in the connection/bridge area (rotated rectangle)
    const dx = x - connectionX
    const dy = y - connectionY
    const rotatedX = dx * Math.cos(-vestibuleConfig.angle) - dy * Math.sin(-vestibuleConfig.angle)
    const rotatedY = dx * Math.sin(-vestibuleConfig.angle) + dy * Math.cos(-vestibuleConfig.angle)
    
    return Math.abs(rotatedX) <= connectionWidth / 2 && Math.abs(rotatedY) <= connectionHeight / 2
  }

  // Check if point is in valid canal space
  const isInValidSpace = (x: number, y: number): boolean => {
    return isInsideRing(x, y) || isInsideVestibule(x, y)
  }

  // Physics update
  const updatePhysics = useCallback(() => {
    if (!canvasRef.current || !selectedEar) return

    const newParticles = particlesRef.current.map((particle, index) => {
      // If particle is dissolving, just shrink it
      if (particle.dissolving) {
        const newRadius = Math.max(0, particle.radius - 0.02)
        return {
          ...particle,
          radius: newRadius
        }
      }

      // Convert device orientation to gravity vector with improved stability
      const gravityStrength = 0.06  // Reduced for more realistic fluid physics
      
      // Get raw orientation values with fallbacks
      const beta = orientation.beta || 0   // front-to-back tilt (-180 to 180)
      const gamma = orientation.gamma || 0 // left-to-right tilt (-90 to 90)
      
      // Normalize angles to prevent sudden jumps
      const normalizedBeta = Math.max(-90, Math.min(90, beta))  // Clamp beta to reasonable range
      const normalizedGamma = Math.max(-90, Math.min(90, gamma)) // Clamp gamma to reasonable range
      
      // Convert to radians
      const betaRad = normalizedBeta * Math.PI / 180
      const gammaRad = normalizedGamma * Math.PI / 180
      
      // Calculate gravity components with improved coordinate system
      // When device is portrait (normal use):
      // - gamma controls left/right gravity (positive gamma = gravity pulls right)
      // - beta controls up/down gravity (positive beta = gravity pulls down)
      
      let gravityX = Math.sin(gammaRad) * gravityStrength
      let gravityY = Math.sin(betaRad) * gravityStrength
      
      // Apply additional smoothing for orientation transitions
      // Detect rapid orientation changes and apply extra damping
      const orientationChangeRate = Math.abs(beta - (lastBetaRef.current || 0)) + Math.abs(gamma - (lastGammaRef.current || 0))
      if (orientationChangeRate > 10) { // If orientation changed rapidly
        gravityX *= 0.5  // Reduce gravity influence during rapid transitions
        gravityY *= 0.5
      }
      
      // Store last orientation for next frame
      lastBetaRef.current = beta
      lastGammaRef.current = gamma

      // Update velocity with gravity
      let newVx = particle.vx + gravityX
      let newVy = particle.vy + gravityY

      // Cap maximum velocity to prevent explosive movements
      const maxVelocity = 2.0
      const velocityMagnitude = Math.sqrt(newVx * newVx + newVy * newVy)
      if (velocityMagnitude > maxVelocity) {
        const scale = maxVelocity / velocityMagnitude
        newVx *= scale
        newVy *= scale
      }

      // Apply progressive damping (stronger damping at higher speeds)
      const dampingFactor = 0.992 - (velocityMagnitude * 0.002) // More damping at higher speeds
      newVx *= dampingFactor
      newVy *= dampingFactor

      // Predict new position
      let newX = particle.x + newVx
      let newY = particle.y + newVy

      // Check if particle is in vestibule
      const nowInVestibule = isInsideVestibule(newX, newY)
      
      if (nowInVestibule && !particle.inAmpulla) {
        particle.inAmpulla = true
      }

      // Boundary checks and physics - simplified and improved
      const distFromCenter = Math.sqrt((newX - CENTER_X) ** 2 + (newY - CENTER_Y) ** 2)
      const vestibuleConfig = getVestibuleConfig()
      
      if (isInsideRing(newX, newY)) {
        // Outer boundary collision
        if (distFromCenter > OUTER_RADIUS - particle.radius) {
          const angleToParticle = Math.atan2(newY - CENTER_Y, newX - CENTER_X)
          const vestibuleConnectionStart = vestibuleConfig.angle - 0.3
          const vestibuleConnectionEnd = vestibuleConfig.angle + 0.3
          
          // Simplified angle check
          let inConnectionArea = false
          let normalizedAngle = angleToParticle
          if (normalizedAngle < 0) normalizedAngle += Math.PI * 2
          
          let normalizedStart = vestibuleConnectionStart
          if (normalizedStart < 0) normalizedStart += Math.PI * 2
          
          let normalizedEnd = vestibuleConnectionEnd
          if (normalizedEnd < 0) normalizedEnd += Math.PI * 2
          
          // Handle angle wrapping around 0/2π
          if (normalizedEnd < normalizedStart) {
            inConnectionArea = (normalizedAngle >= normalizedStart || normalizedAngle <= normalizedEnd)
          } else {
            inConnectionArea = (normalizedAngle >= normalizedStart && normalizedAngle <= normalizedEnd)
          }
          
          if (!inConnectionArea) {
            const angle = Math.atan2(newY - CENTER_Y, newX - CENTER_X)
            newX = CENTER_X + Math.cos(angle) * (OUTER_RADIUS - particle.radius)
            newY = CENTER_Y + Math.sin(angle) * (OUTER_RADIUS - particle.radius)
            
            // Improved reflection with less energy loss
            const normalX = Math.cos(angle)
            const normalY = Math.sin(angle)
            const dotProduct = newVx * normalX + newVy * normalY
            
            // Only reflect if moving toward the wall
            if (dotProduct > 0) {
              newVx = newVx - 1.5 * dotProduct * normalX
              newVy = newVy - 1.5 * dotProduct * normalY
              newVx *= 0.85  // Less energy loss
              newVy *= 0.85
            }
          }
        } 
        // Inner boundary collision
        else if (distFromCenter < INNER_RADIUS + particle.radius) {
          const angle = Math.atan2(newY - CENTER_Y, newX - CENTER_X)
          newX = CENTER_X + Math.cos(angle) * (INNER_RADIUS + particle.radius)
          newY = CENTER_Y + Math.sin(angle) * (INNER_RADIUS + particle.radius)
          
          // Improved reflection with less energy loss
          const normalX = -Math.cos(angle)
          const normalY = -Math.sin(angle)
          const dotProduct = newVx * normalX + newVy * normalY
          
          // Only reflect if moving toward the wall
          if (dotProduct > 0) {
            newVx = newVx - 1.5 * dotProduct * normalX
            newVy = newVy - 1.5 * dotProduct * normalY
            newVx *= 0.85  // Less energy loss
            newVy *= 0.85
          }
        }
      } else if (isInsideVestibule(newX, newY)) {
        const distFromVestibuleCenter = Math.sqrt((newX - vestibuleConfig.centerX) ** 2 + (newY - vestibuleConfig.centerY) ** 2)
        
        if (distFromVestibuleCenter > vestibuleConfig.radius - particle.radius) {
          const angle = Math.atan2(newY - vestibuleConfig.centerY, newX - vestibuleConfig.centerX)
          newX = vestibuleConfig.centerX + Math.cos(angle) * (vestibuleConfig.radius - particle.radius)
          newY = vestibuleConfig.centerY + Math.sin(angle) * (vestibuleConfig.radius - particle.radius)
          
          // Gentler collision in vestibule
          const normalX = Math.cos(angle)
          const normalY = Math.sin(angle)
          const dotProduct = newVx * normalX + newVy * normalY
          
          if (dotProduct > 0) {
            newVx = newVx - 1.2 * dotProduct * normalX
            newVy = newVy - 1.2 * dotProduct * normalY
            newVx *= 0.7  // More damping in vestibule for settling
            newVy *= 0.7
          }
        }
        
        // Check for dissolution
        if (Math.abs(newVx) < 0.1 && Math.abs(newVy) < 0.1) {
          particle.dissolving = true
        }
      } else if (!isInValidSpace(newX, newY)) {
        // Push particle back to valid space with minimal energy loss
        if (isInsideRing(particle.x, particle.y)) {
          const angle = Math.atan2(newY - CENTER_Y, newX - CENTER_X)
          newX = CENTER_X + Math.cos(angle) * (OUTER_RADIUS - particle.radius)
          newY = CENTER_Y + Math.sin(angle) * (OUTER_RADIUS - particle.radius)
        } else {
          const angle = Math.atan2(newY - vestibuleConfig.centerY, newX - vestibuleConfig.centerX)
          newX = vestibuleConfig.centerX + Math.cos(angle) * (vestibuleConfig.radius - particle.radius)
          newY = vestibuleConfig.centerY + Math.sin(angle) * (vestibuleConfig.radius - particle.radius)
        }
        newVx *= 0.8  // Less energy loss when correcting position
        newVy *= 0.8
      }

      // Check cupula collision
      if (checkCupulaCollision(newX, newY, particle.radius) && !nowInVestibule) {
        const cupulaX = CENTER_X
        const cupulaHeight = TUBE_WIDTH * 0.95
        const cupulaY = CENTER_Y + OUTER_RADIUS - cupulaHeight / 2
        const pushAngle = Math.atan2(newY - cupulaY, newX - cupulaX)
        const pushDistance = particle.radius + TUBE_WIDTH * 0.5
        newX = cupulaX + Math.cos(pushAngle) * pushDistance
        newY = cupulaY + Math.sin(pushAngle) * pushDistance
        
        newVx *= 0.7
        newVy *= 0.7
      }

      // Particle-to-particle collision (keep existing logic)
      particlesRef.current.forEach((otherParticle, otherIndex) => {
        if (index !== otherIndex && !particle.dissolving && !otherParticle.dissolving) {
          const dx = newX - otherParticle.x
          const dy = newY - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const minDistance = particle.radius + otherParticle.radius
          
          if (distance < minDistance && distance > 0) {
            const overlap = minDistance - distance
            const separationX = (dx / distance) * (overlap * 0.5)
            const separationY = (dy / distance) * (overlap * 0.5)
            
            newX += separationX
            newY += separationY
            
            const normalX = dx / distance
            const normalY = dy / distance
            const relativeVelocityX = newVx - otherParticle.vx
            const relativeVelocityY = newVy - otherParticle.vy
            const velocityAlongNormal = relativeVelocityX * normalX + relativeVelocityY * normalY
            
            if (velocityAlongNormal > 0) return
            
            const restitution = 0.8
            const impulse = -(1 + restitution) * velocityAlongNormal / 2
            newVx += impulse * normalX
            newVy += impulse * normalY
          }
        }
      })

      // Add minimum velocity to prevent complete sticking
      const minVelocity = 0.01
      const currentSpeed = Math.sqrt(newVx * newVx + newVy * newVy)
      if (currentSpeed > 0 && currentSpeed < minVelocity && !particle.dissolving) {
        const speedMultiplier = minVelocity / currentSpeed
        newVx *= speedMultiplier
        newVy *= speedMultiplier
      }

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

    particlesRef.current = newParticles
    setParticles(newParticles)
  }, [orientation, epleyComplete, selectedEar])

  // Animation loop
  useEffect(() => {
    const animate = () => {
      updatePhysics()
      draw()
      animationRef.current = requestAnimationFrame(animate)
    }

    if (permissionGranted && selectedEar) {
      animate()
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [updatePhysics, permissionGranted, selectedEar])

  // Handle Epley Complete click
  const handleEpleyCompleteClick = () => {
    initializeParticles()
  }

  // Draw function
  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas || !selectedEar) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const vestibuleConfig = getVestibuleConfig()

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Draw outer ring (light blue fluid)
    ctx.fillStyle = '#87CEEB'
    ctx.beginPath()
    ctx.arc(CENTER_X, CENTER_Y, OUTER_RADIUS, 0, Math.PI * 2)
    ctx.fill()

    // Draw inner hole (white)
    ctx.fillStyle = 'white'
    ctx.beginPath()
    ctx.arc(CENTER_X, CENTER_Y, INNER_RADIUS, 0, Math.PI * 2)
    ctx.fill()

    // Draw vestibule
    ctx.fillStyle = '#87CEEB'
    ctx.beginPath()
    ctx.arc(vestibuleConfig.centerX, vestibuleConfig.centerY, vestibuleConfig.radius, 0, Math.PI * 2)
    ctx.fill()

    // Draw connection between ring and vestibule
    const connectionX = CENTER_X + Math.cos(vestibuleConfig.angle) * OUTER_RADIUS
    const connectionY = CENTER_Y + Math.sin(vestibuleConfig.angle) * OUTER_RADIUS
    const connectionWidth = 40
    const connectionHeight = 30
    
    ctx.fillStyle = '#87CEEB'
    ctx.save()
    ctx.translate(connectionX, connectionY)
    ctx.rotate(vestibuleConfig.angle)
    ctx.fillRect(-5, -connectionHeight/2, connectionWidth, connectionHeight)
    ctx.restore()

    // Draw ring borders
    ctx.strokeStyle = '#4682B4'
    ctx.lineWidth = 2
    
    // Draw outer ring border in segments, skipping vestibule connection area
    ctx.beginPath()
    const connectionStartAngle = vestibuleConfig.angle - 0.3
    const connectionEndAngle = vestibuleConfig.angle + 0.3
    ctx.arc(CENTER_X, CENTER_Y, OUTER_RADIUS, 0, connectionStartAngle)
    ctx.stroke()
    
    ctx.beginPath()
    ctx.arc(CENTER_X, CENTER_Y, OUTER_RADIUS, connectionEndAngle, Math.PI * 2)
    ctx.stroke()
    
    // Inner ring border
    ctx.beginPath()
    ctx.arc(CENTER_X, CENTER_Y, INNER_RADIUS, 0, Math.PI * 2)
    ctx.stroke()

    // Draw vestibule border
    ctx.beginPath()
    const ringConnectionAngle = Math.atan2(connectionY - vestibuleConfig.centerY, connectionX - vestibuleConfig.centerX)
    const skipStartAngle = ringConnectionAngle - 0.4
    const skipEndAngle = ringConnectionAngle + 0.4
    ctx.arc(vestibuleConfig.centerX, vestibuleConfig.centerY, vestibuleConfig.radius, skipEndAngle, skipStartAngle + Math.PI * 2)
    ctx.stroke()

    // Draw cupula
    const cupulaX = CENTER_X
    const cupulaWidth = TUBE_WIDTH * 0.7
    const cupulaHeight = TUBE_WIDTH * 0.95
    const cupulaY = CENTER_Y + OUTER_RADIUS - cupulaHeight / 2
    
    ctx.fillStyle = '#8B4513'
    ctx.fillRect(
      cupulaX - cupulaWidth / 2,
      cupulaY - cupulaHeight / 2,
      cupulaWidth,
      cupulaHeight
    )
    
    // Draw hair structures
    ctx.strokeStyle = '#654321'
    ctx.lineWidth = 1.5
    for (let i = 0; i < 10; i++) {
      const hairX = cupulaX - cupulaWidth / 2 + (cupulaWidth / 9) * i
      ctx.beginPath()
      ctx.moveTo(hairX, cupulaY - cupulaHeight / 2)
      const hairHeight = 4 + Math.sin(i * 0.5) * 2
      ctx.lineTo(hairX, cupulaY - cupulaHeight / 2 - hairHeight)
      ctx.stroke()
    }

    // Draw particles
    ctx.fillStyle = '#8A2BE2'
    particlesRef.current.forEach(particle => {
      if (particle.radius > 0) {
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fill()
      }
    })

    // Draw "Epley Complete" success indicator
    if (epleyComplete) {
      ctx.fillStyle = '#10B981'
      ctx.beginPath()
      ctx.arc(CENTER_X, CENTER_Y, 25, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(CENTER_X - 10, CENTER_Y)
      ctx.lineTo(CENTER_X - 3, CENTER_Y + 7)
      ctx.lineTo(CENTER_X + 10, CENTER_Y - 7)
      ctx.stroke()
      
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
    ctx.fillText(`${selectedEar === 'left' ? 'Left' : 'Right'} Semicircular Canal`, CENTER_X, CENTER_Y - OUTER_RADIUS - 20)
    ctx.fillText('Cupula', cupulaX, cupulaY + cupulaHeight / 2 + 20)
    ctx.fillText('Vestibule', vestibuleConfig.centerX, vestibuleConfig.centerY + vestibuleConfig.radius + 15)
  }

  // Handle canvas click for Epley Complete reset
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!epleyComplete) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const clickY = event.clientY - rect.top
    
    const distFromCenter = Math.sqrt((clickX - CENTER_X) ** 2 + (clickY - CENTER_Y) ** 2)
    if (distFromCenter <= 25) {
      handleEpleyCompleteClick()
    }
  }

  // Initialize particles when ear is selected
  useEffect(() => {
    if (selectedEar) {
      initializeParticles()
    }
  }, [selectedEar, initializeParticles])

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
          🎯 Pocket Epley Trainer
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
        gap: '20px',
        width: '100%',
        maxWidth: '500px',
        padding: '0 20px'
      }}>
        {/* Ear Selection Screen */}
        {!selectedEar && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <h3 style={{ marginBottom: '10px' }}>Select Ear for Training</h3>
            <p style={{ marginBottom: '30px', color: '#666', fontSize: '14px' }}>
              Choose which ear you want to practice the Epley maneuver on
            </p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => setSelectedEar('left')}
                style={{
                  padding: '20px 30px',
                  borderRadius: '12px',
                  border: '2px solid #374151',
                  backgroundColor: 'white',
                  color: '#374151',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(55, 65, 81, 0.1)',
                  minWidth: '140px',
                  order: 1,
                  textAlign: 'center'
                }}
              >
                Left Ear<br/>
                <span style={{ fontSize: '12px', opacity: 0.7 }}>Epley Maneuver</span>
              </button>
              <button
                onClick={() => setSelectedEar('right')}
                style={{
                  padding: '20px 30px',
                  borderRadius: '12px',
                  border: '2px solid #374151',
                  backgroundColor: 'white',
                  color: '#374151',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(55, 65, 81, 0.1)',
                  minWidth: '140px',
                  order: 2,
                  textAlign: 'center'
                }}
              >
                Right Ear<br/>
                <span style={{ fontSize: '12px', opacity: 0.7 }}>Epley Maneuver</span>
              </button>
            </div>
          </div>
        )}

        {/* Orientation Lock Prompt - Only show if orientation setup not complete */}
        {selectedEar && orientationLockPrompted && !orientationSetupComplete && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <h3>📱 Lock Screen Rotation</h3>
            <p style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>
              For the best training experience, please lock your device to portrait mode:
            </p>
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '20px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              textAlign: 'left',
              fontSize: '14px'
            }}>
              <strong>iOS:</strong> Swipe down from top-right → Tap rotation lock icon<br/>
              <strong>Android:</strong> Swipe down from top → Tap auto-rotate to disable
            </div>
            <button
              onClick={handleOrientationLockAck}
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
              Continue to Training
            </button>
          </div>
        )}

        {/* Orientation Permission Screen - Only show if orientation setup not complete */}
        {selectedEar && !orientationLockPrompted && !permissionGranted && !orientationSetupComplete && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <h3>📲 Enable Device Orientation</h3>
            <p style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>
              Tilt your device to move the particles through the {selectedEar} ear canal.
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
        )}

        {/* Simulation Canvas - Show if ear selected and (permission granted OR orientation setup complete) */}
        {selectedEar && (permissionGranted || orientationSetupComplete) && (
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
            
            <div style={{ textAlign: 'center', maxWidth: '350px' }}>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                <strong>{selectedEar === 'left' ? 'Left' : 'Right'} Ear Epley Training:</strong><br/>
                Tilt your device to guide particles into the vestibule. 
                Complete the maneuver by getting all particles to dissolve in the vestibule chamber.
              </p>
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
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
                    cursor: 'pointer'
                  }}
                >
                  Reset Particles
                </button>
                <button
                  onClick={() => {
                    setSelectedEar(null)
                    setEpleyComplete(false)
                    // Don't reset orientation setup - keep it for switching ears
                  }}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    backgroundColor: 'white',
                    color: '#666',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Switch Ear
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
} 