import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SetupScreen } from './SetupScreen'

function renderSetup(overrides: Partial<Parameters<typeof SetupScreen>[0]> = {}) {
  const props = {
    minutesInput: '5',
    onMinutesChange: vi.fn(),
    onStart: vi.fn(),
    error: null,
    presets: [3, 5, 10],
    onSelectPreset: vi.fn(),
    soundEnabled: true,
    onToggleSound: vi.fn(),
    ...overrides,
  }

  render(<SetupScreen {...props} />)
  return props
}

describe('SetupScreen', () => {
  it('lets players set a custom duration and start the race', async () => {
    const user = userEvent.setup()
    const props = renderSetup()

    const minutesField = screen.getByLabelText(/how many minutes/i)
    await user.clear(minutesField)
    await user.type(minutesField, '7')
    await user.click(screen.getByRole('button', { name: /start race/i }))

    expect(props.onMinutesChange).toHaveBeenLastCalledWith('7')
    expect(props.onStart).toHaveBeenCalledTimes(1)
  })

  it('disables the start button and surfaces validation feedback', () => {
    renderSetup({ error: 'Please enter a valid duration.' })

    expect(screen.getByRole('alert')).toHaveTextContent('Please enter a valid duration.')
    expect(screen.getByRole('button', { name: /start race/i })).toBeDisabled()
  })
})
