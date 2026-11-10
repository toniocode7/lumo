import { REWARDS, dayKey } from './rules'
import type { Category, GameState, Repeat, Size } from './types'

export type NewTask = { title: string; size: Size; category: Category; repeat: Repeat }

export type Action =
  | { type: 'add'; task: NewTask; id: string; now: Date }
  | { type: 'complete'; id: string; now: Date }
  | { type: 'uncomplete'; id: string; now: Date }
  | { type: 'delete'; id: string }
  | { type: 'restore'; state: GameState }

export const initialState: GameState = {
  version: 1,
  player: {
    xp: 0,
    coins: 0,
    tasksDone: 0,
    byCategory: { body: 0, mind: 0, create: 0, order: 0 },
  },
  tasks: [],
}

export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'add': {
      const title = action.task.title.trim()
      if (!title) return state
      return {
        ...state,
        tasks: [
          ...state.tasks,
          {
            ...action.task,
            title,
            id: action.id,
            createdAt: action.now.toISOString(),
            completions: [],
          },
        ],
      }
    }

    case 'complete':
    case 'uncomplete': {
      const task = state.tasks.find((t) => t.id === action.id)
      if (!task) return state
      const today = dayKey(action.now)
      const done = task.completions.includes(today)
      if (action.type === 'complete' ? done : !done) return state

      // Unchecking gives the reward back, so a mis-tap costs nothing and can't be farmed.
      const sign = action.type === 'complete' ? 1 : -1
      const r = REWARDS[task.size]
      const p = state.player
      return {
        ...state,
        player: {
          xp: Math.max(0, p.xp + sign * r.xp),
          coins: Math.max(0, p.coins + sign * r.coins),
          tasksDone: Math.max(0, p.tasksDone + sign),
          byCategory: {
            ...p.byCategory,
            [task.category]: Math.max(0, p.byCategory[task.category] + sign),
          },
        },
        tasks: state.tasks.map((t) =>
          t.id !== task.id
            ? t
            : {
                ...t,
                completions:
                  sign > 0 ? [...t.completions, today] : t.completions.filter((d) => d !== today),
              },
        ),
      }
    }

    case 'delete':
      // Rewards already earned are kept: deleting a task is not a penalty.
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.id) }

    case 'restore':
      return action.state
  }
}
