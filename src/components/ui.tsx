import { useEffect, useRef, useState, type ButtonHTMLAttributes, type CSSProperties, type ReactNode, type Ref } from 'react'
import { Icon, type IconName } from './Icon'
import type { Category, Rarity } from '../game/types'
import './ui.css'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'gold'

export function Button({
  variant = 'primary',
  icon,
  block,
  children,
  className = '',
  ref,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  icon?: IconName
  block?: boolean
  ref?: Ref<HTMLButtonElement>
}) {
  return (
    <button
      ref={ref}
      className={`btn btn-${variant} ${block ? 'btn-block' : ''} ${className}`}
      {...rest}
    >
      {icon && <Icon name={icon} size={18} />}
      {children}
    </button>
  )
}

export function IconButton({
  icon,
  label,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { icon: IconName; label: string }) {
  return (
    <button className="icon-btn" aria-label={label} title={label} {...rest}>
      <Icon name={icon} />
    </button>
  )
}

export function Card({
  children,
  className = '',
  style,
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
}) {
  return (
    <div className={`card ${className}`} style={style}>
      {children}
    </div>
  )
}

export function ProgressBar({
  value,
  max,
  tone = 'accent',
  label,
  cycle,
}: {
  value: number
  max: number
  tone?: 'accent' | 'gold' | 'coral'
  label: string
  /** Bump when the bar wraps around (a new level): it fills up, then restarts from zero. */
  cycle?: number
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  const [shown, setShown] = useState(pct)
  const [instant, setInstant] = useState(false)
  const [gaining, setGaining] = useState(false)
  const prev = useRef({ pct, cycle })

  useEffect(() => {
    const before = prev.current
    prev.current = { pct, cycle }
    const timers: ReturnType<typeof setTimeout>[] = []
    if (cycle !== undefined && before.cycle !== undefined && cycle > before.cycle) {
      // New level: finish the bar, snap back to empty, then fill to the new value.
      setShown(100)
      timers.push(setTimeout(() => (setInstant(true), setShown(0)), 650))
      timers.push(setTimeout(() => (setInstant(false), setShown(pct)), 700))
    } else {
      setShown(pct)
    }
    if (pct > before.pct || (cycle ?? 0) > (before.cycle ?? 0)) {
      setGaining(true)
      timers.push(setTimeout(() => setGaining(false), 1100))
    }
    return () => timers.forEach(clearTimeout)
  }, [pct, cycle])

  return (
    <div
      className={`progress progress-${tone} ${gaining ? 'is-gaining' : ''} ${instant ? 'is-instant' : ''}`}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
    >
      <div className="progress-fill" style={{ width: `${shown}%` }} />
    </div>
  )
}

export function Stat({
  icon,
  value,
  label,
  tone = 'accent',
}: {
  icon: IconName
  value: ReactNode
  label: string
  tone?: 'accent' | 'gold' | 'coral'
}) {
  return (
    <div className={`stat stat-${tone}`} aria-label={`${label} : ${value}`}>
      <span className="stat-icon">
        <Icon name={icon} size={16} />
      </span>
      <span className="num stat-value">{value}</span>
    </div>
  )
}

const rarityLabel: Record<Rarity, string> = {
  common: 'Commune',
  rare: 'Rare',
  legendary: 'Légendaire',
}

export function RarityChip({ rarity }: { rarity: Rarity }) {
  return <span className={`chip chip-${rarity}`}>{rarityLabel[rarity]}</span>
}

export const categoryLabel: Record<Category, string> = {
  body: 'Corps',
  mind: 'Esprit',
  create: 'Création',
  order: 'Ordre',
}

export function CategoryTag({ category }: { category: Category }) {
  return (
    <span className="cat-tag" style={{ '--c': `var(--cat-${category})` } as CSSProperties}>
      <span className="cat-dot" />
      {categoryLabel[category]}
    </span>
  )
}

export function ScreenHeader({ title, subtitle, action }: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <header className="screen-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      {action}
    </header>
  )
}

export function EmptyState({ icon, title, text }: { icon: IconName; title: string; text: string }) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <Icon name={icon} size={28} />
      </span>
      <h3>{title}</h3>
      <p className="muted">{text}</p>
    </div>
  )
}
