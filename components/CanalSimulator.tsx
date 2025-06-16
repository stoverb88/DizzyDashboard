import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  shape: number[]; // Irregular shape points
}

interface CanalSimulatorProps {
  onBack: () => void;
}

export function CanalSimulator({ onBack }: CanalSimulatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [orientation, setOrientation] = useState({ beta: 0, gamma: 0 });
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Canvas dimensions for landscape
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 400;

  // Generate irregular particle shape
  const generateParticleShape = useCallback((size: number): number[] => {
    const points: number[] = [];
    const numPoints = 8;
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const radius = size * (0.7 + Math.random() * 0.6); // Irregular radius
      points.push(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
    return points;
  }, []);

  // Initialize particles
  useEffect(() => {
    const initialParticles: Particle[] = [];
    for (let i = 0; i < 10; i++) {
      initialParticles.push({
        id: i,
        x: 150 + Math.random() * 50, // Near ampulla, left side
        y: 180 + Math.random() * 40,
        vx: 0,
        vy: 0,
        size: 3 + Math.random() * 2,
        shape: generateParticleShape(3 + Math.random() * 2)
      });
    }
    setParticles(initialParticles);
  }, [generateParticleShape]);

  // Request device orientation permission
  useEffect(() => {
    const requestPermission = async () => {
      if (typeof DeviceOrientationEvent !== 'undefined' && 'requestPermission' in DeviceOrientationEvent) {
        try {
          const permission = await (DeviceOrientationEvent as any).requestPermission();
          setPermissionGranted(permission === 'granted');
        } catch (error) {
          console.error('Error requesting device orientation permission:', error);
        }
      } else {
        setPermissionGranted(true);
      }
    };

    requestPermission();
  }, []);

  // Handle device orientation
  useEffect(() => {
    if (!permissionGranted) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      setOrientation({
        beta: event.beta || 0,  // Front-to-back tilt
        gamma: event.gamma || 0 // Left-to-right tilt
      });
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [permissionGranted]);

  // Draw canal shape
  const drawCanal = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#2D3748';
    ctx.lineWidth = 3;
    ctx.fillStyle = '#F7FAFC';

    // Draw semicircular canal
    ctx.beginPath();
    // Outer curve
    ctx.arc(400, 200, 180, Math.PI, 0, false);
    // Inner curve
    ctx.arc(400, 200, 120, 0, Math.PI, true);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw ampulla (enlarged area)
    ctx.beginPath();
    ctx.arc(220, 200, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Draw utricle
    ctx.beginPath();
    ctx.arc(580, 200, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#2D3748';
    ctx.font = '14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Ampulla', 220, 250);
    ctx.fillText('Utricle', 580, 250);
    ctx.fillText('Posterior Semicircular Canal', 400, 100);
  }, []);

  // Draw irregular particle
  const drawParticle = useCallback((ctx: CanvasRenderingContext2D, particle: Particle) => {
    ctx.save();
    ctx.translate(particle.x, particle.y);
    ctx.fillStyle = '#2D3748';
    ctx.beginPath();
    ctx.moveTo(particle.shape[0], particle.shape[1]);
    for (let i = 2; i < particle.shape.length; i += 2) {
      ctx.lineTo(particle.shape[i], particle.shape[i + 1]);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }, []);

  // Check if particle is inside canal
  const isInsideCanal = useCallback((x: number, y: number): boolean => {
    const centerX = 400;
    const centerY = 200;
    const distFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    
    // Inside outer circle but outside inner circle, or in ampulla/utricle areas
    const inMainCanal = distFromCenter <= 180 && distFromCenter >= 120;
    const inAmpulla = Math.sqrt((x - 220) ** 2 + (y - 200) ** 2) <= 25;
    const inUtricle = Math.sqrt((x - 580) ** 2 + (y - 200) ** 2) <= 30;
    
    return inMainCanal || inAmpulla || inUtricle;
  }, []);

  // Physics update
  const updateParticles = useCallback(() => {
    setParticles(prevParticles => {
      return prevParticles.map(particle => {
        // Calculate gravity based on device orientation
        const gravityX = Math.sin(orientation.gamma * Math.PI / 180) * 0.3;
        const gravityY = Math.sin(orientation.beta * Math.PI / 180) * 0.3;

        // Update velocity with gravity and damping
        let newVx = particle.vx + gravityX;
        let newVy = particle.vy + gravityY;
        
        // Apply damping
        newVx *= 0.98;
        newVy *= 0.98;

        // Update position
        let newX = particle.x + newVx;
        let newY = particle.y + newVy;

        // Boundary checking and collision with canal walls
        if (!isInsideCanal(newX, newY)) {
          // Simple bounce back
          newX = particle.x;
          newY = particle.y;
          newVx *= -0.5;
          newVy *= -0.5;
        }

        // Floor collision
        if (newY > CANVAS_HEIGHT - particle.size) {
          newY = CANVAS_HEIGHT - particle.size;
          newVy *= -0.3;
        }

        return {
          ...particle,
          x: newX,
          y: newY,
          vx: newVx,
          vy: newVy
        };
      });
    });
  }, [orientation, isInsideCanal]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw canal
      drawCanal(ctx);

      // Draw particles
      particles.forEach(particle => {
        drawParticle(ctx, particle);
      });

      // Update physics
      updateParticles();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particles, drawCanal, drawParticle, updateParticles]);

  // Lock orientation to landscape
  useEffect(() => {
    const lockOrientation = async () => {
      try {
        if (screen.orientation && (screen.orientation as any).lock) {
          await (screen.orientation as any).lock('landscape');
        }
      } catch (error) {
        console.log('Orientation lock not supported or failed:', error);
      }
    };

    lockOrientation();

    return () => {
      if (screen.orientation && (screen.orientation as any).unlock) {
        (screen.orientation as any).unlock();
      }
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#F7FAFC',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      {/* Header */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: '#2D3748',
        fontSize: '18px',
        fontWeight: '600'
      }}>
        Canal Particle Simulator
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{
          border: '2px solid #E2E8F0',
          borderRadius: '12px',
          backgroundColor: 'white',
          maxWidth: '90vw',
          maxHeight: '70vh'
        }}
      />

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        bottom: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: '#4A5568',
        fontSize: '14px',
        textAlign: 'center',
        maxWidth: '600px',
        padding: '0 20px'
      }}>
        Tilt your device to move the particles through the canal. Watch how they respond to gravity!
      </div>

      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          padding: '12px 24px',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: '#667eea',
          color: 'white',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
          transition: 'all 0.2s'
        }}
      >
        ← Back to Maneuvers
      </button>

      {/* Permission prompt */}
      {!permissionGranted && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          textAlign: 'center',
          maxWidth: '300px'
        }}>
          <p style={{ color: '#4A5568', marginBottom: '15px' }}>
            Device orientation access is needed for the simulation to work properly.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#667eea',
              color: 'white',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
        </div>
      )}
    </div>
  );
} 