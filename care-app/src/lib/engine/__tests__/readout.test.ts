import { describe, it, expect } from 'vitest'
import { selectReadout, detectRedFlags } from '@/lib/engine/readout'
import { loadJourneyPack } from '@/lib/engine/pack'

const pack = loadJourneyPack({
  id: 'p', goal: 'rehab', type: 'clinical', name: 'p',
  intro: { what_is: 'a', how_help: 'b' },
  redFlags: [{ questionId: 'q1', optionId: 'danger', message: 'พบแพทย์ก่อน' }],
  stages: [{ id: 's', label: 's' }],
  freeReadout: { s: { summary: 'สรุป', starterTechniques: ['ท่า1'] } },
  screeningQuestions: [{ id: 'q1', text: 'q', stat: null, options: [
    { id: 'ok', label: 'ปกติ', stage: 's', stats: {} },
    { id: 'danger', label: 'อันตราย', stage: 's', stats: {} },
  ] }],
})

describe('selectReadout', () => {
  it('returns readout for a known stage', () => {
    expect(selectReadout(pack, 's').summary).toBe('สรุป')
  })
  it('falls back for unknown stage', () => {
    expect(selectReadout(pack, 'nope').starterTechniques).toEqual([])
  })
})

describe('detectRedFlags', () => {
  it('returns matching messages', () => {
    expect(detectRedFlags(pack, { q1: 'danger' })).toEqual(['พบแพทย์ก่อน'])
  })
  it('returns empty when none match', () => {
    expect(detectRedFlags(pack, { q1: 'ok' })).toEqual([])
  })
})
