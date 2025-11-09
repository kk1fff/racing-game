export const GAME_CONFIG = {
  minMinutes: 0.5,
  maxMinutes: 120,
  countdownStepMs: 800,
  goMs: 600,
  celebrationMs: 10_000,
  sounds: { enabledDefault: true },
  theme: {
    bg: '#f7fbff',
    primary: '#ff8a00',
    accent: '#4f46e5',
    stroke: '#0f172a',
  },
} as const

type GameConfig = typeof GAME_CONFIG

export type ThemeConfig = GameConfig['theme']
