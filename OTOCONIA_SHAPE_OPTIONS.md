# Otoconia Particle Shape Options - Future Enhancement

## Current State
- **Current Shape**: Perfect circles (purple, `#8A2BE2`)
- **Rendering Method**: HTML5 Canvas 2D context using `ctx.arc()`
- **Size**: ~6 pixels radius (1/8th of tube width)
- **Properties**: No rotation/orientation tracking
- **File**: `components/CanalSimulation.tsx` (lines 860-868)

## Electron Microscope Reference
Real otoconia (ear crystals) have these characteristics:
- **Oblong/elliptical** shape (not circular)
- **Irregular, organic edges** (not perfectly smooth)
- **Varied sizes** with length typically 1.5-2x the width
- **Slightly faceted** appearance (calcium carbonate crystalline structure)
- **Textured surface** with subtle irregularities
- **3D barrel/rice grain** appearance

---

## Shape Option 1: Ellipses (Simple Oblong)

### Description
Replace circles with ellipses using Canvas `ellipse()` method.

### Visual Characteristics
- Smooth, oblong shape
- 1.5:1 or 2:1 aspect ratio (length:width)
- Rotates dynamically as particle moves
- Still has smooth edges (not jagged)

### Implementation Approach
```typescript
// Add to Particle interface:
interface Particle {
  // ... existing properties
  angle: number           // Rotation angle in radians
  angularVelocity: number // Rotation speed
  width: number           // Minor axis (shorter dimension)
  height: number          // Major axis (longer dimension)
}

// Drawing code:
ctx.save()
ctx.translate(particle.x, particle.y)
ctx.rotate(particle.angle)
ctx.beginPath()
ctx.ellipse(0, 0, particle.width, particle.height, 0, 0, Math.PI * 2)
ctx.fill()
ctx.restore()
```

### Pros
- Native Canvas API support
- Simple to implement
- Smooth animation
- Minimal performance impact
- Maintains clean, medical illustration style

