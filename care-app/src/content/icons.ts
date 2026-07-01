// Animated holographic icon frame sequences per goal (cross-faded on hover).
// Files live in public/icons/<cat>/<cat>_0N.webp
const seq = (cat: string, n: number) =>
  Array.from({ length: n }, (_, i) => `/icons/${cat}/${cat}_0${i + 1}.webp`)

export const GOAL_ICON_FRAMES: Record<string, string[]> = {
  rehab: seq('rehab', 6),
  elderly: seq('elderly', 8),
  sport: seq('sport', 6),
}
