import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatHexagon } from '@/components/StatHexagon'

describe('StatHexagon', () => {
  it('renders all six Thai axis labels', () => {
    render(<StatHexagon stats={{
      strength: 50, balance: 50, flexibility: 50,
      endurance: 50, function: 50, comfort: 50,
    }} />)
    for (const label of ['แรง', 'ทรงตัว', 'ยืดหยุ่น', 'ทนทาน', 'ฟังก์ชัน', 'สบาย']) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }
  })

  it('renders a value polygon', () => {
    const { container } = render(<StatHexagon stats={{
      strength: 80, balance: 20, flexibility: 60,
      endurance: 40, function: 70, comfort: 30,
    }} />)
    expect(container.querySelector('[data-testid="value-polygon"]')).toBeTruthy()
  })
})
