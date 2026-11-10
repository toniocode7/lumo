import type { CSSProperties } from 'react'
import { burstFrom, cssVar, floatText } from '../fx/particles'
import { useGame } from '../game/store'
import { REWARDS, repeatLabel } from '../game/rules'
import type { Task } from '../game/types'
import { Icon } from './Icon'
import { CategoryTag } from './ui'
import './TaskRow.css'

export function TaskRow({ task, done }: { task: Task; done: boolean }) {
  const { completeTask, uncompleteTask, deleteTask } = useGame()
  const r = REWARDS[task.size]
  const repeat = repeatLabel(task.repeat)

  return (
    <li
      className={`task ${done ? 'is-done' : ''}`}
      style={{ '--c': `var(--cat-${task.category})` } as CSSProperties}
    >
      <button
        className="task-check"
        aria-pressed={done}
        aria-label={done ? `Décocher « ${task.title} »` : `Terminer « ${task.title} »`}
        onClick={(e) => {
          if (done) return uncompleteTask(task.id)
          burstFrom(e.currentTarget, [cssVar(`--cat-${task.category}`), '#ffffff', cssVar('--accent')])
          floatText(e.currentTarget, `+${r.xp} XP`)
          completeTask(task.id)
        }}
      >
        <Icon name="check" size={18} />
      </button>

      <div className="task-body">
        <span className="task-title">{task.title}</span>
        <span className="task-meta">
          <CategoryTag category={task.category} />
          {repeat && (
            <span className="task-repeat">
              <Icon name="repeat" size={13} /> {repeat}
            </span>
          )}
        </span>
      </div>

      <span className="task-reward num" aria-label={`${r.xp} XP`}>
        +{r.xp}
      </span>

      <button
        className="task-delete"
        aria-label={`Supprimer « ${task.title} »`}
        onClick={() => deleteTask(task.id)}
      >
        <Icon name="trash" size={18} />
      </button>
    </li>
  )
}
