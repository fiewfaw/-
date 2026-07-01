import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import Page from '@/app/result/page'
import { useSession } from '@/lib/store'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))

describe('Result page', () => {
  beforeEach(() => {
    useSession.getState().reset()
    useSession.getState().selectGoal('rehab', 'stroke')
    useSession.getState().setAnswer('q_mobility', 'bedbound')
    useSession.getState().setAnswer('q_balance', 'poor')
    useSession.getState().setAnswer('q_pain', 'severe')
  })

  it('shows the resolved stage and readout', () => {
    render(<Page />)
    expect(screen.getByText(/ระยะของคุณ:/)).toHaveTextContent('ระยะติดเตียง')
    expect(screen.getByText(/ป้องกันข้อติด/)).toBeInTheDocument()
  })

  it('shows red-flag warning and disclaimer and CTA', () => {
    render(<Page />)
    expect(screen.getByText(/ปวดรุนแรง/)).toBeInTheDocument()
    expect(screen.getByText(/ไม่ใช่การวินิจฉัย/)).toBeInTheDocument()
    expect(screen.getByText('⚡ ปรึกษานักกายภาพ')).toBeInTheDocument()
  })
})
