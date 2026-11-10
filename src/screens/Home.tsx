import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Creature, type Mood } from '../components/Creature'
import { NestScene } from '../components/NestScene'
import { HATCH_AFTER_TASKS, currentForm, formName } from '../game/creature'
import { TaskRow } from '../components/TaskRow'
import { Button, Card, ProgressBar, Stat } from '../components/ui'
import { useGame } from '../game/store'
import { levelFromXp, todaysTasks } from '../game/rules'
import { remainingMs } from '../game/expedition'
import { formatClock, useNow } from '../useNow'
import './screens.css'

function caption(todo: number, done: number) {
  if (done === 0 && todo === 0) return 'Flotte tranquillement. Attend la suite.'
  if (todo === 0) return 'Rayonne. Journée bouclée.'
  if (done === 0) return 'T’observe, l’air de rien.'
  return 'Prend des forces. Continue comme ça.'
}

function eggCaption(tasksDone: number) {
  const left = HATCH_AFTER_TASKS - tasksDone
  if (left <= 0) return 'Il est prêt.'
  if (tasksDone === 0) return `Il éclora après ${HATCH_AFTER_TASKS} tâches. Coche la première.`
  return `Ça craque. Encore ${left} tâche${left > 1 ? 's' : ''}.`
}

export function Home() {
  const { state, openSheet, pulse, streak } = useGame()
  const form = currentForm(state.creature)
  const { level, xpInLevel, xpToNext } = levelFromXp(state.player.xp)
  const { todo, done } = todaysTasks(state)
  const mood: Mood = streak.sleeping
    ? 'sleep'
    : done.length > 0 && todo.length === 0
      ? 'happy'
      : 'idle'
  const name = formName(form.stage, form.branch)
  const exp = state.expedition
  const now = useNow(!!exp)
  const expLeft = exp ? remainingMs(exp, now) : 0
  const expLabel = !exp ? 'Prête à partir' : expLeft === 0 ? 'Rentrée, butin à ouvrir' : `Retour dans ${formatClock(expLeft)}`
  const cards = state.daily?.cards ?? []
  const cardsDone = cards.filter((c) => c.done).length
  const cardsHidden = cards.filter((c) => !c.revealed).length
  const cardsLabel =
    cards.length === 0
      ? 'Tirage en cours'
      : cardsDone === cards.length
        ? 'Toutes faites'
        : cardsHidden > 0
          ? `${cardsHidden} à retourner`
          : `${cardsDone} sur ${cards.length} faites`

  return (
    <div className="stack">
      <div className="row between">
        <div className="row">
          <Stat
            icon="flame"
            value={streak.current}
            label={`Série de ${streak.current} jour${streak.current > 1 ? 's' : ''}`}
            tone={streak.atRisk ? 'coral' : 'accent'}
          />
          <Stat icon="coin" value={state.player.coins} label="Pièces" tone="gold" />
          <Stat icon="spark" value={`Niv. ${level}`} label="Niveau" />
        </div>
        <Link to="/profil" className="icon-btn mobile-only" aria-label="Profil">
          <Icon name="user" />
        </Link>
      </div>

      <div
        className={`nest-stage backdrop-${state.nest.backdrop} ${streak.sleeping && !exp ? 'is-misty' : ''}`}
      >
        <NestScene slots={state.nest.slots}>
          {exp ? (
            <Link to="/expedition" className="away" aria-label="Voir l’expédition">
              <span className="away-icon">
                <Icon name="compass" size={36} />
              </span>
            </Link>
          ) : (
            <Creature
              stage={form.stage}
              branch={form.branch}
              seed={state.creature.seed}
              eggProgress={state.player.tasksDone}
              mood={mood}
              pulseKey={pulse}
              size={180}
              label={name}
            />
          )}
        </NestScene>
        <div className="nest-ground" />
        <div className="creature-name">
          <h2>{name}</h2>
          <p className="muted">
            {exp
              ? expLeft === 0
                ? 'Rentré de voyage. Va voir ce qu’il rapporte.'
                : `Parti explorer. Retour dans ${formatClock(expLeft)}.`
              : streak.sleeping
                ? 'Il dort sous la brume. Une tâche ou une carte suffit pour le réveiller.'
                : form.stage === 0
              ? eggCaption(state.player.tasksDone)
              : caption(todo.length, done.length)}
          </p>
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

      {streak.atRisk && (
        <div className="streak-note" role="status">
          <span className="streak-note-icon">
            <Icon name="flame" size={18} />
          </span>
          <p>
            <strong>
              Série de {streak.current} jour{streak.current > 1 ? 's' : ''} en jeu.
            </strong>{' '}
            Une tâche ou une carte aujourd’hui suffit.
            {streak.jokerAvailable && ' Et ton joker de la semaine couvre un oubli.'}
          </p>
        </div>
      )}

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
            <small>{cardsLabel}</small>
          </span>
        </Link>
        <Link to="/expedition" className="shortcut">
          <span className="shortcut-icon">
            <Icon name="compass" />
          </span>
          <span>
            <strong>Expédition</strong>
            <small>{expLabel}</small>
          </span>
        </Link>
      </div>
    </div>
  )
}
