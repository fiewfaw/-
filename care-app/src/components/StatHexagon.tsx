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
  const valueXY = STAT_KEYS.map((k, i) => point(i, (stats[k] / 100) * R))
  const valuePoints = valueXY.map((p) => p.join(',')).join(' ')
  // value polygon as % of the square box → clip the radar sweep to the blue area only
  const clipPoly = valueXY
    .map(([x, y]) => `${((x / SIZE) * 100).toFixed(2)}% ${((y / SIZE) * 100).toFixed(2)}%`)
    .join(', ')

  return (
    <div className="hex-wrap">
      {/* clockwise radar sweep — clipped to the blue stat polygon only */}
      <div className="hex-radar-clip" style={{ clipPath: `polygon(${clipPoly})` }}>
        <div className="hex-radar-spin" />
      </div>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="relative block w-full"
        style={{ filter: 'drop-shadow(0 0 8px rgba(56,225,255,.5))' }}
        role="img"
        aria-label="สเตตัสร่างกาย"
      >
        {/* radial spokes for radar feel */}
        {STAT_KEYS.map((_, i) => {
          const [x, y] = point(i, R)
          return (
            <line key={`sp${i}`} x1={CX} y1={CY} x2={x} y2={y}
              stroke="rgba(56,225,255,0.14)" strokeWidth={1} />
          )
        })}
        <polygon points={gridPoints} fill="none" stroke="rgba(56,225,255,0.3)" strokeWidth={1} />
        <polygon points={STAT_KEYS.map((_, i) => point(i, R * 0.5).join(',')).join(' ')}
          fill="none" stroke="rgba(56,225,255,0.16)" strokeWidth={1} />
        <polygon data-testid="value-polygon" points={valuePoints}
          fill="rgba(56,225,255,0.22)" stroke="#38e1ff" strokeWidth={2} />

        {/* value vertices — alternate blinking */}
        {valueXY.map(([x, y], i) => (
          <circle key={`nd${i}`} cx={x} cy={y} r={3.6} fill="#bdf6ff"
            className={i % 2 === 0 ? 'hex-node-a' : 'hex-node-b'} />
        ))}

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
    </div>
  )
}
