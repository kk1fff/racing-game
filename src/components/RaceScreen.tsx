import { useCallback, useEffect, useRef, useState } from 'react'
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
  const trackRef = useRef<HTMLDivElement>(null)
  const runnerRef = useRef<HTMLDivElement>(null)
  const finishRef = useRef<HTMLDivElement>(null)
  const [maxTravelPx, setMaxTravelPx] = useState(0)

  const updateRunnerBounds = useCallback(() => {
    const trackWidth = trackRef.current?.offsetWidth ?? 0
    const runnerWidth = runnerRef.current?.offsetWidth ?? 0
    if (!trackWidth || !runnerWidth) {
      setMaxTravelPx(0)
      return
    }
    const finishWidth = finishRef.current?.offsetWidth ?? 0
    const startOffset = trackWidth * 0.05 // matches .runner { left: 5% }
    const finishOffset = trackWidth * 0.04 // matches .finish { right: 4% }
    const safeGap = 16
    const available =
      trackWidth - startOffset - finishOffset - finishWidth - runnerWidth - safeGap
    setMaxTravelPx(Math.max(available, 0))
  }, [])

  useEffect(() => {
    updateRunnerBounds()
    if (typeof ResizeObserver === 'function') {
      const observer = new ResizeObserver(updateRunnerBounds)
      const elements = [trackRef.current, runnerRef.current, finishRef.current]
      elements.forEach((element) => {
        if (element) observer.observe(element)
      })
      return () => observer.disconnect()
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateRunnerBounds)
      return () => window.removeEventListener('resize', updateRunnerBounds)
    }
    return undefined
  }, [updateRunnerBounds])

  return (
    <div className="screen race-screen">
      <Hud durationMs={durationMs} elapsedMs={elapsedMs} progress={progress} />
      <div className="track-area" role="presentation">
        <div className="sky" aria-hidden>
          <div className="cloud cloud-one" style={{ transform: `translateX(${progress * 20}%)` }} />
          <div className="cloud cloud-two" style={{ transform: `translateX(${progress * 35}%)` }} />
          <div className="cloud cloud-three" style={{ transform: `translateX(${progress * 10}%)` }} />
        </div>
        <div className="track" ref={trackRef}>
          <div className="track-markings" aria-hidden />
          <div
            className="runner"
            ref={runnerRef}
            style={{ transform: `translateX(${progress * maxTravelPx}px)` }}
          >
            <RunnerSprite />
          </div>
          <div className="finish" aria-label="Finish line" role="img" ref={finishRef}>
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
