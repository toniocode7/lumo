import { ALL_DONE_BONUS, cardReward } from './cards'
import { getChallenge } from './challenges'
import { advanceCreature } from './creature'
import type { Duration, Loot } from './expedition'
import { REWARDS, dayKey, levelFromXp } from './rules'
import { hadActivity } from './streak'
import { DEFAULT_BACKDROP, getItem } from './items'
import { BOND_PER_TASK, BOND_TAPS_PER_DAY } from './bond'
import { LEVEL_RARE_CHEST_EVERY, TASK_CHEST_EVERY, TASK_RARE_CHEST_EVERY, type ChestRewards } from './chests'
import { hitShadow } from './shadow'
import type { Category, Chest, Daily, GameState, Repeat, Shadow, Size } from './types'

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
  | { type: 'finishOnboarding' }
  | { type: 'pet'; now: Date }
  | { type: 'setShadow'; shadow: Shadow }
  | { type: 'openChest'; id: string; rewards: ChestRewards; now: Date }

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
  onboarded: false,
  bond: { points: 0, day: '', taps: 0 },
  chests: [],
  shadow: null,
  milestones: { tasks: 0, level: 1, chestSeq: 0 },
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

/** Actions that can earn or take back XP; they also hit the Shadow and may give chests. */
const PROGRESS_ACTIONS = new Set<Action['type']>(['complete', 'uncomplete', 'completeCard', 'finishExpedition', 'openChest'])

export function reducer(state: GameState, action: Action): GameState {
  const next = baseReducer(state, action)
  if (next === state || !PROGRESS_ACTIONS.has(action.type)) return next
  return withProgress(state, next)
}

/**
 * Side effects of earning XP, in one place:
 * the Shadow takes the XP as damage (or heals it back on an uncheck), each new task adds
 * to the bond, and new milestones (5 tasks, a level, a defeated Shadow) drop chests.
 */
function withProgress(before: GameState, after: GameState): GameState {
  const gained = after.player.xp - before.player.xp
  const { shadow, defeatedNow } = hitShadow(after.shadow, gained)
  let { tasks, level, chestSeq } = after.milestones
  const chests: Chest[] = []
  const drop = (rarity: Chest['rarity'], source: Chest['source']) =>
    chests.push({ id: `c${++chestSeq}`, rarity, source })

  const doneNow = after.player.tasksDone
  while (tasks + 1 <= doneNow) {
    tasks++
    if (tasks % TASK_CHEST_EVERY === 0) drop(tasks % TASK_RARE_CHEST_EVERY === 0 ? 'rare' : 'common', 'tasks')
  }
  const levelNow = levelFromXp(after.player.xp).level
  while (level + 1 <= levelNow) {
    level++
    drop(level % LEVEL_RARE_CHEST_EVERY === 0 ? 'rare' : 'common', 'level')
  }
  if (defeatedNow) drop('legendary', 'shadow')

  const newTasks = Math.max(0, doneNow - before.player.tasksDone)
  return {
    ...after,
    shadow,
    chests: [...after.chests, ...chests],
    milestones: { tasks, level, chestSeq },
    bond: { ...after.bond, points: after.bond.points + newTasks * BOND_PER_TASK },
  }
}

function baseReducer(state: GameState, action: Action): GameState {
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

    case 'pet': {
      // Taps always get a reaction; only the first few each day grow the bond.
      const day = dayKey(action.now)
      const taps = state.bond.day === day ? state.bond.taps : 0
      if (taps >= BOND_TAPS_PER_DAY) return state
      return { ...state, bond: { points: state.bond.points + 1, day, taps: taps + 1 } }
    }

    case 'setShadow':
      return { ...state, shadow: action.shadow }

    case 'openChest': {
      if (!state.chests.some((c) => c.id === action.id)) return state
      const { rewards } = action
      const player = {
        ...state.player,
        xp: state.player.xp + rewards.xp,
        coins: state.player.coins + rewards.coins,
      }
      return autoPlace(
        {
          ...state,
          player,
          chests: state.chests.filter((c) => c.id !== action.id),
          creature: advanceCreature(state.creature, player, action.now),
          inventory: rewards.itemId ? [...state.inventory, rewards.itemId] : state.inventory,
        },
        rewards.itemId,
      )
    }

    case 'finishOnboarding':
      return state.onboarded ? state : { ...state, onboarded: true }

    case 'setBackdrop': {
      const owned = action.itemId === DEFAULT_BACKDROP || state.inventory.includes(action.itemId)
      if (!owned || getItem(action.itemId)?.kind !== 'backdrop') return state
      return { ...state, nest: { ...state.nest, backdrop: action.itemId } }
    }
  }
}
