import { Card, EmptyState, ScreenHeader } from '../components/ui'
import './screens.css'

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
