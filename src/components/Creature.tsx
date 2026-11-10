import { useId, type ReactNode } from 'react'
import type { Category, Stage } from '../game/types'
import './Creature.css'

export type Mood = 'idle' | 'happy' | 'sleep'

type Props = {
  stage: Stage
  branch: Category | null
  seed?: number
  mood?: Mood
  /** Tasks done so far; cracks the egg as it gets closer to hatching. */
  eggProgress?: number
  size?: number
  /** Change this value to play a short glow pulse (e.g. after a task). */
  pulseKey?: number
  label?: string
}

// Everything is drawn around the centre of a 200 x 200 box.
const C = 100

const PALETTE: Record<Category | 'spark', { light: string; main: string; deep: string }> = {
  spark: { light: '#f2fffd', main: '#8be6dc', deep: '#2fa89d' },
  body: { light: '#fff3e6', main: '#f5a66a', deep: '#c4622b' },
  mind: { light: '#eef5ff', main: '#8ab8ff', deep: '#3f6fd1' },
  create: { light: '#f6f0ff', main: '#c3a6ff', deep: '#7c55d9' },
  order: { light: '#effffd', main: '#6fe0d4', deep: '#1f9a8f' },
}

/** Tiny deterministic random generator, so a creature always looks the same. */
function rng(seed: number) {
  let s = seed >>> 0 || 1
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

function pt(r: number, deg: number, cx = C, cy = C): [number, number] {
  const a = ((deg - 90) * Math.PI) / 180
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
}

const poly = (pts: [number, number][]) =>
  'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L') + ' Z'

/** Smooth closed curve through points (Catmull-Rom turned into Béziers). */
function blob(pts: [number, number][]) {
  const n = pts.length
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n]
    const p1 = pts[i]
    const p2 = pts[(i + 1) % n]
    const p3 = pts[(i + 2) % n]
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }
  return d + ' Z'
}

/** Core body outline, its facet lines, and where the eyes sit. */
function coreShape(branch: Category | null, r: number) {
  switch (branch) {
    case 'body': {
      // A forward-leaning shard: sharp, fast-looking.
      const pts: [number, number][] = [
        pt(r * 1.55, 8),
        pt(r * 1.0, 75),
        pt(r * 1.25, 160),
        pt(r * 1.05, 215),
        pt(r * 1.0, 290),
      ]
      return { d: poly(pts), facets: pts, eyeY: C - r * 0.05 }
    }
    case 'mind': {
      const d = `M${C} ${C - r} A${r} ${r} 0 1 1 ${C - 0.01} ${C - r} Z`
      const facets: [number, number][] = [0, 120, 240].map((a) => pt(r, a))
      return { d, facets, eyeY: C - r * 0.05 }
    }
    case 'create': {
      const radii = [1.1, 0.88, 1.18, 0.92, 1.05, 0.8, 1.12]
      const pts = radii.map((k, i) => pt(r * k, (360 / radii.length) * i + 10))
      return { d: blob(pts), facets: [] as [number, number][], eyeY: C - r * 0.08 }
    }
    case 'order': {
      const pts = [0, 60, 120, 180, 240, 300].map((a) => pt(r * 1.2, a))
      return { d: poly(pts), facets: pts, eyeY: C - r * 0.02 }
    }
    default: {
      const pts: [number, number][] = [
        [C, C - r * 1.5],
        [C + r, C],
        [C, C + r * 1.5],
        [C - r, C],
      ]
      return { d: poly(pts), facets: pts, eyeY: C - r * 0.05 }
    }
  }
}

