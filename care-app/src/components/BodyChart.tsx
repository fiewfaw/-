export type Marker = { x: number; y: number; kind: 'pain' | 'weakness' | 'sensory' | 'movement' }

const COLOR: Record<Marker['kind'], string> = {
  pain: '#ef4444',       // 🔴
  weakness: '#f97316',   // 🟧
  sensory: '#eab308',    // 🟡
  movement: '#3b82f6',   // 🔵
}

export function BodyChart({ markers }: { markers: Marker[] }) {
  return (
    <div className="relative w-full max-w-[320px] mx-auto">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/body-chart.jpg" alt="แผนภาพร่างกาย" className="w-full" />
      {markers.map((m, i) => (
        <span key={i} data-marker={m.kind}
          className="absolute h-3 w-3 rounded-full ring-2 ring-white -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${m.x}%`, top: `${m.y}%`, background: COLOR[m.kind] }} />
      ))}
    </div>
  )
}
