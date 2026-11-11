import { ITEMS } from './items'
import type { ChestRarity } from './types'

export const CHEST_LABEL: Record<ChestRarity, string> = {
  common: 'Coffre de pierre',
  rare: 'Coffre de cristal',
  legendary: 'Coffre d’aurore',
}

/** A common chest every 5 tasks (rare every 25), and one per level (rare every 5 levels). */
export const TASK_CHEST_EVERY = 5
export const TASK_RARE_CHEST_EVERY = 25
export const LEVEL_RARE_CHEST_EVERY = 5

const TABLE: Record<ChestRarity, { coins: [number, number]; xp: number; itemChance: number; pool: (i: (typeof ITEMS)[number]) => boolean }> = {
  common: { coins: [20, 40], xp: 10, itemChance: 0.25, pool: (i) => i.source === 'expedition' && i.rarity === 'common' },
  rare: { coins: [50, 90], xp: 25, itemChance: 0.6, pool: (i) => i.source === 'expedition' },
  legendary: { coins: [120, 200], xp: 60, itemChance: 1, pool: (i) => i.source === 'legendary' },
}

export interface ChestRewards {
  coins: number
  xp: number
  itemId?: string
}

/** Random numbers are passed in so the result is testable. Prefers items not owned yet. */
export function rollChest(rarity: ChestRarity, owned: string[], rand: () => number): ChestRewards {
  const t = TABLE[rarity]
  const coins = Math.round(t.coins[0] + rand() * (t.coins[1] - t.coins[0]))
  let itemId: string | undefined
  if (rand() < t.itemChance) {
    const pool = ITEMS.filter(t.pool)
    const fresh = pool.filter((i) => !owned.includes(i.id))
    const list = fresh.length ? fresh : pool
    itemId = list[Math.floor(rand() * list.length)].id
  }
  return { coins, xp: t.xp, itemId }
}
