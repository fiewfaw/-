'use client'
import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const MODEL = '/models/human.glb'
useGLTF.preload(MODEL)

/**
 * Real humanoid GLB rendered as a cyan medical hologram: glowing wireframe
 * skin + faint translucent body. Camera auto-rotates via OrbitControls.
 */
export function HologramModel() {
  const { scene } = useGLTF(MODEL)

  const { object, scale, position } = useMemo(() => {
    // fit BEFORE swapping materials (geometry unchanged)
    const box = new THREE.Box3().setFromObject(scene)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const s = 1.95 / (size.y || 1)

    scene.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (mesh.isMesh) {
        mesh.frustumCulled = false
        mesh.material = new THREE.MeshBasicMaterial({
          color: 0x38e1ff,
          wireframe: true,
          transparent: true,
          opacity: 0.5,
          toneMapped: false,
        })
      }
    })

    return {
      object: scene,
      scale: s,
      position: [-center.x * s, -box.min.y * s, -center.z * s] as [number, number, number],
    }
  }, [scene])

  return (
    <group scale={scale} position={position}>
      <primitive object={object} />
    </group>
  )
}
