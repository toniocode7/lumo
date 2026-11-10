import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react'
import { useGame } from '../game/store'
import { REWARDS, SIZE_LABEL, WEEKDAYS } from '../game/rules'
import type { Category, Repeat, Size } from '../game/types'
import { Icon } from './Icon'
import { Button, categoryLabel } from './ui'
import './TaskSheet.css'

type RepeatMode = 'once' | 'daily' | 'days'
const sizes: Size[] = ['s', 'm', 'l']
const categories: Category[] = ['body', 'mind', 'create', 'order']
const categoryHint: Record<Category, string> = {
  body: 'sport, santé, sommeil',
  mind: 'études, lecture',
  create: 'projets, art, musique',
  order: 'maison, admin',
}

export function TaskSheet() {
  const { sheetOpen, closeSheet, addTask } = useGame()
  const [title, setTitle] = useState('')
  const [size, setSize] = useState<Size>('m')
  const [category, setCategory] = useState<Category>('order')
  const [mode, setMode] = useState<RepeatMode>('once')
  const [days, setDays] = useState<number[]>([1, 3, 5])
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!sheetOpen) return
    setTitle('')
    setMode('once')
    // Wait for the open animation to start so mobile keyboards behave.
    const t = setTimeout(() => input.current?.focus(), 60)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeSheet()
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(t)
      window.removeEventListener('keydown', onKey)
    }
  }, [sheetOpen, closeSheet])

  if (!sheetOpen) return null

  const canSave = title.trim().length > 0 && (mode !== 'days' || days.length > 0)

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!canSave) return
    const repeat: Repeat = mode === 'once' ? 'once' : mode === 'daily' ? 'daily' : [...days].sort((a, b) => a - b)
    addTask({ title, size, category, repeat })
    closeSheet()
  }

  const toggleDay = (n: number) =>
    setDays((d) => (d.includes(n) ? d.filter((x) => x !== n) : [...d, n]))

  return (
    <div className="sheet-backdrop" onClick={closeSheet}>
      <form
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
      >
        <div className="sheet-head">
          <h2 id="sheet-title">Nouvelle tâche</h2>
          <button type="button" className="icon-btn" aria-label="Fermer" onClick={closeSheet}>
            <Icon name="close" />
          </button>
        </div>

        <input
          ref={input}
          className="field"
          placeholder="Ex. : courir 20 minutes"
          value={title}
          maxLength={80}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="Titre de la tâche"
        />

        <fieldset className="group">
          <legend>Taille</legend>
          <div className="options three">
            {sizes.map((s) => (
              <button
                type="button"
                key={s}
                className="option"
                aria-pressed={size === s}
                onClick={() => setSize(s)}
              >
                <strong>{SIZE_LABEL[s]}</strong>
                <small className="num">+{REWARDS[s].xp} XP</small>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="group">
          <legend>Catégorie</legend>
          <div className="options two">
            {categories.map((c) => (
              <button
                type="button"
                key={c}
                className="option cat"
                style={{ '--c': `var(--cat-${c})` } as CSSProperties}
                aria-pressed={category === c}
                onClick={() => setCategory(c)}
              >
                <strong>
                  <span className="cat-dot" /> {categoryLabel[c]}
                </strong>
                <small>{categoryHint[c]}</small>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="group">
          <legend>Répétition</legend>
          <div className="options three">
            {(
              [
                ['once', 'Une fois'],
                ['daily', 'Chaque jour'],
                ['days', 'Certains jours'],
              ] as const
            ).map(([m, label]) => (
              <button
                type="button"
                key={m}
                className="option compact"
                aria-pressed={mode === m}
                onClick={() => setMode(m)}
              >
                {label}
              </button>
            ))}
          </div>
          {mode === 'days' && (
            <div className="days">
              {WEEKDAYS.map((d) => (
                <button
                  type="button"
                  key={d.n}
                  className="day"
                  aria-pressed={days.includes(d.n)}
                  aria-label={d.long}
                  onClick={() => toggleDay(d.n)}
                >
                  {d.short}
                </button>
              ))}
            </div>
          )}
        </fieldset>

        <Button type="submit" block disabled={!canSave}>
          Ajouter
        </Button>
      </form>
    </div>
  )
}
