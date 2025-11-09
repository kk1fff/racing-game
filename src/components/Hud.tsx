import { formatTime } from '../utils/time'

interface HudProps {
  durationMs: number
  elapsedMs: number
  progress: number
}

export function Hud({ durationMs, elapsedMs, progress }: HudProps) {
  const remainingMs = Math.max(0, durationMs - elapsedMs)

  return (
    <header className="hud" aria-label="Race status">
      <div className="hud-card" role="group" aria-label="Time">
        <span className="hud-label">Time left</span>
        <span className="hud-value">{formatTime(remainingMs)}</span>
      </div>
      <div className="hud-progress" role="group" aria-label="Progress">
        <span className="hud-label">Progress</span>
        <div className="progress-bar" aria-hidden>
          <div className="progress-bar-fill" style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
        <span className="hud-value">{Math.round(progress * 100)}%</span>
      </div>
    </header>
  )
}
