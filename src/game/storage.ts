import { advanceCreature, newSeed } from './creature'
import { autoPlace, initialState } from './reducer'
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
    nest: s.nest?.slots ? s.nest : initialState.nest,
    // Players who already had progress before the welcome screens existed skip them.
    onboarded: s.onboarded ?? (player.xp > 0 || (Array.isArray(s.tasks) && s.tasks.length > 0)),
  }
  // Items found before the nest existed get placed in it.
  if (!s.nest?.slots) for (const id of state.inventory) Object.assign(state, autoPlace(state, id))
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

/** Asks the browser not to clear our data under storage pressure (helps on iPhone). */
export function requestPersistentStorage() {
  try {
    void navigator.storage?.persist?.()
  } catch {
    // Not supported: data still saves, just without the extra guarantee.
  }
}

export interface SaveFile {
  app: 'lumo'
  version: 1
  exportedAt: string
  state: GameState
}

export function exportSave(state: GameState, now = new Date()): { name: string; json: string } {
  const file: SaveFile = { app: 'lumo', version: 1, exportedAt: now.toISOString(), state }
  const day = now.toISOString().slice(0, 10)
  return { name: `lumo-sauvegarde-${day}.json`, json: JSON.stringify(file, null, 2) }
}

/** Reads a save file. Throws a readable message if it isn't one. */
export function parseSave(text: string): { state: GameState; exportedAt: string } {
  let data: Partial<SaveFile>
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('Ce fichier n’est pas lisible.')
  }
  if (data?.app !== 'lumo' || !data.state || typeof data.state !== 'object') {
    throw new Error('Ce fichier n’est pas une sauvegarde Lumo.')
  }
  return { state: normalize(data.state), exportedAt: String(data.exportedAt ?? '') }
}