### Cons
- Still has perfectly smooth edges (doesn't capture crystalline texture)
- May look too "polished" compared to real otoconia

---

## Shape Option 2: Rounded Rectangles (Pill Shape)

### Description
Draw rounded rectangles to create a pill/capsule shape.

### Visual Characteristics
- Oblong with rounded ends
- Flat sides with semicircular caps
- More geometric than organic
- Aspect ratio: 2:1 or 3:1

### Implementation Approach
```typescript
// Drawing code:
ctx.save()
ctx.translate(particle.x, particle.y)
ctx.rotate(particle.angle)
ctx.beginPath()
ctx.roundRect(-width/2, -height/2, width, height, height/2)
ctx.fill()
ctx.restore()
```

### Pros
- Clean, recognizable shape
- Good visual distinction from circles
- Built-in Canvas API (`roundRect`)
- Maintains medical illustration aesthetic

### Cons
- Less organic than real otoconia
- Edges still smooth (no jagged texture)
- May look too "artificial"

---

## Shape Option 3: Irregular Polygons (Faceted Crystals)

### Description
Draw custom polygons with 6-8 vertices to simulate crystalline facets.

### Visual Characteristics
- Irregular hexagon or octagon shapes
- Slightly varied vertex positions for organic feel
- Each particle has unique shape (procedurally generated)
- Captures crystalline/mineral nature of otoconia

### Implementation Approach
```typescript
// Generate random vertices for each particle:
interface Particle {
  // ... existing properties
  vertices: Array<{x: number, y: number}> // 6-8 points
  angle: number
}

// Drawing code:
ctx.save()
ctx.translate(particle.x, particle.y)
ctx.rotate(particle.angle)
ctx.beginPath()
ctx.moveTo(particle.vertices[0].x, particle.vertices[0].y)
particle.vertices.forEach(v => ctx.lineTo(v.x, v.y))
ctx.closePath()
ctx.fill()
ctx.restore()
```

### Pros
- Captures crystalline nature
- Each particle looks unique
- More realistic representation
- Creates visual interest

### Cons
- More complex collision detection needed
- Slightly higher computational cost
- May look "busy" at small sizes
- Vertices need careful tuning to avoid sharp points

---

## Shape Option 4: Bezier Curve Blobs (Organic Irregular)

### Description
Use cubic Bezier curves to create smooth but irregular organic shapes.

### Visual Characteristics
- Oblong with subtle irregularities
- Smooth flowing edges (no sharp corners)
- Each particle has unique silhouette
- More "natural" than geometric shapes

### Implementation Approach
```typescript
// Generate control points for Bezier curves:
interface Particle {
  // ... existing properties
  controlPoints: Array<{
    x: number, y: number,
    cpx1: number, cpy1: number,
    cpx2: number, cpy2: number
  }>
  angle: number
}

// Drawing code using bezierCurveTo():
ctx.save()
ctx.translate(particle.x, particle.y)
ctx.rotate(particle.angle)
ctx.beginPath()
ctx.moveTo(particle.controlPoints[0].x, particle.controlPoints[0].y)
particle.controlPoints.forEach(cp => {
  ctx.bezierCurveTo(cp.cpx1, cp.cpy1, cp.cpx2, cp.cpy2, cp.x, cp.y)
})
ctx.closePath()
ctx.fill()
ctx.restore()
```

### Pros
- Very organic appearance
- Smooth edges
- Visually interesting without being harsh
- Each particle unique

### Cons
- Most complex to implement
- Collision detection requires more work
- May be overkill for small particle sizes

---

## Shape Option 5: Image-Based Sprites

### Description
Use pre-rendered PNG images of otoconia in multiple rotations.

### Visual Characteristics
- Can capture exact texture from electron microscope
- Multiple rotation frames (e.g., 12 angles)
- Most realistic visual appearance
- Can include shading and depth

### Implementation Approach
```typescript
// Preload sprite images:
const particleSprites = [
  new Image(), // 0°
  new Image(), // 30°
  new Image(), // 60°
  // ... etc
]

// Drawing code:
const angleIndex = Math.floor((particle.angle / (Math.PI * 2)) * 12) % 12
ctx.drawImage(
  particleSprites[angleIndex],
  particle.x - particle.radius,
  particle.y - particle.radius,
  particle.radius * 2,
  particle.radius * 2
)
```

### Pros
- Maximum realism
- Can use actual electron microscope image as source
- No shape computation needed
- Consistent appearance

### Cons
- Requires asset creation/management
- More memory usage (multiple images)
- Less scalable (looks pixelated when resized)
- Overkill for educational simulation

---

## Shape Option 6: Hybrid - Ellipse with Texture ⭐ RECOMMENDED

### Description
Combine ellipse shape with procedural texture overlay to add surface irregularities.

### Visual Characteristics
- Base shape: Ellipse (1.7:1 ratio)
- Add subtle jagged edge effect using small random offsets
- Optional: Add fill pattern or gradient for dimension
- Balances realism with performance

### Implementation Approach
```typescript
interface Particle {
  // ... existing properties
  angle: number
  width: number
  height: number
  edgeNoise: number[] // Random offsets for edge irregularity
}

// Drawing code:
ctx.save()
ctx.translate(particle.x, particle.y)
ctx.rotate(particle.angle)

// Draw base ellipse
ctx.beginPath()
ctx.ellipse(0, 0, particle.width, particle.height, 0, 0, Math.PI * 2)
ctx.fill()

// Optional: Add subtle edge irregularity using small circles/bumps
for (let i = 0; i < 8; i++) {
  const angle = (i / 8) * Math.PI * 2
  const noise = particle.edgeNoise[i] || 0
  const x = Math.cos(angle) * (particle.width + noise)
  const y = Math.sin(angle) * (particle.height + noise)
  ctx.beginPath()
  ctx.arc(x, y, 0.5, 0, Math.PI * 2)
  ctx.fill()
}

ctx.restore()
```

### Pros
- Balances simplicity and realism
- Captures oblong shape and irregular edges
- Good performance
- Visually distinct from circles
- Scalable approach

### Cons
- Slightly more complex than simple ellipse
- Need to tune edge noise carefully

---

## Physics Considerations for Rotation

All non-circular shapes require adding angular physics:

```typescript
// Physics updates needed in updatePhysics():
// 1. Calculate angular acceleration from collisions
// 2. Update angular velocity with damping
// 3. Update angle based on angular velocity

// Pseudo-code:
particle.angularVelocity *= 0.98  // Angular damping
particle.angle += particle.angularVelocity

// On collision, add torque:
const collisionTorque = calculateTorque(collision)
particle.angularVelocity += collisionTorque
```

**Performance Note**: Angular physics adds minimal computational overhead (<5% for 4 particles).

---

## Collision Detection Updates

For non-circular shapes, collision detection becomes more complex:

### Option A: Use Bounding Circle (Simplest)
- Keep current circle-based collision
- Use particle's maximum dimension as collision radius
- Fast but less accurate

### Option B: Separating Axis Theorem (SAT)
- Accurate polygon collision detection
- More computation per frame
- Overkill for 4 particles

### Option C: Hybrid Approach ⭐ RECOMMENDED
- Use circle approximation for particle-to-particle
- Use circle approximation for particle-to-wall
- Visual shape is non-circular but physics treats it as circular
- **This is what most games do for performance**

---

## Implementation Checklist

When ready to implement, follow these steps:

1. **Update Particle Interface**
   - Add `angle`, `angularVelocity`, shape dimensions
   - Location: `components/CanalSimulation.tsx` lines 6-16

2. **Initialize Particles**
   - Set random initial angles, generate shape data
   - Location: `initializeParticles()` function, lines 103-178

3. **Update Physics**
   - Add angular velocity updates and damping
   - Location: `updatePhysics()` function, lines 435-710

4. **Modify Draw Function**
   - Replace circle drawing with chosen shape
   - Location: Draw particles section, lines 860-868

5. **Test Collision**
   - Verify existing collision still works reasonably
   - May need minor adjustments to collision detection

6. **Tune Parameters**
   - Adjust aspect ratios, edge noise, rotation speeds
   - Test with different device orientations

---

## Design Decisions to Make

Before implementing, decide on:

1. **Visual Priority**: Medical accuracy vs. clean illustration style
2. **Complexity**: Simple (ellipses) vs. textured (hybrid)
3. **Rotation**: Visible tumbling vs. static orientation
4. **Edge Treatment**: Subtle vs. pronounced irregularities
5. **Color Scheme**: Keep purple for visibility vs. realistic beige/white

---

## Reference Files

- **Main Component**: [`components/CanalSimulation.tsx`](components/CanalSimulation.tsx)
  - Particle interface: lines 6-16
  - Initialization: lines 103-178
  - Physics: lines 435-710
  - Drawing: lines 762-1036
  - Particle rendering: lines 860-868

---

## Future Enhancements

Additional ideas to consider:
- Add subtle gradient/shading to particles for depth
- Implement particle size variation (otoconia aren't all identical)
- Add slight wobble animation when particles are stationary
- Consider color variation for different dissolution states
- Add particle shadows for 3D effect

---

**Status**: ON HOLD - Pending more pressing edits
**Created**: 2025-12-17
**Electron Microscope Image**: Provided by user, shows oblong faceted crystals
