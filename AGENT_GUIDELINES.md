# Agent Contribution Guidelines

## Development Workflow
- Use TypeScript with React function components; keep logic in `src/App.tsx` and reusable UI in `src/components/`.
- Prefer hooks over class components. Persist user-facing preferences with `usePersistentState` when feasible.
- Maintain the state machine order: `SETUP → COUNTDOWN → RACING → (USER_WIN | COMPUTER_WIN) → POST_RACE`.
- Rely on `performance.now()` for all timing logic; avoid `Date.now()` to prevent clock drift.

## Styling & Assets
- Global styles live in `src/index.css`; component and layout styles belong in `src/App.css` unless a component requires scoped overrides.
- Follow the bright cartoon aesthetic with soft shadows, bold outlines, and rounded corners. Respect the reduced-motion media query for new animations.
- Store new SVG or media assets locally under `src/assets/` or `public/` as appropriate.

## Accessibility
- Provide visible focus states and ensure touch targets stay ≥56 px.
- Use ARIA live regions or polite announcements for dynamic content changes (countdown, results, toasts).
- Honour `prefers-reduced-motion` by supplying static fallbacks when introducing new motion-heavy effects.

## Testing & Tooling
- Before committing, run `npm run build` to confirm type safety and successful bundling.
- Add automated tests when implementing complex logic or regressions are likely.
- Document feature updates in `CHANGELOG.md`, expand `SPEC.md` for new behaviour, and summarise user-facing changes in `README.md`.
