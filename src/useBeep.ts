let audioCtx: AudioContext | null = null

export function useBeep() {
  function play(): void {
    // Stub — real implementation in Plan 05-02
    void audioCtx
  }

  return { play }
}
