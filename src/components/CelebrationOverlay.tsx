import { useMemo } from 'react'

interface CelebrationOverlayProps {
  active: boolean
  reducedMotion: boolean
}

const CONFETTI_COUNT = 60

export function CelebrationOverlay({ active, reducedMotion }: CelebrationOverlayProps) {
  const confetti = useMemo(
    () =>
      Array.from({ length: CONFETTI_COUNT }, (_, index) => ({
        id: index,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 4 + Math.random() * 3,
        scale: 0.6 + Math.random() * 0.8,
        hue: Math.floor(Math.random() * 360),
      })),
    [],
  )

  if (!active) return null

  if (reducedMotion) {
    return (
      <div className="celebration-overlay reduced" role="presentation">
        <div className="celebration-banner">🎉 Amazing! 🎉</div>
      </div>
    )
  }

  return (
    <div className="celebration-overlay" role="presentation" aria-hidden>
      {confetti.map((piece) => (
        <span
          key={piece.id}
          className="confetti-piece"
          style={{
            left: `${piece.left}%`,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            transform: `scale(${piece.scale})`,
            background: `hsl(${piece.hue} 80% 60%)`,
          }}
        />
      ))}
      <div className="balloon balloon-left" aria-hidden />
      <div className="balloon balloon-right" aria-hidden />
      <div className="sparkle-layer" aria-hidden />
    </div>
  )
}
