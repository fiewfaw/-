import { describe, it, expect } from 'vitest'
import { GOALS, CONDITIONS, getPack } from '@/content/registry'

describe('registry', () => {
  it('routes the rehab goal to the conditions sub-picker', () => {
    const rehab = GOALS.find((g) => g.id === 'rehab')
    expect(rehab?.href).toBe('/conditions')
  })

  it('maps the stroke condition to the stroke pack', () => {
    const stroke = CONDITIONS.find((c) => c.id === 'stroke')
    expect(stroke?.packId).toBe('stroke')
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
