class SoundBoard {
  private audioCtx: AudioContext | null = null
  private enabled = true

  setEnabled(enabled: boolean) {
    this.enabled = enabled
    if (!enabled) {
      this.audioCtx?.close()
      this.audioCtx = null
    }
  }

  private async ensureContext(): Promise<AudioContext | null> {
    if (!this.enabled || typeof window === 'undefined' || typeof AudioContext === 'undefined') {
      return null
    }
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext()
    }
    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume()
    }
    return this.audioCtx
  }

  async playCountdownTone(step: number) {
    const ctx = await this.ensureContext()
    if (!ctx) return
    const frequency = 440 + step * 60
    this.playTone(ctx, frequency, 0.15)
  }

  async playGoTone() {
    const ctx = await this.ensureContext()
    if (!ctx) return
    this.playTone(ctx, 660, 0.25)
  }

  async playWinFanfare() {
    const ctx = await this.ensureContext()
    if (!ctx) return
    this.playTone(ctx, 784, 0.3, 0.4)
    setTimeout(() => this.playTone(ctx, 880, 0.35, 0.4), 120)
    setTimeout(() => this.playTone(ctx, 988, 0.4, 0.4), 240)
  }

  private playTone(ctx: AudioContext, frequency: number, duration: number, gainLevel = 0.2) {
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.frequency.value = frequency
    oscillator.type = 'triangle'
    gain.gain.value = gainLevel
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    const now = ctx.currentTime
    oscillator.start(now)
    gain.gain.setValueAtTime(gainLevel, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
    oscillator.stop(now + duration + 0.05)
  }
}

export const soundBoard = new SoundBoard()
