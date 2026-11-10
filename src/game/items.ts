/** Decoration items. Step 7 (nest and shop) will place them in the nest. */
export interface Item {
  id: string
  name: string
  /** Where it can be found. Only 'legendary' items exist so far. */
  source: 'legendary'
}

export const ITEMS: Item[] = [
  { id: 'aurora-lantern', name: 'Lanterne d’aurore', source: 'legendary' },
  { id: 'singing-crystal', name: 'Cristal chantant', source: 'legendary' },
  { id: 'comet-feather', name: 'Plume de comète', source: 'legendary' },
  { id: 'silver-fern', name: 'Fougère d’argent', source: 'legendary' },
  { id: 'moonstone', name: 'Pierre de lune', source: 'legendary' },
  { id: 'still-hourglass', name: 'Sablier figé', source: 'legendary' },
]

const byId = new Map(ITEMS.map((i) => [i.id, i]))
export const getItem = (id: string) => byId.get(id)

/** Picks an item, preferring ones the player doesn't own yet. */
export function pickLegendaryItem(owned: string[], rand: () => number): string {
  const pool = ITEMS.filter((i) => i.source === 'legendary')
  const fresh = pool.filter((i) => !owned.includes(i.id))
  const list = fresh.length ? fresh : pool
  return list[Math.floor(rand() * list.length)].id
}
