import { useEffect, useRef, useState } from 'react'
import { formName } from '../game/creature'
import { useGame } from '../game/store'
import { Creature } from './Creature'
import { Button, categoryLabel } from './ui'
import './EvolutionOverlay.css'

/** Hatching and evolution moment. Step 8 will add particles and sound. */
export function EvolutionOverlay() {
  const { evolution, dismissEvolution, state } = useGame()
  const [phase, setPhase] = useState<'before' | 'flash' | 'after'>('before')
  const button = useRef<HTMLButtonElement>(null)

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
    if (phase === 'after') button.current?.focus()
  }, [phase])

  if (!evolution) return null
  const { from, to } = evolution
  const hatched = from.stage === 0
  const shown = phase === 'after' ? to : from
  const toName = formName(to.stage, to.branch)

  return (
    <div className={`evo evo-${phase}`} role="dialog" aria-modal="true" aria-labelledby="evo-title">
      <div className="evo-rays" aria-hidden="true" />
      <div className="evo-creature">
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
                : `Branche ${to.branch ? categoryLabel[to.branch] : ''} : c’est ce que tu fais le plus qui l’a façonné.`}
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
