// What the creature says in its speech bubble. Short, a bit dry, never guilt-tripping.

const pick = (list: readonly string[]) => list[Math.floor(Math.random() * list.length)]

export function greetLine(hour: number): string {
  if (hour < 5 || hour >= 22) return pick(['Il est tard, non ?', 'Chut. Les étoiles travaillent.', 'Une dernière, et au lit.'])
  if (hour < 11) return pick(['Bien dormi ? Moi, j’ai brillé toute la nuit.', 'Le matin, c’est fait pour cocher des trucs. Il paraît.', 'Café d’abord, gloire ensuite.'])
  if (hour < 14) return pick(['Midi déjà. On en est où ?', 'Une petite tâche avant de manger ?', 'Je garde le nid. Toi, tu gères.'])
  if (hour < 18) return pick(['L’après-midi, c’est le moment des grosses tâches.', 'Allez, on ne lâche rien.', 'Tu reviens ! Je faisais semblant de ne pas attendre.'])
  return pick(['Bonne soirée. Encore une petite chose et on souffle ?', 'Le soir, je brille plus. C’est scientifique.', 'Tu as bien bossé ? Raconte.'])
}

const TAP: Record<number, readonly string[]> = {
  1: ['…Oui ?', 'Tu m’as touché. Je note.', 'Hé. Doucement.', 'On se connaît à peine.'],
  2: ['Salut, toi.', 'Ça chatouille.', 'Encore ? D’accord, encore.', 'Tu reviens souvent, toi.'],
  3: ['On fait équipe, non ?', 'J’aime bien quand tu passes.', 'Regarde, je sais tourner sur moi-même.', 'Tu m’as manqué. Un peu.'],
  4: ['Je t’attendais.', 'Toi, tu es mon humain préféré.', 'On forme une belle équipe.', 'Tu veux voir un truc ? Regarde bien.'],
  5: ['Toi et moi, c’est du solide.', 'Je brille plus quand tu es là.', 'Rien ne nous arrête.', 'Je dessine des étoiles. Pour toi.'],
}

export const tapLine = (bondLevel: number) => pick(TAP[Math.max(1, Math.min(5, bondLevel))])

export const afterTaskLine = () =>
  pick(['Encore une ! Je brille.', 'Joli. Très joli.', 'Ça, c’est fait.', 'Tu m’impressionnes. Ne le répète pas.', 'Je sens que je grandis.', 'Hop, dans la poche.'])

export const allDoneLine = () =>
  pick(['Journée bouclée. On se la coule douce ?', 'Tout est fait. Je suis fier. Discrètement.', 'Plus rien à faire ? Le luxe.'])

export function shadowLine(hpRatio: number, defeated: boolean): string {
  if (defeated) return pick(['On l’a eue. Respect.', 'Plus d’Ombre cette semaine. Tranquille.'])
  if (hpRatio < 0.35) return pick(['L’Ombre faiblit, continue !', 'Encore un effort, elle vacille.'])
  return pick(['Cette Ombre ne me fait pas peur. Enfin… un peu.', 'Chaque tâche la fait reculer. Je l’ai vu.', 'Elle rôde. On s’en occupe ?'])
}

export const sleepLine = () => pick(['Zzz…', '…mmh… cinq minutes…', 'Zzz… une tâche… zzz…'])

export const eggLine = () => pick(['*toc toc*', '…', '(l’œuf remue un peu)', '*crac ?*'])
