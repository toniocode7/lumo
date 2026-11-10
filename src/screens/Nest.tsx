import { useEffect, useState } from 'react'
import { Creature } from '../components/Creature'
import { Icon } from '../components/Icon'
import { ItemArt } from '../components/ItemArt'
import { NestScene } from '../components/NestScene'
import { Button, Card, RarityChip, ScreenHeader, Stat } from '../components/ui'
import { currentForm } from '../game/creature'
import { DEFAULT_BACKDROP, ITEMS, getItem, type Item, type ItemKind } from '../game/items'
import { burstFrom, cssVar } from '../fx/particles'
import { useGame } from '../game/store'
import './Nest.css'

const SOURCE_LABEL: Record<Item['source'], string> = {
  shop: 'Boutique',
  legendary: 'Carte légendaire',
  expedition: 'Expédition',
}

const FILTERS: { kind: ItemKind | 'all'; label: string }[] = [
  { kind: 'all', label: 'Tout' },
  { kind: 'plant', label: 'Plantes' },
  { kind: 'light', label: 'Lumières' },
  { kind: 'stone', label: 'Pierres' },
  { kind: 'backdrop', label: 'Ambiances' },
]

function SlotSheet({ slot, onClose }: { slot: number; onClose: () => void }) {
  const { state, placeItem } = useGame()
  const owned = [...new Set(state.inventory)]
    .map(getItem)
    .filter((i): i is Item => !!i && i.kind !== 'backdrop')
  const current = state.nest.slots[slot]

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const choose = (id: string | null) => {
    placeItem(slot, id)
    onClose()
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="slot-title" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h2 id="slot-title">Décorer cet endroit</h2>
          <button className="icon-btn" aria-label="Fermer" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>
        {owned.length === 0 ? (
          <p className="muted">
            Rien à poser pour l’instant. La boutique, les expéditions et les cartes légendaires
            remplissent ta collection.
          </p>
        ) : (
          <div className="pick-grid">
            {owned.map((item) => {
              const elsewhere = state.nest.slots.includes(item.id) && current !== item.id
              return (
                <button key={item.id} className="pick" aria-pressed={current === item.id} onClick={() => choose(item.id)}>
                  <ItemArt item={item} size={52} />
                  <span>{item.name}</span>
                  {elsewhere && <small>Déjà posé, sera déplacé</small>}
                </button>
              )
            })}
          </div>
        )}
        {current && (
          <Button variant="secondary" block onClick={() => choose(null)}>
            Laisser vide
          </Button>
        )}
      </div>
    </div>
  )
}

function MyNest() {
  const { state, setBackdrop } = useGame()
  const [slot, setSlot] = useState<number | null>(null)
  const form = currentForm(state.creature)
  const counts = state.inventory.reduce<Record<string, number>>((m, id) => ({ ...m, [id]: (m[id] ?? 0) + 1 }), {})
  const collection = Object.keys(counts)
    .map(getItem)
    .filter((i): i is Item => !!i && i.kind !== 'backdrop')
  const backdrops = ITEMS.filter((i) => i.kind === 'backdrop' && (i.id === DEFAULT_BACKDROP || counts[i.id]))

  return (
    <div className="stack">
      <div className={`nest-stage nest-big backdrop-${state.nest.backdrop}`}>
        <NestScene slots={state.nest.slots} onSlot={setSlot}>
          <Creature stage={form.stage} branch={form.branch} seed={state.creature.seed} eggProgress={state.player.tasksDone} size={170} />
        </NestScene>
        <div className="nest-ground" />
        <p className="nest-hint">Touche un emplacement pour le décorer.</p>
      </div>

      <h2 className="section-title">Ambiance</h2>
      <div className="backdrop-row">
        {backdrops.map((b) => (
          <button key={b.id} className="backdrop-pick" aria-pressed={state.nest.backdrop === b.id} onClick={() => setBackdrop(b.id)}>
            <ItemArt item={b} size={56} />
            <span>{b.name}</span>
          </button>
        ))}
      </div>

      <h2 className="section-title">Collection</h2>
      {collection.length === 0 ? (
        <Card>
          <p className="muted">
            Vide pour l’instant. Les expéditions et les cartes légendaires rapportent des objets
            introuvables en boutique.
          </p>
        </Card>
      ) : (
        <div className="item-grid">
          {collection.map((item) => (
            <Card key={item.id} className="item-card">
              <ItemArt item={item} size={64} />
              <strong>{item.name}</strong>
              <small className="muted">
                {SOURCE_LABEL[item.source]}
                {counts[item.id] > 1 && ` · x${counts[item.id]}`}
              </small>
              {item.source !== 'shop' && <RarityChip rarity={item.rarity} />}
            </Card>
          ))}
        </div>
      )}

      {slot !== null && <SlotSheet slot={slot} onClose={() => setSlot(null)} />}
    </div>
  )
}

function Shop() {
  const { state, buyItem } = useGame()
  const [filter, setFilter] = useState<ItemKind | 'all'>('all')
  const coins = state.player.coins
  const items = ITEMS.filter(
    (i) => i.source === 'shop' && i.id !== DEFAULT_BACKDROP && (filter === 'all' || i.kind === filter),
  )

  return (
    <div className="stack">
      <div className="filters" role="group" aria-label="Filtrer la boutique">
        {FILTERS.map((f) => (
          <button key={f.kind} className="filter" aria-pressed={filter === f.kind} onClick={() => setFilter(f.kind)}>
            {f.label}
          </button>
        ))}
      </div>
      <div className="item-grid">
        {items.map((item) => {
          const owned = state.inventory.includes(item.id)
          const missing = (item.price ?? 0) - coins
          return (
            <Card key={item.id} className={`item-card ${owned ? 'is-owned' : ''}`}>
              <ItemArt item={item} size={64} />
              <strong>{item.name}</strong>
              {owned ? (
                <span className="owned">
                  <Icon name="check" size={16} /> À toi
                </span>
              ) : (
                <Button
                  variant="gold"
                  className="buy"
                  disabled={missing > 0}
                  onClick={(e) => {
                    burstFrom(e.currentTarget, [cssVar('--gold'), item.color, '#ffffff'], { count: 28 })
                    buyItem(item.id)
                  }}
                  aria-label={`Acheter ${item.name} pour ${item.price} pièces`}
                >
                  <Icon name="coin" size={16} /> {item.price}
                </Button>
              )}
              {!owned && missing > 0 && <small className="muted">Encore {missing}</small>}
            </Card>
          )
        })}
      </div>
      <p className="muted hint-small">
        Les objets d’expédition et des cartes légendaires ne se vendent pas ici. Il faut aller les
        chercher.
      </p>
    </div>
  )
}

export function Nest() {
  const { state } = useGame()
  const [tab, setTab] = useState<'nest' | 'shop'>('nest')

  return (
    <>
      <ScreenHeader
        title="Nid"
        subtitle="Décore l’endroit où vit ton compagnon."
        action={<Stat icon="coin" value={state.player.coins} label="Pièces" tone="gold" />}
      />
      <div className="segmented tabs" role="tablist" aria-label="Nid ou boutique">
        <button role="tab" aria-selected={tab === 'nest'} aria-pressed={tab === 'nest'} onClick={() => setTab('nest')}>
          <Icon name="nest" size={16} /> Mon nid
        </button>
        <button role="tab" aria-selected={tab === 'shop'} aria-pressed={tab === 'shop'} onClick={() => setTab('shop')}>
          <Icon name="coin" size={16} /> Boutique
        </button>
      </div>
      {tab === 'nest' ? <MyNest /> : <Shop />}
    </>
  )
}
