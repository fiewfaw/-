import { describe, it, expect } from 'vitest'
import { GOALS, getPack } from '@/content/registry'

describe('registry', () => {
  it('exposes the rehab goal mapped to stroke pack', () => {
    const rehab = GOALS.find((g) => g.id === 'rehab')
    expect(rehab?.packId).toBe('stroke')
  })

  it('loads and validates the stroke pack', () => {
    const pack = getPack('stroke')
    expect(pack.name).toContain('Stroke')
    expect(pack.screeningQuestions.length).toBe(3)
  })

  it('throws on unknown pack', () => {
    expect(() => getPack('nope')).toThrow()
  })
})
