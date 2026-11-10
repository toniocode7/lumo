import type { Category, Size } from './types'

export interface Challenge {
  id: string
  text: string
  category: Category
  size: Size
}

const c = (id: string, category: Category, size: Size, text: string): Challenge => ({
  id,
  text,
  category,
  size,
})

/** Short daily challenges. Ids must never change: saved cards point to them. */
export const CHALLENGES: Challenge[] = [
  // Corps
  c('walk20', 'body', 'm', 'Marcher 20 minutes'),
  c('stretch5', 'body', 's', '5 minutes d’étirements'),
  c('water', 'body', 's', 'Boire un grand verre d’eau maintenant'),
  c('stairs', 'body', 's', 'Prendre les escaliers au lieu de l’ascenseur'),
  c('pushups', 'body', 's', '10 pompes, même sur les genoux'),
  c('sleep', 'body', 'm', 'Se coucher avant minuit ce soir'),
  c('fruit', 'body', 's', 'Manger un fruit'),
  c('nophone', 'body', 'm', 'Pas d’écran la dernière demi-heure avant de dormir'),
  c('breathe', 'body', 's', '2 minutes de respiration lente'),
  c('dance', 'body', 's', 'Danser sur une chanson entière'),
  c('outside', 'body', 's', 'Sortir prendre l’air 10 minutes'),
  c('posture', 'body', 's', 'Se redresser et rouler les épaules'),
  c('cook', 'body', 'm', 'Cuisiner un vrai repas'),
  c('run', 'body', 'm', 'Courir ou pédaler 15 minutes'),
  c('sun', 'body', 's', 'Prendre 5 minutes de lumière du jour'),
  // Esprit
  c('read10', 'mind', 's', 'Lire 10 pages'),
  c('learnword', 'mind', 's', 'Apprendre un mot dans une autre langue'),
  c('podcast', 'mind', 'm', 'Écouter un épisode de podcast ou une conf'),
  c('review', 'mind', 'm', 'Relire ses cours ou notes 20 minutes'),
  c('article', 'mind', 's', 'Lire un article jusqu’au bout'),
  c('question', 'mind', 's', 'Chercher la réponse à une question qui te trotte'),
  c('flashcards', 'mind', 's', '10 minutes de fiches ou de flashcards'),
  c('nosocial', 'mind', 'm', 'Une heure sans réseaux sociaux'),
  c('journal', 'mind', 's', 'Écrire 3 lignes sur ta journée'),
  c('plan', 'mind', 's', 'Noter les 3 priorités de demain'),
  c('focus25', 'mind', 'm', '25 minutes concentré sur un seul truc'),
  c('doc', 'mind', 'm', 'Regarder un documentaire court'),
  c('explain', 'mind', 's', 'Expliquer à quelqu’un ce que tu as appris'),
  c('chess', 'mind', 's', 'Résoudre une énigme ou un casse-tête'),
  c('gratitude', 'mind', 's', 'Noter une chose qui s’est bien passée'),
  // Création
  c('sketch', 'create', 's', 'Gribouiller un dessin, même moche'),
  c('photo', 'create', 's', 'Prendre une photo dont tu es fier'),
  c('write100', 'create', 'm', 'Écrire 100 mots sur ce que tu veux'),
  c('music', 'create', 'm', '15 minutes d’instrument ou de musique'),
  c('playlist', 'create', 's', 'Composer une playlist de 5 morceaux'),
  c('idea', 'create', 's', 'Noter une idée de projet'),
  c('sideproject', 'create', 'm', 'Avancer 20 minutes sur un projet perso'),
  c('recipe', 'create', 'm', 'Tester une recette jamais faite'),
  c('poem', 'create', 's', 'Écrire un haïku'),
  c('diy', 'create', 'm', 'Réparer ou bricoler un objet'),
  c('rearrange', 'create', 's', 'Changer un détail de déco chez toi'),
  c('newsong', 'create', 's', 'Écouter un album que tu ne connais pas'),
  c('letter', 'create', 's', 'Écrire un petit mot à quelqu’un'),
  c('collage', 'create', 's', 'Faire un moodboard de 5 images'),
  c('hum', 'create', 's', 'Inventer une mélodie et l’enregistrer'),
  // Ordre
  c('tidy10', 'order', 's', '10 minutes de rangement'),
  c('reply', 'order', 's', 'Répondre à un message qui traîne'),
  c('inbox', 'order', 'm', 'Vider 20 mails de ta boîte'),
  c('dishes', 'order', 's', 'Faire la vaisselle d’un coup'),
  c('bed', 'order', 's', 'Faire ton lit'),
  c('desk', 'order', 's', 'Libérer ton bureau'),
  c('admin', 'order', 'm', 'Régler une démarche administrative'),
  c('laundry', 'order', 'm', 'Lancer et étendre une machine'),
  c('budget', 'order', 's', 'Regarder tes dépenses de la semaine'),
  c('photos', 'order', 's', 'Supprimer 30 photos inutiles'),
  c('bag', 'order', 's', 'Vider et ranger ton sac'),
  c('call', 'order', 's', 'Passer l’appel que tu repousses'),
  c('trash', 'order', 's', 'Sortir les poubelles'),
  c('agenda', 'order', 's', 'Mettre ton agenda à jour'),
  c('donate', 'order', 'm', 'Mettre de côté 5 objets à donner'),
]

const byId = new Map(CHALLENGES.map((ch) => [ch.id, ch]))

export function getChallenge(id: string): Challenge | undefined {
  return byId.get(id)
}
