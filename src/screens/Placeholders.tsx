import { Card, EmptyState, ScreenHeader } from '../components/ui'
import './screens.css'

export function Expedition() {
  return (
    <>
      <ScreenHeader title="Expédition" subtitle="Concentre-toi, ton compagnon part explorer." />
      <Card>
        <EmptyState
          icon="compass"
          title="Sac pas encore bouclé"
          text="15, 25 ou 45 minutes : plus c'est long, plus le butin a de l'allure."
        />
      </Card>
    </>
  )
}

export function Nest() {
  return (
    <>
      <ScreenHeader title="Nid" subtitle="Décore l'endroit où vit ton compagnon." />
      <Card>
        <EmptyState
          icon="nest"
          title="Boutique fermée pour travaux"
          text="Plantes, lumières, pierres : ça arrive. Garde tes pièces au chaud."
        />
      </Card>
    </>
  )
}
