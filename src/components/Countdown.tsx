import { useEffect, useRef } from 'react'

interface CountdownProps {
  label: string
}

export function Countdown({ label }: CountdownProps) {
  const prevLabel = useRef('')
  const liveRegionRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (liveRegionRef.current) {
      if (prevLabel.current !== label) {
        liveRegionRef.current.textContent = label
        prevLabel.current = label
      }
    }
  }, [label])

  return (
    <div className="screen countdown-screen" role="presentation">
      <div className="countdown-bubble" aria-hidden>
        <span key={label} className="countdown-value">
          {label}
        </span>
      </div>
      <div ref={liveRegionRef} className="sr-only" aria-live="assertive" />
    </div>
  )
}
