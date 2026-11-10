import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { formName } from '../game/creature'
import { useGame } from '../game/store'
import { burstFrom, cssVar } from '../fx/particles'
import { sfx } from '../fx/sound'
import { Creature } from './Creature'
import { Button, categoryLabel } from './ui'
import './EvolutionOverlay.css'

/** Hatching and evolution moment: charge, flash, then the new form in its branch colour. */
export function EvolutionOverlay() {
  const { evolution, dismissEvolution, state } = useGame()
  const [phase, setPhase] = useState<'before' | 'flash' | 'after'>('before')
  const button = useRef<HTMLButtonElement>(null)
  const stage = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!evolution) return
    setPhase('before')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const t1 = setTimeout(() => setPhase('flash'), reduce ? 0 : 1400)
    const t2 = setTimeout(() => setPhase('after'), reduce ? 0 : 1900)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [evolution])

  useEffect(() => {
    if (!evolution) return
    const color = evolution.to.branch ? cssVar(`--cat-${evolution.to.branch}`) : cssVar('--accent')
    if (phase === 'before') sfx.evolveCharge()
    if (phase === 'flash') {
      sfx.evolveBurst()
      burstFrom(stage.current, [color, '#ffffff', cssVar('--gold')], { count: 90, power: 1.6 })
    }
    if (phase === 'after') {
      button.current?.focus()
      // A few soft sparkles rising while the new form settles in.
      const timers = [400, 1300, 2200].map((ms) =>
        setTimeout(() => burstFrom(stage.current, [color, '#ffffff'], { count: 14, power: 0.6, upward: true, spread: 1.2 }), ms),
      )
      return () => timers.forEach(clearTimeout)
    }
  }, [phase, evolution])

  if (!evolution) return null
  const { from, to } = evolution
  const hatched = from.stage === 0
  const shown = phase === 'after' ? to : from
  const toName = formName(to.stage, to.branch)
  const evoColor = to.branch ? `var(--cat-${to.branch})` : 'var(--accent)'

  return (
    <div
      className={`evo evo-${phase}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="evo-title"
      style={{ '--evo': evoColor } as CSSProperties}
    >
      <div className="evo-rays" aria-hidden="true" />
      <div className="evo-creature" ref={stage}>
        <span className="evo-motes" aria-hidden="true">
          {Array.from({ length: 10 }, (_, i) => (
            <i key={i} style={{ '--a': `${i * 36}deg`, '--d': `${(i % 5) * 0.12}s` } as CSSProperties} />
          ))}
        </span>
        <span className="evo-ring r1" aria-hidden="true" />
        <span className="evo-ring r2" aria-hidden="true" />
        <span className="evo-ring r3" aria-hidden="true" />
        <Creature
          stage={shown.stage}
          branch={shown.branch}
          seed={state.creature.seed}
          eggProgress={3}
          mood={phase === 'after' ? 'happy' : 'idle'}
          size={240}
          label={formName(shown.stage, shown.branch)}
        />
      </div>
      <div className="evo-text" aria-live="polite">
        {phase === 'after' ? (
          <>
            <p className="evo-kicker">{hatched ? 'Éclosion' : 'Évolution'}</p>
            <h1 id="evo-title">{hatched ? `Voici ${toName}.` : `${formName(from.stage, from.branch)} devient ${toName}.`}</h1>
            <p className="muted">
              {hatched
                ? 'Trois tâches, et l’œuf a cédé. Prends-en soin : il grandit avec ce que tu fais.'
                : `Branche ${to.branch ? categoryLabel[to.branch] : ''}\u00a0: c’est ce que tu fais le plus qui l’a façonné.`}
            </p>
            <Button ref={button} onClick={dismissEvolution}>
              Continuer
            </Button>
          </>
        ) : (
          <h1 id="evo-title" className="evo-wait">
            {hatched ? 'Quelque chose bouge…' : 'Quelque chose change…'}
          </h1>
        )}
      </div>
    </div>
  )
}
