import { render, screen } from '@testing-library/react'
import { RaceScreen } from './RaceScreen'

const baseProps = {
  durationMs: 5 * 60_000,
  elapsedMs: 0,
  progress: 0.2,
  onDone: vi.fn(),
  disabled: false,
}

const originalInnerHeight = window.innerHeight

function setViewportHeight(value: number) {
  Object.defineProperty(window, 'innerHeight', { configurable: true, value })
}

afterEach(() => {
  setViewportHeight(originalInnerHeight)
})

describe('RaceScreen layout', () => {
  it('matches constrained viewport heights to keep the runner visible', () => {
    setViewportHeight(500)
    render(<RaceScreen {...baseProps} />)

    expect(screen.getByTestId('race-screen')).toHaveStyle({ minHeight: '500px' })
    expect(screen.getByTestId('track-area')).toHaveStyle({ minHeight: '320px' })
  })

  it('caps the scene height on very tall displays', () => {
    setViewportHeight(1400)
    render(<RaceScreen {...baseProps} />)

    expect(screen.getByTestId('race-screen')).toHaveStyle({ minHeight: '900px' })
    expect(screen.getByTestId('track-area')).toHaveStyle({ minHeight: '640px' })
  })
})
