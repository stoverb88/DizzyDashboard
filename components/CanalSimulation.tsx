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
type PerspectiveType = 'patient' | 'clinician' | null

export function CanalSimulation({ onClose }: CanalSimulationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const [particles, setParticles] = useState<Particle[]>([])
  const [orientation, setOrientation] = useState({ beta: 0, gamma: 0 })
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [epleyComplete, setEpleyComplete] = useState(false)
  const [selectedEar, setSelectedEar] = useState<EarType>(null)
  const [selectedPerspective, setSelectedPerspective] = useState<PerspectiveType>(null)
  const [orientationLockPrompted, setOrientationLockPrompted] = useState(false)
  const [orientationSetupComplete, setOrientationSetupComplete] = useState(false)
  const particlesRef = useRef<Particle[]>([])
  
  // Avatar slideshow state
  const [currentAvatarStage, setCurrentAvatarStage] = useState(1) // Start with stage 1
  
  // Completion animation state
  const [completionAnimationStarted, setCompletionAnimationStarted] = useState(false)
  const [avatarOpacity, setAvatarOpacity] = useState(1.0)
  const [successOpacity, setSuccessOpacity] = useState(0.0)
  const completionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Avatar transition animation state
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [previousAvatarStage, setPreviousAvatarStage] = useState(1)
  const [transitionProgress, setTransitionProgress] = useState(0) // 0 to 1
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Particle detection delay state
  const [detectedStage, setDetectedStage] = useState(1)
  const [detectionTimer, setDetectionTimer] = useState<NodeJS.Timeout | null>(null)
  const detectionDelayMs = 250 // 0.25 seconds

  // Canvas dimensions - optimized for mobile
  const CANVAS_WIDTH = 450  // Increased from 400
  const CANVAS_HEIGHT = 450 // Increased from 400
  const CENTER_X = CANVAS_WIDTH / 2
  const CENTER_Y = CANVAS_HEIGHT / 2
  
  // Ring dimensions - scaled to fill larger canvas
  const OUTER_RADIUS = 180  // Increased from 157 (was 140 originally)
  const INNER_RADIUS = 130  // Increased from 112 (was 100 originally)
  const TUBE_WIDTH = OUTER_RADIUS - INNER_RADIUS
  const PARTICLE_RADIUS = Math.floor(TUBE_WIDTH / 8) // 1/8th tube width

  // Get vestibule configuration based on ear type
  const getVestibuleConfig = () => {
    if (selectedEar === 'left') {
      // Left ear: vestibule at 4 o'clock position (120 degrees)
      const VESTIBULE_ANGLE = Math.PI * 2/3 // 4 o'clock position (120 degrees)
      return {
        angle: VESTIBULE_ANGLE,
        centerX: CENTER_X + Math.cos(VESTIBULE_ANGLE) * (OUTER_RADIUS + 60), // Increased from 50
        centerY: CENTER_Y + Math.sin(VESTIBULE_ANGLE) * (OUTER_RADIUS + 60), // Increased from 50
        radius: 85 // Increased from 70
      }
    } else {
      // Right ear: vestibule at 4 o'clock position (original)
      const VESTIBULE_ANGLE = Math.PI / 3 // 4 o'clock position (60 degrees)
      return {
        angle: VESTIBULE_ANGLE,
        centerX: CENTER_X + Math.cos(VESTIBULE_ANGLE) * (OUTER_RADIUS + 60), // Increased from 50
        centerY: CENTER_Y + Math.sin(VESTIBULE_ANGLE) * (OUTER_RADIUS + 60), // Increased from 50
        radius: 85 // Increased from 70
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
    setCurrentAvatarStage(1) // Reset avatar to starting position
    
    // Reset completion animation state
    setCompletionAnimationStarted(false)
    setAvatarOpacity(1.0)
    setSuccessOpacity(0.0)
    if (completionTimeoutRef.current) {
      clearTimeout(completionTimeoutRef.current)
      completionTimeoutRef.current = null
    }
    
    // Reset transition animation state
    setIsTransitioning(false)
    setPreviousAvatarStage(1)
    setTransitionProgress(0)
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current)
      transitionTimeoutRef.current = null
    }
    
    // Reset detection delay state
    setDetectedStage(1)
    if (detectionTimer) {
      clearTimeout(detectionTimer)
      setDetectionTimer(null)
    }
  }, [selectedEar])

  // Start completion animation sequence
  const startCompletionAnimation = useCallback(() => {
    if (completionAnimationStarted) return
    
    setCompletionAnimationStarted(true)
    
    // Phase 1: Fade out avatar over 1 second
    const fadeOutInterval = setInterval(() => {
      setAvatarOpacity(prev => {
        const newOpacity = prev - 0.05 // Fade out in 20 steps (1 second at 50ms intervals)
        if (newOpacity <= 0) {
          clearInterval(fadeOutInterval)
          return 0
        }
        return newOpacity
      })
    }, 50)
    
    // Phase 2: After 1 second, fade in success indicator
    completionTimeoutRef.current = setTimeout(() => {
      setEpleyComplete(true)
      
      const fadeInInterval = setInterval(() => {
        setSuccessOpacity(prev => {
          const newOpacity = prev + 0.05 // Fade in over 1 second
          if (newOpacity >= 1) {
            clearInterval(fadeInInterval)
            return 1
          }
          return newOpacity
        })
      }, 50)
    }, 1000)
  }, [completionAnimationStarted])

  // Start avatar transition animation
  const startAvatarTransition = useCallback((newStage: number) => {
    if (isTransitioning || newStage === currentAvatarStage) return
    
    // Clean up any existing transition
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current)
    }
    
    setPreviousAvatarStage(currentAvatarStage)
    setIsTransitioning(true)
    setTransitionProgress(0)
    
    // Smooth transition over 800ms
    const transitionDuration = 800
    const steps = 40 // 20ms intervals for smooth animation
    const stepDuration = transitionDuration / steps
    
    let step = 0
    const transitionInterval = setInterval(() => {
      step++
      const progress = step / steps
      
      // Use easeInOutCubic for natural movement feel
      const easedProgress = progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2
      
      setTransitionProgress(easedProgress)
      
      if (step >= steps) {
        clearInterval(transitionInterval)
        setCurrentAvatarStage(newStage)
        setIsTransitioning(false)
        setTransitionProgress(0)
      }
    }, stepDuration)
    
    // Cleanup timeout
    transitionTimeoutRef.current = setTimeout(() => {
      clearInterval(transitionInterval)
      setCurrentAvatarStage(newStage)
      setIsTransitioning(false)
      setTransitionProgress(0)
    }, transitionDuration + 100)
  }, [isTransitioning, currentAvatarStage])

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
      // Get raw orientation values
      let beta = event.beta || 0
      let gamma = event.gamma || 0
      
      // Detect and filter out extreme orientation changes that cause gimbal lock
      // If beta jumps more than 90 degrees from previous value, it's likely a gimbal lock spike
      setOrientation(prev => {
        const betaDiff = Math.abs(beta - prev.beta)
        const gammaDiff = Math.abs(gamma - prev.gamma)
        
        // If there's a massive jump (>90°), ignore this reading and keep previous values
        if (betaDiff > 90 || gammaDiff > 90) {
          return prev // Keep previous stable values
        }
        
        // Clamp to reasonable physiological range (±30° is plenty for Epley)
        beta = Math.max(-30, Math.min(30, beta))
        gamma = Math.max(-30, Math.min(30, gamma))
        
        // Ensure we never create "upward" gravity - always maintain downward component
        // If beta would create strong upward force, limit it
        if (beta < -20) beta = -20  // Prevent extreme forward tilt
        if (beta > 20) beta = 20    // Prevent extreme backward tilt
        
        // Smooth the orientation changes
        const smoothingFactor = 0.3 // Decreased smoothing for more responsive control
        const newBeta = prev.beta * smoothingFactor + beta * (1 - smoothingFactor)
        const newGamma = prev.gamma * smoothingFactor + gamma * (1 - smoothingFactor)
        
        return {
          beta: newBeta,
          gamma: newGamma
        }
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
    const cupulaHeight = TUBE_WIDTH * 0.85
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
    const connectionHeight = 38
    
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

      // Convert device orientation to gravity vector
      const gravityStrength = 0.06  // Increased for more responsive particle movement - like otoconia in endolymph
      
      // Detect if device is roughly horizontal
      const isHorizontal = Math.abs(Math.abs(orientation.gamma || 0) - 90) < 30
      
      let gravityX, gravityY
      
      if (isHorizontal) {
        gravityX = Math.sin((orientation.gamma || 0) * Math.PI / 180) * gravityStrength
        gravityY = Math.sin((orientation.beta || 0) * Math.PI / 180) * gravityStrength * 0.1
      } else {
        gravityX = Math.sin((orientation.gamma || 0) * Math.PI / 180) * gravityStrength
        gravityY = Math.sin((orientation.beta || 0) * Math.PI / 180) * gravityStrength
      }

      // Update velocity with gravity
      let newVx = particle.vx + gravityX
      let newVy = particle.vy + gravityY

      // Apply increased damping for more viscous fluid behavior
      newVx *= 0.9  // Increased friction for more realistic endolymph viscosity
      newVy *= 0.9

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
            
            // Gentler reflection to prevent sticking
            const normalX = Math.cos(angle)
            const normalY = Math.sin(angle)
            const dotProduct = newVx * normalX + newVy * normalY
            
            // Only reflect if moving toward the wall
            if (dotProduct > 0) {
              newVx = newVx - 1.1 * dotProduct * normalX  // Reduced from 1.2 for gentler reflection
              newVy = newVy - 1.1 * dotProduct * normalY
              newVx *= 0.97  // Slightly increased from 0.95 to maintain more energy
              newVy *= 0.97
            }
          }
        } 
        // Inner boundary collision
        else if (distFromCenter < INNER_RADIUS + particle.radius) {
          const angle = Math.atan2(newY - CENTER_Y, newX - CENTER_X)
          newX = CENTER_X + Math.cos(angle) * (INNER_RADIUS + particle.radius)
          newY = CENTER_Y + Math.sin(angle) * (INNER_RADIUS + particle.radius)
          
          // Gentler reflection to prevent sticking
          const normalX = -Math.cos(angle)
          const normalY = -Math.sin(angle)
          const dotProduct = newVx * normalX + newVy * normalY
          
          // Only reflect if moving toward the wall
          if (dotProduct > 0) {
            newVx = newVx - 1.1 * dotProduct * normalX  // Reduced from 1.2 for gentler reflection
            newVy = newVy - 1.1 * dotProduct * normalY
            newVx *= 0.97  // Slightly increased from 0.95 to maintain more energy
            newVy *= 0.97
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
        const cupulaHeight = TUBE_WIDTH * 0.85
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
            const separationX = (dx / distance) * (overlap * 0.6)  // Increased from 0.5 for better separation
            const separationY = (dy / distance) * (overlap * 0.6)
            
            newX += separationX
            newY += separationY
            
            const normalX = dx / distance
            const normalY = dy / distance
            const relativeVelocityX = newVx - otherParticle.vx
            const relativeVelocityY = newVy - otherParticle.vy
            const velocityAlongNormal = relativeVelocityX * normalX + relativeVelocityY * normalY
            
            if (velocityAlongNormal > 0) return
            
            const restitution = 0.85  // Increased from 0.8 for slightly more bouncy collisions
            const impulse = -(1 + restitution) * velocityAlongNormal / 2
            newVx += impulse * normalX
            newVy += impulse * normalY
            
            // Add slight repulsion to prevent clumping
            const repulsionStrength = 0.02
            newVx += normalX * repulsionStrength
            newVy += normalY * repulsionStrength
          }
        }
      })

      // Add minimum velocity to prevent complete sticking
      const minVelocity = 0.008  // Reduced from 0.01 to allow more natural stopping
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
    
    if (allParticlesInVestibule && !epleyComplete && currentAvatarStage === 5 && !completionAnimationStarted) {
      // All particles are in vestibule AND we're at final stage 5 - start completion animation
      startCompletionAnimation()
    }

    particlesRef.current = newParticles
    setParticles(newParticles)
    
    // Update avatar stage based on particle positions
    updateAvatarStage()
  }, [orientation, epleyComplete, selectedEar, currentAvatarStage, completionAnimationStarted, startCompletionAnimation])

  // Animation loop
  useEffect(() => {
    const animate = () => {
      updatePhysics()
      draw()
      animationRef.current = requestAnimationFrame(animate)
    }

    if (permissionGranted && selectedEar && selectedPerspective) {
      animate()
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [updatePhysics, permissionGranted, selectedEar, selectedPerspective])

  // Handle Epley Complete click
  const handleEpleyCompleteClick = () => {
    initializeParticles()
    setCurrentAvatarStage(1) // Reset avatar to starting position
    
    // Reset all animation states
    setCompletionAnimationStarted(false)
    setAvatarOpacity(1.0)
    setSuccessOpacity(0.0)
    if (completionTimeoutRef.current) {
      clearTimeout(completionTimeoutRef.current)
      completionTimeoutRef.current = null
    }
    
    // Reset transition animation states
    setIsTransitioning(false)
    setPreviousAvatarStage(1)
    setTransitionProgress(0)
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current)
      transitionTimeoutRef.current = null
    }
    
    // Reset detection delay states
    setDetectedStage(1)
    if (detectionTimer) {
      clearTimeout(detectionTimer)
      setDetectionTimer(null)
    }
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
    const connectionWidth = 50  // Increased from 40
    const connectionHeight = 38 // Increased from 30
    
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
    const cupulaHeight = TUBE_WIDTH * 0.85
    const cupulaY = CENTER_Y + OUTER_RADIUS - cupulaHeight / 2
    
    ctx.fillStyle = '#8B4513'
    ctx.fillRect(
      cupulaX - cupulaWidth / 2,
      cupulaY - cupulaHeight / 2,
      cupulaWidth,
      cupulaHeight
    )
    
    // Draw hair structures - scaled for larger cupula
    ctx.strokeStyle = '#654321'
    ctx.lineWidth = 2 // Increased from 1.5 for better visibility
    for (let i = 0; i < 12; i++) { // Increased from 10 hairs
      const hairX = cupulaX - cupulaWidth / 2 + (cupulaWidth / 11) * i
      ctx.beginPath()
      ctx.moveTo(hairX, cupulaY - cupulaHeight / 2)
      const hairHeight = 6 + Math.sin(i * 0.5) * 3 // Increased hair height
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

    // Draw perspective avatars in center of ring
    if (selectedPerspective && (selectedPerspective === 'clinician' || selectedPerspective === 'patient')) {
      const maxAvatarSize = INNER_RADIUS * 1.4 // Maximum size to fit in center
      
      if (isTransitioning) {
        // During transition, draw both previous and current avatars with crossfade
        const previousAvatarImage = new Image()
        const currentAvatarImage = new Image()
        
        // Get paths for both avatars
        const earPrefix = selectedEar === 'right' ? 'R' : 'L'
        const perspectiveType = selectedPerspective === 'patient' ? 'treat' : 'epley'
        
        previousAvatarImage.src = `/avatars/${earPrefix}_${perspectiveType}_${previousAvatarStage}.png`
        currentAvatarImage.src = `/avatars/${earPrefix}_${perspectiveType}_${currentAvatarStage}.png`
        
        const drawTransitionAvatars = () => {
          if (previousAvatarImage.complete && currentAvatarImage.complete && 
              previousAvatarImage.naturalWidth > 0 && currentAvatarImage.naturalWidth > 0) {
            
            // Calculate dimensions for both avatars
            const prevAspectRatio = previousAvatarImage.naturalWidth / previousAvatarImage.naturalHeight
            const currAspectRatio = currentAvatarImage.naturalWidth / currentAvatarImage.naturalHeight
            
            let prevWidth, prevHeight, currWidth, currHeight
            
            // Previous avatar dimensions
            if (prevAspectRatio > 1) {
              prevWidth = maxAvatarSize
              prevHeight = maxAvatarSize / prevAspectRatio
            } else {
              prevHeight = maxAvatarSize
              prevWidth = maxAvatarSize * prevAspectRatio
            }
            
            // Current avatar dimensions
            if (currAspectRatio > 1) {
              currWidth = maxAvatarSize
              currHeight = maxAvatarSize / currAspectRatio
            } else {
              currHeight = maxAvatarSize
              currWidth = maxAvatarSize * currAspectRatio
            }
            
            // Calculate positions with slight movement simulation
            const baseX = CENTER_X
            const baseY = CENTER_Y
            
            // Simulate natural head/neck movement during transitions
            const movementOffset = 8 // pixels of movement
            const rotationMovement = Math.sin(transitionProgress * Math.PI) * movementOffset
            
            // Previous avatar position (fading out)
            const prevX = baseX - prevWidth / 2 - rotationMovement * 0.3
            const prevY = baseY - prevHeight / 2
            
            // Current avatar position (fading in)
            const currX = baseX - currWidth / 2 + rotationMovement * 0.3
            const currY = baseY - currHeight / 2
            
            // Draw previous avatar (fading out)
            ctx.globalAlpha = (1 - transitionProgress) * avatarOpacity
            ctx.drawImage(previousAvatarImage, prevX, prevY, prevWidth, prevHeight)
            
            // Draw current avatar (fading in)
            ctx.globalAlpha = transitionProgress * avatarOpacity
            ctx.drawImage(currentAvatarImage, currX, currY, currWidth, currHeight)
            
            ctx.globalAlpha = 1.0 // Reset alpha
          }
        }
        
        // Draw immediately if both loaded, or set onload handlers
        if (previousAvatarImage.complete && currentAvatarImage.complete) {
          drawTransitionAvatars()
        } else {
          let loadedCount = 0
          const checkBothLoaded = () => {
            loadedCount++
            if (loadedCount === 2) drawTransitionAvatars()
          }
          
          if (!previousAvatarImage.complete) previousAvatarImage.onload = checkBothLoaded
          if (!currentAvatarImage.complete) currentAvatarImage.onload = checkBothLoaded
          
          // If one is already loaded, increment counter
          if (previousAvatarImage.complete) loadedCount++
          if (currentAvatarImage.complete) loadedCount++
          
          if (loadedCount === 2) drawTransitionAvatars()
        }
      } else {
        // Normal drawing (no transition)
        const avatarImage = new Image()
        avatarImage.src = getAvatarImagePath()
        
        const drawAvatar = () => {
          if (avatarImage.complete && avatarImage.naturalWidth > 0) {
            // Calculate aspect ratio to maintain original proportions
            const aspectRatio = avatarImage.naturalWidth / avatarImage.naturalHeight
            
            let avatarWidth, avatarHeight
            
            if (aspectRatio > 1) {
              // Wider than tall - constrain by width
              avatarWidth = maxAvatarSize
              avatarHeight = maxAvatarSize / aspectRatio
            } else {
              // Taller than wide - constrain by height
              avatarHeight = maxAvatarSize
              avatarWidth = maxAvatarSize * aspectRatio
            }
            
            const avatarX = CENTER_X - avatarWidth / 2
            const avatarY = CENTER_Y - avatarHeight / 2
            
            // Apply opacity for fade-out animation
            ctx.globalAlpha = avatarOpacity
            ctx.drawImage(avatarImage, avatarX, avatarY, avatarWidth, avatarHeight)
            ctx.globalAlpha = 1.0 // Reset alpha
          }
        }
        
        // Draw immediately if already loaded, or set onload handler
        if (avatarImage.complete) {
          drawAvatar()
        } else {
          avatarImage.onload = drawAvatar
        }
      }
    }

    // Draw "Epley Complete" success indicator
    if (epleyComplete) {
      // Apply opacity for fade-in animation
      ctx.globalAlpha = successOpacity
      
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
      
      ctx.globalAlpha = 1.0 // Reset alpha
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

  // Initialize particles when ear and perspective are selected
  useEffect(() => {
    if (selectedEar && selectedPerspective) {
      initializeParticles()
    }
  }, [selectedEar, selectedPerspective, initializeParticles])

  // Cleanup completion timeout on unmount
  useEffect(() => {
    return () => {
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current)
      }
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current)
      }
      if (detectionTimer) {
        clearTimeout(detectionTimer)
      }
    }
  }, [detectionTimer])

  // Helper function to determine which bracket a particle is in
  function getParticleBracket(particle: Particle): string {
    const dx = particle.x - CENTER_X
    const dy = particle.y - CENTER_Y
    const angle = Math.atan2(dy, dx)
    let degrees = (angle * 180) / Math.PI
    if (degrees < 0) degrees += 360

    if (selectedEar === 'right') {
      // Right ear brackets - stage 2 triggers after 30-40° of movement
      // Red bracket: Starting position + initial settling zone (3-5 o'clock)
      if (degrees >= 90 && degrees < 130) return 'red'  // 40° window for settling
      // Yellow bracket: First intentional movement (supine position)
      if (degrees >= 130 && degrees < 210) return 'yellow'  // Triggers after 40° movement
      // Blue bracket: Top of canal
      if (degrees >= 210 && degrees < 290) return 'blue'
      // Orange bracket: Right side, approaching vestibule
      if (degrees >= 290 || degrees < 45) return 'orange'
      // Green bracket: Final vestibule position
      if (degrees >= 45 && degrees < 90) return 'green'
    } else {
      // Left ear brackets - stage 2 triggers after 30-40° of movement
      // Red bracket: Starting position + initial settling zone (12-2 o'clock)
      if (degrees >= 30 && degrees < 70) return 'red'  // 40° window for settling
      // Yellow bracket: First intentional movement (supine position)
      if (degrees >= 70 && degrees < 150) return 'yellow'  // Triggers after 40° movement
      if (degrees >= 320 || degrees < 30) return 'yellow'  // Additional coverage for left ear
      // Blue bracket: Top of canal
      if (degrees >= 210 && degrees < 290) return 'blue'
      // Orange bracket: Left side, approaching vestibule
      if (degrees >= 150 && degrees < 210) return 'orange'
      // Green bracket: Final vestibule position
      if (degrees >= 290 && degrees < 320) return 'green'
    }
    
    return 'red' // default to starting position
  }

  // Helper function to get avatar image path
  function getAvatarImagePath(): string {
    if (!selectedEar || !selectedPerspective) return ''
    
    const earPrefix = selectedEar === 'right' ? 'R' : 'L'
    const perspectiveType = selectedPerspective === 'patient' ? 'treat' : 'epley'
    
    return `/avatars/${earPrefix}_${perspectiveType}_${currentAvatarStage}.png`
  }

  // Helper function to get stage description
  function getStageDescription(): string {
    if (selectedEar === 'left') {
      // Left ear Epley maneuver instructions
      switch (currentAvatarStage) {
        case 1: return 'Seated Head Left'
        case 2: return 'Supine Head Left Neck Extended'
        case 3: return 'Supine Head Right Neck Extended'
        case 4: return 'Right Sidelying Head Right and Chin Tucked'
        case 5: return 'Seated with Chin Tucked'
        default: return 'Seated Head Left'
      }
    } else {
      // Right ear Epley maneuver instructions (original)
      switch (currentAvatarStage) {
        case 1: return 'Seated Head Right'
        case 2: return 'Supine Head Right Neck Extended'
        case 3: return 'Supine Head Left Neck Extended'
        case 4: return 'Left Sidelying Head Left and Chin Tucked'
        case 5: return 'Seated with Chin Tucked'
        default: return 'Seated Head Right'
      }
    }
  }

  // Update avatar stage based on particle positions
  function updateAvatarStage() {
    if (particlesRef.current.length < 1) return

    // Count particles in each bracket
    const bracketCounts = { red: 0, yellow: 0, blue: 0, orange: 0, green: 0 }
    particlesRef.current.forEach(particle => {
      const bracket = getParticleBracket(particle)
      bracketCounts[bracket as keyof typeof bracketCounts]++
    })

    // Find the bracket with at least 1 particle (1/4 threshold)
    let targetBracket = 'red' // default
    for (const [bracket, count] of Object.entries(bracketCounts)) {
      if (count >= 1) {
        targetBracket = bracket
        break
      }
    }

    // Map brackets to avatar stages (only move forward)
    const bracketToStage: { [key: string]: number } = {
      red: 1,    // Stage 1
      yellow: 2, // Stage 2
      blue: 3,   // Stage 3
      orange: 4, // Stage 4
      green: 5   // Stage 5
    }

    const newStage = bracketToStage[targetBracket]
    
    if (newStage > currentAvatarStage) {
      // Check if this is a new detection or the same stage we're already waiting for
      if (newStage !== detectedStage) {
        // New stage detected - clear any existing timer and start new one
        if (detectionTimer) {
          clearTimeout(detectionTimer)
        }
        
        setDetectedStage(newStage)
        
        const newTimer = setTimeout(() => {
          startAvatarTransition(newStage)
          setDetectionTimer(null)
        }, detectionDelayMs)
        
        setDetectionTimer(newTimer)
      }
      // If it's the same stage we're already waiting for, just let the timer continue
    } else if (newStage <= currentAvatarStage && detectionTimer) {
      // Particles moved back to previous stage - cancel pending transition
      clearTimeout(detectionTimer)
      setDetectionTimer(null)
      setDetectedStage(currentAvatarStage)
    }
  }

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
        marginTop: '70px',  // Reduced from 80px
        marginBottom: '15px', // Reduced from 20px
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',  // Reduced from 15px
        width: '100%',
        maxWidth: '500px',
        padding: '0 15px',  // Reduced from 20px
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 100px)'  // Adjusted for smaller header margin
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

        {/* Perspective Selection Screen */}
        {selectedEar && !selectedPerspective && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <h3 style={{ marginBottom: '10px' }}>Select Training Perspective</h3>
            <p style={{ marginBottom: '30px', color: '#666', fontSize: '14px' }}>
              Choose your learning perspective for the {selectedEar} ear Epley maneuver
            </p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => setSelectedPerspective('patient')}
                style={{
                  padding: '20px 30px',
                  borderRadius: '12px',
                  border: '2px solid #667eea',
                  backgroundColor: 'white',
                  color: '#667eea',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.1)',
                  minWidth: '140px',
                  textAlign: 'center'
                }}
              >
                Patient Perspective<br/>
                <span style={{ fontSize: '12px', opacity: 0.7 }}>3rd Person Body View</span>
              </button>
              <button
                onClick={() => setSelectedPerspective('clinician')}
                style={{
                  padding: '20px 30px',
                  borderRadius: '12px',
                  border: '2px solid #10b981',
                  backgroundColor: 'white',
                  color: '#10b981',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.1)',
                  minWidth: '140px',
                  textAlign: 'center'
                }}
              >
                Clinician Perspective<br/>
                <span style={{ fontSize: '12px', opacity: 0.7 }}>1st Person Face View</span>
              </button>
            </div>
            <button
              onClick={() => {
                setSelectedEar(null)
                setSelectedPerspective(null)
                setEpleyComplete(false)
                setCurrentAvatarStage(1) // Reset avatar stage
                // Don't reset orientation setup - keep it for switching ears
                
                // Clean up completion animation
                setCompletionAnimationStarted(false)
                setAvatarOpacity(1.0)
                setSuccessOpacity(0.0)
                if (completionTimeoutRef.current) {
                  clearTimeout(completionTimeoutRef.current)
                  completionTimeoutRef.current = null
                }
                
                // Clean up transition animation
                setIsTransitioning(false)
                setPreviousAvatarStage(1)
                setTransitionProgress(0)
                if (transitionTimeoutRef.current) {
                  clearTimeout(transitionTimeoutRef.current)
                  transitionTimeoutRef.current = null
                }
                
                // Clean up detection delay
                setDetectedStage(1)
                if (detectionTimer) {
                  clearTimeout(detectionTimer)
                  setDetectionTimer(null)
                }
              }}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                backgroundColor: 'white',
                color: '#666',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              ← Back to Ear Selection
            </button>
          </div>
        )}

        {/* Orientation Lock Prompt - Only show if orientation setup not complete */}
        {selectedEar && selectedPerspective && orientationLockPrompted && !orientationSetupComplete && (
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
        {selectedEar && selectedPerspective && !orientationLockPrompted && !permissionGranted && !orientationSetupComplete && (
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

        {/* Simulation Canvas - Show if ear and perspective selected and (permission granted OR orientation setup complete) */}
        {selectedEar && selectedPerspective && (permissionGranted || orientationSetupComplete) && (
          <>
            {/* Clinician Perspective Instructions (above canvas) */}
            {selectedPerspective === 'clinician' && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: '8px',
                textAlign: 'center'
              }}>
                <p style={{
                  fontSize: '14px',
                  color: '#333',
                  margin: '0 0 2px 0',
                  fontWeight: '600'
                }}>
                  Stage {currentAvatarStage}/5: {getStageDescription()}
                </p>
              </div>
            )}

            {/* Patient Perspective Instructions (above canvas) */}
            {selectedPerspective === 'patient' && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: '8px',
                textAlign: 'center'
              }}>
                <p style={{
                  fontSize: '14px',
                  color: '#333',
                  margin: '0 0 2px 0',
                  fontWeight: '600'
                }}>
                  Stage {currentAvatarStage}/5: {getStageDescription()}
                </p>
              </div>
            )}
            
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
                    setSelectedPerspective(null)
                    setEpleyComplete(false)
                    setCurrentAvatarStage(1) // Reset avatar stage
                    // Don't reset orientation setup - keep it for switching ears
                    
                    // Clean up completion animation
                    setCompletionAnimationStarted(false)
                    setAvatarOpacity(1.0)
                    setSuccessOpacity(0.0)
                    if (completionTimeoutRef.current) {
                      clearTimeout(completionTimeoutRef.current)
                      completionTimeoutRef.current = null
                    }
                    
                    // Clean up transition animation
                    setIsTransitioning(false)
                    setPreviousAvatarStage(1)
                    setTransitionProgress(0)
                    if (transitionTimeoutRef.current) {
                      clearTimeout(transitionTimeoutRef.current)
                      transitionTimeoutRef.current = null
                    }
                    
                    // Clean up detection delay
                    setDetectedStage(1)
                    if (detectionTimer) {
                      clearTimeout(detectionTimer)
                      setDetectionTimer(null)
                    }
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