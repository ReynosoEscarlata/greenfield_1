import '@testing-library/jest-dom'

const createMockOscillator = () => ({
  type: 'sine' as OscillatorType,
  frequency: { setValueAtTime: vi.fn() },
  connect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
})

const createMockGain = () => ({
  gain: {
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  },
  connect: vi.fn(),
})

const mockAudioContextInstance = {
  createOscillator: vi.fn(createMockOscillator),
  createGain: vi.fn(createMockGain),
  destination: {},
  currentTime: 0,
  state: 'running',
  resume: vi.fn(),
}

global.AudioContext = vi.fn(() => mockAudioContextInstance) as unknown as typeof AudioContext
