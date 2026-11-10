import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { burstFrom, cssVar } from '../fx/particles'
import { sfx } from '../fx/sound'
import { useGame } from '../game/store'
import { Creature } from './Creature'
import { Icon, type IconName } from './Icon'
import { Button } from './ui'
import './Welcome.css'

const SLIDES: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'spark',
    title: 'Bienvenue dans Lumo.',
    text: 'Ici, tes vraies tâches font grandir une créature de lumière. Plus tu avances, plus elle brille.',
  },
  {
    icon: 'tasks',
    title: 'Coche, gagne, grandis.',
    text: 'Chaque tâche rapporte de l’XP et des pièces. Chaque matin, trois cartes défis t’attendent, face cachée.',
  },
  {
    icon: 'compass',
    title: 'Concentre-toi, il explore.',
    text: 'Lance une expédition : ton compagnon part à l’aventure pendant que tu bosses. Et si tu t’absentes, il s’endort, c’est tout. Rien n’est jamais perdu.',
  },
]

/** First launch: three short screens, then the egg arrives. */
export function Welcome() {
  const { state, ready, finishOnboarding, openSheet } = useGame()
  const [step, setStep] = useState(0)
  const egg = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const last = step === SLIDES.length

  useEffect(() => {
    if (!last) return
    const t = setTimeout(() => {
      burstFrom(egg.current, [cssVar('--accent'), '#ffffff', cssVar('--gold')], { count: 40, power: 1.1 })
    }, 350)
    return () => clearTimeout(t)
  }, [last])

  if (!ready || state.onboarded) return null

  const next = () => {
    sfx.flip()
    setStep((s) => s + 1)
  }
  const done = (addTask: boolean) => {
    finishOnboarding()
    navigate('/')
    if (addTask) setTimeout(openSheet, 250)
  }

  return (
    <div className="welcome" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
      {!last && (
        <button className="welcome-skip" onClick={() => setStep(SLIDES.length)}>
          Passer
        </button>
      )}

      {last ? (
        <div className="welcome-body" key="egg">
          <div className="welcome-egg" ref={egg}>
            <Creature stage={0} branch={null} seed={state.creature.seed} size={200} label="Ton œuf" />
          </div>
          <h1 id="welcome-title">Voici ton œuf.</h1>
          <p className="muted">
            Personne ne sait ce qu’il contient. Trois tâches, et il éclot. Ce qu’il deviendra
            dépendra de ce que tu fais le plus.
          </p>
          <div className="welcome-actions">
            <Button block icon="plus" onClick={() => done(true)}>
              Ajouter ma première tâche
            </Button>
            <Button block variant="ghost" onClick={() => done(false)}>
              Plus tard
            </Button>
          </div>
        </div>
      ) : (
        <div className="welcome-body" key={step}>
          <span className="welcome-icon">
            <Icon name={SLIDES[step].icon} size={40} />
          </span>
          <h1 id="welcome-title">{SLIDES[step].title}</h1>
          <p className="muted">{SLIDES[step].text}</p>
          <div className="welcome-dots" aria-label={`Écran ${step + 1} sur ${SLIDES.length}`}>
            {SLIDES.map((_, i) => (
              <span key={i} className={i === step ? 'on' : ''} />
            ))}
          </div>
          <div className="welcome-actions">
            <Button block onClick={next}>
              {step === SLIDES.length - 1 ? 'Recevoir mon œuf' : 'Suivant'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
