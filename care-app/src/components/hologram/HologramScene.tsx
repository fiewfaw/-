'use client'
import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Line } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import type { Group } from 'three'
import { HologramModel } from './HologramModel'

const CYAN = '#38e1ff'

/** octagonal glowing platform with radial spokes */
function Platform() {
  const spokes = useRef<Group>(null)
  const R = 1.15

  const octagon = useMemo<[number, number, number][]>(() => {
    const pts: [number, number, number][] = []
    for (let i = 0; i <= 8; i++) {
      const a = Math.PI / 8 + (i * Math.PI) / 4
      pts.push([Math.cos(a) * R, 0, Math.sin(a) * R])
    }
    return pts
  }, [])

  const innerOct = useMemo<[number, number, number][]>(
    () => octagon.map(([x, , z]) => [x * 0.62, 0, z * 0.62]),
    [octagon],
  )

  useFrame((_, delta) => {
    if (spokes.current) spokes.current.rotation.y += delta * 0.15
  })

  return (
    <group position={[0, 0, 0]}>
      {/* translucent octagon fill */}
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 8]} position={[0, 0.002, 0]}>
        <circleGeometry args={[R * 0.98, 8]} />
        <meshBasicMaterial color="#0a2740" transparent opacity={0.35} />
      </mesh>
      {/* outer + inner glowing rings */}
      <Line points={octagon} color={CYAN} lineWidth={2} transparent opacity={0.9} />
      <Line points={innerOct} color={CYAN} lineWidth={1} transparent opacity={0.5} />
      {/* rotating radial spokes */}
      <group ref={spokes}>
        {octagon.slice(0, 8).map((p, i) => (
          <Line
            key={i}
            points={[[0, 0.001, 0], p]}
            color={CYAN}
            lineWidth={1}
            transparent
            opacity={0.25}
          />
        ))}
      </group>
      {/* base glow disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <circleGeometry args={[R * 1.6, 48]} />
        <meshBasicMaterial color="#06243a" transparent opacity={0.5} />
      </mesh>
    </group>
  )
}

export default function HologramScene() {
  return (
    <Canvas
      camera={{ position: [0, 1.15, 4.0], fov: 42 }}
      gl={{ antialias: true, alpha: false }}
      dpr={[1, 2]}
    >
      <color attach="background" args={['#03070f']} />
      <fog attach="fog" args={['#03070f', 4.5, 9]} />

      <ambientLight intensity={0.6} color="#bfe9ff" />
      <pointLight position={[2, 3, 2]} intensity={18} color="#38e1ff" />
      <pointLight position={[-2, 1, -2]} intensity={10} color="#1d6fb0" />

      <Suspense fallback={null}>
        <HologramModel />
      </Suspense>
      <Platform />

      <OrbitControls
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.9}
        minDistance={2.2}
        maxDistance={6}
        target={[0, 1.0, 0]}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.8}
      />

      <EffectComposer>
        <Bloom mipmapBlur luminanceThreshold={0.2} intensity={1.25} radius={0.75} />
      </EffectComposer>
    </Canvas>
  )
}
