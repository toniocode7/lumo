import { useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Card, ScreenHeader, categoryLabel } from '../components/ui'
import { Creature } from '../components/Creature'
import { SaveCard } from '../components/SaveCard'
import { EVOLVE_AT, formName } from '../game/creature'
import { useGame } from '../game/store'
import { dayKey } from '../game/rules'
import { addDays } from '../game/streak'
import type { Category } from '../game/types'
import { useThemeContext } from '../themeContext'
import { setSoundEnabled, sfx, soundEnabled } from '../fx/sound'
import './screens.css'

const categories: Category[] = ['body', 'mind', 'create', 'order']

export function Profile() {
  const { theme, setTheme } = useThemeContext()
  const [sound, setSound] = useState(soundEnabled)
  const toggleSound = (on: boolean) => {
    setSoundEnabled(on)
    setSound(on)
    if (on) sfx.check()
  }
  const { state, streak } = useGame()
  const { player, creature } = state
  const today = dayKey()
  const first = state.activeDays[0]
  const strip = Array.from({ length: 14 }, (_, i) => addDays(today, i - 13)).map((d) => ({
    day: d,
    kind: state.activeDays.includes(d)
      ? 'active'
      : streak.jokerDays.includes(d)
        ? 'joker'
        : d === today
          ? 'today'
          : first && d > first
            ? 'missed'
            : 'none',
  }))
  const weekday = new Intl.DateTimeFormat('fr-FR', { weekday: 'narrow' })
  const longDate = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  const kindLabel: Record<string, string> = {
    active: 'actif',
    joker: 'sauvé par le joker',
    today: 'aujourd’hui, rien encore',
    missed: 'jour manqué',
    none: 'avant tes débuts',
  }
  const dateFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' })
  const max = Math.max(1, ...categories.map((c) => player.byCategory[c]))

  return (
    <>
      <ScreenHeader title="Profil" subtitle="Tes stats et tes réglages." />

      <div className="stats-grid">
        <Card className="big-stat">
          <span className="num">{player.tasksDone}</span>
          <small>tâches faites</small>
        </Card>
        <Card className="big-stat">
          <span className="num">{player.xp}</span>
          <small>XP au total</small>
        </Card>
        <Card className="big-stat">
          <span className="num">{player.cardsDone}</span>
          <small>cartes relevées</small>
        </Card>
        <Card className="big-stat">
          <span className="num">{player.focusMinutes}</span>
          <small>minutes de concentration</small>
        </Card>
      </div>

      <h2 className="section-title">Série</h2>
      <Card className="stack">
        <div className="streak-head">
          <div>
            <span className="num streak-big">{streak.current}</span>
            <small className="muted"> jour{streak.current > 1 ? 's' : ''} d’affilée</small>
          </div>
          <div className="streak-side muted">
            <span>Record&nbsp;: <strong className="num">{streak.best}</strong></span>
            <span className={`joker-pill ${streak.jokerAvailable ? 'on' : ''}`}>
              {streak.jokerAvailable ? 'Joker dispo' : 'Joker utilisé'}
            </span>
          </div>
        </div>
        <ol className="strip" aria-label="Les 14 derniers jours">
          {strip.map(({ day, kind }) => {
            const date = new Date(`${day}T12:00:00`)
            return (
              <li key={day} className={`strip-day ${kind}`} title={`${longDate.format(date)}\u00a0: ${kindLabel[kind]}`}>
                <span className="strip-dot" />
                <span className="strip-label">{weekday.format(date)}</span>
                <span className="sr-only">
                  {longDate.format(date)}&nbsp;: {kindLabel[kind]}
                </span>
              </li>
            )
          })}
        </ol>
        <p className="muted" style={{ fontSize: 13 }}>
          Une tâche ou une carte par jour fait avancer la série. Un joker par semaine couvre un
          jour manqué, tout seul. Deux jours sans rien et ton compagnon s’endort&nbsp;: il se réveille
          dès que tu reviens, sans rien perdre.
        </p>
      </Card>

      <h2 className="section-title">Répartition</h2>
      <Card className="stack">
        {categories.map((c) => (
          <div
            key={c}
            className="cat-bar"
            style={{ '--c': `var(--cat-${c})` } as CSSProperties}
          >
            <span className="cat-bar-label">{categoryLabel[c]}</span>
            <span className="cat-bar-track">
              <span
                className="cat-bar-fill"
                style={{ width: `${(player.byCategory[c] / max) * 100}%` }}
              />
            </span>
            <span className="num cat-bar-value">{player.byCategory[c]}</span>
          </div>
        ))}
        <p className="muted" style={{ fontSize: 13 }}>
          La catégorie que tu fais le plus décidera de la forme de ton compagnon.
        </p>
      </Card>

      <h2 className="section-title">Évolutions</h2>
      <Card>
        {creature.history.length === 0 ? (
          <p className="muted">Ton œuf n’a pas encore éclos. Trois tâches, et on en reparle.</p>
        ) : (
          <ol className="evo-list">
            {[...creature.history].reverse().map((e) => (
              <li key={e.stage}>
                <Creature stage={e.stage} branch={e.branch} seed={creature.seed} size={56} />
                <div>
                  <strong>{formName(e.stage, e.branch)}</strong>
                  <p className="muted" style={{ fontSize: 13 }}>
                    {e.stage === 1 ? 'Éclosion' : `Niveau ${EVOLVE_AT[e.stage as 2 | 3 | 4]}`}
                    {e.branch ? ` · ${categoryLabel[e.branch]}` : ''} · {dateFmt.format(new Date(e.at))}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
        {creature.history.length > 0 && creature.history.length < 4 && (
          <p className="muted" style={{ fontSize: 13, marginTop: 12 }}>
            Prochaine évolution au niveau {EVOLVE_AT[(creature.history.length + 1) as 2 | 3 | 4]}.
          </p>
        )}
      </Card>

      <h2 className="section-title">Réglages</h2>
      <Card>
        <div className="setting">
          <div>
            <strong>Thème</strong>
            <p className="muted" style={{ fontSize: 14 }}>
              Sombre par défaut, plus reposant.
            </p>
          </div>
          <div className="segmented" role="group" aria-label="Thème">
            <button aria-pressed={theme === 'dark'} onClick={() => setTheme('dark')}>
              <Icon name="moon" size={16} /> Sombre
            </button>
            <button aria-pressed={theme === 'light'} onClick={() => setTheme('light')}>
              <Icon name="sun" size={16} /> Clair
            </button>
          </div>
        </div>
        <div className="setting">
          <div>
            <strong>Sons</strong>
            <p className="muted" style={{ fontSize: 14 }}>
              Petits sons discrets quand tu valides.
            </p>
          </div>
          <div className="segmented" role="group" aria-label="Sons">
            <button aria-pressed={sound} onClick={() => toggleSound(true)}>
              Activés
            </button>
            <button aria-pressed={!sound} onClick={() => toggleSound(false)}>
              Coupés
            </button>
          </div>
        </div>
        <Link to="/ui" className="setting" style={{ textDecoration: 'none' }}>
          <div>
            <strong>Design system</strong>
            <p className="muted" style={{ fontSize: 14 }}>
              Couleurs, typos et composants de l’appli.
            </p>
          </div>
          <Icon name="chevron" />
        </Link>
      </Card>

      <h2 className="section-title">Appli et sauvegarde</h2>
      <SaveCard />
    </>
  )
}