/** Decorations around the body. More of them at each stage. */
function ornaments(branch: Category, stage: Stage, r: number, rand: () => number, fill: string) {
  const level = stage - 1 // 1, 2 or 3
  const turn = rand() * 360
  const out: ReactNode[] = []

  if (branch === 'body') {
    const count = [0, 3, 5, 7][level]
    const shards = Array.from({ length: count }, (_, i) => {
      const a = turn + (360 / count) * i
      const tip = pt(r * 2.35, a)
      const l = pt(r * 1.75, a - 7)
      const rr = pt(r * 1.75, a + 7)
      return <path key={i} d={poly([tip, l, rr])} fill={fill} opacity={0.85} />
    })
    out.push(
      <g key="shards" className="cr-spin">
        {shards}
      </g>,
    )
    if (level >= 3) {
      const rays = Array.from({ length: 12 }, (_, i) => {
        const a = (360 / 12) * i
        const [x1, y1] = pt(r * 2.6, a)
        const [x2, y2] = pt(r * 2.9, a)
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
      })
      out.push(
        <g key="rays" className="cr-spin-rev" stroke={fill} strokeWidth={2} strokeLinecap="round" opacity={0.6}>
          {rays}
        </g>,
      )
    }
  }

  if (branch === 'mind') {
    const rings = [0, 1, 2, 3][level]
    for (let i = 0; i < rings; i++) {
      const tilt = -25 + i * 50 + (rand() - 0.5) * 10
      const rx = r * (2 + i * 0.25)
      const ry = r * 0.55
      out.push(
        <g key={`ring${i}`} transform={`rotate(${tilt} ${C} ${C})`}>
          <g className={i % 2 ? 'cr-spin-rev' : 'cr-spin'}>
            <ellipse cx={C} cy={C} rx={rx} ry={ry} fill="none" stroke={fill} strokeWidth={1.5} opacity={0.55} />
            <circle cx={C + rx} cy={C} r={3.5} fill={fill} />
          </g>
        </g>,
      )
    }
    if (level >= 3) {
      const dots = Array.from({ length: 5 }, (_, i) => {
        const [x, y] = pt(r * 1.75, -40 + i * 20)
        return <circle key={i} cx={x} cy={y} r={i === 2 ? 4 : 2.6} fill={fill} />
      })
      out.push(
        <g key="crown" className="cr-twinkle">
          {dots}
        </g>,
      )
    }
  }

  if (branch === 'create') {
    const count = [0, 2, 3, 5][level]
    const tendrils = Array.from({ length: count }, (_, i) => {
      const a = turn + i * (300 / count) + rand() * 30
      const len = r * (1.8 + rand() * 0.7)
      const [x0, y0] = pt(r * 0.9, a)
      const [cx, cy] = pt(len * 0.8, a + 35)
      const [x1, y1] = pt(len, a + 10)
      return (
        <g key={i} className="cr-sway" style={{ animationDelay: `${-i * 0.9}s` }}>
          <path
            d={`M${x0} ${y0} Q${cx} ${cy} ${x1} ${y1}`}
            fill="none"
            stroke={fill}
            strokeWidth={3}
            strokeLinecap="round"
            opacity={0.75}
          />
          <circle cx={x1} cy={y1} r={4} fill={fill} />
        </g>
      )
    })
    out.push(<g key="tendrils">{tendrils}</g>)
    if (level >= 2) {
      const bits = Array.from({ length: level * 2 }, (_, i) => {
        const [x, y] = pt(r * (2 + rand() * 0.6), rand() * 360)
        const s = 3 + rand() * 3
        return (
          <path
            key={i}
            className="cr-drift"
            style={{ animationDelay: `${-i * 1.3}s` }}
            d={poly([
              [x, y - s],
              [x + s * 0.7, y],
              [x, y + s],
              [x - s * 0.7, y],
            ])}
            fill={fill}
            opacity={0.7}
          />
        )
      })
      out.push(<g key="bits">{bits}</g>)
    }
  }

  if (branch === 'order') {
    const count = [0, 2, 4, 6][level]
    const start = count === 2 ? 90 : 0
    const crystals = Array.from({ length: count }, (_, i) => {
      const a = start + (360 / count) * i
      const [x, y] = pt(r * 2.05, a)
      const s = r * 0.32
      return (
        <path
          key={i}
          d={poly([pt(s * 1.5, a, x, y), pt(s, a + 90, x, y), pt(s * 1.5, a + 180, x, y), pt(s, a + 270, x, y)])}
          fill={fill}
          opacity={0.85}
        />
      )
    })
    out.push(
      <g key="crystals" className="cr-spin">
        {crystals}
      </g>,
    )
    if (level >= 3) {
      const tri = (o: number) => poly([0, 120, 240].map((a) => pt(r * 2.7, a + o)))
      out.push(
        <g key="frame" className="cr-spin-rev" fill="none" stroke={fill} strokeWidth={1.5} opacity={0.5}>
          <path d={tri(0)} />
          <path d={tri(60)} />
        </g>,
      )
    }
  }

  return out
}

function Eyes({ y, gap, size, mood }: { y: number; gap: number; size: number; mood: Mood }) {
  if (mood === 'sleep') {
    return (
      <g stroke="#0b1416" strokeWidth={2.4} strokeLinecap="round" fill="none">
        <path d={`M${C - gap - size} ${y} q${size} ${size * 0.8} ${size * 2} 0`} />
        <path d={`M${C + gap - size} ${y} q${size} ${size * 0.8} ${size * 2} 0`} />
      </g>
    )
  }
  return (
    <g className="cr-blink" fill="#0b1416">
      <ellipse cx={C - gap} cy={y} rx={size * 0.8} ry={size} />
      <ellipse cx={C + gap} cy={y} rx={size * 0.8} ry={size} />
      <circle cx={C - gap + size * 0.3} cy={y - size * 0.35} r={size * 0.28} fill="#fff" opacity={0.8} />
      <circle cx={C + gap + size * 0.3} cy={y - size * 0.35} r={size * 0.28} fill="#fff" opacity={0.8} />
    </g>
  )
}

