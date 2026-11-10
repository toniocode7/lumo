import { ITEMS } from './items'

export const DURATIONS = [15, 25, 45] as const
export type Duration = (typeof DURATIONS)[number]

/** Full loot for a completed expedition, by length. Longer = better odds of a rare item. */
export const LOOT: Record<Duration, { xp: number; coins: number; itemChance: number; rareChance: number }> = {
  15: { xp: 20, coins: 15, itemChance: 0.15, rareChance: 0.2 },
  25: { xp: 40, coins: 30, itemChance: 0.25, rareChance: 0.35 },
  45: { xp: 80, coins: 60, itemChance: 0.4, rareChance: 0.55 },
}

export interface Expedition {
  startedAt: string // ISO timestamp; the timer is always computed from it
  minutes: Duration
  taskId?: string
}

export interface Loot {
  xp: number
  coins: number
  itemId?: string
  /** Fraction of the planned time actually spent (1 = full trip). */
  completion: number
  minutesSpent: number
  /** Task the expedition was linked to, offered for checking off on return. */
  taskId?: string
}

/** Random numbers in [0, 1), passed in so loot stays testable. */
export interface LootRolls {
  coins: number
  item: number
  rare: number
  pick: number
}

export function endsAt(e: Expedition): number {
  return new Date(e.startedAt).getTime() + e.minutes * 60_000
}

export function remainingMs(e: Expedition, now: number = Date.now()): number {
  return Math.max(0, endsAt(e) - now)
}

export function progress(e: Expedition, now: number = Date.now()): number {
  return Math.min(1, 1 - remainingMs(e, now) / (e.minutes * 60_000))
}

export function computeLoot(e: Expedition, now: number, rolls: LootRolls): Loot {
  const completion = progress(e, now)
  const minutesSpent = Math.floor((completion * e.minutes * 60_000) / 60_000)
  const table = LOOT[e.minutes]
  const full = completion >= 1

  if (!full) {
    // Coming home early: half the loot for the time spent, no item, nothing else lost.
    const share = completion * 0.5
    return {
      xp: Math.round(table.xp * share),
      coins: Math.round(table.coins * share),
      completion,
      minutesSpent,
    }
  }

  // ±20 % on coins so each return feels a bit different.
  const coins = Math.round(table.coins * (0.8 + rolls.coins * 0.4))
  let itemId: string | undefined
  if (rolls.item < table.itemChance) {
    const rarity = rolls.rare < table.rareChance ? 'rare' : 'common'
    const pool = ITEMS.filter((i) => i.source === 'expedition' && i.rarity === rarity)
    itemId = pool[Math.floor(rolls.pick * pool.length)].id
  }
  return { xp: table.xp, coins, itemId, completion: 1, minutesSpent: e.minutes }
}
