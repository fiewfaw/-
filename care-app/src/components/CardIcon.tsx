'use client'
import { useEffect, useRef, useState } from 'react'

// Cross-fades a frame sequence to animate on hover. When not playing, it rests
// on frame 0. Falls back to the emoji when no frames are provided.
export function CardIcon({
  frames,
  playing,
  emoji,
  size = 40,
}: {
  frames?: string[]
  playing: boolean
  emoji: string
  size?: number
}) {
  const [idx, setIdx] = useState(0)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!frames || !playing) {
      if (timer.current) {
        clearInterval(timer.current)
        timer.current = null
      }
      setIdx(0)
      return
    }
    timer.current = setInterval(
      () => setIdx((i) => (i + 1) % frames.length),
      110,
    )
    return () => {
      if (timer.current) clearInterval(timer.current)
      timer.current = null
    }
  }, [frames, playing])

  if (!frames) return <span className="text-3xl">{emoji}</span>

  return (
    <span className="card-icon" style={{ width: size, height: size }}>
      {frames.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={src} src={src} alt="" aria-hidden style={{ opacity: i === idx ? 1 : 0 }} />
      ))}
    </span>
  )
}
