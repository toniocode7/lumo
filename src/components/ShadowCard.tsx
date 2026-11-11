import { useEffect, useRef, useState } from 'react'
import { weekOf } from '../game/streak'
import { dayKey } from '../game/rules'
import { capitalize } from '../game/shadow'
import { useGame } from '../game/store'
import type { Shadow } from '../game/types'
import { sfx } from '../fx/sound'
import { floatText } from '../fx/particles'
import { ProgressBar } from './ui'
import './ShadowCard.css'

export function ShadowArt({ shadow, size = 96, hit = 0 }: { shadow: Shadow; size?: number; hit?: number }) {
  const ratio = shadow.hp / shadow.maxHp
  return (
    <svg
      key={hit}
      className={`shadow-art ${shadow.defeated ? 'is-gone' : ''} ${hit ? 'is-hit' : ''}`}
      viewBox="0 0 100 100"
      width={size}
      height={size}
      aria-hidden="true"
      style={{ filter: `hue-rotate(${shadow.hue}deg)` }}
    >
      <defs>
        <radialGradient id="shadow-body" cx="45%" cy="40%" r="65%">
          <stop offset="0" stopColor="#4a3d6b" />
          <stop offset="0.6" stopColor="#241d38" />
          <stop offset="1" stopColor="#120e1d" stopOpacity="0.9" />
        </radialGradient>
        <radialGradient id="shadow-eye">
          <stop offset="0" stopColor="#ffd2f0" />
          <stop offset="0.5" stopColor="#c86bd9" />
          <stop offset="1" stopColor="#c86bd9" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g className="shadow-wisps" opacity={0.7}>
        <path d="M20 70 C10 80 14 92 6 96" stroke="#2c2444" strokeWidth={6} fill="none" strokeLinecap="round" />
        <path d="M80 70 C90 82 86 90 96 96" stroke="#2c2444" strokeWidth={6} fill="none" strokeLinecap="round" />
        <path d="M50 80 C48 90 54 94 50 99" stroke="#2c2444" strokeWidth={5} fill="none" strokeLinecap="round" />
      </g>
      {/* Shrinks as it loses HP */}
      <g className="shadow-body" style={{ transform: `scale(${(0.72 + 0.28 * ratio).toFixed(3)})` }}>
        <path
          d="M50 12 C70 12 86 26 86 46 C86 64 78 78 66 80 C60 86 54 78 50 84 C46 78 40 86 34 80 C22 78 14 64 14 46 C14 26 30 12 50 12 Z"
          fill="url(#shadow-body)"
        />
        <ellipse cx={38} cy={44} rx={8} ry={6} fill="url(#shadow-eye)" className="shadow-eye" />
        <ellipse cx={62} cy={44} rx={8} ry={6} fill="url(#shadow-eye)" className="shadow-eye" />
        <circle cx={38} cy={44} r={2.2} fill="#fff" />
        <circle cx={62} cy={44} r={2.2} fill="#fff" />
        <path d="M30 35 L44 39 M70 35 L56 39" stroke="#120e1d" strokeWidth={3} strokeLinecap="round" />
      </g>
    </svg>
  )
}

/** This week's Shadow on the home screen: HP bar, days left, flinches when hit. */
export function ShadowCard() {
  const { state } = useGame()
  const shadow = state.shadow
  const [hit, setHit] = useState(0)
  const last = useRef(shadow?.hp)
  const card = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!shadow) return
    const prev = last.current
    last.current = shadow.hp
    if (prev !== undefined && shadow.hp < prev) {
      setHit((h) => h + 1)
      sfx.shadowHit()
      floatText(card.current?.querySelector('.shadow-art') ?? null, `-${prev - shadow.hp}`, '#d98bf0')
    }
  }, [shadow])

  if (!shadow) return null
  const today = dayKey()
  const daysLeft = shadow.week === weekOf(today) ? Math.max(1, 7 - Math.round((Date.parse(today) - Date.parse(shadow.week)) / 86_400_000)) : 0

  return (
    <div ref={card} className={`shadow-card ${shadow.defeated ? 'is-defeated' : ''}`}>
      <ShadowArt shadow={shadow} hit={hit} size={84} />
      <div className="shadow-info">
        <small className="shadow-kicker">{shadow.defeated ? 'Ombre dissipée' : 'L’Ombre de la semaine'}</small>
        <strong>{capitalize(shadow.name)}</strong>
        {shadow.defeated ? (
          <p className="muted">Bien joué. La prochaine arrive lundi.</p>
        ) : (
          <>
            <ProgressBar value={shadow.hp} max={shadow.maxHp} tone="coral" label="Points de vie de l’Ombre" />
            <p className="muted">
              <span className="num">{shadow.hp}</span> PV · encore {daysLeft} jour{daysLeft > 1 ? 's' : ''}. Chaque XP
              gagné la fait reculer.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
