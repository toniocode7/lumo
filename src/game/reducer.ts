import { ALL_DONE_BONUS, cardReward } from './cards'
import { getChallenge } from './challenges'
import { advanceCreature } from './creature'
import type { Duration, Loot } from './expedition'
import { REWARDS, dayKey } from './rules'
import { hadActivity } from './streak'
import { DEFAULT_BACKDROP, getItem } from './items'
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
  | { type: 'buyItem'; itemId: string }
  | { type: 'placeItem'; slot: number; itemId: string | null }
  | { type: 'setBackdrop'; itemId: string }

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
  activeDays: [],
  inventory: [],
  nest: { backdrop: DEFAULT_BACKDROP, slots: [null, null, null, null] },
}

export const NEST_SLOTS = 4

/** New decorations go straight into the first free spot, so finds show up in the nest. */
export function autoPlace(state: GameState, itemId: string | undefined): GameState {
  const item = itemId ? getItem(itemId) : undefined
  if (!item || item.kind === 'backdrop' || state.nest.slots.includes(item.id)) return state
  const free = state.nest.slots.indexOf(null)
  if (free < 0) return state
  return { ...state, nest: { ...state.nest, slots: state.nest.slots.map((s, i) => (i === free ? item.id : s)) } }
}

const markActive = (days: string[], day: string) =>
  days.includes(day) ? days : [...days, day].sort()

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
      const next: GameState = {
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
      // Unchecking the day's only activity takes the day back out of the streak.
      const activeDays =
        sign > 0
          ? markActive(state.activeDays, today)
          : hadActivity(next, today)
            ? state.activeDays
            : state.activeDays.filter((d) => d !== today)
      return { ...next, activeDays }
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
        activeDays: markActive(state.activeDays, dayKey(action.now)),
      }
      return autoPlace(next, itemId)
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
      return autoPlace(
        {
          ...state,
          player,
          expedition: null,
          creature: advanceCreature(state.creature, player, action.now),
          inventory: loot.itemId ? [...state.inventory, loot.itemId] : state.inventory,
        },
        loot.itemId,
      )
    }

    case 'buyItem': {
      const item = getItem(action.itemId)
      if (!item || item.source !== 'shop' || item.price === undefined) return state
      if (state.inventory.includes(item.id) || item.id === DEFAULT_BACKDROP) return state
      if (state.player.coins < item.price) return state
      const next = {
        ...state,
        player: { ...state.player, coins: state.player.coins - item.price },
        inventory: [...state.inventory, item.id],
      }
      return item.kind === 'backdrop'
        ? { ...next, nest: { ...next.nest, backdrop: item.id } }
        : autoPlace(next, item.id)
    }

    case 'placeItem': {
      const { slot, itemId } = action
      if (slot < 0 || slot >= NEST_SLOTS) return state
      if (itemId !== null) {
        const item = getItem(itemId)
        if (!item || item.kind === 'backdrop' || !state.inventory.includes(itemId)) return state
      }
      // An item sits in one spot at a time: placing it again moves it.
      const slots = state.nest.slots.map((s, i) => (i === slot ? itemId : s === itemId ? null : s))
      return { ...state, nest: { ...state.nest, slots } }
    }

    case 'setBackdrop': {
      const owned = action.itemId === DEFAULT_BACKDROP || state.inventory.includes(action.itemId)
      if (!owned || getItem(action.itemId)?.kind !== 'backdrop') return state
      return { ...state, nest: { ...state.nest, backdrop: action.itemId } }
    }
  }
}
