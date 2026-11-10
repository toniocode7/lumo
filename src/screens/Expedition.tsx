import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Creature } from '../components/Creature'
import { Icon } from '../components/Icon'
import { Button, Card, RarityChip, ScreenHeader } from '../components/ui'
import { currentForm } from '../game/creature'
import { DURATIONS, LOOT, progress, remainingMs, type Duration } from '../game/expedition'
import { getItem } from '../game/items'
import { todaysTasks } from '../game/rules'
import { burstFrom, cssVar } from '../fx/particles'
import { useGame } from '../game/store'
import { formatClock, useNow } from '../useNow'
import './Expedition.css'

const DURATION_TEXT: Record<Duration, string> = {
  15: 'Petit tour',
  25: 'Exploration',
  45: 'Grande traversée',
}

/** Point on the trail (a cubic curve across the landscape), as % of the scene. */
function trailPoint(t: number) {
  const p0 = [8, 78]
  const p1 = [35, 20]
  const p2 = [62, 100]
  const p3 = [90, 34]
  const u = 1 - t
  const x = u ** 3 * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t ** 3 * p3[0]
  const y = u ** 3 * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t ** 3 * p3[1]
  return { x, y }
}

function Landscape({ t, children }: { t: number; children?: ReactNode }) {
  const pos = trailPoint(t)
  return (
    <div className="scene">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0d1424" />
            <stop offset="1" stopColor="#172235" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#sky)" />
        <path d="M0 62 L14 48 L26 58 L40 40 L54 56 L68 44 L82 54 L100 42 L100 100 L0 100 Z" fill="#1a2840" />
        <path d="M0 78 L18 66 L34 76 L50 64 L66 74 L84 62 L100 70 L100 100 L0 100 Z" fill="#14202f" />
        <path
          className="trail"
          d="M8 78 C35 20 62 100 90 34"
          fill="none"
          stroke="#4fd1c5"
          strokeOpacity="0.35"
          strokeWidth="0.8"
          strokeDasharray="1.5 2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="stars" aria-hidden="true" />
      <span className="flag" style={{ left: '90%', top: '34%' }} aria-hidden="true" />
      <div className="traveler" style={{ left: `${pos.x}%`, top: `${pos.y}%` }}>
        {children}
      </div>
    </div>
  )
}

