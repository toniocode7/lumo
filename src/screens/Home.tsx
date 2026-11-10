import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Orb } from '../components/Orb'
import { TaskRow } from '../components/TaskRow'
import { Button, Card, ProgressBar, Stat } from '../components/ui'
import { useGame } from '../game/store'
import { levelFromXp, todaysTasks } from '../game/rules'
import './screens.css'

function mood(todo: number, done: number) {
  if (done === 0 && todo === 0) return 'Flotte tranquillement. Attend la suite.'
  if (todo === 0) return 'Rayonne. Journée bouclée.'
  if (done === 0) return 'T’observe, l’air de rien.'
  return 'Prend des forces. Continue comme ça.'
}

export function Home() {
  const { state, openSheet } = useGame()
  const { level, xpInLevel, xpToNext } = levelFromXp(state.player.xp)
  const { todo, done } = todaysTasks(state)

  return (
    <div className="stack">
      <div className="row between">
        <div className="row">
          <Stat icon="coin" value={state.player.coins} label="Pièces" tone="gold" />
          <Stat icon="spark" value={`Niv. ${level}`} label="Niveau" />
        </div>
        <Link to="/profil" className="icon-btn mobile-only" aria-label="Profil">
          <Icon name="user" />
        </Link>
      </div>

      <div className="nest-stage">
        <Orb size={150} />
        <div className="nest-ground" />
        <div className="creature-name">
          <h2>Étincelle</h2>
          <p className="muted">{mood(todo.length, done.length)}</p>
        </div>
      </div>

      <Card className="level-card">
        <div className="level-head">
          <span>
            Niveau <span className="num">{level}</span>
          </span>
          <span className="num muted" style={{ fontSize: 14 }}>
            {xpInLevel} / {xpToNext} XP
          </span>
        </div>
        <ProgressBar value={xpInLevel} max={xpToNext} label="Progression du niveau" />
      </Card>

      {todo.length > 0 ? (
        <section>
          <div className="row between">
            <h2 className="section-title">Aujourd’hui</h2>
            <Link to="/taches" className="see-all">
              Tout voir ({todo.length})
            </Link>
          </div>
          <ul className="task-list">
            {todo.slice(0, 3).map((t) => (
              <TaskRow key={t.id} task={t} done={false} />
            ))}
          </ul>
        </section>
      ) : null}

      <Button icon="plus" block onClick={openSheet}>
        Ajouter une tâche
      </Button>

      <div className="shortcuts">
        <Link to="/cartes" className="shortcut gold">
          <span className="shortcut-icon">
            <Icon name="cards" />
          </span>
          <span>
            <strong>Cartes du jour</strong>
            <small>Bientôt</small>
          </span>
        </Link>
        <Link to="/expedition" className="shortcut">
          <span className="shortcut-icon">
            <Icon name="compass" />
          </span>
          <span>
            <strong>Expédition</strong>
            <small>Bientôt</small>
          </span>
        </Link>
      </div>
    </div>
  )
}
