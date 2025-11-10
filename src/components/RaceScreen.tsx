import type { CSSProperties } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Hud } from './Hud'
import { RunnerSprite } from './RunnerSprite'
import { clamp } from '../utils/time'

const MAX_SCENE_HEIGHT = 900
const MIN_SCENE_HEIGHT = 320

function resolveViewportHeight() {
  if (typeof window === 'undefined') {
    return MAX_SCENE_HEIGHT
  }
  const { innerHeight } = window
  return Math.max(MIN_SCENE_HEIGHT, innerHeight || MAX_SCENE_HEIGHT)
}

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
  const [viewportHeight, setViewportHeight] = useState(() => resolveViewportHeight())

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

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleResize = () => setViewportHeight(resolveViewportHeight())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const raceMinHeight = Math.min(viewportHeight, 900)
  const trackMinHeight = clamp(viewportHeight * 0.6, 320, 640)
  const trackHeight = clamp(trackMinHeight * 0.6, 220, 460)
  const trackMarginTop = clamp(viewportHeight * 0.06, 24, 200)

  const raceScreenStyle: CSSProperties = { minHeight: `${raceMinHeight}px` }
  const trackAreaStyle: CSSProperties = { minHeight: `${trackMinHeight}px` }
  const trackStyle: CSSProperties = { marginTop: `${trackMarginTop}px`, height: `${trackHeight}px` }

  return (
    <div className="screen race-screen" data-testid="race-screen" style={raceScreenStyle}>
      <Hud durationMs={durationMs} elapsedMs={elapsedMs} progress={progress} />
      <div className="track-area" role="presentation" data-testid="track-area" style={trackAreaStyle}>
        <div className="sky" aria-hidden>
          <div className="cloud cloud-one" style={{ transform: `translateX(${progress * 20}%)` }} />
          <div className="cloud cloud-two" style={{ transform: `translateX(${progress * 35}%)` }} />
          <div className="cloud cloud-three" style={{ transform: `translateX(${progress * 10}%)` }} />
        </div>
        <div className="track" ref={trackRef} style={trackStyle}>
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
