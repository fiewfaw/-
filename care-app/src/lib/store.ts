import { create } from 'zustand'
import type { Answers } from '@/lib/engine/scoring'

type SessionState = {
  goalId: string | null
  packId: string | null
  answers: Answers
  selectGoal: (goalId: string, packId: string | null) => void
  setAnswer: (questionId: string, optionId: string) => void
  reset: () => void
}

export const useSession = create<SessionState>((set) => ({
  goalId: null,
  packId: null,
  answers: {},
  selectGoal: (goalId, packId) => set({ goalId, packId, answers: {} }),
  setAnswer: (questionId, optionId) =>
    set((s) => ({ answers: { ...s.answers, [questionId]: optionId } })),
  reset: () => set({ goalId: null, packId: null, answers: {} }),
}))
