import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { ALL_DONE_BONUS, cardReward, drawDaily, pickChallenge } from './cards'
import { currentForm } from './creature'
import { computeLoot, type Duration, type Loot } from './expedition'
import { getItem, pickLegendaryItem } from './items'
import { cardDoneMessage, doneMessage, levelUpMessage } from './messages'
import { initialState, reducer, type Action, type NewTask } from './reducer'
import { REWARDS, dayKey, levelFromXp } from './rules'
import { loadState, saveState } from './storage'
import { streakInfo, type StreakInfo } from './streak'
import type { Category, GameState, Stage } from './types'

export type Form = { stage: Stage; branch: Category | null }
export type EvolutionEvent = { from: Form; to: Form }

export type Toast = {
  id: number
  text: string
  tone: 'accent' | 'gold' | 'neutral'
  undo?: () => void
}

type Game = {
  state: GameState
  streak: StreakInfo
  ready: boolean
  addTask: (t: NewTask) => void
  completeTask: (id: string) => void
  uncompleteTask: (id: string) => void
  deleteTask: (id: string) => void
  revealCard: (index: number) => void
  rerollCard: (index: number) => void
  completeCard: (index: number) => void
  startExpedition: (minutes: Duration, taskId?: string) => void
  /** Brings the creature home (early or not) and returns what it found. */
  finishExpedition: () => void
  loot: Loot | null
  clearLoot: () => void
  toast: Toast | null
  dismissToast: () => void
  sheetOpen: boolean
  /** Bumped on each completion so the creature can react. */
  pulse: number
  evolution: EvolutionEvent | null
  dismissEvolution: () => void
  openSheet: () => void
  closeSheet: () => void
}

