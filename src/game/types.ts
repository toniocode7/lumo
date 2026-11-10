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
  byCategory: Record<Category, number>
}

export interface GameState {
  version: 1
  player: Player
  tasks: Task[]
}
