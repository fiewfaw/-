import { STAT_KEYS, STAT_LABELS_TH, type StatRadar } from '@/lib/types'

const SIZE = 240
const CX = SIZE / 2
const CY = SIZE / 2
const R = 90

function point(index: number, radius: number) {
  // start at top (-90deg), 6 axes clockwise
  const angle = (-90 + index * 60) * (Math.PI / 180)
  return [CX + radius * Math.cos(angle), CY + radius * Math.sin(angle)] as const
}

export function StatHexagon({ stats }: { stats: StatRadar }) {
  const gridPoints = STAT_KEYS.map((_, i) => point(i, R).join(',')).join(' ')
  const valuePoints = STAT_KEYS
    .map((k, i) => point(i, (stats[k] / 100) * R).join(','))
    .join(' ')

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-[280px]" role="img" aria-label="สเตตัสร่างกาย">
      <polygon points={gridPoints} fill="none" stroke="#cbd5e1" strokeWidth={1} />
      <polygon points={gridPoints.split(' ').map((p) => {
        const [x, y] = p.split(',').map(Number)
        return `${CX + (x - CX) * 0.5},${CY + (y - CY) * 0.5}`
      }).join(' ')} fill="none" stroke="#e2e8f0" strokeWidth={1} />
      <polygon data-testid="value-polygon" points={valuePoints}
        fill="rgba(43,124,184,0.35)" stroke="#2b7cb8" strokeWidth={2} />
      {STAT_KEYS.map((k, i) => {
        const [lx, ly] = point(i, R + 22)
        return (
          <text key={k} x={lx} y={ly} fontSize={13} fill="#0f3a5f"
            textAnchor="middle" dominantBaseline="middle">
            {STAT_LABELS_TH[k]}
          </text>
        )
      })}
    </svg>
  )
}
