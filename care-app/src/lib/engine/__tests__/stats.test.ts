import { describe, it, expect } from 'vitest'
import { computeStats } from '@/lib/engine/stats'
import { loadJourneyPack } from '@/lib/engine/pack'

const pack = loadJourneyPack({
  id: 'p', goal: 'rehab', type: 'clinical', name: 'p',
  intro: { what_is: 'a', how_help: 'b' }, redFlags: [],
  stages: [{ id: 's', label: 's' }],
  freeReadout: { s: { summary: 'x', starterTechniques: [] } },
  screeningQuestions: [
    { id: 'q1', text: 'q1', stat: null, options: [
      { id: 'a', label: 'a', stage: 's', stats: { strength: 30, comfort: -20 } },
    ] },
  ],
})

describe('computeStats', () => {
  it('starts at 50 and applies option contributions', () => {
    const stats = computeStats(pack, { q1: 'a' })
    expect(stats.strength).toBe(80)
    expect(stats.comfort).toBe(30)
    expect(stats.balance).toBe(50)
  })

  it('clamps to 0–100', () => {
    const big = loadJourneyPack({
      ...pack,
      screeningQuestions: [{ id: 'q1', text: 'q', stat: null, options: [
        { id: 'a', label: 'a', stage: 's', stats: { strength: 999 } },
      ] }],
    })
    expect(computeStats(big, { q1: 'a' }).strength).toBe(100)
  })
})
