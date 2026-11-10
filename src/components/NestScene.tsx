import type { ReactNode } from 'react'
import { getItem } from '../game/items'
import { Icon } from './Icon'
import { ItemArt } from './ItemArt'
import './NestScene.css'

/** The creature's spot with its decorations around it. Slots go left to right. */
export function NestScene({
  slots,
  children,
  onSlot,
}: {
  slots: (string | null)[]
  children: ReactNode
  /** When set, every slot becomes a button (decorating mode). */
  onSlot?: (index: number) => void
}) {
  return (
    <div className={`nest-scene ${onSlot ? 'is-editing' : ''}`}>
      {slots.map((id, i) => {
        const item = id ? getItem(id) : undefined
        const art = item && <ItemArt item={item} size={i === 1 || i === 2 ? 46 : 60} />
        return (
          <div key={i} className={`nest-slot slot-${i}`}>
            {onSlot ? (
              <button
                className={`slot-btn ${item ? 'has-item' : ''}`}
                onClick={() => onSlot(i)}
                aria-label={item ? `Emplacement ${i + 1}\u00a0: ${item.name}. Changer` : `Emplacement ${i + 1} vide. Décorer`}
              >
                {art ?? <Icon name="plus" size={18} />}
              </button>
            ) : (
              art
            )}
          </div>
        )
      })}
      <div className="nest-creature">{children}</div>
    </div>
  )
}
