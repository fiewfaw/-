import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BodyChart } from '@/components/BodyChart'

describe('BodyChart', () => {
  it('renders the chart image', () => {
    render(<BodyChart markers={[]} />)
    expect(screen.getByAltText('แผนภาพร่างกาย')).toBeInTheDocument()
  })

  it('renders one node per marker', () => {
    const { container } = render(<BodyChart markers={[
      { x: 13, y: 30, kind: 'pain' },
      { x: 36, y: 40, kind: 'weakness' },
    ]} />)
    expect(container.querySelectorAll('[data-marker]').length).toBe(2)
  })
})
