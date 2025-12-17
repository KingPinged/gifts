import React, { useRef, Suspense, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF, OrbitControls } from '@react-three/drei'
import { useGiftStore } from '../store'
import * as THREE from 'three'

interface SceneProps {
  onGiftClick: () => void
}

export default function Scene({ onGiftClick }: SceneProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0)
    }
    checkMobile()
  }, [])

  return (
    <>
      <color attach="background" args={['#1a1a2e']} />
      <fog attach="fog" args={['#1a1a2e', 10, 45]} />

      <Lighting />
      <Suspense fallback={null}>
        <WinterEnvironment />
      </Suspense>
      <GiftBox onClick={onGiftClick} />
      <Snow />

      {isMobile ? (
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2.2}
          minAzimuthAngle={-Math.PI / 6}
          maxAzimuthAngle={Math.PI / 6}
        />
      ) : (
        <MouseParallaxCamera />
      )}
    </>
  )
}

function MouseParallaxCamera() {
  const { camera } = useThree()
  const mouse = useRef({ x: 0, y: 0 })
  const targetPosition = useRef({ x: 6, y: 10, z: 8 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useFrame(() => {
    // Subtle camera movement based on mouse position
    const targetX = 5 + mouse.current.x * 1.5
    const targetY = 3 + mouse.current.y * 0.5
    const targetZ = 7

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.05)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.05)
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05)

    camera.lookAt(0, -2, 0)
  })

  return null
}

function Lighting() {
  return (
    <>
      <ambientLight intensity={0.5} color="#b4c6e7" />
      <directionalLight
        position={[10, 15, 10]}
        intensity={1.2}
        color="#fff5e6"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-5, 8, -5]} intensity={0.4} color="#e6f0ff" />
      <pointLight position={[0, 3, 0]} intensity={1} color="#ffd700" distance={8} />
      <hemisphereLight args={['#87ceeb', '#3d5c5c', 0.4]} />
    </>
  )
}

function WinterEnvironment() {
  const { scene } = useGLTF('/models/small_winter_scene/scene.gltf')
  const groupRef = useRef<THREE.Group>(null)
  const baseRotationY = Math.PI * -0.1 // Adjust this value to rotate the scene

  useFrame((state) => {
    if (groupRef.current) {
      // Add gentle sway animation on top of base rotation
      groupRef.current.rotation.y = baseRotationY + Math.sin(state.clock.elapsedTime * 0.03) * 0.02
    }
  })

  return (
    <group ref={groupRef} position={[0, -3, -1]} scale={[0.3, 0.3, 0.3]}>
      <primitive object={scene} />
    </group>
  )
}

// Preload the model
useGLTF.preload('/models/small_winter_scene/scene.gltf')

function GiftBox({ onClick }: { onClick: () => void }) {
  const { scene } = useGLTF('/models/giftbox/scene.gltf')
  const groupRef = useRef<THREE.Group>(null)
  const { giftState, setGiftState } = useGiftStore()
  const baseY = -3

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime

    if (giftState === 'idle' || giftState === 'hovering') {
      groupRef.current.position.y = baseY + Math.sin(t * 0.8) * 0.1
      groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.1
    }
  })

  const handlePointerOver = () => {
    if (giftState === 'idle') {
      document.body.style.cursor = 'pointer'
      setGiftState('hovering')
      if (groupRef.current) {
        groupRef.current.scale.setScalar(1.1)
      }
    }
  }

  const handlePointerOut = () => {
    if (giftState === 'hovering') {
      document.body.style.cursor = 'default'
      setGiftState('idle')
      if (groupRef.current) {
        groupRef.current.scale.setScalar(1)
      }
    }
  }

  const handleClick = (e: any) => {
    e.stopPropagation()
    if (giftState === 'idle' || giftState === 'hovering') {
      document.body.style.cursor = 'default'
      onClick()
    }
  }

  const isInteractive = giftState === 'idle' || giftState === 'hovering'

  return (
    <group
      ref={groupRef}
      position={[0, baseY, 0]}
      scale={[1, 1, 1]}
      onPointerOver={isInteractive ? handlePointerOver : undefined}
      onPointerOut={isInteractive ? handlePointerOut : undefined}
      onClick={isInteractive ? handleClick : undefined}
    >
      <primitive object={scene} />
    </group>
  )
}

// Preload giftbox model
useGLTF.preload('/models/giftbox/scene.gltf')

function Snow() {
  const pointsRef = useRef<THREE.Points>(null)
  const count = 600 // Balance between visual density and performance

  // Scene bounds for snow coverage
  const bounds = {
    x: 25,  // Width of snow area
    y: 20,  // Height (how high snow starts)
    z: 25   // Depth of snow area
  }

  // Store initial data for each snowflake
  const snowData = React.useMemo(() => {
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const speeds = new Float32Array(count)
    const offsets = new Float32Array(count) // For varied drift patterns

    for (let i = 0; i < count; i++) {
      // Spread snow across the entire scene
      positions[i * 3] = (Math.random() - 0.5) * bounds.x
      positions[i * 3 + 1] = Math.random() * bounds.y - 3 // Start from -3 to bounds.y-3
      positions[i * 3 + 2] = (Math.random() - 0.5) * bounds.z

      // Vary snowflake sizes (smaller ones fall slower, larger fall faster)
      sizes[i] = 0.03 + Math.random() * 0.08

      // Fall speed varies with size (larger = faster, like real snow)
      speeds[i] = 0.01 + sizes[i] * 0.15

      // Random offset for drift pattern variation
      offsets[i] = Math.random() * Math.PI * 2
    }

    return { positions, sizes, speeds, offsets }
  }, [])

  useFrame((state) => {
    if (!pointsRef.current) return

    const t = state.clock.elapsedTime
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array
    const { speeds, offsets } = snowData

    for (let i = 0; i < count; i++) {
      const i3 = i * 3

      // Vertical fall with individual speed
      pos[i3 + 1] -= speeds[i]

      // Horizontal drift - gentle sine wave motion (wind effect)
      const driftX = Math.sin(t * 0.5 + offsets[i]) * 0.003
      const driftZ = Math.cos(t * 0.3 + offsets[i] * 1.5) * 0.002

      pos[i3] += driftX
      pos[i3 + 2] += driftZ

      // Reset snowflake when it falls below ground
      if (pos[i3 + 1] < -5) {
        pos[i3 + 1] = bounds.y - 3
        // Randomize X and Z position when recycling
        pos[i3] = (Math.random() - 0.5) * bounds.x
        pos[i3 + 2] = (Math.random() - 0.5) * bounds.z
      }

      // Keep snow within horizontal bounds (wrap around)
      if (pos[i3] > bounds.x / 2) pos[i3] = -bounds.x / 2
      if (pos[i3] < -bounds.x / 2) pos[i3] = bounds.x / 2
      if (pos[i3 + 2] > bounds.z / 2) pos[i3 + 2] = -bounds.z / 2
      if (pos[i3 + 2] < -bounds.z / 2) pos[i3 + 2] = bounds.z / 2
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={snowData.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={snowData.sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        color="#ffffff"
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
