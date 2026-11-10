import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { initialState, reducer } from './reducer'
import { dayKey, isForToday, levelFromXp, todaysTasks, xpForLevel } from './rules'
import { loadState, normalize, saveState } from './storage'
import { currentForm, dominantCategory } from './creature'
import type { GameState } from './types'

const monday9am = new Date(2026, 10, 9, 9, 0) // Mon 9 Nov 2026
const add = (s: GameState, id: string, extra: Partial<Parameters<typeof reducer>[1]> = {}) =>
  reducer(s, {
    type: 'add',
    id,
    now: monday9am,
    task: { title: `Tâche ${id}`, size: 'm', category: 'mind', repeat: 'once' },
    ...extra,
  } as Parameters<typeof reducer>[1])

describe('day boundary', () => {
  it('counts 2 am as the previous day', () => {
    expect(dayKey(new Date(2026, 10, 10, 2, 0))).toBe('2026-11-09')
    expect(dayKey(new Date(2026, 10, 10, 5, 0))).toBe('2026-11-10')
  })
})

describe('levels', () => {
  it('starts at level 1 and grows slower over time', () => {
    expect(levelFromXp(0)).toEqual({ level: 1, xpInLevel: 0, xpToNext: 40 })
    expect(levelFromXp(40).level).toBe(2)
    expect(xpForLevel(10)).toBeGreaterThan(xpForLevel(2) * 5)
  })
})

describe('tasks', () => {
  it('ignores blank titles', () => {
    const s = reducer(initialState, {
      type: 'add',
      id: 'x',
      now: monday9am,
      task: { title: '   ', size: 's', category: 'body', repeat: 'once' },
    })
    expect(s.tasks).toHaveLength(0)
  })

  it('rewards a completion once, and unchecking gives it back', () => {
    let s = add(initialState, 'a')
    s = reducer(s, { type: 'complete', id: 'a', now: monday9am })
    s = reducer(s, { type: 'complete', id: 'a', now: monday9am })
    expect(s.player).toMatchObject({ xp: 25, coins: 12, tasksDone: 1 })
    expect(s.player.byCategory.mind).toBe(1)
    s = reducer(s, { type: 'uncomplete', id: 'a', now: monday9am })
    expect(s.player).toMatchObject({ xp: 0, coins: 0, tasksDone: 0 })
  })

  it('keeps rewards when a done task is deleted', () => {
    let s = add(initialState, 'a')
    s = reducer(s, { type: 'complete', id: 'a', now: monday9am })
    s = reducer(s, { type: 'delete', id: 'a' })
    expect(s.tasks).toHaveLength(0)
    expect(s.player.xp).toBe(25)
  })

  it('shows one-off tasks until done, then only on the day they were done', () => {
    let s = add(initialState, 'a')
    s = reducer(s, { type: 'complete', id: 'a', now: monday9am })
    expect(isForToday(s.tasks[0], monday9am)).toBe(true)
    expect(isForToday(s.tasks[0], new Date(2026, 10, 10, 9))).toBe(false)
  })

  it('repeats daily tasks and resets them each day', () => {
    let s = add(initialState, 'a', {})
    s = { ...s, tasks: s.tasks.map((t) => ({ ...t, repeat: 'daily' as const })) }
    s = reducer(s, { type: 'complete', id: 'a', now: monday9am })
    expect(todaysTasks(s, monday9am).done).toHaveLength(1)
    const tuesday = new Date(2026, 10, 10, 9)
    expect(todaysTasks(s, tuesday).todo).toHaveLength(1)
  })

  it('shows weekday tasks only on their days', () => {
    let s = add(initialState, 'a')
    s = { ...s, tasks: s.tasks.map((t) => ({ ...t, repeat: [1, 3] })) }
    expect(isForToday(s.tasks[0], monday9am)).toBe(true)
    expect(isForToday(s.tasks[0], new Date(2026, 10, 10, 9))).toBe(false)
    // Monday 1 am still belongs to Sunday's game day.
    expect(isForToday(s.tasks[0], new Date(2026, 10, 9, 1))).toBe(false)
  })
})

describe('storage', () => {
  it('round-trips the state through IndexedDB', async () => {
    let s = add(initialState, 'a')
    s = reducer(s, { type: 'complete', id: 'a', now: monday9am })
    await saveState(s)
    expect(await loadState()).toEqual(s)
  })

  it('fills in missing fields from partial saves', () => {
    const s = normalize({ player: { xp: 5 } })
    expect(s.player.coins).toBe(0)
    expect(s.player.byCategory.body).toBe(0)
    expect(s.tasks).toEqual([])
  })
})

describe('creature', () => {
  const doTasks = (n: number, category: 'body' | 'mind' = 'mind', size: 's' | 'l' = 's') => {
    let s = initialState
    for (let i = 0; i < n; i++) {
      s = reducer(s, {
        type: 'add',
        id: `t${i}`,
        now: monday9am,
        task: { title: `T${i}`, size, category, repeat: 'once' },
      })
      s = reducer(s, { type: 'complete', id: `t${i}`, now: monday9am })
    }
    return s
  }

  it('hatches after the third task', () => {
    expect(currentForm(doTasks(2).creature).stage).toBe(0)
    expect(currentForm(doTasks(3).creature)).toEqual({ stage: 1, branch: null })
  })

  it('evolves at level 5 into the dominant branch', () => {
    // 12 big Corps tasks = 600 XP, past level 5.
    const s = doTasks(12, 'body', 'l')
    expect(levelFromXp(s.player.xp).level).toBeGreaterThanOrEqual(5)
    expect(currentForm(s.creature)).toEqual({ stage: 2, branch: 'body' })
    expect(s.creature.history.map((e) => e.stage)).toEqual([1, 2])
  })

  it('never goes back a stage when a task is unchecked', () => {
    let s = doTasks(3)
    s = reducer(s, { type: 'uncomplete', id: 't2', now: monday9am })
    expect(s.player.tasksDone).toBe(2)
    expect(currentForm(s.creature).stage).toBe(1)
  })

  it('breaks ties in favour of the task just done', () => {
    expect(dominantCategory({ body: 2, mind: 2, create: 0, order: 0 }, 'mind')).toBe('mind')
    expect(dominantCategory({ body: 3, mind: 2, create: 0, order: 0 }, 'mind')).toBe('body')
  })

  it('gives old saves a creature that matches their progress', () => {
    const s = normalize({ player: { xp: 30, tasksDone: 4 } })
    expect(currentForm(s.creature).stage).toBe(1)
  })
})
