import type { Expedition } from './expedition'

export type Category = 'body' | 'mind' | 'create' | 'order'
export type Size = 's' | 'm' | 'l'

/** 'once', 'daily', or the weekdays it repeats on (0 = Sunday … 6 = Saturday). */
export type Repeat = 'once' | 'daily' | number[]

export interface Task {
  id: string
  title: string
  size: Size
  category: Category
  repeat: Repeat
  createdAt: string // ISO timestamp
  /** Game days (YYYY-MM-DD) on which the task was completed. */
  completions: string[]
}

export interface Player {
  xp: number // total XP ever earned
  coins: number
  tasksDone: number
  cardsDone: number
  expeditionsDone: number
  focusMinutes: number
  byCategory: Record<Category, number>
}

/** 0 = egg, 1 = Étincelle, 2 and 3 = intermediate forms, 4 = final form. */
export type Stage = 0 | 1 | 2 | 3 | 4

export interface Evolution {
  stage: Stage
  /** Branch taken at this stage; null for the hatchling. */
  branch: Category | null
  at: string // ISO timestamp
}

export interface Creature {
  /** Drives small per-creature variations (tint, ornament angles). */
  seed: number
  /** One entry per stage reached, starting with the hatching. Empty = still an egg. */
  history: Evolution[]
}

export type Rarity = 'common' | 'rare' | 'legendary'

export interface DailyCard {
  challengeId: string
  rarity: Rarity
  revealed: boolean
  done: boolean
  /** Item found on a legendary card. */
  itemId?: string
}

export interface Daily {
  day: string // game day (YYYY-MM-DD) these cards belong to
  cards: DailyCard[]
  rerollUsed: boolean
  bonusClaimed: boolean
}

export interface Nest {
  backdrop: string
  /** Decorations placed around the creature, left to right. null = empty spot. */
  slots: (string | null)[]
}

export interface GameState {
  version: 1
  player: Player
  creature: Creature
  tasks: Task[]
  daily: Daily | null
  expedition: Expedition | null
  /** Game days with at least one task or card done (drives the streak). */
  activeDays: string[]
  /** Item ids the player owns (duplicates allowed). */
  inventory: string[]
  nest: Nest
  /** The welcome screens have been seen. */
  onboarded: boolean
}
