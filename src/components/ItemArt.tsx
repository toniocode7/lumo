import { useId } from 'react'
import type { Item } from '../game/items'
import './ItemArt.css'

// Every decoration is drawn here, in a 64 x 64 box standing on y = 60.
function draw(art: Item['art'], c: string, glow: string) {
  switch (art) {
    case 'fern':
      return (
        <g stroke={c} strokeWidth={2.4} strokeLinecap="round" fill="none">
          <path d="M32 60 C31 44 26 30 16 20" />
          <path d="M32 60 C33 42 38 28 48 18" />
          <path d="M32 60 C32 40 32 26 32 10" />
          <path d="M32 60 C28 50 18 44 8 42" />
          <path d="M32 60 C36 50 46 44 56 42" />
          <g strokeWidth={1.6} opacity={0.8}>
            <path d="M24 32 l-6 2 M28 40 l-7 1 M38 32 l6 1 M36 40 l7 0 M32 22 l-5 -3 M32 22 l5 -3" />
          </g>
        </g>
      )
    case 'cactus':
      return (
        <g fill={c}>
          <path d="M26 60 V22 L32 14 L38 22 V60 Z" />
          <path d="M26 40 H18 V30 L21 26 L24 30 V36 H26 Z" opacity={0.85} />
          <path d="M38 34 H44 V24 L47 20 L50 24 V38 H38 Z" opacity={0.85} />
          <path d="M32 14 V60" stroke="#fff" strokeOpacity={0.25} strokeWidth={1.2} />
          <circle cx={32} cy={13} r={3} fill="#ff9ec4" />
        </g>
      )
    case 'bonsai':
      return (
        <g>
          <path d="M31 60 C30 50 34 46 30 38 C28 34 24 32 22 30 M31 46 C36 42 40 40 42 34" stroke="#8b6a52" strokeWidth={3.5} fill="none" strokeLinecap="round" />
          <circle cx={20} cy={26} r={9} fill={c} />
          <circle cx={42} cy={28} r={8} fill={c} opacity={0.9} />
          <circle cx={31} cy={18} r={10} fill={c} />
          <circle cx={28} cy={15} r={3} fill="#fff" opacity={0.25} />
          <rect x={20} y={58} width={24} height={4} rx={2} fill="#5c6178" />
        </g>
      )
    case 'lantern':
      return (
        <g>
          <circle cx={32} cy={36} r={16} fill={glow} className="art-glow" />
          <path d="M26 20 H38 L36 16 H28 Z" fill="#5c6178" />
          <rect x={25} y={20} width={14} height={28} rx={4} fill={c} opacity={0.9} />
          <rect x={29} y={24} width={6} height={20} rx={3} fill="#fff" opacity={0.6} />
          <rect x={23} y={48} width={18} height={4} rx={2} fill="#5c6178" />
          <rect x={30} y={52} width={4} height={8} fill="#5c6178" />
        </g>
      )
    case 'garland':
      return (
        <g>
          <path d="M8 60 V18 M56 60 V18" stroke="#5c6178" strokeWidth={2.5} strokeLinecap="round" />
          <path d="M8 20 Q32 40 56 20" stroke="#8a90a6" strokeWidth={1.2} fill="none" />
          {[0.15, 0.32, 0.5, 0.68, 0.85].map((t, i) => {
            const x = 8 + 48 * t
            const y = (1 - t) * (1 - t) * 20 + 2 * (1 - t) * t * 40 + t * t * 20
            return <circle key={i} cx={x} cy={y + 2} r={3} fill={c} className="art-twinkle" style={{ animationDelay: `${-i * 0.5}s` }} />
          })}
        </g>
      )
    case 'fireflies':
      return (
        <g>
          <path d="M14 60 C20 52 24 54 30 60 M34 60 C40 50 46 52 52 60" stroke="#3f5a4a" strokeWidth={2} fill="none" />
          {[
            [20, 30],
            [34, 18],
            [46, 34],
            [28, 44],
            [42, 46],
          ].map(([x, y], i) => (
            <g key={i} className="art-drift" style={{ animationDelay: `${-i * 0.8}s` }}>
              <circle cx={x} cy={y} r={6} fill={glow} />
              <circle cx={x} cy={y} r={2.2} fill={c} />
            </g>
          ))}
        </g>
      )
    case 'pebble':
      return (
        <g>
          <ellipse cx={32} cy={52} rx={18} ry={9} fill={c} />
          <ellipse cx={26} cy={48} rx={7} ry={3} fill="#fff" opacity={0.3} />
          <ellipse cx={32} cy={61} rx={18} ry={2} fill="#000" opacity={0.2} />
        </g>
      )
    case 'cairn':
      return (
        <g fill={c}>
          <ellipse cx={32} cy={54} rx={16} ry={6} />
          <ellipse cx={31} cy={44} rx={12} ry={5} opacity={0.9} />
          <ellipse cx={33} cy={35.5} rx={9} ry={4} opacity={0.85} />
          <ellipse cx={32} cy={28.5} rx={6} ry={3} opacity={0.8} />
          <ellipse cx={28} cy={52} rx={5} ry={1.6} fill="#fff" opacity={0.25} />
        </g>
      )
    case 'crystal':
      return (
        <g>
          <circle cx={32} cy={38} r={20} fill={glow} className="art-glow" />
          <path d="M32 8 L40 24 L38 60 H26 L24 24 Z" fill={c} />
          <path d="M32 8 L40 24 L32 60 Z" fill="#fff" opacity={0.2} />
          <path d="M18 30 L23 38 L22 60 H14 L13 38 Z" fill={c} opacity={0.8} />
          <path d="M46 26 L51 36 L50 60 H42 L41 36 Z" fill={c} opacity={0.85} />
        </g>
      )
    case 'mushroom':
      return (
        <g>
          <circle cx={32} cy={34} r={18} fill={glow} className="art-glow" />
          <path d="M28 60 C28 50 29 42 30 38 H35 C36 42 37 50 36 60 Z" fill="#dfe3ee" />
          <path d="M14 40 C14 26 22 18 32 18 C42 18 50 26 50 40 Z" fill={c} />
          <circle cx={24} cy={30} r={2.5} fill="#fff" opacity={0.8} />
          <circle cx={36} cy={26} r={2} fill="#fff" opacity={0.8} />
          <circle cx={42} cy={34} r={2.2} fill="#fff" opacity={0.8} />
          <path d="M42 60 C42 54 43 50 44 48 H47 C48 50 48 54 48 60 Z" fill="#dfe3ee" opacity={0.8} />
          <path d="M38 50 C38 44 42 42 45.5 42 C49 42 53 44 53 50 Z" fill={c} opacity={0.8} />
        </g>
      )
    case 'feather':
      return (
        <g>
          <path d="M18 60 C24 44 34 22 50 8 C52 24 44 42 24 54 Z" fill={c} />
          <path d="M18 60 C28 42 38 26 50 8" stroke="#fff" strokeOpacity={0.5} strokeWidth={1.4} fill="none" />
          <path d="M30 40 L24 38 M36 30 L30 27 M40 36 L46 32 M34 46 L40 44" stroke="#fff" strokeOpacity={0.35} strokeWidth={1.2} />
        </g>
      )
    case 'hourglass':
      return (
        <g>
          <circle cx={32} cy={36} r={18} fill={glow} className="art-glow" />
          <rect x={18} y={12} width={28} height={4} rx={2} fill="#8a90a6" />
          <rect x={18} y={56} width={28} height={4} rx={2} fill="#8a90a6" />
          <path d="M22 16 H42 L34 36 L42 56 H22 L30 36 Z" fill="#fff" opacity={0.15} stroke="#cfd6e6" strokeWidth={1.2} />
          <path d="M26 20 H38 L32 32 Z" fill={c} />
          <path d="M26 56 L32 46 L38 56 Z" fill={c} />
          <path d="M32 32 V46" stroke={c} strokeWidth={1.2} />
        </g>
      )
    case 'driftwood':
      return (
        <g>
          <path d="M8 56 C18 50 30 54 40 48 C46 44 52 44 58 46 L58 50 C52 49 46 50 42 54 C32 60 18 60 8 60 Z" fill={c} />
          <path d="M30 52 C34 44 36 38 34 30" stroke={c} strokeWidth={3} strokeLinecap="round" fill="none" />
          <path d="M14 57 C24 55 34 55 44 51" stroke="#fff" strokeOpacity={0.25} strokeWidth={1.2} fill="none" />
        </g>
      )
    case 'sprout':
      return (
        <g>
          <circle cx={32} cy={50} r={14} fill={glow} className="art-glow" />
          <path d="M32 58 C32 46 32 36 32 30" stroke="#7bc29a" strokeWidth={2.5} fill="none" strokeLinecap="round" />
          <path d="M32 38 C24 38 18 32 18 24 C26 24 32 30 32 38 Z" fill="#7bc29a" />
          <path d="M32 34 C40 34 46 28 46 20 C38 20 32 26 32 34 Z" fill="#8fd6ad" />
          <ellipse cx={32} cy={56} rx={7} ry={5} fill={c} />
          <ellipse cx={30} cy={54} rx={2.5} ry={1.5} fill="#fff" opacity={0.6} />
        </g>
      )
    case 'moss':
      return (
        <g>
          <ellipse cx={32} cy={52} rx={24} ry={14} fill={glow} className="art-glow" />
          <path d="M8 60 C8 48 18 42 26 46 C30 38 42 38 46 46 C52 42 58 50 56 60 Z" fill="#3f7a5c" />
          {[
            [16, 52],
            [24, 48],
            [34, 46],
            [42, 50],
            [50, 54],
            [30, 54],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={1.8} fill={c} className="art-twinkle" style={{ animationDelay: `${-i * 0.4}s` }} />
          ))}
        </g>
      )
    case 'star':
      return (
        <g>
          <circle cx={32} cy={34} r={20} fill={glow} className="art-glow" />
          <path d="M32 8 L37 29 L58 34 L37 39 L32 60 L27 39 L6 34 L27 29 Z" fill={c} />
          <path d="M32 8 L37 29 L32 34 Z M58 34 L37 39 L32 34 Z" fill="#fff" opacity={0.35} />
        </g>
      )
    case 'moon':
      return (
        <g>
          <circle cx={32} cy={40} r={20} fill={glow} className="art-glow" />
          <circle cx={32} cy={42} r={16} fill={c} />
          <circle cx={38} cy={38} r={13} fill="#9aa6c8" opacity={0.35} />
          <circle cx={26} cy={36} r={3} fill="#fff" opacity={0.6} />
        </g>
      )
    case 'backdrop':
      return null
  }
}

export function ItemArt({ item, size = 56 }: { item: Item; size?: number }) {
  const id = useId().replace(/:/g, '')
  if (item.kind === 'backdrop') {
    return <span className={`backdrop-swatch backdrop-${item.id}`} style={{ width: size, height: size }} aria-hidden="true" />
  }
  return (
    <svg className="item-art" viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
      <defs>
        <radialGradient id={id}>
          <stop offset="0" stopColor={item.color} stopOpacity={0.45} />
          <stop offset="1" stopColor={item.color} stopOpacity={0} />
        </radialGradient>
      </defs>
      {draw(item.art, item.color, `url(#${id})`)}
    </svg>
  )
}
