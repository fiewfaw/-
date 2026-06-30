'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh } from 'three'

const BODY = '#38e1ff'
const WIRE = '#8ff0ff'
const NODE = '#bdf6ff'

/** translucent capsule + wireframe overlay = one "bone" */
function Bone({
  position,
  radius,
  length,
  rotation,
}: {
  position: [number, number, number]
  radius: number
  length: number
  rotation?: [number, number, number]
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <capsuleGeometry args={[radius, length, 8, 18]} />
        <meshPhysicalMaterial
          color={BODY}
          transparent
          opacity={0.14}
          roughness={0.25}
          metalness={0}
          transmission={0.65}
          thickness={0.4}
          emissive="#0c3350"
          emissiveIntensity={0.4}
        />
      </mesh>
      <mesh>
        <capsuleGeometry args={[radius * 1.012, length, 5, 14]} />
        <meshBasicMaterial color={WIRE} wireframe transparent opacity={0.22} />
      </mesh>
    </group>
  )
}

function Ball({
  position,
  radius,
  opacity = 0.16,
}: {
  position: [number, number, number]
  radius: number
  opacity?: number
}) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[radius, 24, 24]} />
        <meshPhysicalMaterial
          color={BODY}
          transparent
          opacity={opacity}
          roughness={0.2}
          transmission={0.65}
          thickness={0.4}
          emissive="#0c3350"
          emissiveIntensity={0.4}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[radius * 1.012, 16, 16]} />
        <meshBasicMaterial color={WIRE} wireframe transparent opacity={0.2} />
      </mesh>
    </group>
  )
}

/** glowing emissive node (toneMapped off so Bloom catches it) */
function Node({
  position,
  size = 0.045,
  color = NODE,
}: {
  position: [number, number, number]
  size?: number
  color?: string
}) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  )
}

const JOINTS: [number, number, number][] = [
  [0, 1.5, 0], // neck
  [0.2, 1.42, 0], [-0.2, 1.42, 0], // shoulders
  [0.26, 1.12, 0], [-0.26, 1.12, 0], // elbows
  [0.26, 0.84, 0], [-0.26, 0.84, 0], // wrists
  [0.12, 0.92, 0], [-0.12, 0.92, 0], // hips
  [0.12, 0.5, 0], [-0.12, 0.5, 0], // knees
  [0.12, 0.09, 0], [-0.12, 0.09, 0], // ankles
]

const SPINE: [number, number, number][] = [
  [0, 0.98, 0], [0, 1.1, 0], [0, 1.22, 0], [0, 1.34, 0], [0, 1.44, 0],
]

export function HologramHuman() {
  const ring = useRef<Mesh>(null)
  const root = useRef<Group>(null)

  useFrame((state, delta) => {
    if (ring.current) ring.current.rotation.z += delta * 0.6
    if (root.current) {
      // subtle hologram bob
      root.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.015
    }
  })

  return (
    <group ref={root}>
      {/* head + neck */}
      <Ball position={[0, 1.66, 0]} radius={0.12} />
      <Bone position={[0, 1.5, 0]} radius={0.05} length={0.08} />

      {/* torso + pelvis */}
      <Bone position={[0, 1.22, 0]} radius={0.16} length={0.34} />
      <Ball position={[0, 0.95, 0]} radius={0.15} opacity={0.13} />

      {/* arms */}
      <Bone position={[0.24, 1.27, 0]} radius={0.055} length={0.26} />
      <Bone position={[-0.24, 1.27, 0]} radius={0.055} length={0.26} />
      <Bone position={[0.26, 0.99, 0]} radius={0.045} length={0.24} />
      <Bone position={[-0.26, 0.99, 0]} radius={0.045} length={0.24} />
      <Ball position={[0.26, 0.8, 0]} radius={0.05} />
      <Ball position={[-0.26, 0.8, 0]} radius={0.05} />

      {/* legs */}
      <Bone position={[0.12, 0.71, 0]} radius={0.075} length={0.34} />
      <Bone position={[-0.12, 0.71, 0]} radius={0.075} length={0.34} />
      <Bone position={[0.12, 0.29, 0]} radius={0.06} length={0.34} />
      <Bone position={[-0.12, 0.29, 0]} radius={0.06} length={0.34} />
      <Ball position={[0.12, 0.05, 0]} radius={0.055} />
      <Ball position={[-0.12, 0.05, 0]} radius={0.055} />

      {/* glowing joint nodes */}
      {JOINTS.map((p, i) => (
        <Node key={`j${i}`} position={p} />
      ))}

      {/* spine nodes */}
      {SPINE.map((p, i) => (
        <Node key={`s${i}`} position={p} size={0.03} color="#e6fbff" />
      ))}

      {/* chest core ring */}
      <mesh ref={ring} position={[0, 1.28, 0.02]}>
        <torusGeometry args={[0.13, 0.012, 12, 48]} />
        <meshBasicMaterial color="#7fe8ff" toneMapped={false} />
      </mesh>
      <Node position={[0, 1.28, 0.02]} size={0.05} color="#ffffff" />
    </group>
  )
}
