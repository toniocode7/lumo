import type { GameState, Size, Task } from './types'

export const REWARDS: Record<Size, { xp: number; coins: number }> = {
  s: { xp: 10, coins: 5 },
  m: { xp: 25, coins: 12 },
  l: { xp: 50, coins: 25 },
}

export const SIZE_LABEL: Record<Size, string> = { s: 'Petite', m: 'Moyenne', l: 'Grosse' }

/** A game day starts at 5 am, so a late-night task still counts for "today". */
export const DAY_START_HOUR = 5

export function dayKey(date: Date = new Date()): string {
  const d = new Date(date.getTime() - DAY_START_HOUR * 3600_000)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

/** Weekday (0 = Sunday) of the game day containing `date`. */
export function gameWeekday(date: Date = new Date()): number {
  return new Date(date.getTime() - DAY_START_HOUR * 3600_000).getDay()
}

/** XP needed to go from `level` to `level + 1`. Fast at first, then slower. */
export function xpForLevel(level: number): number {
  return Math.round(40 * Math.pow(level, 1.35))
}

export function levelFromXp(totalXp: number) {
  let level = 1
  let rest = totalXp
  while (rest >= xpForLevel(level)) {
    rest -= xpForLevel(level)
    level++
  }
  return { level, xpInLevel: rest, xpToNext: xpForLevel(level) }
}

export function isDoneToday(task: Task, today = dayKey()): boolean {
  return task.completions.includes(today)
}

/** Should the task appear in today's list? */
export function isForToday(task: Task, now: Date = new Date()): boolean {
  const today = dayKey(now)
  if (task.repeat === 'once') {
    // Open one-off tasks stay until done; done ones show only on the day they were done.
    return task.completions.length === 0 || task.completions.includes(today)
  }
  if (task.repeat === 'daily') return true
  return task.repeat.includes(gameWeekday(now))
}

export function todaysTasks(state: GameState, now: Date = new Date()) {
  const today = dayKey(now)
  const list = state.tasks.filter((t) => isForToday(t, now))
  return {
    todo: list.filter((t) => !isDoneToday(t, today)),
    done: list.filter((t) => isDoneToday(t, today)),
  }
}

export const WEEKDAYS = [
  { n: 1, short: 'L', long: 'lundi' },
  { n: 2, short: 'M', long: 'mardi' },
  { n: 3, short: 'M', long: 'mercredi' },
  { n: 4, short: 'J', long: 'jeudi' },
  { n: 5, short: 'V', long: 'vendredi' },
  { n: 6, short: 'S', long: 'samedi' },
  { n: 0, short: 'D', long: 'dimanche' },
]

export function repeatLabel(repeat: Task['repeat']): string | null {
  if (repeat === 'once') return null
  if (repeat === 'daily' || repeat.length === 7) return 'Tous les jours'
  return WEEKDAYS.filter((d) => repeat.includes(d.n))
    .map((d) => d.long.slice(0, 3) + '.')
    .join(' ')
}