function Picker() {
  const { state, startExpedition } = useGame()
  const [minutes, setMinutes] = useState<Duration>(25)
  const [taskId, setTaskId] = useState('')
  const { todo } = todaysTasks(state)
  const form = currentForm(state.creature)

  return (
    <div className="stack">
      <Landscape t={0}>
        <Creature stage={form.stage} branch={form.branch} seed={state.creature.seed} eggProgress={state.player.tasksDone} size={64} />
      </Landscape>

      <fieldset className="durations">
        <legend className="section-title">Durée</legend>
        {DURATIONS.map((m) => (
          <button key={m} className="duration" aria-pressed={minutes === m} onClick={() => setMinutes(m)}>
            <span className="num duration-min">{m}</span>
            <span className="duration-label">
              <strong>{DURATION_TEXT[m]}</strong>
              <small>
                +{LOOT[m].xp} XP · ~{LOOT[m].coins} pièces · objet {Math.round(LOOT[m].itemChance * 100)}&nbsp;%
              </small>
            </span>
          </button>
        ))}
      </fieldset>

      {todo.length > 0 && (
        <label className="link-task">
          <span className="section-title">Sur quoi tu te concentres&nbsp;? (facultatif)</span>
          <select className="field" value={taskId} onChange={(e) => setTaskId(e.target.value)}>
            <option value="">Rien de précis</option>
            {todo.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </label>
      )}

      <Button block icon="compass" onClick={() => startExpedition(minutes, taskId || undefined)}>
        Partir {minutes} minutes
      </Button>
      <p className="muted hint">
        {form.stage === 0
          ? 'Ton œuf part aussi. Oui, il roule.'
          : 'Pose ton téléphone : ton compagnon s’occupe du reste.'}
      </p>
    </div>
  )
}

function Journey() {
  const { state, finishExpedition } = useGame()
  const exp = state.expedition!
  const now = useNow(true)
  const left = remainingMs(exp, now)
  const t = progress(exp, now)
  const back = left === 0
  const [confirm, setConfirm] = useState(false)
  const form = currentForm(state.creature)
  const task = exp.taskId ? state.tasks.find((x) => x.id === exp.taskId) : undefined

  useEffect(() => {
    const prev = document.title
    document.title = back ? 'Rentré · Lumo' : `${formatClock(left)} · Lumo`
    return () => {
      document.title = prev
    }
  }, [left, back])

  useEffect(() => {
    if (!confirm) return
    const t = setTimeout(() => setConfirm(false), 4000)
    return () => clearTimeout(t)
  }, [confirm])

  return (
    <div className="stack journey">
      <Landscape t={t}>
        <Creature
          stage={form.stage}
          branch={form.branch}
          seed={state.creature.seed}
          eggProgress={state.player.tasksDone}
          mood={back ? 'happy' : 'idle'}
          size={64}
        />
      </Landscape>

      <div className="clock" role="timer" aria-live="off">
        <span className="num">{back ? '00:00' : formatClock(left)}</span>
        <p className="muted">
          {back
            ? 'Ton compagnon est rentré, les poches pleines.'
            : task
              ? `Concentré sur\u00a0: ${task.title}`
              : 'En exploration. Reste concentré.'}
        </p>
      </div>

      {back ? (
        <Button block variant="gold" icon="spark" onClick={finishExpedition}>
          Ouvrir le butin
        </Button>
      ) : confirm ? (
        <Button block variant="secondary" onClick={finishExpedition}>
          Rentrer maintenant (butin réduit)
        </Button>
      ) : (
        <Button block variant="ghost" onClick={() => setConfirm(true)}>
          Abandonner
        </Button>
      )}
    </div>
  )
}

function LootView() {
  const { loot, clearLoot, state, completeTask } = useGame()
  const hero = useRef<HTMLDivElement>(null)

  // A shower of light when the creature empties its pockets.
  useEffect(() => {
    if (!loot || loot.completion < 1) return
    const t = setTimeout(() => {
      burstFrom(hero.current, [cssVar('--gold'), cssVar('--accent'), '#ffffff'], { count: 50, power: 1.3, upward: true, spread: 1.6 })
    }, 250)
    return () => clearTimeout(t)
  }, [loot])

  if (!loot) return null
  const form = currentForm(state.creature)
  const item = loot.itemId ? getItem(loot.itemId) : undefined
  const full = loot.completion >= 1
  const task = loot.taskId ? state.tasks.find((t) => t.id === loot.taskId) : undefined
  const taskOpen = task && !todaysTasks(state).done.some((t) => t.id === task.id)

  return (
    <div className="stack loot">
      <div className="loot-hero" ref={hero}>
        <Creature stage={form.stage} branch={form.branch} seed={state.creature.seed} eggProgress={state.player.tasksDone} mood="happy" size={140} />
        <h2>{full ? 'De retour, avec du butin.' : loot.minutesSpent < 1 ? 'Déjà rentré ?' : 'Retour anticipé.'}</h2>
        <p className="muted">
          {full
            ? `${loot.minutesSpent} minutes de concentration. Pas mal du tout.`
            : loot.minutesSpent < 1
              ? 'Il a à peine passé la porte. Pas grave, ce sera pour la prochaine.'
              : `${loot.minutesSpent} minute${loot.minutesSpent > 1 ? 's' : ''} quand même. Il a ramassé ce qu’il a pu.`}
        </p>
      </div>

      <Card className="loot-list">
        <div className="loot-row">
          <Icon name="spark" /> <span className="num">+{loot.xp} XP</span>
        </div>
        <div className="loot-row gold">
          <Icon name="coin" /> <span className="num">+{loot.coins} pièces</span>
        </div>
        {item && (
          <div className={`loot-row item rarity-${item.rarity}`}>
            <Icon name="nest" /> <span>{item.name}</span>
            <RarityChip rarity={item.rarity} />
          </div>
        )}
      </Card>

      {taskOpen && (
        <Button
          block
          variant="secondary"
          icon="check"
          onClick={() => {
            completeTask(task.id)
            clearLoot()
          }}
        >
          Cocher « {task.title} »
        </Button>
      )}
      <Button block onClick={clearLoot}>
        Super
      </Button>
    </div>
  )
}

export function Expedition() {
  const { state, loot } = useGame()
  const active = !!state.expedition

  return (
    <>
      <ScreenHeader
        title="Expédition"
        subtitle={
          loot ? 'Voyons ce qu’il rapporte.' : active ? 'Ton compagnon explore.' : 'Concentre-toi, ton compagnon part explorer.'
        }
      />
      {loot ? <LootView /> : active ? <Journey /> : <Picker />}
    </>
  )
}
