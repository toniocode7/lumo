import type { GameState } from './types'

/** Days without activity (today excluded) before the creature falls asleep. */
export const SLEEP_AFTER_MISSED_DAYS = 2

const parse = (day: string) => {
  const [y, m, d] = day.split('-').map(Number)
  return new Date(y, m - 1, d, 12) // noon avoids daylight-saving edge cases
}

const format = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

export function addDays(day: string, n: number): string {
  const d = parse(day)
  d.setDate(d.getDate() + n)
  return format(d)
}

/** Monday of the day's week, used to give one joker per week. */
export function weekOf(day: string): string {
  const d = parse(day)
  const offset = (d.getDay() + 6) % 7 // Monday = 0
  d.setDate(d.getDate() - offset)
  return format(d)
}

export interface StreakInfo {
  /** Consecutive active days, with joker days bridging single gaps (they don't add to the count). */
  current: number
  best: number
  todayActive: boolean
  /** Days saved by a joker. */
  jokerDays: string[]
  jokerAvailable: boolean
  /** Two days or more without activity: the creature sleeps and the nest is misty. */
  sleeping: boolean
  /** Streak alive but nothing done yet today. */
  atRisk: boolean
}

/**
 * Replays history day by day. A missed day is covered by that week's joker if it is free;
 * otherwise the streak drops to zero. A joker spent on the first of two missed days in a row
 * is given back, since it couldn't save anything.
 */
export function streakInfo(activeDays: string[], today: string): StreakInfo {
  const active = new Set(activeDays.filter((d) => d <= today))
  const todayActive = active.has(today)
  const usedWeeks = new Set<string>()
  const jokerDays: string[] = []
  let current = 0
  let best = 0
  let last: string | null = null

  const first = [...active].sort()[0]
  if (first) {
    for (let d = first; d < today; d = addDays(d, 1)) {
      if (active.has(d)) {
        current++
        last = d
      } else {
        const prev = addDays(d, -1)
        if (jokerDays[jokerDays.length - 1] === prev) {
          // Second missed day in a row: the joker didn't help, refund it.
          usedWeeks.delete(weekOf(jokerDays.pop()!))
          current = 0
        } else if (current > 0 && !usedWeeks.has(weekOf(d))) {
          usedWeeks.add(weekOf(d))
          jokerDays.push(d)
        } else {
          current = 0
        }
      }
      best = Math.max(best, current)
    }
  }
  if (todayActive) {
    current++
    last = today
    best = Math.max(best, current)
  }

  const sleeping =
    last !== null && !todayActive && last < addDays(today, -SLEEP_AFTER_MISSED_DAYS)

  return {
    current,
    best,
    todayActive,
    jokerDays,
    jokerAvailable: !usedWeeks.has(weekOf(today)),
    sleeping,
    atRisk: current > 0 && !todayActive,
  }
}

/** Was anything done on this game day? (Tasks or daily cards.) */
export function hadActivity(state: GameState, day: string): boolean {
  return (
    state.tasks.some((t) => t.completions.includes(day)) ||
    (state.daily?.day === day && state.daily.cards.some((c) => c.done))
  )
}

/** Rebuilds the activity log from what a save already contains. */
export function activityFromHistory(state: GameState): string[] {
  const days = new Set<string>()
  for (const t of state.tasks) for (const d of t.completions) days.add(d)
  if (state.daily?.cards.some((c) => c.done)) days.add(state.daily.day)
  return [...days].sort()
}
