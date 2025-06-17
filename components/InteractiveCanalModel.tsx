import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  shape: number; // Different shapes for variety
  settled: boolean;
}

interface InteractiveCanalModelProps {
  onBack: () => void;
}

export function InteractiveCanalModel({ onBack }: InteractiveCanalModelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(true);
  const [orientation, setOrientation] = useState({ beta: 0, gamma: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Canal path points (anatomically accurate posterior semicircular canal)
  const canalPath = useRef<{x: number, y: number}[]>([]);
  
  // Initialize particles
  const initializeParticles = useCallback(() => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 10; i++) {
      newParticles.push({
        id: i,
        x: 180 + Math.random() * 40, // Start in canal area
        y: 200 + Math.random() * 60,
        vx: 0,
        vy: 0,
        size: 3 + Math.random() * 2,
        shape: Math.floor(Math.random() * 4), // 4 different shapes
        settled: false
      });
    }
    setParticles(newParticles);
  }, []);

  // Reset particles to canal position
  const resetParticles = () => {
    initializeParticles();
  };

  // Request device orientation permission
  const requestPermission = async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && 'requestPermission' in DeviceOrientationEvent) {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          setPermissionGranted(true);
          setShowPermissionDialog(false);
          startOrientationListener();
        } else {
          setPermissionGranted(false);
          setShowPermissionDialog(false);
        }
      } catch (error) {
        console.error('Error requesting permission:', error);
        setPermissionGranted(false);
        setShowPermissionDialog(false);
      }
    } else {
      // For non-iOS devices, assume permission is granted
      setPermissionGranted(true);
      setShowPermissionDialog(false);
      startOrientationListener();
    }
  };

  const startOrientationListener = () => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      setOrientation({
        beta: event.beta || 0,  // front-to-back tilt
        gamma: event.gamma || 0 // left-to-right tilt
      });
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  };

  // Generate canal path
  const generateCanalPath = useCallback((width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const path: {x: number, y: number}[] = [];
    
    // Posterior semicircular canal shape
    const radius = Math.min(width, height) * 0.35;
    const steps = 100;
    
    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * Math.PI * 1.2 + Math.PI * 0.4; // Partial circle
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius * 0.8; // Slightly elliptical
      path.push({ x, y });
    }
    
    canalPath.current = path;
  }, []);

  // Check if point is inside canal
  const isInsideCanal = (x: number, y: number): boolean => {
    const path = canalPath.current;
    if (path.length === 0) return false;
    
    // Find closest point on canal path
    let minDistance = Infinity;
    for (const point of path) {
      const distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);
      minDistance = Math.min(minDistance, distance);
    }
    
    return minDistance < 25; // Canal width tolerance
  };

  // Physics simulation
  const updatePhysics = useCallback(() => {
    if (!permissionGranted) return;
    
    setParticles(prevParticles => {
      return prevParticles.map(particle => {
        if (particle.settled) return particle;
        
        // Convert device orientation to gravity vector
        const gravityX = orientation.gamma * 0.01; // Sensitivity adjustment
        const gravityY = orientation.beta * 0.01 + 0.1; // Always some downward gravity
        
        // Apply gravity
        let newVx = particle.vx + gravityX;
        let newVy = particle.vy + gravityY;
        
        // Apply damping
        newVx *= 0.98;
        newVy *= 0.98;
        
        // Update position
        let newX = particle.x + newVx;
        let newY = particle.y + newVy;
        
        // Boundary collision detection
        if (!isInsideCanal(newX, newY)) {
          // Find closest point on canal and bounce
          const path = canalPath.current;
          let closestPoint = path[0];
          let minDistance = Infinity;
          
          for (const point of path) {
            const distance = Math.sqrt((newX - point.x) ** 2 + (newY - point.y) ** 2);
            if (distance < minDistance) {
              minDistance = distance;
              closestPoint = point;
            }
          }
          
          // Bounce off canal wall
          const dx = newX - closestPoint.x;
          const dy = newY - closestPoint.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          
          if (length > 0) {
            const normalX = dx / length;
            const normalY = dy / length;
            
            // Reflect velocity
            const dot = newVx * normalX + newVy * normalY;
            newVx -= 2 * dot * normalX * 0.6; // Energy loss on bounce
            newVy -= 2 * dot * normalY * 0.6;
            
            // Move particle back inside
            newX = closestPoint.x + normalX * 20;
            newY = closestPoint.y + normalY * 20;
          }
        }
        
        // Check if particle reached utricle (bottom area)
        const isInUtricle = newY > dimensions.height * 0.8 && 
                           newX > dimensions.width * 0.3 && 
                           newX < dimensions.width * 0.7;
        
        if (isInUtricle && Math.abs(newVx) < 0.5 && Math.abs(newVy) < 0.5) {
          return { ...particle, x: newX, y: newY, vx: 0, vy: 0, settled: true };
        }
        
        return { ...particle, x: newX, y: newY, vx: newVx, vy: newVy };
      });
    });
  }, [orientation, permissionGranted, dimensions]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      updatePhysics();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    if (!showPermissionDialog) {
      animate();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [updatePhysics, showPermissionDialog]);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    setDimensions({ width: rect.width, height: rect.height });
    generateCanalPath(rect.width, rect.height);
    
    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    // Draw canal outline
    if (canalPath.current.length > 0) {
      ctx.strokeStyle = '#2D3748';
      ctx.lineWidth = 3;
      ctx.beginPath();
      
      const path = canalPath.current;
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();
      
      // Draw ampulla (enlarged end)
      ctx.fillStyle = '#E2E8F0';
      ctx.beginPath();
      ctx.arc(path[0].x, path[0].y, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Draw utricle area
      const utricleY = rect.height * 0.85;
      ctx.fillStyle = '#F7FAFC';
      ctx.strokeStyle = '#2D3748';
      ctx.beginPath();
      ctx.roundRect(rect.width * 0.25, utricleY - 20, rect.width * 0.5, 40, 20);
      ctx.fill();
      ctx.stroke();
      
      // Labels
      ctx.fillStyle = '#2D3748';
      ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Ampulla', path[0].x, path[0].y - 25);
      ctx.fillText('Utricle', rect.width * 0.5, utricleY + 5);
      ctx.fillText('Posterior Semicircular Canal', rect.width * 0.5, 40);
    }
    
    // Draw particles
    particles.forEach(particle => {
      ctx.fillStyle = particle.settled ? '#48BB78' : '#E53E3E';
      ctx.beginPath();
      
      // Different particle shapes
      switch (particle.shape) {
        case 0: // Circle
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          break;
        case 1: // Square
          ctx.rect(particle.x - particle.size, particle.y - particle.size, particle.size * 2, particle.size * 2);
          break;
        case 2: // Triangle
          ctx.moveTo(particle.x, particle.y - particle.size);
          ctx.lineTo(particle.x - particle.size, particle.y + particle.size);
          ctx.lineTo(particle.x + particle.size, particle.y + particle.size);
          ctx.closePath();
          break;
        case 3: // Diamond
          ctx.moveTo(particle.x, particle.y - particle.size);
          ctx.lineTo(particle.x + particle.size, particle.y);
          ctx.lineTo(particle.x, particle.y + particle.size);
          ctx.lineTo(particle.x - particle.size, particle.y);
          ctx.closePath();
          break;
      }
      
      ctx.fill();
    });
    
  }, [particles, dimensions, generateCanalPath]);

  // Initialize particles on mount
  useEffect(() => {
    initializeParticles();
  }, [initializeParticles]);

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
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <button
          onClick={onBack}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
            backgroundColor: 'white',
            color: '#4A5568',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          ← Back
        </button>
        <h2 style={{
          fontSize: '1.2rem',
          fontWeight: '600',
          color: '#2D3748',
          margin: 0
        }}>
          Interactive Canal Model
        </h2>
        <button
          onClick={resetParticles}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#667eea',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Reset
        </button>
      </div>

      {/* Permission Dialog */}
      <AnimatePresence>
        {showPermissionDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 2000,
              padding: '20px'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '12px',
                maxWidth: '400px',
                textAlign: 'center'
              }}
            >
              <h3 style={{
                color: '#2D3748',
                marginBottom: '15px',
                fontSize: '1.3rem',
                fontWeight: '600'
              }}>
                Device Orientation Access
              </h3>
              <p style={{
                color: '#4A5568',
                marginBottom: '20px',
                lineHeight: '1.6'
              }}>
                This simulation uses your device's orientation to show how otoconia (ear crystals) move through the semicircular canal when you tilt your device.
              </p>
              <p style={{
                color: '#E53E3E',
                marginBottom: '25px',
                fontSize: '14px',
                fontStyle: 'italic'
              }}>
                Without permissions, the simulation is inaccurate and does not function as designed.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={() => setShowPermissionDialog(false)}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: 'white',
                    color: '#4A5568',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Continue Without
                </button>
                <button
                  onClick={requestPermission}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#667eea',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                  }}
                >
                  Grant Permission
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          flex: 1,
          width: '100%',
          height: '100%',
          touchAction: 'none'
        }}
      />

      {/* Status indicator */}
      {!showPermissionDialog && (
        <div style={{
          position: 'absolute',
          top: '80px',
          left: '20px',
          right: '20px',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'inline-block',
            padding: '8px 16px',
            borderRadius: '20px',
            backgroundColor: permissionGranted ? '#48BB78' : '#E53E3E',
            color: 'white',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            {permissionGranted ? '📱 Orientation Active' : '⚠️ Limited Functionality'}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div style={{
        padding: '20px',
        backgroundColor: '#F7FAFC',
        borderTop: '1px solid #E2E8F0'
      }}>
        <p style={{
          color: '#4A5568',
          fontSize: '14px',
          textAlign: 'center',
          margin: 0,
          lineHeight: '1.5'
        }}>
          🔄 <strong>Tilt your device</strong> to move the red otoconia through the canal. 
          Green particles have settled in the utricle. <strong>Tap Reset</strong> to start over.
        </p>
      </div>
    </div>
  );
} 