function Egg({ progress, ids }: { progress: number; ids: { glow: string; body: string } }) {
  const shell =
    'M100 46 C128 46 146 96 146 122 C146 150 126 166 100 166 C74 166 54 150 54 122 C54 96 72 46 100 46 Z'
  // Cracks appear one by one as the first tasks get done.
  const cracks = [
    'M78 92 L88 100 L84 110 L94 118',
    'M122 98 L112 108 L118 118 L108 126',
    'M92 140 L100 132 L108 142 L116 136',
  ].slice(0, Math.min(3, progress))

  return (
    <g className="cr-wobble">
      <ellipse cx={C} cy={176} rx={40} ry={6} fill="#000" opacity={0.25} />
      <path d={shell} fill={`url(#${ids.body})`} />
      {/* Geometric band */}
      <path
        d="M57 112 L72 104 L86 114 L100 104 L114 114 L128 104 L143 112"
        fill="none"
        stroke="#ffffff"
        strokeOpacity={0.35}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <path d="M100 46 C88 60 82 76 80 92" fill="none" stroke="#fff" strokeOpacity={0.35} strokeWidth={2} strokeLinecap="round" />
      {cracks.map((d, i) => (
        <path
          key={i}
          d={d}
          className="cr-crack"
          fill="none"
          stroke="#f2fffd"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      <circle cx={C} cy={118} r={22 + progress * 8} fill={`url(#${ids.glow})`} opacity={0.35 + progress * 0.15} />
    </g>
  )
}

export function Creature({
  stage,
  branch,
  seed = 1,
  mood = 'idle',
  eggProgress = 0,
  size = 180,
  pulseKey,
  label,
}: Props) {
  const uid = useId().replace(/:/g, '')
  const ids = { glow: `g${uid}`, body: `b${uid}`, egg: `e${uid}` }
  const rand = rng(seed)
  // Each creature gets a slightly different tint, within its branch colour.
  const hue = Math.round((rand() - 0.5) * 24)
  const colors = PALETTE[stage <= 1 || !branch ? 'spark' : branch]
  const r = [0, 26, 30, 32, 34][stage]
  const haloR = [70, 70, 82, 90, 98][stage]
  const core = coreShape(stage <= 1 ? null : branch, r)
  const sleeping = mood === 'sleep'

  return (
    <div
      className={`creature mood-${mood}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={label}
    >
      <svg viewBox="0 0 200 200" width="100%" height="100%" style={{ filter: hue ? `hue-rotate(${hue}deg)` : undefined }}>
        <defs>
          <radialGradient id={ids.glow} cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor={colors.main} stopOpacity={0.6} />
            <stop offset="1" stopColor={colors.main} stopOpacity={0} />
          </radialGradient>
          <radialGradient id={ids.body} cx="42%" cy="36%" r="70%">
            <stop offset="0" stopColor={colors.light} />
            <stop offset="0.5" stopColor={colors.main} />
            <stop offset="1" stopColor={colors.deep} />
          </radialGradient>
        </defs>

        <circle
          key={pulseKey}
          className={`cr-halo ${pulseKey ? 'cr-pulse' : ''}`}
          cx={C}
          cy={C}
          r={haloR}
          fill={`url(#${ids.glow})`}
          opacity={sleeping ? 0.35 : 1}
        />

        {stage === 0 ? (
          <Egg progress={eggProgress} ids={{ glow: ids.glow, body: ids.body }} />
        ) : (
          <g className="cr-float">
            {branch && stage >= 2 && <g opacity={sleeping ? 0.45 : 1}>{ornaments(branch, stage, r, rand, colors.main)}</g>}
            <g className="cr-body">
              <path d={core.d} fill={`url(#${ids.body})`} opacity={sleeping ? 0.7 : 1} />
              {core.facets.map(([x, y], i) => (
                <line key={i} x1={C} y1={C} x2={x} y2={y} stroke="#fff" strokeOpacity={0.22} strokeWidth={1.2} />
              ))}
              <Eyes y={core.eyeY} gap={r * 0.32} size={r * 0.15} mood={mood} />
            </g>
          </g>
        )}

        {!sleeping &&
          [0, 1, 2].map((i) => {
            const [x, y] = pt(haloR * (0.6 + rand() * 0.3), rand() * 360)
            return (
              <circle
                key={i}
                className="cr-mote"
                style={{ animationDelay: `${-i * 2}s` }}
                cx={x}
                cy={y}
                r={1.6 + rand() * 1.2}
                fill={colors.light}
              />
            )
          })}
      </svg>
    </div>
  )
}
