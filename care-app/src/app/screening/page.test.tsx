import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Page from '@/app/screening/page'
import { useSession } from '@/lib/store'

const push = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))

describe('Screening page', () => {
  beforeEach(() => {
    push.mockClear()
    useSession.getState().reset()
    useSession.getState().selectGoal('rehab', 'stroke')
  })

  it('shows the first question', () => {
    render(<Page />)
    expect(screen.getByText('ตอนนี้เคลื่อนไหวได้แค่ไหน')).toBeInTheDocument()
  })

  it('advances and finishes to result', () => {
    render(<Page />)
    fireEvent.click(screen.getByText('นั่งได้ แต่ยังไม่ยืน'))
    fireEvent.click(screen.getByText('นั่งทรงตัวได้ ยืนต้องช่วย'))
    fireEvent.click(screen.getByText('ไม่ปวด'))
    expect(push).toHaveBeenCalledWith('/result')
    expect(useSession.getState().answers.q_mobility).toBe('sits')
  })
})
