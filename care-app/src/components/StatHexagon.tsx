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
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="mx-auto block w-full max-w-[280px]"
      style={{ filter: 'drop-shadow(0 0 8px rgba(56,225,255,.5))' }}
      role="img" aria-label="สเตตัสร่างกาย">
      <polygon points={gridPoints} fill="none" stroke="rgba(56,225,255,0.3)" strokeWidth={1} />
      <polygon points={gridPoints.split(' ').map((p) => {
        const [x, y] = p.split(',').map(Number)
        return `${CX + (x - CX) * 0.5},${CY + (y - CY) * 0.5}`
      }).join(' ')} fill="none" stroke="rgba(56,225,255,0.16)" strokeWidth={1} />
      <polygon data-testid="value-polygon" points={valuePoints}
        fill="rgba(56,225,255,0.22)" stroke="#38e1ff" strokeWidth={2} />
      {STAT_KEYS.map((k, i) => {
        const [lx, ly] = point(i, R + 22)
        return (
          <text key={k} x={lx} y={ly} fontSize={13} fill="#8fd6f5"
            textAnchor="middle" dominantBaseline="middle">
            {STAT_LABELS_TH[k]}
          </text>
        )
      })}
    </svg>
  )
}
