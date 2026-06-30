'use client'
import { Component, useEffect, useState, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { hasWebGL } from '@/lib/webgl'

const HologramScene = dynamic(() => import('@/components/hologram/HologramScene'), {
  ssr: false,
})

const FALLBACK_NOTE = '3D preview requires WebGL'

function Fallback() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hologram-reference.png"
        alt="Medical hologram preview"
        style={{ maxWidth: '92%', maxHeight: '78%', objectFit: 'contain', opacity: 0.95 }}
      />
      <p style={{ color: '#7fa6c4', fontSize: 13, letterSpacing: '.08em' }}>{FALLBACK_NOTE}</p>
    </div>
  )
}

/** if three/WebGL throws at runtime, show the static fallback */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? <Fallback /> : this.props.children
  }
}

function Hud() {
  const corner = (style: React.CSSProperties): React.CSSProperties => ({
    position: 'absolute',
    width: 26,
    height: 26,
    borderColor: 'rgba(56,225,255,.55)',
    ...style,
  })
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2 }}>
      <div style={corner({ top: 16, left: 16, borderTop: '2px solid', borderLeft: '2px solid' })} />
      <div style={corner({ top: 16, right: 16, borderTop: '2px solid', borderRight: '2px solid' })} />
      <div style={corner({ bottom: 16, left: 16, borderBottom: '2px solid', borderLeft: '2px solid' })} />
      <div style={corner({ bottom: 16, right: 16, borderBottom: '2px solid', borderRight: '2px solid' })} />
      <div style={{ position: 'absolute', top: 22, left: 52 }}>
        <div
          style={{
            color: '#38e1ff',
            fontSize: 11,
            letterSpacing: '.34em',
            textTransform: 'uppercase',
            textShadow: '0 0 12px rgba(56,225,255,.6)',
            fontWeight: 700,
          }}
        >
          Baan Physio · Body Hologram
        </div>
        <div style={{ color: '#5f87a6', fontSize: 11, marginTop: 4, letterSpacing: '.05em' }}>
          MEDICAL SCAN · INTERACTIVE 3D
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#5f87a6',
          fontSize: 12,
          letterSpacing: '.06em',
        }}
      >
        ลากเพื่อหมุน · เลื่อนเพื่อซูม
      </div>
    </div>
  )
}

export default function HologramPage() {
  const [mounted, setMounted] = useState(false)
  const [webgl, setWebgl] = useState(true)

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setMounted(true)
      setWebgl(hasWebGL())
    })
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <main
      style={{
        position: 'fixed',
        inset: 0,
        background: 'radial-gradient(1100px 760px at 50% 8%,#0b2236 0%,#05101e 55%,#02050c 100%)',
        overflow: 'hidden',
      }}
    >
      {mounted && webgl ? (
        <SceneBoundary>
          <HologramScene />
        </SceneBoundary>
      ) : mounted ? (
        <Fallback />
      ) : null}
      <Hud />
    </main>
  )
}
