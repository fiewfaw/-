import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import Page from '@/app/page'
import { useSession } from '@/lib/store'

const push = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))

describe('Goal entry page', () => {
  beforeEach(() => { push.mockClear(); useSession.getState().reset() })

  it('renders all goals', () => {
    render(<Page />)
    expect(screen.getByText('ฟื้นฟูจากโรค')).toBeInTheDocument()
    expect(screen.getByText('ดูแลสุขภาพทั่วไป')).toBeInTheDocument()
  })

  it('navigates to screening when a ready goal is chosen', () => {
    render(<Page />)
    screen.getByText('ฟื้นฟูจากโรค').click()
    expect(useSession.getState().packId).toBe('stroke')
    expect(push).toHaveBeenCalledWith('/screening')
  })
})
