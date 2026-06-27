import type { JourneyPack } from '@/lib/engine/pack'
import type { Answers } from '@/lib/engine/scoring'

export function selectReadout(pack: JourneyPack, stageId: string) {
  return pack.freeReadout[stageId] ?? { summary: '', starterTechniques: [] }
}

export function detectRedFlags(pack: JourneyPack, answers: Answers): string[] {
  return pack.redFlags
    .filter((rf) => answers[rf.questionId] === rf.optionId)
    .map((rf) => rf.message)
}
