import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  mass: number;
  settled: boolean;
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
  const CANVAS_WIDTH = 900;
  const CANVAS_HEIGHT = 500;

  // Physics constants based on research
  const GRAVITY_SCALE = 0.15;
  const FLUID_DAMPING = 0.92;
  const PARTICLE_INTERACTION_RADIUS = 15;
  const SETTLING_THRESHOLD = 0.05;
  const ENDOLYMPH_VISCOSITY = 0.98;

  // Canal geometry points (more anatomically accurate)
  const CANAL_GEOMETRY = {
    // Posterior semicircular canal path
    posteriorCanal: {
      centerX: 450,
      centerY: 250,
      outerRadius: 200,
      innerRadius: 140,
      startAngle: Math.PI * 0.8,
      endAngle: Math.PI * 0.2
    },
    // Ampulla (enlarged area where particles start)
    ampulla: {
      x: 250,
      y: 250,
      radius: 35
    },
    // Common crus connection
    commonCrus: {
      x: 650,
      y: 180,
      width: 25,
      height: 60
    },
    // Utricle (destination)
    utricle: {
      x: 700,
      y: 280,
      radius: 45
    }
  };

  // Initialize particles clustered in cupula area
  useEffect(() => {
    const initialParticles: Particle[] = [];
    const clusterX = CANAL_GEOMETRY.ampulla.x + 20;
    const clusterY = CANAL_GEOMETRY.ampulla.y;
    
    for (let i = 0; i < 15; i++) {
      // Create tight cluster in cupula
      const angle = (i / 15) * Math.PI * 2;
      const radius = 8 + Math.random() * 12;
      const x = clusterX + Math.cos(angle) * radius;
      const y = clusterY + Math.sin(angle) * radius;
      
      initialParticles.push({
        id: i,
        x: x,
        y: y,
        vx: 0,
        vy: 0,
        size: 2.5 + Math.random() * 1.5,
        mass: 1 + Math.random() * 0.5,
        settled: false
      });
    }
    setParticles(initialParticles);
  }, []);

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

  // Draw anatomically accurate canal
  const drawCanal = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#2D3748';
    ctx.lineWidth = 3;
    ctx.fillStyle = '#F7FAFC';

    // Draw posterior semicircular canal (main curved path)
    const canal = CANAL_GEOMETRY.posteriorCanal;
    ctx.beginPath();
    // Outer arc
    ctx.arc(canal.centerX, canal.centerY, canal.outerRadius, canal.startAngle, canal.endAngle, false);
    // Connect to inner arc
    ctx.arc(canal.centerX, canal.centerY, canal.innerRadius, canal.endAngle, canal.startAngle, true);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw ampulla (enlarged sensing area)
    const amp = CANAL_GEOMETRY.ampulla;
    ctx.beginPath();
    ctx.arc(amp.x, amp.y, amp.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Draw common crus connection
    const cc = CANAL_GEOMETRY.commonCrus;
    ctx.fillRect(cc.x - cc.width/2, cc.y - cc.height/2, cc.width, cc.height);
    ctx.strokeRect(cc.x - cc.width/2, cc.y - cc.height/2, cc.width, cc.height);

    // Draw utricle
    const ut = CANAL_GEOMETRY.utricle;
    ctx.beginPath();
    ctx.arc(ut.x, ut.y, ut.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Draw cupula area (where particles cluster)
    ctx.strokeStyle = '#E53E3E';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(amp.x + 20, amp.y, 20, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Labels
    ctx.fillStyle = '#2D3748';
    ctx.font = '14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('PSC', canal.centerX, canal.centerY - canal.outerRadius - 20);
    ctx.fillText('Ampulla', amp.x, amp.y + amp.radius + 20);
    ctx.fillText('CC', cc.x, cc.y - cc.height/2 - 15);
    ctx.fillText('UT', ut.x, ut.y + ut.radius + 20);
    ctx.fillStyle = '#E53E3E';
    ctx.font = '12px system-ui';
    ctx.fillText('Cupula (OT)', amp.x + 20, amp.y - 35);
  }, []);

  // Check if point is inside canal system
  const isInsideCanal = useCallback((x: number, y: number): boolean => {
    const canal = CANAL_GEOMETRY.posteriorCanal;
    const amp = CANAL_GEOMETRY.ampulla;
    const cc = CANAL_GEOMETRY.commonCrus;
    const ut = CANAL_GEOMETRY.utricle;

    // Check ampulla
    const ampDist = Math.sqrt((x - amp.x) ** 2 + (y - amp.y) ** 2);
    if (ampDist <= amp.radius) return true;

    // Check utricle
    const utDist = Math.sqrt((x - ut.x) ** 2 + (y - ut.y) ** 2);
    if (utDist <= ut.radius) return true;

    // Check common crus
    if (x >= cc.x - cc.width/2 && x <= cc.x + cc.width/2 &&
        y >= cc.y - cc.height/2 && y <= cc.y + cc.height/2) return true;

    // Check main canal (between outer and inner radius)
    const canalDist = Math.sqrt((x - canal.centerX) ** 2 + (y - canal.centerY) ** 2);
    if (canalDist <= canal.outerRadius && canalDist >= canal.innerRadius) {
      // Check if within the arc angle
      const angle = Math.atan2(y - canal.centerY, x - canal.centerX);
      const normalizedAngle = angle < 0 ? angle + 2 * Math.PI : angle;
      return normalizedAngle >= canal.endAngle && normalizedAngle <= canal.startAngle;
    }

    return false;
  }, []);

  // Calculate particle interactions (clustering behavior)
  const calculateParticleForces = useCallback((particle: Particle, allParticles: Particle[]) => {
    let forceX = 0;
    let forceY = 0;

    allParticles.forEach(other => {
      if (other.id === particle.id) return;

      const dx = other.x - particle.x;
      const dy = other.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < PARTICLE_INTERACTION_RADIUS && distance > 0) {
        // Repulsion force to prevent overlap
        const repulsionForce = 0.5 / (distance * distance);
        forceX -= (dx / distance) * repulsionForce;
        forceY -= (dy / distance) * repulsionForce;

        // Slight attraction for clustering (like real otoconia)
        if (distance > particle.size + other.size) {
          const attractionForce = 0.02;
          forceX += (dx / distance) * attractionForce;
          forceY += (dy / distance) * attractionForce;
        }
      }
    });

    return { forceX, forceY };
  }, []);

  // Physics update with realistic fluid dynamics
  const updateParticles = useCallback(() => {
    setParticles(prevParticles => {
      return prevParticles.map(particle => {
        // Calculate gravity based on device orientation
        const gravityX = Math.sin(orientation.gamma * Math.PI / 180) * GRAVITY_SCALE;
        const gravityY = Math.sin(orientation.beta * Math.PI / 180) * GRAVITY_SCALE;

        // Calculate particle interaction forces
        const { forceX, forceY } = calculateParticleForces(particle, prevParticles);

        // Update velocity with forces and fluid resistance
        let newVx = particle.vx * ENDOLYMPH_VISCOSITY + (gravityX + forceX) * particle.mass;
        let newVy = particle.vy * ENDOLYMPH_VISCOSITY + (gravityY + forceY) * particle.mass;

        // Apply fluid damping
        newVx *= FLUID_DAMPING;
        newVy *= FLUID_DAMPING;

        // Update position
        let newX = particle.x + newVx;
        let newY = particle.y + newVy;

        // Boundary collision with canal walls
        if (!isInsideCanal(newX, newY)) {
          // Find closest valid position
          let closestX = particle.x;
          let closestY = particle.y;
          let minDistance = Infinity;

          // Sample points around current position to find closest valid point
          for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
            for (let radius = 1; radius <= 20; radius += 2) {
              const testX = particle.x + Math.cos(angle) * radius;
              const testY = particle.y + Math.sin(angle) * radius;
              
              if (isInsideCanal(testX, testY)) {
                const distance = Math.sqrt((testX - newX) ** 2 + (testY - newY) ** 2);
                if (distance < minDistance) {
                  minDistance = distance;
                  closestX = testX;
                  closestY = testY;
                }
              }
            }
          }

          newX = closestX;
          newY = closestY;
          newVx *= -0.3; // Energy loss on collision
          newVy *= -0.3;
        }

        // Check if particle has settled
        const speed = Math.sqrt(newVx * newVx + newVy * newVy);
        const settled = speed < SETTLING_THRESHOLD;

        return {
          ...particle,
          x: newX,
          y: newY,
          vx: newVx,
          vy: newVy,
          settled: settled
        };
      });
    });
  }, [orientation, calculateParticleForces, isInsideCanal]);

  // Draw realistic particles
  const drawParticle = useCallback((ctx: CanvasRenderingContext2D, particle: Particle) => {
    ctx.save();
    ctx.translate(particle.x, particle.y);
    
    // Color based on movement state
    if (particle.settled) {
      ctx.fillStyle = '#C53030'; // Dark red when settled
    } else {
      ctx.fillStyle = '#E53E3E'; // Bright red when moving
    }

    // Draw irregular particle shape
    ctx.beginPath();
    const points = 6;
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const radius = particle.size * (0.8 + Math.random() * 0.4);
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();
    
    // Add slight glow effect for moving particles
    if (!particle.settled) {
      ctx.shadowColor = '#E53E3E';
      ctx.shadowBlur = 3;
      ctx.fill();
    }
    
    ctx.restore();
  }, []);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw canal system
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
        top: '15px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: '#2D3748',
        fontSize: '18px',
        fontWeight: '600'
      }}>
        Posterior Canal Otoconia Simulator
      </div>

      {/* Orientation display */}
      <div style={{
        position: 'absolute',
        top: '45px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: '#4A5568',
        fontSize: '12px',
        textAlign: 'center'
      }}>
        Tilt: {Math.round(orientation.gamma)}° | Roll: {Math.round(orientation.beta)}°
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
          maxWidth: '95vw',
          maxHeight: '75vh'
        }}
      />

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        bottom: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: '#4A5568',
        fontSize: '13px',
        textAlign: 'center',
        maxWidth: '700px',
        padding: '0 20px',
        lineHeight: '1.4'
      }}>
        <strong>Red particles (otoconia)</strong> respond to gravity and device tilt. 
        Watch them move through the canal system from the cupula toward the utricle!
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

      {/* Reset button */}
      <button
        onClick={() => window.location.reload()}
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          padding: '8px 16px',
          borderRadius: '6px',
          border: '1px solid #E2E8F0',
          backgroundColor: 'white',
          color: '#4A5568',
          fontSize: '12px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        Reset Particles
      </button>

      {/* Permission prompt */}
      {!permissionGranted && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          textAlign: 'center',
          maxWidth: '350px'
        }}>
          <h3 style={{ color: '#2D3748', marginBottom: '15px', fontSize: '16px' }}>
            Device Motion Required
          </h3>
          <p style={{ color: '#4A5568', marginBottom: '20px', fontSize: '14px', lineHeight: '1.4' }}>
            This simulation needs access to your device's motion sensors to demonstrate 
            how otoconia respond to head movements during repositioning maneuvers.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
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
      )}
    </div>
  );
} 