const Ctx = createContext<Game | null>(null)

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [ready, setReady] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [pulse, setPulse] = useState(0)
  const [evolution, setEvolution] = useState<EvolutionEvent | null>(null)
  const [loot, setLoot] = useState<Loot | null>(null)
  const stateRef = useRef(state)
  stateRef.current = state
  const toastId = useRef(0)

  useEffect(() => {
    loadState().then((s) => {
      dispatch({ type: 'restore', state: s })
      setReady(true)
    })
  }, [])

  // New cards each game day (5 am), checked on start, every minute and when the app comes back.
  useEffect(() => {
    if (!ready) return
    const check = () => {
      const today = dayKey()
      if (stateRef.current.daily?.day !== today) {
        dispatch({ type: 'setDaily', daily: drawDaily(today, Math.random) })
      }
    }
    check()
    const t = setInterval(check, 60_000)
    document.addEventListener('visibilitychange', check)
    return () => {
      clearInterval(t)
      document.removeEventListener('visibilitychange', check)
    }
  }, [ready])

  // Save after every change, once the saved state has been loaded.
  useEffect(() => {
    if (ready) saveState(state).catch(() => {})
  }, [state, ready])

  const show = useCallback((t: Omit<Toast, 'id'>) => {
    toastId.current += 1
    setToast({ ...t, id: toastId.current })
  }, [])

  const restoreTo = useCallback((snapshot: GameState) => {
    dispatch({ type: 'restore', state: snapshot })
    setToast(null)
  }, [])

  const addTask = useCallback((task: NewTask) => {
    dispatch({ type: 'add', task, id: newId(), now: new Date() })
    setToast(null)
  }, [])

  /** Applies a rewarding action, then reacts: creature pulse, evolution screen, toast. */
  const reward = useCallback(
    (
      action: Action,
      message: (after: GameState) => { text: string; important?: boolean },
      tone: Toast['tone'] = 'accent',
    ) => {
      const before = stateRef.current
      const after = reducer(before, action)
      if (after === before) return
      dispatch(action)
      setPulse((n) => n + 1)
      const from = currentForm(before.creature)
      const to = currentForm(after.creature)
      if (to.stage > from.stage) setEvolution({ from, to })
      const oldLevel = levelFromXp(before.player.xp).level
      const newLevel = levelFromXp(after.player.xp).level
      const today = dayKey()
      const woke =
        streakInfo(before.activeDays, today).sleeping && !streakInfo(after.activeDays, today).sleeping
      const m = woke
        ? { text: 'Ton compagnon se réveille, la brume se lève. Content de te revoir.', important: true }
        : message(after)
      show(
        newLevel > oldLevel && !m.important
          ? { text: levelUpMessage(newLevel), tone: 'gold', undo: () => restoreTo(before) }
          : { text: m.text, tone: m.important ? 'gold' : tone, undo: () => restoreTo(before) },
      )
    },
    [show, restoreTo],
  )

  const completeTask = useCallback(
    (id: string) => {
      const task = stateRef.current.tasks.find((t) => t.id === id)
      if (!task) return
      const r = REWARDS[task.size]
      reward({ type: 'complete', id, now: new Date() }, () => ({ text: doneMessage(r.xp, r.coins) }))
    },
    [reward],
  )

  const revealCard = useCallback((index: number) => {
    dispatch({ type: 'revealCard', index })
  }, [])

  const rerollCard = useCallback((index: number) => {
    const daily = stateRef.current.daily
    if (!daily) return
    const challengeId = pickChallenge(
      Math.random,
      daily.cards.map((c) => c.challengeId),
    )
    dispatch({ type: 'rerollCard', index, challengeId })
    setToast(null)
  }, [])

  const completeCard = useCallback(
    (index: number) => {
      const before = stateRef.current
      const card = before.daily?.cards[index]
      if (!card) return
      const itemId =
        card.rarity === 'legendary' ? pickLegendaryItem(before.inventory, Math.random) : undefined
      const r = cardReward(card)
      reward(
        { type: 'completeCard', index, now: new Date(), itemId },
        (after) => {
          const bonus = !before.daily?.bonusClaimed && after.daily?.bonusClaimed
          if (itemId)
            return { text: `Carte légendaire. Tu trouves\u00a0: ${getItem(itemId)?.name}.`, important: true }
          if (bonus)
            return {
              text: `Les trois cartes. Bonus\u00a0: +${ALL_DONE_BONUS.xp} XP et ${ALL_DONE_BONUS.coins} pièces.`,
              important: true,
            }
          return { text: cardDoneMessage(r.xp) }
        },
        card.rarity === 'common' ? 'accent' : 'gold',
      )
    },
    [reward],
  )

  const uncompleteTask = useCallback((id: string) => {
    dispatch({ type: 'uncomplete', id, now: new Date() })
    setToast(null)
  }, [])

  const deleteTask = useCallback(
    (id: string) => {
      const before = stateRef.current
      dispatch({ type: 'delete', id })
      show({ text: 'Tâche supprimée.', tone: 'neutral', undo: () => restoreTo(before) })
    },
    [show, restoreTo],
  )

  const startExpedition = useCallback((minutes: Duration, taskId?: string) => {
    dispatch({ type: 'startExpedition', minutes, taskId, now: new Date() })
    setToast(null)
  }, [])

  const finishExpedition = useCallback(() => {
    const before = stateRef.current
    if (!before.expedition) return
    const now = new Date()
    const found = computeLoot(before.expedition, now.getTime(), {
      coins: Math.random(),
      item: Math.random(),
      rare: Math.random(),
      pick: Math.random(),
    })
    const after = reducer(before, { type: 'finishExpedition', loot: found, now })
    dispatch({ type: 'finishExpedition', loot: found, now })
    setLoot({ ...found, taskId: before.expedition.taskId })
    setToast(null)
    const from = currentForm(before.creature)
    const to = currentForm(after.creature)
    if (to.stage > from.stage) setEvolution({ from, to })
  }, [])

  const today = dayKey()
  const streak = useMemo(() => streakInfo(state.activeDays, today), [state.activeDays, today])

  const value = useMemo<Game>(
    () => ({
      state,
      streak,
      ready,
      addTask,
      completeTask,
      uncompleteTask,
      deleteTask,
      revealCard,
      rerollCard,
      completeCard,
      startExpedition,
      finishExpedition,
      loot,
      clearLoot: () => setLoot(null),
      toast,
      dismissToast: () => setToast(null),
      sheetOpen,
      openSheet: () => setSheetOpen(true),
      closeSheet: () => setSheetOpen(false),
      pulse,
      evolution,
      dismissEvolution: () => setEvolution(null),
    }),
    [
      state,
      streak,
      ready,
      addTask,
      completeTask,
      uncompleteTask,
      deleteTask,
      revealCard,
      rerollCard,
      completeCard,
      startExpedition,
      finishExpedition,
      loot,
      toast,
      sheetOpen,
      pulse,
      evolution,
    ],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGame() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useGame must be used inside GameProvider')
  return v
}
