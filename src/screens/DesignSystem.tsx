import { Orb } from '../components/Orb'
import {
  Button,
  Card,
  CategoryTag,
  ProgressBar,
  RarityChip,
  ScreenHeader,
  Stat,
} from '../components/ui'
import './screens.css'

const colors = [
  ['Fond', '--bg'],
  ['Surface', '--surface'],
  ['Bordure', '--border'],
  ['Texte', '--text'],
  ['Texte 2', '--text-2'],
  ['Turquoise', '--accent'],
  ['Ambre', '--gold'],
  ['Corail', '--coral'],
  ['Commune', '--rarity-common'],
  ['Rare', '--rarity-rare'],
  ['Légendaire', '--rarity-legendary'],
]

export function DesignSystem() {
  return (
    <div className="stack">
      <ScreenHeader title="Design system" subtitle="Les briques de Lumo." />

      <h2 className="section-title">Couleurs</h2>
      <div className="swatches">
        {colors.map(([name, token]) => (
          <div className="swatch" key={token}>
            <span style={{ background: `var(${token})` }} />
            <strong>{name}</strong>
            <code>{token}</code>
          </div>
        ))}
      </div>

      <h2 className="section-title">Typographie</h2>
      <Card className="stack type-sample">
        <span className="display num">Niv. 12</span>
        <h1>Space Grotesk, titres et chiffres</h1>
        <p>
          Inter pour le texte. Tâche réglée. Ton compagnon a pris 25 XP et un peu
          d'assurance.
        </p>
        <p className="muted">Texte secondaire, pour les détails.</p>
      </Card>

      <h2 className="section-title">Boutons</h2>
      <div className="row">
        <Button icon="plus">Principal</Button>
        <Button variant="gold" icon="coin">
          Récompense
        </Button>
        <Button variant="secondary">Secondaire</Button>
        <Button variant="ghost">Discret</Button>
        <Button disabled>Désactivé</Button>
      </div>

      <h2 className="section-title">Compteurs et barres</h2>
      <Card className="stack">
        <div className="row">
          <Stat icon="spark" value="1 240" label="XP" />
          <Stat icon="coin" value={86} label="Pièces" tone="gold" />
          <Stat icon="flame" value={4} label="Série" tone="coral" />
        </div>
        <ProgressBar value={140} max={220} label="XP" />
        <ProgressBar value={60} max={100} tone="gold" label="Pièces" />
        <ProgressBar value={1} max={2} tone="coral" label="Série en danger" />
      </Card>

      <h2 className="section-title">Raretés et catégories</h2>
      <Card className="stack">
        <div className="row">
          <RarityChip rarity="common" />
          <RarityChip rarity="rare" />
          <RarityChip rarity="legendary" />
        </div>
        <div className="row" style={{ gap: 16 }}>
          <CategoryTag category="body" />
          <CategoryTag category="mind" />
          <CategoryTag category="create" />
          <CategoryTag category="order" />
        </div>
      </Card>

      <h2 className="section-title">Compagnon (provisoire)</h2>
      <Card>
        <Orb size={140} />
      </Card>
    </div>
  )
}
