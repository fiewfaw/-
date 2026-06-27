import { describe, it, expect } from 'vitest'
import { loadJourneyPack } from '@/lib/engine/pack'

const minimal = {
  id: 'demo',
  goal: 'rehab',
  type: 'clinical',
  name: 'เดโม',
  intro: { what_is: 'a', how_help: 'b' },
  redFlags: [],
  screeningQuestions: [
    {
      id: 'q1', text: 'คำถาม', stat: null,
      options: [{ id: 'o1', label: 'ตัวเลือก', stage: 's1', stats: {} }],
    },
  ],
  stages: [{ id: 's1', label: 'ระยะ 1' }],
  freeReadout: { s1: { summary: 'ok', starterTechniques: [] } },
}

describe('loadJourneyPack', () => {
  it('parses a minimal valid pack', () => {
    const pack = loadJourneyPack(minimal)
    expect(pack.id).toBe('demo')
    expect(pack.screeningQuestions[0].options[0].stage).toBe('s1')
  })

  it('throws on missing required field', () => {
    const bad = { ...minimal, id: undefined }
    expect(() => loadJourneyPack(bad)).toThrow()
  })
})
