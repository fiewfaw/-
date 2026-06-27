import type { JourneyPack } from '@/lib/engine/pack'

export type Answers = Record<string, string>

export function resolveStage(pack: JourneyPack, answers: Answers): string {
  const counts = new Map<string, number>()
  for (const q of pack.screeningQuestions) {
    const optId = answers[q.id]
    if (!optId) continue
    const opt = q.options.find((o) => o.id === optId)
    if (!opt?.stage) continue
    counts.set(opt.stage, (counts.get(opt.stage) ?? 0) + 1)
  }
  let best = pack.stages[0].id
  let bestCount = -1
  for (const stage of pack.stages) {
    const c = counts.get(stage.id) ?? 0
    if (c > bestCount) {
      best = stage.id
      bestCount = c
    }
  }
  return best
}
