import { levelFromXp } from './rules'
import type { Category, Creature, Evolution, Player, Stage } from './types'

export const HATCH_AFTER_TASKS = 3
/** Level needed to reach stages 2, 3 and 4. */
export const EVOLVE_AT: Record<2 | 3 | 4, number> = { 2: 5, 3: 15, 4: 30 }

const CATEGORIES: Category[] = ['body', 'mind', 'create', 'order']

/** The category the player does most. Ties go to `prefer`, then to list order. */
export function dominantCategory(byCategory: Record<Category, number>, prefer?: Category): Category {
  const max = Math.max(...CATEGORIES.map((c) => byCategory[c]))
  if (prefer && byCategory[prefer] === max) return prefer
  return CATEGORIES.find((c) => byCategory[c] === max) ?? 'order'
}

/** Stage the player's progress has earned. */
export function earnedStage(player: Player): Stage {
  if (player.tasksDone < HATCH_AFTER_TASKS) return 0
  const { level } = levelFromXp(player.xp)
  if (level >= EVOLVE_AT[4]) return 4
  if (level >= EVOLVE_AT[3]) return 3
  if (level >= EVOLVE_AT[2]) return 2
  return 1
}

export function currentForm(creature: Creature): { stage: Stage; branch: Category | null } {
  const last = creature.history[creature.history.length - 1]
  return last ? { stage: last.stage, branch: last.branch } : { stage: 0, branch: null }
}

/**
 * Moves the creature forward to the stage the player has earned. Stages never go back:
 * unchecking a task can lower XP, but the creature keeps its form.
 */
export function advanceCreature(
  creature: Creature,
  player: Player,
  now: Date,
  prefer?: Category,
): Creature {
  const target = earnedStage(player)
  let { stage } = currentForm(creature)
  if (target <= stage) return creature
  const added: Evolution[] = []
  while (stage < target) {
    stage = (stage + 1) as Stage
    added.push({
      stage,
      branch: stage === 1 ? null : dominantCategory(player.byCategory, prefer),
      at: now.toISOString(),
    })
  }
  return { ...creature, history: [...creature.history, ...added] }
}

const NAMES: Record<Category, [string, string, string]> = {
  body: ['Braise', 'Comète', 'Astre ardent'],
  mind: ['Orbe', 'Halo', 'Constellation'],
  create: ['Volute', 'Aurore', 'Nébuleuse'],
  order: ['Prisme', 'Cristal', 'Rosace'],
}

export function formName(stage: Stage, branch: Category | null): string {
  if (stage === 0) return 'Œuf mystère'
  if (stage === 1 || !branch) return 'Étincelle'
  return NAMES[branch][stage - 2]
}

export function newSeed() {
  return Math.floor(Math.random() * 1_000_000_000)
}
