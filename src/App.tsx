import type { CSSProperties } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { GAME_CONFIG } from './config'
import { soundBoard } from './sound'
import { clamp } from './utils/time'
import { usePersistentState } from './hooks/usePersistentState'
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion'
import { SetupScreen } from './components/SetupScreen'
import { Countdown } from './components/Countdown'
import { RaceScreen } from './components/RaceScreen'
import { ResultScreen } from './components/ResultScreen'
import { CelebrationOverlay } from './components/CelebrationOverlay'

type GameState = 'SETUP' | 'COUNTDOWN' | 'RACING' | 'USER_WIN' | 'COMPUTER_WIN' | 'POST_RACE'

type RaceResult = 'user' | 'computer' | null

const COUNTDOWN_SEQUENCE = ['3', '2', '1', 'GO!'] as const

export default function App() {
  const [state, setState] = useState<GameState>('SETUP')
  const [minutesSetting, setMinutesSetting] = usePersistentState<number>('beat-runner:minutes', 5)
  const [soundEnabled, setSoundEnabled] = usePersistentState<boolean>(
    'beat-runner:sound',
    GAME_CONFIG.sounds.enabledDefault,
  )
  const [minutesInput, setMinutesInput] = useState(() => minutesSetting.toString())
  const [countdownLabel, setCountdownLabel] = useState<string>(COUNTDOWN_SEQUENCE[0])
  const [progress, setProgress] = useState(0)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [result, setResult] = useState<RaceResult>(null)
  const [announcement, setAnnouncement] = useState('')
  const [toast, setToast] = useState('')
  const [celebrating, setCelebrating] = useState(false)

  const prefersReducedMotion = usePrefersReducedMotion()

  const raceStartRef = useRef(0)
  const durationMsRef = useRef(minutesSetting * 60_000)
  const rafRef = useRef<number | null>(null)
  const countdownTimeoutsRef = useRef<number[]>([])
  const outcomeLockedRef = useRef(false)

  useEffect(() => {
    durationMsRef.current = clamp(minutesSetting, GAME_CONFIG.minMinutes, GAME_CONFIG.maxMinutes) * 60_000
  }, [minutesSetting])

  useEffect(() => {
    soundBoard.setEnabled(soundEnabled)
  }, [soundEnabled])

  const resetToast = useCallback(() => setToast(''), [])

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(''), 3000)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const shareSupported = useMemo(
    () => typeof navigator !== 'undefined' && typeof navigator.share === 'function',
    [],
  )
  const clipboardSupported = useMemo(
    () => typeof navigator !== 'undefined' && Boolean(navigator.clipboard),
    [],
  )

  const validateMinutes = useCallback(
    (value: string): string | null => {
      if (!value.trim()) {
        return 'Enter a number of minutes between 0.5 and 120.'
      }
      const parsed = Number.parseFloat(value)
      if (Number.isNaN(parsed)) {
        return 'Please enter a valid number.'
      }
      if (parsed < GAME_CONFIG.minMinutes || parsed > GAME_CONFIG.maxMinutes) {
        return `Choose between ${GAME_CONFIG.minMinutes} and ${GAME_CONFIG.maxMinutes} minutes.`
      }
      return null
    },
    [],
  )

  const inputError = state === 'SETUP' ? validateMinutes(minutesInput) : null

  const clearCountdownTimeouts = useCallback(() => {
    countdownTimeoutsRef.current.forEach((id) => window.clearTimeout(id))
    countdownTimeoutsRef.current = []
  }, [])

  const transitionToState = useCallback(
    (nextState: GameState, newAnnouncement?: string) => {
      setState(nextState)
      if (newAnnouncement) {
        setAnnouncement(newAnnouncement)
      }
    },
    [],
  )

  useEffect(() => () => clearCountdownTimeouts(), [clearCountdownTimeouts])

  const runCountdown = useCallback(async () => {
    clearCountdownTimeouts()
    return new Promise<void>((resolve) => {
      COUNTDOWN_SEQUENCE.forEach((label, index) => {
        const delay = index * GAME_CONFIG.countdownStepMs
        const timeout = window.setTimeout(() => {
          setCountdownLabel(label)
          if (label !== 'GO!') {
            soundBoard.playCountdownTone(COUNTDOWN_SEQUENCE.length - index)
          } else {
            soundBoard.playGoTone()
          }
          setAnnouncement(label === 'GO!' ? 'Go!' : label)
          if (label === 'GO!') {
            const goTimeout = window.setTimeout(() => resolve(), GAME_CONFIG.goMs)
            countdownTimeoutsRef.current.push(goTimeout)
          }
        }, delay)
        countdownTimeoutsRef.current.push(timeout)
      })
    })
  }, [clearCountdownTimeouts])

  const stopAnimation = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const startAnimation = useCallback(() => {
    stopAnimation()
    outcomeLockedRef.current = false
    const tick = () => {
      const now = performance.now()
      const elapsed = now - raceStartRef.current
      const raceDuration = durationMsRef.current
      const nextProgress = clamp(elapsed / raceDuration, 0, 1)
      setElapsedMs(elapsed)
      setProgress(nextProgress)

      if (nextProgress >= 1 && !outcomeLockedRef.current) {
        outcomeLockedRef.current = true
        setResult('computer')
        transitionToState('COMPUTER_WIN', 'Computer won the race.')
        return
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [stopAnimation, transitionToState])

  useEffect(() => {
    if (state === 'COUNTDOWN') {
      setProgress(0)
      setElapsedMs(0)
      runCountdown().then(() => {
        raceStartRef.current = performance.now()
        transitionToState('RACING', 'Race started.')
      })
    }
    return () => {
      clearCountdownTimeouts()
    }
  }, [clearCountdownTimeouts, runCountdown, state, transitionToState])

  useEffect(() => {
    if (state === 'RACING') {
      startAnimation()
      return () => stopAnimation()
    }
    stopAnimation()
  }, [startAnimation, state, stopAnimation])

  useEffect(() => {
    if (state === 'USER_WIN') {
      setCelebrating(true)
      soundBoard.playWinFanfare()
      setAnnouncement('You won! Celebration time!')
      const timeout = window.setTimeout(() => {
        setCelebrating(false)
        transitionToState('POST_RACE')
      }, GAME_CONFIG.celebrationMs)
      return () => window.clearTimeout(timeout)
    }
  }, [state, transitionToState])

  useEffect(() => {
    if (state === 'COMPUTER_WIN') {
      setProgress(1)
      setElapsedMs(durationMsRef.current)
      const timeout = window.setTimeout(() => transitionToState('POST_RACE'), 1200)
      return () => window.clearTimeout(timeout)
    }
  }, [state, transitionToState])

  const handleDone = useCallback(() => {
    if (state !== 'RACING' || outcomeLockedRef.current) return
    const elapsed = performance.now() - raceStartRef.current
    if (elapsed < durationMsRef.current) {
      outcomeLockedRef.current = true
      setElapsedMs(elapsed)
      setProgress(clamp(elapsed / durationMsRef.current, 0, 1))
      setResult('user')
      transitionToState('USER_WIN')
    }
  }, [state, transitionToState])

  const handleStartRace = useCallback(() => {
    const error = validateMinutes(minutesInput)
    if (error) return
    const parsed = Number.parseFloat(minutesInput)
    const clamped = clamp(parsed, GAME_CONFIG.minMinutes, GAME_CONFIG.maxMinutes)
    setMinutesSetting(clamped)
    setMinutesInput(clamped.toString())
    durationMsRef.current = clamped * 60_000
    setResult(null)
    setProgress(0)
    setElapsedMs(0)
    setCelebrating(false)
    transitionToState('COUNTDOWN', 'Countdown starting')
  }, [minutesInput, setMinutesSetting, transitionToState, validateMinutes])

  const handleReplay = useCallback(() => {
    setMinutesInput(minutesSetting.toString())
    durationMsRef.current = minutesSetting * 60_000
    setResult(null)
    setProgress(0)
    setElapsedMs(0)
    setCelebrating(false)
    transitionToState('COUNTDOWN', 'Countdown starting')
  }, [minutesSetting, transitionToState])

  const handleNewDuration = useCallback(() => {
    stopAnimation()
    setResult(null)
    setProgress(0)
    setElapsedMs(0)
    setCelebrating(false)
    transitionToState('SETUP', 'Set a new race duration')
  }, [stopAnimation, transitionToState])

  const handleShare = useCallback(async () => {
    const summary =
      result === 'user'
        ? 'I beat the runner before the finish line!'
        : 'The runner won this round, but I am ready for another race!'
    const text = `${summary} My race time was ${minutesSetting} minute${minutesSetting === 1 ? '' : 's'} in Beat the Runner.`
    try {
      if (shareSupported && navigator.share) {
        await navigator.share({ title: 'Beat the Runner', text })
        setToast('Shared!')
        setAnnouncement('Result shared successfully')
        return
      }
      if (clipboardSupported && navigator.clipboard) {
        await navigator.clipboard.writeText(text)
        setToast('Copied result to clipboard')
        setAnnouncement('Result copied to clipboard')
        return
      }
      setToast('Sharing not supported on this device')
      setAnnouncement('Sharing not supported on this device')
    } catch (error) {
      console.error('Share failed', error)
      setToast('Could not share the result')
      setAnnouncement('Could not share the result')
    }
  }, [clipboardSupported, minutesSetting, result, shareSupported])

  const handleSelectPreset = useCallback(
    (value: number) => {
      const clamped = clamp(value, GAME_CONFIG.minMinutes, GAME_CONFIG.maxMinutes)
      setMinutesInput(clamped.toString())
      setMinutesSetting(clamped)
    },
    [setMinutesSetting],
  )

  const handleSoundToggle = useCallback(() => setSoundEnabled((prev) => !prev), [setSoundEnabled])

    return (
      <div className="app" style={{ '--app-bg': GAME_CONFIG.theme.bg } as CSSProperties}>
      {state === 'SETUP' && (
        <SetupScreen
          minutesInput={minutesInput}
          onMinutesChange={setMinutesInput}
          onStart={handleStartRace}
          error={inputError}
          presets={[3, 5, 10]}
          onSelectPreset={handleSelectPreset}
          soundEnabled={soundEnabled}
          onToggleSound={handleSoundToggle}
        />
      )}
      {state === 'COUNTDOWN' && <Countdown label={countdownLabel} />}
      {(state === 'RACING' || state === 'USER_WIN' || state === 'COMPUTER_WIN') && (
        <RaceScreen
          durationMs={durationMsRef.current}
          elapsedMs={elapsedMs}
          progress={progress}
          onDone={handleDone}
          disabled={state !== 'RACING'}
        />
      )}
      {state === 'POST_RACE' && result && (
        <ResultScreen
          result={result}
          onReplay={handleReplay}
          onNewDuration={handleNewDuration}
          onShare={handleShare}
          shareSupported={shareSupported || clipboardSupported}
        />
      )}
      <CelebrationOverlay active={celebrating} reducedMotion={prefersReducedMotion} />
      <div className="sr-only" aria-live="assertive">
        {announcement}
      </div>
      {toast && (
        <div className="toast" role="status" onAnimationEnd={resetToast}>
          {toast}
        </div>
      )}
    </div>
  )
}
