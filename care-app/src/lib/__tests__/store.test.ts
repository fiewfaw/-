import { describe, it, expect, beforeEach } from 'vitest'
import { useSession } from '@/lib/store'

describe('useSession', () => {
  beforeEach(() => useSession.getState().reset())

  it('selects a goal', () => {
    useSession.getState().selectGoal('rehab', 'stroke')
    expect(useSession.getState().packId).toBe('stroke')
  })

  it('records answers', () => {
    useSession.getState().setAnswer('q1', 'a')
    useSession.getState().setAnswer('q2', 'b')
    expect(useSession.getState().answers).toEqual({ q1: 'a', q2: 'b' })
  })

  it('resets', () => {
    useSession.getState().selectGoal('rehab', 'stroke')
    useSession.getState().reset()
    expect(useSession.getState().goalId).toBeNull()
  })
})
