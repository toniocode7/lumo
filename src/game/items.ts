/** Every decoration in the game: shop items, legendary card finds and expedition loot. */
export type ItemSource = 'shop' | 'legendary' | 'expedition'
export type ItemKind = 'plant' | 'light' | 'stone' | 'treasure' | 'backdrop'
export type ItemArt =
  | 'fern'
  | 'bonsai'
  | 'cactus'
  | 'lantern'
  | 'garland'
  | 'fireflies'
  | 'cairn'
  | 'crystal'
  | 'pebble'
  | 'mushroom'
  | 'feather'
  | 'hourglass'
  | 'driftwood'
  | 'sprout'
  | 'moss'
  | 'star'
  | 'moon'
  | 'backdrop'

export interface Item {
  id: string
  name: string
  source: ItemSource
  rarity: 'common' | 'rare' | 'legendary'
  kind: ItemKind
  art: ItemArt
  color: string
  /** Shop price in coins. Only shop items have one. */
  price?: number
}

const shop = (id: string, name: string, kind: ItemKind, art: ItemArt, color: string, price: number): Item => ({
  id,
  name,
  source: 'shop',
  rarity: 'common',
  kind,
  art,
  color,
  price,
})

/** The backdrop every nest starts with. */
export const DEFAULT_BACKDROP = 'night'

export const ITEMS: Item[] = [
  // Shop: plants, lights, stones, backdrops
  shop('fern', 'Fougère', 'plant', 'fern', '#5fbf8f', 40),
  shop('cactus', 'Cactus prisme', 'plant', 'cactus', '#4fd1a0', 70),
  shop('bonsai', 'Bonsaï', 'plant', 'bonsai', '#6cc28a', 90),
  shop('lantern', 'Lanterne', 'light', 'lantern', '#f5b544', 60),
  shop('garland', 'Guirlande d’étoiles', 'light', 'garland', '#ffe08a', 120),
  shop('fireflies', 'Lucioles', 'light', 'fireflies', '#d8f56b', 150),
  shop('zen-pebble', 'Galet zen', 'stone', 'pebble', '#b9bfcf', 30),
  shop('cairn', 'Cairn', 'stone', 'cairn', '#a3a9bb', 50),
  shop('rough-crystal', 'Cristal brut', 'stone', 'crystal', '#8ab8ff', 110),
  { id: DEFAULT_BACKDROP, name: 'Nuit claire', source: 'shop', rarity: 'common', kind: 'backdrop', art: 'backdrop', color: '#1b1e29', price: 0 },
  shop('dawn', 'Aube', 'backdrop', 'backdrop', '#f2a68a', 200),
  shop('dusk', 'Crépuscule', 'backdrop', 'backdrop', '#9b6bd9', 200),
  shop('aurora', 'Aurore boréale', 'backdrop', 'backdrop', '#4fd1a0', 350),

  // Legendary daily cards
  { id: 'aurora-lantern', name: 'Lanterne d’aurore', source: 'legendary', rarity: 'legendary', kind: 'light', art: 'lantern', color: '#c3a6ff' },
  { id: 'singing-crystal', name: 'Cristal chantant', source: 'legendary', rarity: 'legendary', kind: 'stone', art: 'crystal', color: '#6fe0d4' },
  { id: 'comet-feather', name: 'Plume de comète', source: 'legendary', rarity: 'legendary', kind: 'treasure', art: 'feather', color: '#f5a66a' },
  { id: 'silver-fern', name: 'Fougère d’argent', source: 'legendary', rarity: 'legendary', kind: 'plant', art: 'fern', color: '#d4dbea' },
  { id: 'moonstone', name: 'Pierre de lune', source: 'legendary', rarity: 'legendary', kind: 'stone', art: 'moon', color: '#e6ecff' },
  { id: 'still-hourglass', name: 'Sablier figé', source: 'legendary', rarity: 'legendary', kind: 'treasure', art: 'hourglass', color: '#f5b544' },

  // Expedition loot: never sold in the shop
  { id: 'polished-pebble', name: 'Galet poli', source: 'expedition', rarity: 'common', kind: 'stone', art: 'pebble', color: '#9fb4c8' },
  { id: 'glow-moss', name: 'Mousse lumineuse', source: 'expedition', rarity: 'common', kind: 'plant', art: 'moss', color: '#7be0a0' },
  { id: 'night-mushroom', name: 'Champignon de nuit', source: 'expedition', rarity: 'common', kind: 'plant', art: 'mushroom', color: '#8ab8ff' },
  { id: 'driftwood', name: 'Bois flotté', source: 'expedition', rarity: 'common', kind: 'treasure', art: 'driftwood', color: '#b9957a' },
  { id: 'star-shard', name: 'Éclat d’étoile', source: 'expedition', rarity: 'rare', kind: 'treasure', art: 'star', color: '#f5d76e' },
  { id: 'aurora-seed', name: 'Graine d’aurore', source: 'expedition', rarity: 'rare', kind: 'plant', art: 'sprout', color: '#c3a6ff' },
  { id: 'wind-feather', name: 'Plume de vent', source: 'expedition', rarity: 'rare', kind: 'treasure', art: 'feather', color: '#bfe9ff' },
]

const byId = new Map(ITEMS.map((i) => [i.id, i]))
export const getItem = (id: string) => byId.get(id)

export const isBackdrop = (id: string) => getItem(id)?.kind === 'backdrop'

/** Picks a legendary item, preferring ones the player doesn't own yet. */
export function pickLegendaryItem(owned: string[], rand: () => number): string {
  const pool = ITEMS.filter((i) => i.source === 'legendary')
  const fresh = pool.filter((i) => !owned.includes(i.id))
  const list = fresh.length ? fresh : pool
  return list[Math.floor(rand() * list.length)].id
}
