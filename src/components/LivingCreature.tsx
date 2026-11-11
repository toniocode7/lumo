import { useCallback, useEffect, useRef, useState } from 'react'
import { bondLevel, unlockedReactions, type Reaction } from '../game/bond'
import { currentForm, formName } from '../game/creature'
import { afterTaskLine, allDoneLine, eggLine, greetLine, shadowLine, sleepLine, tapLine } from '../game/lines'
import { todaysTasks } from '../game/rules'
import { useGame } from '../game/store'
import { burstFrom, cssVar, reducedMotion, ring } from '../fx/particles'
import { sfx } from '../fx/sound'
import { Creature, type Mood } from './Creature'
import './LivingCreature.css'

const REACTION_SOUND: Record<Reaction, keyof typeof sfx> = {
  hop: 'boop',
  spin: 'twirl',
  hum: 'hum',
  flare: 'flare',
  constellation: 'chime',
}

/**
 * The creature on the home screen: it looks toward your finger, reacts when tapped
 * (more tricks as the bond grows) and talks in a little bubble.
 */
export function LivingCreature({ mood, size = 180 }: { mood: Mood; size?: number }) {
  const { state, pulse, pet, streak, ready } = useGame()
  const form = currentForm(state.creature)
  const bond = bondLevel(state.bond.points)
  const box = useRef<HTMLButtonElement>(null)
  const [look, setLook] = useState({ x: 0, y: 0 })
  const [reaction, setReaction] = useState<{ kind: Reaction | 'knock'; key: number } | null>(null)
  const [bubble, setBubble] = useState<{ text: string; key: number } | null>(null)
  const bubbleTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const sleeping = mood === 'sleep'
  const isEgg = form.stage === 0

  const say = useCallback((text: string, ms = 4200) => {
    clearTimeout(bubbleTimer.current)
    setBubble({ text, key: Date.now() })
    bubbleTimer.current = setTimeout(() => setBubble(null), ms)
  }, [])

  useEffect(() => () => clearTimeout(bubbleTimer.current), [])

  // Greets you when you open the app, once the save is loaded (so it knows who it is).
  const greeted = useRef(false)
  useEffect(() => {
    if (!ready || greeted.current) return
    greeted.current = true
    const t = setTimeout(() => {
      if (isEgg) say(eggLine())
      else if (streak.sleeping) say(sleepLine())
      else say(greetLine(new Date().getHours()))
    }, 700)
    return () => clearTimeout(t)
  }, [ready, isEgg, streak.sleeping, say])

  // Comments on what you just did (a task, a card…).
  const lastPulse = useRef(pulse)
  useEffect(() => {
    if (pulse === lastPulse.current) return
    lastPulse.current = pulse
    if (isEgg) return say(eggLine())
    const { todo, done } = todaysTasks(state)
    const sh = state.shadow
    if (sh && Math.random() < 0.4) say(shadowLine(sh.hp / sh.maxHp, sh.defeated))
    else if (todo.length === 0 && done.length > 0) say(allDoneLine())
    else say(afterTaskLine())
  }, [pulse, state, isEgg, say])

  // Eyes follow the pointer (mouse, or finger while touching).
  useEffect(() => {
    if (isEgg || sleeping) return
    let frame = 0
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const r = box.current?.getBoundingClientRect()
        if (!r) return
        const dx = (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)
        const dy = (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2)
        setLook({ x: Math.max(-1, Math.min(1, dx * 1.6)), y: Math.max(-1, Math.min(1, dy * 1.6)) })
      })
    }
    const recenter = () => setTimeout(() => setLook({ x: 0, y: 0 }), 1200)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', recenter)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', recenter)
    }
  }, [isEgg, sleeping])

  const onTap = () => {
    const key = Date.now()
    if (isEgg) {
      sfx.knock()
      setReaction({ kind: 'knock', key })
      say(eggLine())
      return
    }
    pet()
    if (sleeping) {
      say(sleepLine())
      return
    }
    const options = unlockedReactions(bond.level)
    const kind = options[Math.floor(Math.random() * options.length)]
    setReaction({ kind, key })
    sfx[REACTION_SOUND[kind]]()
    say(tapLine(bond.level))
    const color = form.branch ? cssVar(`--cat-${form.branch}`) : cssVar('--accent')
    const r = box.current?.getBoundingClientRect()
    if (!r || reducedMotion()) return
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    if (kind === 'constellation') ring(cx, cy, [color, '#ffffff', cssVar('--gold')], r.width * 0.55, 16)
    else if (kind === 'flare') burstFrom(box.current, [color, '#ffffff'], { count: 30, power: 0.9 })
    else burstFrom(box.current, [color, '#ffffff'], { count: 10, power: 0.5, upward: true, spread: 1.4 })
  }

  return (
    <div className="living" style={{ width: size }}>
      {bubble && (
        <div key={bubble.key} className="bubble" role="status">
          {bubble.text}
        </div>
      )}
      <button
        ref={box}
        className="living-btn"
        onClick={onTap}
        aria-label={`${formName(form.stage, form.branch)}. Touche pour interagir`}
      >
        <span key={reaction?.key} className={reaction ? `react react-${reaction.kind}` : 'react'}>
          <Creature
            stage={form.stage}
            branch={form.branch}
            seed={state.creature.seed}
            eggProgress={state.player.tasksDone}
            mood={streak.sleeping ? 'sleep' : mood}
            pulseKey={pulse}
            size={size}
            look={look}
          />
        </span>
      </button>
    </div>
  )
}
