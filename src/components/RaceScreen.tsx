import type { CSSProperties } from 'react'
import { Hud } from './Hud'
import { RunnerSprite } from './RunnerSprite'

interface RaceScreenProps {
  durationMs: number
  elapsedMs: number
  progress: number
  onDone: () => void
  disabled: boolean
}

export function RaceScreen({ durationMs, elapsedMs, progress, onDone, disabled }: RaceScreenProps) {
  return (
    <div className="screen race-screen">
      <Hud durationMs={durationMs} elapsedMs={elapsedMs} progress={progress} />
      <div className="track-area" role="presentation">
        <div className="sky" aria-hidden>
          <div className="cloud cloud-one" style={{ transform: `translateX(${progress * 20}%)` }} />
          <div className="cloud cloud-two" style={{ transform: `translateX(${progress * 35}%)` }} />
          <div className="cloud cloud-three" style={{ transform: `translateX(${progress * 10}%)` }} />
        </div>
        <div className="track">
          <div className="track-markings" aria-hidden />
          <div className="runner" style={{ '--progress': progress } as CSSProperties}>
            <RunnerSprite />
          </div>
          <div className="finish" aria-label="Finish line" role="img">
            <span>Finish</span>
          </div>
        </div>
      </div>
      <div className="cta-row">
        <button
          type="button"
          className="done-button"
          onClick={onDone}
          disabled={disabled}
          aria-live="polite"
        >
          I am DONE
        </button>
      </div>
    </div>
  )
}
