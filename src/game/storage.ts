import { advanceCreature, newSeed } from './creature'
import { initialState } from './reducer'
import { activityFromHistory } from './streak'
import type { GameState } from './types'

// Minimal IndexedDB key-value store: the whole game state is one record.
const DB_NAME = 'lumo'
const STORE = 'kv'
const KEY = 'state'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function tx<T>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode)
        const req = run(t.objectStore(STORE))
        t.oncomplete = () => {
          db.close()
          resolve(req.result)
        }
        t.onerror = () => {
          db.close()
          reject(t.error)
        }
      }),
  )
}

/** Fills in fields missing from older or partial saves. */
export function normalize(raw: unknown): GameState {
  const s = (raw ?? {}) as Partial<GameState>
  const player = {
    ...initialState.player,
    ...s.player,
    byCategory: { ...initialState.player.byCategory, ...s.player?.byCategory },
  }
  // Saves from before the creature existed get one that matches their progress.
  const creature = s.creature?.history
    ? s.creature
    : advanceCreature({ seed: newSeed(), history: [] }, player, new Date())
  const state: GameState = {
    version: 1,
    player,
    creature,
    tasks: Array.isArray(s.tasks) ? s.tasks : [],
    daily: s.daily ?? null,
    expedition: s.expedition ?? null,
    activeDays: [],
    inventory: Array.isArray(s.inventory) ? s.inventory : [],
  }
  // Saves from before the streak existed rebuild it from completed tasks and cards.
  state.activeDays = Array.isArray(s.activeDays) ? s.activeDays : activityFromHistory(state)
  return state
}

export async function loadState(): Promise<GameState> {
  try {
    const raw = await tx('readonly', (s) => s.get(KEY))
    return normalize(raw ?? { creature: { seed: newSeed(), history: [] } })
  } catch {
    return normalize({ creature: { seed: newSeed(), history: [] } })
  }
}

export async function saveState(state: GameState): Promise<void> {
  await tx('readwrite', (s) => s.put(state, KEY))
}
