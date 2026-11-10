import { ALL_DONE_BONUS, cardReward } from './cards'
import { getChallenge } from './challenges'
import { advanceCreature } from './creature'
import type { Duration, Loot } from './expedition'
import { REWARDS, dayKey } from './rules'
import type { Category, Daily, GameState, Repeat, Size } from './types'

export type NewTask = { title: string; size: Size; category: Category; repeat: Repeat }

export type Action =
  | { type: 'add'; task: NewTask; id: string; now: Date }
  | { type: 'complete'; id: string; now: Date }
  | { type: 'uncomplete'; id: string; now: Date }
  | { type: 'delete'; id: string }
  | { type: 'restore'; state: GameState }
  | { type: 'setDaily'; daily: Daily }
  | { type: 'revealCard'; index: number }
  | { type: 'rerollCard'; index: number; challengeId: string }
  | { type: 'completeCard'; index: number; now: Date; itemId?: string }
  | { type: 'startExpedition'; minutes: Duration; taskId?: string; now: Date }
  | { type: 'finishExpedition'; loot: Loot; now: Date }

export const initialState: GameState = {
  version: 1,
  player: {
    xp: 0,
    coins: 0,
    tasksDone: 0,
    cardsDone: 0,
    expeditionsDone: 0,
    focusMinutes: 0,
    byCategory: { body: 0, mind: 0, create: 0, order: 0 },
  },
  creature: { seed: 1, history: [] },
  tasks: [],
  daily: null,
  expedition: null,
  inventory: [],
}

function updateCard(state: GameState, index: number, patch: Partial<Daily['cards'][number]>): GameState {
  if (!state.daily?.cards[index]) return state
  return {
    ...state,
    daily: {
      ...state.daily,
      cards: state.daily.cards.map((c, i) => (i === index ? { ...c, ...patch } : c)),
    },
  }
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
      const player = {
        ...p,
        xp: Math.max(0, p.xp + sign * r.xp),
        coins: Math.max(0, p.coins + sign * r.coins),
        tasksDone: Math.max(0, p.tasksDone + sign),
        byCategory: {
          ...p.byCategory,
          [task.category]: Math.max(0, p.byCategory[task.category] + sign),
        },
      }
      return {
        ...state,
        player,
        creature:
          sign > 0
            ? advanceCreature(state.creature, player, action.now, task.category)
            : state.creature,
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

    case 'setDaily':
      return { ...state, daily: action.daily }

    case 'revealCard':
      return updateCard(state, action.index, { revealed: true })

    case 'rerollCard': {
      // One free reroll a day; the card keeps its rarity so rerolls can't fish for legendaries.
      const card = state.daily?.cards[action.index]
      if (!state.daily || !card || card.done || state.daily.rerollUsed) return state
      const next = updateCard(state, action.index, { challengeId: action.challengeId, revealed: true })
      return { ...next, daily: { ...next.daily!, rerollUsed: true } }
    }

    case 'completeCard': {
      const card = state.daily?.cards[action.index]
      const challenge = card && getChallenge(card.challengeId)
      if (!state.daily || !card || !challenge || card.done) return state
      const r = cardReward(card)
      const itemId = card.rarity === 'legendary' ? action.itemId : undefined
      let next = updateCard(state, action.index, { done: true, revealed: true, itemId })
      const allDone = next.daily!.cards.every((c) => c.done)
      const bonus = allDone && !next.daily!.bonusClaimed
      const p = state.player
      const player = {
        ...p,
        xp: p.xp + r.xp + (bonus ? ALL_DONE_BONUS.xp : 0),
        coins: p.coins + r.coins + (bonus ? ALL_DONE_BONUS.coins : 0),
        cardsDone: p.cardsDone + 1,
        byCategory: { ...p.byCategory, [challenge.category]: p.byCategory[challenge.category] + 1 },
      }
      next = {
        ...next,
        player,
        creature: advanceCreature(state.creature, player, action.now, challenge.category),
        inventory: itemId ? [...state.inventory, itemId] : state.inventory,
        daily: { ...next.daily!, bonusClaimed: next.daily!.bonusClaimed || bonus },
      }
      return next
    }

    case 'startExpedition':
      if (state.expedition) return state
      return {
        ...state,
        expedition: {
          startedAt: action.now.toISOString(),
          minutes: action.minutes,
          taskId: action.taskId,
        },
      }

    case 'finishExpedition': {
      if (!state.expedition) return state
      const { loot } = action
      const p = state.player
      const player = {
        ...p,
        xp: p.xp + loot.xp,
        coins: p.coins + loot.coins,
        expeditionsDone: p.expeditionsDone + (loot.completion >= 1 ? 1 : 0),
        focusMinutes: p.focusMinutes + loot.minutesSpent,
      }
      return {
        ...state,
        player,
        expedition: null,
        creature: advanceCreature(state.creature, player, action.now),
        inventory: loot.itemId ? [...state.inventory, loot.itemId] : state.inventory,
      }
    }
  }
}
