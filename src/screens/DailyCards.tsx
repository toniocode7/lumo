import type { CSSProperties } from 'react'
import { Icon } from '../components/Icon'
import { Button, Card, CategoryTag, RarityChip, ScreenHeader } from '../components/ui'
import { ALL_DONE_BONUS, CARDS_PER_DAY, cardReward } from '../game/cards'
import { getChallenge } from '../game/challenges'
import { getItem } from '../game/items'
import { useGame } from '../game/store'
import type { DailyCard } from '../game/types'
import './DailyCards.css'

function FlipCard({ card, index }: { card: DailyCard; index: number }) {
  const { revealCard, rerollCard, completeCard, state } = useGame()
  const ch = getChallenge(card.challengeId)
  if (!ch) return null
  const r = cardReward(card)
  const canReroll = !state.daily?.rerollUsed && !card.done

  return (
    <div
      className={`flip rarity-${card.rarity} ${card.revealed ? 'is-revealed' : ''} ${card.done ? 'is-done' : ''}`}
      style={{ '--i': index, '--c': `var(--cat-${ch.category})` } as CSSProperties}
    >
      <div className="flip-inner">
        {/* Back: what you see before flipping */}
        <button
          className="flip-face flip-back"
          onClick={() => revealCard(index)}
          aria-label={`Retourner la carte ${index + 1}`}
          tabIndex={card.revealed ? -1 : 0}
          aria-hidden={card.revealed}
        >
          <svg className="back-pattern" viewBox="0 0 120 120" aria-hidden="true">
            <path d="M60 14 L98 60 L60 106 L22 60 Z" />
            <path d="M60 34 L80 60 L60 86 L40 60 Z" />
            <circle cx="60" cy="60" r="5" />
          </svg>
          <span className="back-hint">Touche pour retourner</span>
        </button>

        {/* Front: the challenge */}
        <div className="flip-face flip-front" aria-hidden={!card.revealed}>
          <div className="front-top">
            <RarityChip rarity={card.rarity} />
            <span className="num front-reward">
              +{r.xp} XP · +{r.coins}
              <Icon name="coin" size={14} />
              {card.rarity === 'legendary' && ' + objet'}
            </span>
          </div>
          <p className="front-text">{ch.text}</p>
          <div className="front-bottom">
            <CategoryTag category={ch.category} />
            {card.done ? (
              <span className="front-done">
                <Icon name="check" size={18} /> Fait
                {card.itemId && <> · {getItem(card.itemId)?.name}</>}
              </span>
            ) : (
              <div className="front-actions">
                {canReroll && (
                  <button
                    className="icon-btn"
                    aria-label="Changer de défi (1 fois par jour)"
                    title="Changer de défi (1 fois par jour)"
                    onClick={() => rerollCard(index)}
                    tabIndex={card.revealed ? 0 : -1}
                  >
                    <Icon name="repeat" size={18} />
                  </button>
                )}
                <Button onClick={() => completeCard(index)} tabIndex={card.revealed ? 0 : -1}>
                  C’est fait
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function DailyCards() {
  const { state } = useGame()
  const daily = state.daily
  const done = daily?.cards.filter((c) => c.done).length ?? 0

  return (
    <>
      <ScreenHeader
        title="Cartes du jour"
        subtitle={
          daily?.bonusClaimed
            ? 'Les trois sont faites. Nouveau tirage demain à 5 h.'
            : 'Trois défis, face cachée. Nouveau tirage à 5 h.'
        }
      />

      {daily && (
        <div className="stack">
          <Card className="cards-status">
            <div className="cards-dots" aria-label={`${done} sur ${CARDS_PER_DAY} faites`}>
              {daily.cards.map((c, i) => (
                <span key={i} className={c.done ? 'on' : ''} />
              ))}
            </div>
            <p className="muted">
              {daily.bonusClaimed
                ? 'Bonus empoché.'
                : `Les trois dans la journée\u00a0: +${ALL_DONE_BONUS.xp} XP et ${ALL_DONE_BONUS.coins} pièces.`}
              {!daily.rerollUsed && ' Une relance gratuite.'}
            </p>
          </Card>

          <div className="cards-grid">
            {daily.cards.map((card, i) => (
              <FlipCard key={`${daily.day}-${i}`} card={card} index={i} />
            ))}
          </div>
        </div>
      )}
    </>
  )
}
