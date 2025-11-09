# Beat the Runner — Technical Specification

## Gameplay Flow
1. **Setup**
   - Duration input accepts decimal minutes within 0.5–120.
   - Preset buttons (3m, 5m, 10m) instantly load common durations.
   - Start button becomes available when input is valid.
   - Sound toggle persists the preference with `localStorage`.
2. **Countdown**
   - Sequence `3 → 2 → 1 → GO!` uses 800 ms steps with a 600 ms “GO!” hold.
   - Each change updates a screen-reader live region and plays tones when sound is enabled.
3. **Race**
   - Runner advances using `requestAnimationFrame` and a monotonic start timestamp.
   - HUD displays time remaining (`mm:ss`) and progress percentage.
   - Player can activate **I am DONE** via pointer, keyboard, or touch (≥56 px target).
   - Progress persists correctly across tab visibility changes and viewport resizes.
4. **Victory Conditions**
   - User win triggers immediately when the CTA fires before elapsed time reaches duration.
   - Computer win occurs once elapsed time meets duration without a user win.
5. **Post-Race**
   - User win: 10 s celebration overlay (confetti, balloons, sparkles). Reduced-motion users receive a static banner.
   - Computer win: brief pause, then result screen.
   - Replay options: **Race Again**, **New Duration**, and **Share Result** (Web Share API or clipboard fallback).

## Architecture
- **Framework**: React + TypeScript (Vite build).
- **State**: React state + refs for timing (`raceStartRef`, `durationMsRef`, `outcomeLockedRef`).
- **Hooks**:
  - `usePersistentState` persists sound and duration preferences.
  - `usePrefersReducedMotion` syncs with OS motion preferences.
- **Timing**: Race progress derives from `performance.now()` ensuring accuracy even when throttled.
- **Sound**: Lightweight `AudioContext` tones for countdown/go/fanfare, disabled when the sound toggle is off.
- **Sharing**: Attempts Web Share, falls back to clipboard copy, communicates outcome via toast + live region.

## UI & Visuals
- **Theme**: Bright cartoon palette using CSS variables and gradients; fonts via `@fontsource/fredoka` and `@fontsource/nunito-sans`.
- **Layout**: Flexbox-driven full viewport screens with responsive paddings.
- **Track**: SVG runner sprite with limb animations, parallax clouds, striped finish banner, and candy-striped progress bar.
- **CTA**: Massive pill button with thick stroke, drop shadow, and bouncy hover states.
- **Accessibility**:
  - Focus-visible styling across interactive elements.
  - ARIA live announcements for countdown, race start, and results.
  - Keyboard support for form submission and CTA activation.
  - Reduced-motion media query disables looping animations and swaps celebration effect.

## Files & Modules
- `src/App.tsx`: State machine, race loop, sharing, celebration control.
- `src/components/`: Presentation components (`SetupScreen`, `Countdown`, `RaceScreen`, `Hud`, `RunnerSprite`, `ResultScreen`, `CelebrationOverlay`).
- `src/hooks/`: Persistence and reduced-motion utilities.
- `src/sound.ts`: Audio tone generation.
- `src/utils/time.ts`: Time formatting and numeric clamp helper.
- `src/App.css` & `src/index.css`: Global theming, responsive layout, and animation styling.
- `src/config.ts`: Tunable race configuration values matching the provided JSON schema.

## Acceptance Highlights
- Accurate win detection against the monotonic race timer.
- Countdown disabled input window; CTA ignores late clicks after race end.
- Celebration overlay lasts exactly 10 s before result screen.
- Sound preference and last duration persist between sessions.
- Responsive visuals validated on mobile, tablet, and desktop viewports.
