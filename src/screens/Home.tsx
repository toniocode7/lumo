import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Orb } from '../components/Orb'
import { Button, Card, ProgressBar, Stat } from '../components/ui'
import './screens.css'

// Sample values until step 2 wires real data.
const preview = { name: 'Étincelle', level: 3, xp: 140, xpNext: 220, coins: 86, streak: 4 }

export function Home() {
  return (
    <div className="stack">
      <div className="row between">
        <div className="row">
          <Stat icon="flame" value={preview.streak} label="Série" tone="coral" />
          <Stat icon="coin" value={preview.coins} label="Pièces" tone="gold" />
        </div>
        <Link to="/profil" className="icon-btn mobile-only" aria-label="Profil">
          <Icon name="user" />
        </Link>
      </div>

      <div className="nest-stage">
        <Orb size={150} />
        <div className="nest-ground" />
        <div className="creature-name">
          <h2>{preview.name}</h2>
          <p className="muted">Flotte tranquillement. Attend la suite.</p>
        </div>
      </div>

      <Card className="level-card">
        <div className="level-head">
          <span>
            Niveau <span className="num">{preview.level}</span>
          </span>
          <span className="num muted" style={{ fontSize: 14 }}>
            {preview.xp} / {preview.xpNext} XP
          </span>
        </div>
        <ProgressBar value={preview.xp} max={preview.xpNext} label="Progression du niveau" />
      </Card>

      <Button icon="plus" block>
        Ajouter une tâche
      </Button>

      <div className="shortcuts">
        <Link to="/cartes" className="shortcut gold">
          <span className="shortcut-icon">
            <Icon name="cards" />
          </span>
          <span>
            <strong>Cartes du jour</strong>
            <small>3 à retourner</small>
          </span>
        </Link>
        <Link to="/expedition" className="shortcut">
          <span className="shortcut-icon">
            <Icon name="compass" />
          </span>
          <span>
            <strong>Expédition</strong>
            <small>Prête à partir</small>
          </span>
        </Link>
      </div>

    </div>
  )
}
