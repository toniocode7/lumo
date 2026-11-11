import type { Shadow } from './types'

/** A new Shadow arrives every Monday. Everything you earn in XP damages it. */
export const SHADOW_NAMES = [
  'la Brume du Lundi',
  'le Voile du Scrolling',
  'la Nuée des Notifications',
  'le Spectre de la Pile de Linge',
  'l’Ombre du « Je le ferai demain »',
  'la Vapeur des Mails Non Lus',
  'le Brouillard du Canapé',
  'la Fumée des Onglets Ouverts',
  'le Nuage du Réveil Repoussé',
  'la Nappe des Petites Excuses',
] as const

export function shadowMaxHp(level: number): number {
  return 350 + 30 * Math.min(level, 25)
}

export function spawnShadow(week: string, level: number, rand: () => number): Shadow {
  const maxHp = shadowMaxHp(level)
  return {
    week,
    name: SHADOW_NAMES[Math.floor(rand() * SHADOW_NAMES.length)],
    hue: Math.round(rand() * 60) - 30,
    maxHp,
    hp: maxHp,
    defeated: false,
  }
}

/** Positive amount = damage, negative = heals (a task unchecked). A defeated Shadow stays defeated. */
export function hitShadow(shadow: Shadow | null, amount: number): { shadow: Shadow | null; defeatedNow: boolean } {
  if (!shadow || shadow.defeated || amount === 0) return { shadow, defeatedNow: false }
  const hp = Math.max(0, Math.min(shadow.maxHp, shadow.hp - amount))
  const defeatedNow = hp === 0
  return { shadow: { ...shadow, hp, defeated: defeatedNow }, defeatedNow }
}

/** Capitalises the first letter, for names used at the start of a sentence. */
export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
