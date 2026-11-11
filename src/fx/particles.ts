// One full-screen canvas for bursts of light, plus floating "+25 XP" labels.
// Nothing runs when the system asks for reduced motion.

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  life: number // seconds left
  max: number
  size: number
  color: string
  spin: number
  angle: number
  shape: 'dot' | 'diamond'
  gravity: number
}

let canvas: HTMLCanvasElement | null = null
let g: CanvasRenderingContext2D | null = null
let parts: Particle[] = []
let running = false
let last = 0

export const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function ensureCanvas() {
  if (canvas) return
  canvas = document.createElement('canvas')
  canvas.className = 'fx-canvas'
  canvas.setAttribute('aria-hidden', 'true')
  document.body.appendChild(canvas)
  g = canvas.getContext('2d')
  const resize = () => {
    const dpr = window.devicePixelRatio || 1
    canvas!.width = innerWidth * dpr
    canvas!.height = innerHeight * dpr
    g?.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  resize()
  window.addEventListener('resize', resize)
}

function frame(now: number) {
  const dt = Math.min(0.05, (now - last) / 1000)
  last = now
  if (!g || !canvas) return
  g.clearRect(0, 0, innerWidth, innerHeight)
  parts = parts.filter((p) => (p.life -= dt) > 0)
  for (const p of parts) {
    p.vy += p.gravity * dt
    p.vx *= 0.985
    p.x += p.vx * dt
    p.y += p.vy * dt
    p.angle += p.spin * dt
    const t = p.life / p.max
    g.globalAlpha = Math.min(1, t * 1.6)
    g.fillStyle = p.color
    g.shadowColor = p.color
    g.shadowBlur = 8
    g.save()
    g.translate(p.x, p.y)
    g.rotate(p.angle)
    const s = p.size * (0.6 + 0.4 * t)
    if (p.shape === 'diamond') {
      g.beginPath()
      g.moveTo(0, -s)
      g.lineTo(s * 0.6, 0)
      g.lineTo(0, s)
      g.lineTo(-s * 0.6, 0)
      g.closePath()
      g.fill()
    } else {
      g.beginPath()
      g.arc(0, 0, s * 0.5, 0, Math.PI * 2)
      g.fill()
    }
    g.restore()
  }
  g.globalAlpha = 1
  if (parts.length) requestAnimationFrame(frame)
  else running = false
}

export function burst(
  x: number,
  y: number,
  colors: string[],
  { count = 22, power = 1, spread = Math.PI * 2, upward = false } = {},
) {
  if (reducedMotion()) return
  ensureCanvas()
  for (let i = 0; i < count; i++) {
    const a = upward ? -Math.PI / 2 + (Math.random() - 0.5) * spread : Math.random() * spread
    const speed = (180 + Math.random() * 260) * power
    const max = 0.6 + Math.random() * 0.6
    parts.push({
      x,
      y,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed - 120 * power,
      life: max,
      max,
      size: 4 + Math.random() * 5,
      color: colors[i % colors.length],
      spin: (Math.random() - 0.5) * 12,
      angle: Math.random() * Math.PI,
      shape: Math.random() < 0.55 ? 'diamond' : 'dot',
      gravity: 520,
    })
  }
  if (!running) {
    running = true
    last = performance.now()
    requestAnimationFrame(frame)
  }
}

/** Stars appearing in a circle and drifting gently outward. */
export function ring(x: number, y: number, colors: string[], radius = 80, count = 14) {
  if (reducedMotion()) return
  ensureCanvas()
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2
    const max = 1.1 + Math.random() * 0.5
    parts.push({
      x: x + Math.cos(a) * radius,
      y: y + Math.sin(a) * radius,
      vx: Math.cos(a) * 30,
      vy: Math.sin(a) * 30 - 20,
      life: max,
      max,
      size: 5 + Math.random() * 3,
      color: colors[i % colors.length],
      spin: 2,
      angle: 0,
      shape: 'diamond',
      gravity: 0,
    })
  }
  if (!running) {
    running = true
    last = performance.now()
    requestAnimationFrame(frame)
  }
}

export function burstFrom(el: Element | null, colors: string[], opts?: Parameters<typeof burst>[3]) {
  if (!el) return
  const r = el.getBoundingClientRect()
  burst(r.left + r.width / 2, r.top + r.height / 2, colors, opts)
}

/** A short label that rises and fades, e.g. "+25 XP". */
export function floatText(el: Element | null, text: string, color = 'var(--accent-text)') {
  if (!el || reducedMotion()) return
  const r = el.getBoundingClientRect()
  const span = document.createElement('span')
  span.className = 'fx-float'
  span.textContent = text
  span.style.left = `${r.left + r.width / 2}px`
  span.style.top = `${r.top}px`
  span.style.color = color
  document.body.appendChild(span)
  span.addEventListener('animationend', () => span.remove())
}

/** Reads a colour token from the stylesheet, e.g. cssVar('--cat-body'). */
export function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#4fd1c5'
}
