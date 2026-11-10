import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'
import { Icon, type IconName } from './Icon'
import './ui.css'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'gold'

export function Button({
  variant = 'primary',
  icon,
  block,
  children,
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  icon?: IconName
  block?: boolean
}) {
  return (
    <button
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
}: {
  value: number
  max: number
  tone?: 'accent' | 'gold' | 'coral'
  label: string
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div
      className={`progress progress-${tone}`}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
    >
      <div className="progress-fill" style={{ width: `${pct}%` }} />
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

export type Rarity = 'common' | 'rare' | 'legendary'
const rarityLabel: Record<Rarity, string> = {
  common: 'Commune',
  rare: 'Rare',
  legendary: 'Légendaire',
}

export function RarityChip({ rarity }: { rarity: Rarity }) {
  return <span className={`chip chip-${rarity}`}>{rarityLabel[rarity]}</span>
}

export type Category = 'body' | 'mind' | 'create' | 'order'
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
