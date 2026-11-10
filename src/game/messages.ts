// Short lines in the app's voice: friendly, a bit dry, never guilt-tripping.
const done = [
  'Tâche réglée. Ton compagnon a pris {xp} XP et un peu d’assurance.',
  'Et une de moins. {xp} XP dans la besace.',
  'Propre. Ton compagnon brille un peu plus fort.',
  'C’est fait, et ça se voit : +{xp} XP.',
  'Cochée. Ton compagnon fait semblant de ne pas être impressionné.',
  'Bien joué. {coins} pièces de plus pour le nid.',
]

const levelUp = [
  'Niveau {level}. Ton compagnon prend ses aises.',
  'Niveau {level}. Ça commence à avoir de l’allure.',
  'Niveau {level}. La lumière gagne du terrain.',
]

const cardDone = [
  'Défi relevé. +{xp} XP.',
  'Carte validée. Ton compagnon approuve d’un clignement.',
  'Une carte de moins, {xp} XP de plus.',
]

function pick(list: string[], vars: Record<string, number>) {
  const line = list[Math.floor(Math.random() * list.length)]
  return line.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''))
}

export const doneMessage = (xp: number, coins: number) => pick(done, { xp, coins })
export const levelUpMessage = (level: number) => pick(levelUp, { level })
export const cardDoneMessage = (xp: number) => pick(cardDone, { xp })
