import { CHALLENGES, getChallenge } from './challenges'
import { REWARDS } from './rules'
import type { Daily, DailyCard, Rarity } from './types'

export const CARDS_PER_DAY = 3
export const RARITY_MULT: Record<Rarity, number> = { common: 1, rare: 2, legendary: 3 }
export const ALL_DONE_BONUS = { xp: 30, coins: 15 }

/** 70 % common, 25 % rare, 5 % legendary. */
export function rollRarity(rand: () => number): Rarity {
  const r = rand()
  if (r < 0.05) return 'legendary'
  if (r < 0.3) return 'rare'
  return 'common'
}

/** Picks a challenge not in `exclude`, avoiding repeated categories when possible. */
export function pickChallenge(rand: () => number, exclude: string[]): string {
  const used = exclude.map((id) => getChallenge(id)?.category)
  const free = CHALLENGES.filter((c) => !exclude.includes(c.id))
  const varied = free.filter((c) => !used.includes(c.category))
  const pool = varied.length ? varied : free
  return pool[Math.floor(rand() * pool.length)].id
}

export function drawDaily(day: string, rand: () => number): Daily {
  const cards: DailyCard[] = []
  for (let i = 0; i < CARDS_PER_DAY; i++) {
    cards.push({
      challengeId: pickChallenge(
        rand,
        cards.map((c) => c.challengeId),
      ),
      rarity: rollRarity(rand),
      revealed: false,
      done: false,
    })
  }
  return { day, cards, rerollUsed: false, bonusClaimed: false }
}

export function cardReward(card: DailyCard) {
  const ch = getChallenge(card.challengeId)
  const base = REWARDS[ch?.size ?? 's']
  const m = RARITY_MULT[card.rarity]
  return { xp: base.xp * m, coins: base.coins * m }
}
