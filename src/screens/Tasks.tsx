import { TaskRow } from '../components/TaskRow'
import { Button, Card, EmptyState, ScreenHeader } from '../components/ui'
import { useGame } from '../game/store'
import { todaysTasks } from '../game/rules'
import './screens.css'

export function Tasks() {
  const { state, ready, openSheet } = useGame()
  const { todo, done } = todaysTasks(state)
  const total = todo.length + done.length

  return (
    <>
      <ScreenHeader
        title="Tâches"
        subtitle={
          total === 0
            ? 'Ce que tu as prévu aujourd’hui.'
            : todo.length === 0
              ? 'Tout est fait. Le reste de la journée t’appartient.'
              : `${done.length} sur ${total} faite${done.length > 1 ? 's' : ''} aujourd’hui.`
        }
      />

      {ready && total === 0 ? (
        <Card>
          <EmptyState
            icon="tasks"
            title="Rien pour l’instant"
            text="Ajoute une tâche. Même petite, elle compte."
          />
          <Button icon="plus" block onClick={openSheet}>
            Ajouter une tâche
          </Button>
        </Card>
      ) : (
        <div className="stack">
          <Button icon="plus" block onClick={openSheet}>
            Ajouter une tâche
          </Button>

          {todo.length > 0 && (
            <section>
              <h2 className="section-title">À faire</h2>
              <ul className="task-list">
                {todo.map((t) => (
                  <TaskRow key={t.id} task={t} done={false} />
                ))}
              </ul>
            </section>
          )}

          {done.length > 0 && (
            <section>
              <h2 className="section-title">Faites aujourd’hui</h2>
              <ul className="task-list">
                {done.map((t) => (
                  <TaskRow key={t.id} task={t} done />
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </>
  )
}
