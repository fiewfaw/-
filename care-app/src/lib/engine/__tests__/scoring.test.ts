import { describe, it, expect } from 'vitest'
import { resolveStage, type Answers } from '@/lib/engine/scoring'
import { loadJourneyPack } from '@/lib/engine/pack'

const pack = loadJourneyPack({
  id: 'p', goal: 'rehab', type: 'clinical', name: 'p',
  intro: { what_is: 'a', how_help: 'b' }, redFlags: [],
  stages: [{ id: 'bed', label: 'ติดเตียง' }, { id: 'walk', label: 'ยืน-เดิน' }],
  freeReadout: { bed: { summary: 'x', starterTechniques: [] }, walk: { summary: 'y', starterTechniques: [] } },
  screeningQuestions: [
    { id: 'q1', text: 'q1', stat: null, options: [
      { id: 'a', label: 'a', stage: 'bed', stats: {} },
      { id: 'b', label: 'b', stage: 'walk', stats: {} },
    ] },
    { id: 'q2', text: 'q2', stat: null, options: [
      { id: 'c', label: 'c', stage: 'bed', stats: {} },
      { id: 'd', label: 'd', stage: 'walk', stats: {} },
    ] },
  ],
})

describe('resolveStage', () => {
  it('picks the majority stage', () => {
    const answers: Answers = { q1: 'a', q2: 'c' } // both bed
    expect(resolveStage(pack, answers)).toBe('bed')
  })

  it('breaks ties by stage order', () => {
    const answers: Answers = { q1: 'a', q2: 'd' } // 1 bed, 1 walk → bed first
    expect(resolveStage(pack, answers)).toBe('bed')
  })

  it('falls back to first stage when no answers', () => {
    expect(resolveStage(pack, {})).toBe('bed')
  })
})
