import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Card, ScreenHeader, categoryLabel } from '../components/ui'
import { useGame } from '../game/store'
import type { Category } from '../game/types'
import { useThemeContext } from '../themeContext'
import './screens.css'

const categories: Category[] = ['body', 'mind', 'create', 'order']

export function Profile() {
  const { theme, setTheme } = useThemeContext()
  const { player } = useGame().state
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
      </div>

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
    </>
  )
}
