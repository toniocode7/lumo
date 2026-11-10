/** Decoration items. Step 7 (nest and shop) will place them in the nest. */
export interface Item {
  id: string
  name: string
  /** Where it can be found: legendary daily cards, or expeditions. */
  source: 'legendary' | 'expedition'
  rarity: 'common' | 'rare' | 'legendary'
}

export const ITEMS: Item[] = [
  { id: 'aurora-lantern', name: 'Lanterne d’aurore', source: 'legendary', rarity: 'legendary' },
  { id: 'singing-crystal', name: 'Cristal chantant', source: 'legendary', rarity: 'legendary' },
  { id: 'comet-feather', name: 'Plume de comète', source: 'legendary', rarity: 'legendary' },
  { id: 'silver-fern', name: 'Fougère d’argent', source: 'legendary', rarity: 'legendary' },
  { id: 'moonstone', name: 'Pierre de lune', source: 'legendary', rarity: 'legendary' },
  { id: 'still-hourglass', name: 'Sablier figé', source: 'legendary', rarity: 'legendary' },
  // Found only on expeditions, never sold in the shop.
  { id: 'polished-pebble', name: 'Galet poli', source: 'expedition', rarity: 'common' },
  { id: 'glow-moss', name: 'Mousse lumineuse', source: 'expedition', rarity: 'common' },
  { id: 'night-mushroom', name: 'Champignon de nuit', source: 'expedition', rarity: 'common' },
  { id: 'driftwood', name: 'Bois flotté', source: 'expedition', rarity: 'common' },
  { id: 'star-shard', name: 'Éclat d’étoile', source: 'expedition', rarity: 'rare' },
  { id: 'aurora-seed', name: 'Graine d’aurore', source: 'expedition', rarity: 'rare' },
  { id: 'wind-feather', name: 'Plume de vent', source: 'expedition', rarity: 'rare' },
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
