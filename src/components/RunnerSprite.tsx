export function RunnerSprite() {
  return (
    <svg className="runner-sprite" viewBox="0 0 120 100" role="img" aria-label="Runner character">
      <g strokeWidth={4} stroke="#0f172a" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path className="runner-body" d="M60 22c-6 0-12 5-12 11 0 6 5 11 12 11s12-5 12-11c0-6-6-11-12-11z" fill="#ffdc7c" />
        <path className="runner-head" d="M60 10c-8 0-14 6-14 13 0 7 6 13 14 13s14-6 14-13c0-7-6-13-14-13z" fill="#fff1a6" />
        <circle cx="56" cy="20" r="2" fill="#0f172a" />
        <path className="runner-mouth" d="M54 26c2 2 6 2 8 0" stroke="#0f172a" />
        <path className="runner-arm-left" d="M48 40c-10 2-14 8-12 14" />
        <path className="runner-arm-right" d="M72 42c8 1 16 10 16 16" />
        <path className="runner-leg-front" d="M58 45c-4 12-14 28-24 36" />
        <path className="runner-leg-back" d="M62 45c10 12 16 30 28 42" />
      </g>
      <g className="runner-shirt" stroke="none">
        <path d="M48 36h24l-2 18H50z" fill="#4f46e5" />
        <path d="M50 54l-4 16 10-6 6 8 4-18z" fill="#ff8a00" />
      </g>
    </svg>
  )
}
