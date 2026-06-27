import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FadeIn } from '@/components/FadeIn'

describe('FadeIn', () => {
  it('renders children', () => {
    render(<FadeIn><p>hello</p></FadeIn>)
    expect(screen.getByText('hello')).toBeInTheDocument()
  })
})
