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
import { currentForm } from './creature'
import { doneMessage, levelUpMessage } from './messages'
import { initialState, reducer, type NewTask } from './reducer'
import { REWARDS, levelFromXp } from './rules'
import { loadState, saveState } from './storage'
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
  ready: boolean
  addTask: (t: NewTask) => void
  completeTask: (id: string) => void
  uncompleteTask: (id: string) => void
  deleteTask: (id: string) => void
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
  const stateRef = useRef(state)
  stateRef.current = state
  const toastId = useRef(0)

  useEffect(() => {
    loadState().then((s) => {
      dispatch({ type: 'restore', state: s })
      setReady(true)
    })
  }, [])

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

  const completeTask = useCallback(
    (id: string) => {
      const before = stateRef.current
      const task = before.tasks.find((t) => t.id === id)
      if (!task) return
      const action = { type: 'complete', id, now: new Date() } as const
      const after = reducer(before, action)
      dispatch(action)
      setPulse((n) => n + 1)
      const from = currentForm(before.creature)
      const to = currentForm(after.creature)
      if (to.stage > from.stage) setEvolution({ from, to })
      const r = REWARDS[task.size]
      const oldLevel = levelFromXp(before.player.xp).level
      const newLevel = levelFromXp(before.player.xp + r.xp).level
      show(
        newLevel > oldLevel
          ? { text: levelUpMessage(newLevel), tone: 'gold', undo: () => restoreTo(before) }
          : { text: doneMessage(r.xp, r.coins), tone: 'accent', undo: () => restoreTo(before) },
      )
    },
    [show, restoreTo],
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

  const value = useMemo<Game>(
    () => ({
      state,
      ready,
      addTask,
      completeTask,
      uncompleteTask,
      deleteTask,
      toast,
      dismissToast: () => setToast(null),
      sheetOpen,
      openSheet: () => setSheetOpen(true),
      closeSheet: () => setSheetOpen(false),
      pulse,
      evolution,
      dismissEvolution: () => setEvolution(null),
    }),
    [state, ready, addTask, completeTask, uncompleteTask, deleteTask, toast, sheetOpen, pulse, evolution],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGame() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useGame must be used inside GameProvider')
  return v
}
