// Small sounds synthesised with the Web Audio API: no audio files to ship.
// Everything is quiet on purpose and can be turned off in the profile.

const KEY = 'lumo.sound'
let ctx: AudioContext | null = null
let master: GainNode | null = null

export function soundEnabled(): boolean {
  try {
    return localStorage.getItem(KEY) !== 'off'
  } catch {
    return true
  }
}

export function setSoundEnabled(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off')
  } catch {
    // Storage can be blocked; the choice then lasts for this visit only.
  }
}

function audio(): { ctx: AudioContext; out: GainNode } | null {
  if (!soundEnabled() || typeof window === 'undefined' || !('AudioContext' in window)) return null
  if (!ctx) {
    ctx = new AudioContext()
    const lowpass = ctx.createBiquadFilter()
    lowpass.type = 'lowpass'
    lowpass.frequency.value = 5000
    master = ctx.createGain()
    master.gain.value = 0.18
    master.connect(lowpass).connect(ctx.destination)
  }
  // Browsers start audio suspended until a tap; every sound here follows one.
  if (ctx.state === 'suspended') void ctx.resume()
  return { ctx, out: master! }
}

function tone(freq: number, at: number, dur: number, type: OscillatorType = 'sine', level = 0.6, slideTo?: number) {
  const a = audio()
  if (!a) return
  const t = a.ctx.currentTime + at
  const osc = a.ctx.createOscillator()
  const g = a.ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(level, t + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(g).connect(a.out)
  osc.start(t)
  osc.stop(t + dur + 0.05)
}

function whoosh(at: number, dur: number, from: number, to: number, level = 0.5) {
  const a = audio()
  if (!a) return
  const t = a.ctx.currentTime + at
  const len = Math.floor(a.ctx.sampleRate * dur)
  const buffer = a.ctx.createBuffer(1, len, a.ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  const src = a.ctx.createBufferSource()
  src.buffer = buffer
  const band = a.ctx.createBiquadFilter()
  band.type = 'bandpass'
  band.Q.value = 1.2
  band.frequency.setValueAtTime(from, t)
  band.frequency.exponentialRampToValueAtTime(to, t + dur)
  const g = a.ctx.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(level, t + dur * 0.3)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(band).connect(g).connect(a.out)
  src.start(t)
}

const C5 = 523.25
const E5 = 659.25
const G5 = 783.99
const C6 = 1046.5

export const sfx = {
  check() {
    tone(660, 0, 0.12, 'triangle', 0.5)
    tone(990, 0.07, 0.22, 'sine', 0.45)
  },
  uncheck() {
    tone(520, 0, 0.12, 'sine', 0.3, 380)
  },
  flip() {
    whoosh(0, 0.22, 600, 2400, 0.35)
  },
  card() {
    tone(G5, 0, 0.14, 'triangle', 0.45)
    tone(1175, 0.08, 0.26, 'sine', 0.4)
  },
  coin() {
    tone(1320, 0, 0.07, 'square', 0.12)
    tone(1760, 0.06, 0.2, 'sine', 0.35)
  },
  levelUp() {
    ;[C5, E5, G5, C6].forEach((f, i) => tone(f, i * 0.085, 0.3, 'triangle', 0.45))
    tone(C6 * 1.5, 0.36, 0.5, 'sine', 0.25)
  },
  depart() {
    whoosh(0, 0.6, 300, 1800, 0.3)
    tone(392, 0.05, 0.3, 'sine', 0.25, 523)
  },
  loot() {
    ;[1568, 1976, 2349, 2637, 3136].forEach((f, i) => tone(f, i * 0.06, 0.18, 'sine', 0.25))
  },
  evolveCharge() {
    whoosh(0, 1.3, 200, 3000, 0.35)
    tone(220, 0, 1.3, 'sine', 0.2, 440)
  },
  evolveBurst() {
    ;[C5, E5, G5, 987.77].forEach((f) => tone(f, 0, 1.6, 'triangle', 0.22))
    ;[C6, 1318.5, 1568].forEach((f, i) => tone(f, 0.1 + i * 0.08, 1.1, 'sine', 0.18))
  },
}
