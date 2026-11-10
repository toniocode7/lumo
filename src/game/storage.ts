import { initialState } from './reducer'
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
  return {
    version: 1,
    player: {
      ...initialState.player,
      ...s.player,
      byCategory: { ...initialState.player.byCategory, ...s.player?.byCategory },
    },
    tasks: Array.isArray(s.tasks) ? s.tasks : [],
  }
}

export async function loadState(): Promise<GameState> {
  try {
    const raw = await tx('readonly', (s) => s.get(KEY))
    return raw ? normalize(raw) : initialState
  } catch {
    return initialState
  }
}

export async function saveState(state: GameState): Promise<void> {
  await tx('readwrite', (s) => s.put(state, KEY))
}
