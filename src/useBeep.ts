let audioCtx: AudioContext | null = null

export function useBeep() {
  function play(): void {
    try {
      if (!audioCtx) {
        audioCtx = new AudioContext()
      }
      const ctx = audioCtx
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, now)
      gain.gain.setValueAtTime(0.3, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.2)
    } catch {
      // silent — audio failure must not interrupt call-next flow
    }
  }

  return { play }
}
