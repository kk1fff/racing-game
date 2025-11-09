import type { FormEvent } from 'react'
import { useCallback } from 'react'

interface SetupScreenProps {
  minutesInput: string
  onMinutesChange: (value: string) => void
  onStart: () => void
  error: string | null
  presets: number[]
  onSelectPreset: (value: number) => void
  soundEnabled: boolean
  onToggleSound: () => void
}

export function SetupScreen({
  minutesInput,
  onMinutesChange,
  onStart,
  error,
  presets,
  onSelectPreset,
  soundEnabled,
  onToggleSound,
}: SetupScreenProps) {
  const handleSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault()
      onStart()
    },
    [onStart],
  )

  return (
    <div className="screen setup-screen">
      <div className="card setup-card">
        <h1 className="title">Beat the Runner</h1>
        <p className="subtitle">Finish your task before our speedy friend reaches the finish line!</p>
        <form onSubmit={handleSubmit} className="setup-form">
          <label htmlFor="duration" className="input-label">
            How many minutes should the race last?
          </label>
          <div className="input-row">
            <input
              id="duration"
              inputMode="decimal"
              pattern="^\\d*(?:\\.\\d+)?$"
              value={minutesInput}
              onChange={(event) => onMinutesChange(event.target.value)}
              className="minutes-input"
              aria-describedby={error ? 'duration-error' : undefined}
              aria-invalid={Boolean(error)}
            />
            <button type="button" className="sound-toggle" onClick={onToggleSound} aria-pressed={soundEnabled}>
              <span className="sound-icon" aria-hidden>
                {soundEnabled ? '🔊' : '🔇'}
              </span>
              <span className="sound-label">Sound {soundEnabled ? 'On' : 'Off'}</span>
            </button>
          </div>
          {error && (
            <p className="error" id="duration-error" role="alert">
              {error}
            </p>
          )}
          <div className="preset-row" aria-label="Duration presets">
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                className="preset-button"
                onClick={() => onSelectPreset(preset)}
              >
                {preset}m
              </button>
            ))}
          </div>
          <button type="submit" className="primary" disabled={Boolean(error)}>
            Start Race
          </button>
        </form>
        <p className="helper-text">Tip: You can press Enter to start once you set the time.</p>
      </div>
    </div>
  )
}
