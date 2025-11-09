import '@testing-library/jest-dom/vitest'

// Provide a minimal ResizeObserver shim for tests that render the race track.
class ResizeObserverMock implements ResizeObserver {
  callback: ResizeObserverCallback
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
  }
  observe(target: Element) {
    this.callback([{ target, contentRect: target.getBoundingClientRect() }] as ResizeObserverEntry[], this)
  }
  unobserve() {}
  disconnect() {}
}

if (typeof window !== 'undefined' && !('ResizeObserver' in window)) {
  ;(window as unknown as { ResizeObserver: typeof ResizeObserver }).ResizeObserver = ResizeObserverMock
}
