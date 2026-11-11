import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { CHEST_LABEL, type ChestRewards } from '../game/chests'
import { getItem } from '../game/items'
import { useGame } from '../game/store'
import type { ChestRarity } from '../game/types'
import { burstFrom, cssVar } from '../fx/particles'
import { sfx } from '../fx/sound'
import { Icon } from './Icon'
import { ItemArt } from './ItemArt'
import { Button, RarityChip } from './ui'
import './ChestOverlay.css'

const COLORS: Record<ChestRarity, { body: string; trim: string; gem: string }> = {
  common: { body: '#5c6378', trim: '#9aa0b4', gem: '#4fd1c5' },
  rare: { body: '#2f4f8f', trim: '#8ab8ff', gem: '#bfe1ff' },
  legendary: { body: '#4b3585', trim: '#f5b544', gem: '#e3d4ff' },
}

const TAPS_TO_OPEN = 3

export function ChestArt({ rarity, cracks = 0, open = false, size = 180 }: { rarity: ChestRarity; cracks?: number; open?: boolean; size?: number }) {
  const c = COLORS[rarity]
  return (
    <svg className={`chest-art ${open ? 'is-open' : ''}`} viewBox="0 0 120 120" width={size} height={size} aria-hidden="true">
      <defs>
        <radialGradient id={`chest-glow-${rarity}`}>
          <stop offset="0" stopColor={c.gem} stopOpacity={0.9} />
          <stop offset="1" stopColor={c.gem} stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={60} cy={108} rx={40} ry={6} fill="#000" opacity={0.3} />
      {/* Light escaping once it opens */}
      <ellipse className="chest-light" cx={60} cy={56} rx={44} ry={30} fill={`url(#chest-glow-${rarity})`} />
      {/* Body */}
      <path d="M20 60 H100 L96 104 H24 Z" fill={c.body} />
      <path d="M20 60 H100 L99 70 H21 Z" fill="#000" opacity={0.18} />
      <rect x={18} y={78} width={84} height={6} fill={c.trim} opacity={0.85} />
      <rect x={30} y={60} width={6} height={44} fill={c.trim} opacity={0.6} />
      <rect x={84} y={60} width={6} height={44} fill={c.trim} opacity={0.6} />
      {/* Cracks of light, one per tap */}
      {[
        'M44 64 L50 72 L46 80 L52 90',
        'M76 66 L70 74 L76 82 L70 94',
        'M58 88 L62 96 L58 102',
      ]
        .slice(0, cracks)
        .map((d, i) => (
          <path key={i} d={d} className="chest-crack" stroke={c.gem} strokeWidth={2.2} fill="none" strokeLinecap="round" />
        ))}
      {/* Lid */}
      <g className="chest-lid">
        <path d="M16 60 C16 38 32 28 60 28 C88 28 104 38 104 60 Z" fill={c.body} />
        <path d="M16 60 C16 38 32 28 60 28 C88 28 104 38 104 60 Z" fill="#fff" opacity={0.08} />
        <path d="M16 56 H104 V62 H16 Z" fill={c.trim} />
        <path d="M30 34 C30 44 30 52 30 58 M90 34 C90 44 90 52 90 58" stroke={c.trim} strokeWidth={6} opacity={0.6} />
        <circle cx={60} cy={58} r={9} fill={c.trim} />
        <path d="M60 51 L65 58 L60 65 L55 58 Z" fill={c.gem} className="chest-gem" />
      </g>
    </svg>
  )
}

export function ChestOverlay({ onClose }: { onClose: () => void }) {
  const { state, openChest } = useGame()
  const chest = state.chests[0]
  const [taps, setTaps] = useState(0)
  const [rewards, setRewards] = useState<ChestRewards | null>(null)
  const [shown, setShown] = useState(chest)
  const art = useRef<HTMLButtonElement>(null)

  // Keep showing the opened chest after it leaves the list.
  useEffect(() => {
    if (!rewards && chest) setShown(chest)
  }, [chest, rewards])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!shown) return null
  const rarity = shown.rarity
  const item = rewards?.itemId ? getItem(rewards.itemId) : undefined

  const tap = () => {
    if (rewards || !chest) return
    const n = taps + 1
    setTaps(n)
    if (n < TAPS_TO_OPEN) {
      sfx.chestTap()
      return
    }
    sfx.chestOpen()
    setRewards(openChest(chest.id))
    const colors = rarity === 'legendary' ? [cssVar('--rarity-legendary'), cssVar('--gold'), '#ffffff'] : rarity === 'rare' ? [cssVar('--rarity-rare'), '#ffffff', cssVar('--accent')] : [cssVar('--accent'), cssVar('--gold'), '#ffffff']
    burstFrom(art.current, colors, { count: rarity === 'legendary' ? 90 : rarity === 'rare' ? 60 : 40, power: rarity === 'legendary' ? 1.6 : 1.2 })
  }

  const next = () => {
    setRewards(null)
    setTaps(0)
    if (state.chests.length === 0) onClose()
  }

  const left = state.chests.length

  return (
    <div className={`chest-overlay rarity-${rarity}`} role="dialog" aria-modal="true" aria-labelledby="chest-title">
      <button className="icon-btn chest-close" aria-label="Fermer" onClick={onClose}>
        <Icon name="close" />
      </button>
      <p className="chest-kicker">{CHEST_LABEL[rarity]}</p>
      <button
        ref={art}
        className={`chest-btn shake-${Math.min(taps, TAPS_TO_OPEN)}`}
        onClick={tap}
        disabled={!!rewards}
        aria-label={rewards ? 'Coffre ouvert' : `Toucher le coffre pour l’ouvrir (${TAPS_TO_OPEN - taps} coups)`}
        style={{ '--gem': COLORS[rarity].gem } as CSSProperties}
      >
        <ChestArt rarity={rarity} cracks={rewards ? 3 : taps} open={!!rewards} size={200} />
      </button>

      {rewards ? (
        <div className="chest-rewards" aria-live="polite">
          <h1 id="chest-title">Dans le coffre…</h1>
          <div className="chest-loot">
            <span className="loot-pill gold">
              <Icon name="coin" size={18} /> +{rewards.coins}
            </span>
            <span className="loot-pill">
              <Icon name="spark" size={18} /> +{rewards.xp} XP
            </span>
          </div>
          {item && (
            <div className={`chest-item rarity-${item.rarity}`}>
              <ItemArt item={item} size={72} />
              <strong>{item.name}</strong>
              <RarityChip rarity={item.rarity} />
              <small className="muted">Posé dans ton nid s’il reste de la place.</small>
            </div>
          )}
          <Button block onClick={next}>
            {left > 0 ? `Coffre suivant (${left})` : 'Super'}
          </Button>
        </div>
      ) : (
        <div className="chest-rewards">
          <h1 id="chest-title">{taps === 0 ? 'Un coffre !' : taps === 1 ? 'Ça résiste…' : 'Encore un coup !'}</h1>
          <p className="muted">Touche le coffre pour l’ouvrir.</p>
        </div>
      )}
    </div>
  )
}
