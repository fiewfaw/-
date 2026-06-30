'use client'
import { useEffect, useState } from 'react'

/**
 * Rotating body hologram — continuous 360° turntable through 8 AI-rendered angle
 * frames (transparent PNG→webp, ~20KB each). Pure images + CSS, so it spins on
 * every device with no WebGL or video codec. Plus a holographic float + scanline.
 */
const FRAMES = [
  '/holo/a000.webp', '/holo/a045.webp', '/holo/a090.webp', '/holo/a135.webp',
  '/holo/a180.webp', '/holo/a225.webp', '/holo/a270.webp', '/holo/a315.webp',
]

const CSS = `
@keyframes holoFloat { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(-6px) } }
@keyframes holoScan { 0%{ transform: translateY(-130%) } 100%{ transform: translateY(130%) } }
.holo-stage{ position:relative; width:100%; height:100%; overflow:hidden }
.holo-float{ position:absolute; inset:0;
  animation: holoFloat 6s ease-in-out infinite;
  filter: drop-shadow(0 0 14px rgba(56,225,255,.4)); }
.holo-frame{ position:absolute; inset:0; width:100%; height:100%; object-fit:contain;
  opacity:0; transition:opacity .18s linear }
.holo-frame.on{ opacity:1 }
.holo-scan{ position:absolute; left:0; right:0; height:38%; pointer-events:none; mix-blend-mode:screen;
  background:linear-gradient(180deg, transparent, rgba(56,225,255,.12), transparent);
  animation: holoScan 4.5s linear infinite }
`

export function HologramAvatar({ height = 380 }: { height?: number }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % FRAMES.length), 180)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        borderRadius: 16,
        overflow: 'hidden',
        background: 'radial-gradient(120% 100% at 50% 8%,#0b2236 0%,#04101e 60%,#02060d 100%)',
        border: '1px solid rgba(56,225,255,.18)',
      }}
    >
      <style>{CSS}</style>
      <div className="holo-stage">
        <div className="holo-float">
          {FRAMES.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              className={`holo-frame${i === step ? ' on' : ''}`}
              src={src}
              alt="Body hologram"
            />
          ))}
        </div>
        <div className="holo-scan" />
      </div>
    </div>
  )
}
