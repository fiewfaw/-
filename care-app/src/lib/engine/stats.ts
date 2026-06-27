import { STAT_KEYS, type StatRadar } from '@/lib/types'
import type { JourneyPack } from '@/lib/engine/pack'
import type { Answers } from '@/lib/engine/scoring'

const clamp = (n: number) => Math.max(0, Math.min(100, n))

export function computeStats(pack: JourneyPack, answers: Answers): StatRadar {
  const radar = Object.fromEntries(STAT_KEYS.map((k) => [k, 50])) as StatRadar
  for (const q of pack.screeningQuestions) {
    const opt = q.options.find((o) => o.id === answers[q.id])
    if (!opt) continue
    for (const k of STAT_KEYS) {
      const delta = opt.stats[k]
      if (typeof delta === 'number') radar[k] += delta
    }
  }
  for (const k of STAT_KEYS) radar[k] = clamp(radar[k])
  return radar
}
