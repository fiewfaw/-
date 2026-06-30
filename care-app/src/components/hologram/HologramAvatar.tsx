'use client'
import { useEffect, useState } from 'react'

/**
 * Premium rotating body hologram. Cross-fades through AI-rendered angle frames
 * (left → front → right → front) to read as a turning 3D figure, with a
 * holographic float + glow-pulse + scanline. Pure images + CSS, so it plays on
 * every device — no WebGL or video codec needed.
 */
const FRAMES = ['/holo/left.webp', '/holo/front.webp', '/holo/right.webp', '/holo/front.webp']
const UNIQUE = ['/holo/left.webp', '/holo/front.webp', '/holo/right.webp']

const CSS = `
@keyframes holoFloat { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(-7px) } }
@keyframes holoPulse { 0%,100%{ filter: drop-shadow(0 0 10px rgba(56,225,255,.3)) brightness(1) } 50%{ filter: drop-shadow(0 0 20px rgba(56,225,255,.55)) brightness(1.06) } }
@keyframes holoScan { 0%{ transform: translateY(-130%) } 100%{ transform: translateY(130%) } }
.holo-stage{ position:relative; width:100%; height:100%; overflow:hidden }
.holo-float{ position:absolute; inset:0; animation: holoFloat 6s ease-in-out infinite, holoPulse 3.4s ease-in-out infinite }
.holo-frame{ position:absolute; inset:0; width:100%; height:100%; object-fit:contain;
  opacity:0; transition:opacity .85s ease-in-out }
.holo-frame.on{ opacity:1 }
.holo-scan{ position:absolute; left:0; right:0; height:40%; pointer-events:none; mix-blend-mode:screen;
  background:linear-gradient(180deg, transparent, rgba(56,225,255,.14), transparent);
  animation: holoScan 4s linear infinite }
`

export function HologramAvatar({ height = 380 }: { height?: number }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % FRAMES.length), 1300)
    return () => clearInterval(id)
  }, [])

  const activeSrc = FRAMES[step]

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
          {UNIQUE.map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              className={`holo-frame${src === activeSrc ? ' on' : ''}`}
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
