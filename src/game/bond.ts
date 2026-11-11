/** The bond with the creature grows with care (taps) and with what you get done. */
export const BOND_LEVELS = [
  { at: 0, name: 'Curieux' },
  { at: 15, name: 'Familier' },
  { at: 45, name: 'Complice' },
  { at: 100, name: 'Inséparable' },
  { at: 200, name: 'Lié pour de bon' },
] as const

/** Taps that count toward the bond each day; more taps still get a reaction. */
export const BOND_TAPS_PER_DAY = 5
export const BOND_PER_TASK = 2

export function bondLevel(points: number) {
  let index = 0
  BOND_LEVELS.forEach((l, i) => {
    if (points >= l.at) index = i
  })
  const next = BOND_LEVELS[index + 1]
  return {
    level: index + 1, // 1 … 5
    name: BOND_LEVELS[index].name,
    progress: next ? (points - BOND_LEVELS[index].at) / (next.at - BOND_LEVELS[index].at) : 1,
    nextName: next?.name,
  }
}

/** Reactions to a tap. Each bond level adds one. */
export const REACTIONS = ['hop', 'spin', 'hum', 'flare', 'constellation'] as const
export type Reaction = (typeof REACTIONS)[number]

export function unlockedReactions(level: number): Reaction[] {
  return REACTIONS.slice(0, Math.max(1, Math.min(level, REACTIONS.length)))
}
