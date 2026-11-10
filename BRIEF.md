# Brief : appli de productivité gamifiée

Nom provisoire : **Lumo**

## Le concept

Une appli de productivité qui se joue comme un jeu. L'utilisateur reçoit un œuf mystère qui éclot après ses premières tâches et donne une créature unique. Chaque tâche réelle accomplie la fait grandir, évoluer et partir en expédition. Le but : rendre l'envie de cocher ses tâches aussi forte que l'envie de lancer un jeu sur son téléphone.

Les quatre piliers :

- **Tâches** : l'utilisateur note ce qu'il a à faire, chaque tâche terminée rapporte de l'XP et des pièces.
- **Cartes du jour** : chaque matin, 3 petits défis à retourner, avec des raretés.
- **Expéditions** : le minuteur de concentration envoie la créature explorer, elle revient avec du butin.
- **Évolution** : la créature change de forme selon le niveau atteint et selon le type de tâches que l'utilisateur fait le plus.

## Public et ton

- **Cible** : grand public, 15 à 35 ans.
- **Ni enfantin, ni genré** : pas de rose bonbon ni d'univers guerrier, pas de grands yeux kawaii, pas de licornes ni de muscles. On vise l'esthétique des jeux indépendants modernes, élégants et contemplatifs (dans l'esprit d'Alto's Odyssey, Monument Valley ou Journey).
- **Textes** : tutoiement, phrases courtes, une pointe d'humour, jamais infantilisant, jamais culpabilisant. Exemple : « Tâche réglée. Ton compagnon a pris 25 XP et un peu d'assurance. »

## Direction artistique

**Ambiance générale** : mode sombre par défaut (avec un mode clair), fonds profonds, lumières douces, beaucoup d'air. La créature est la seule source de lumière vive à l'écran.

**Palette de départ** :

- Fond `#11131A`, surfaces `#1B1E29`, bordures `#2A2E3D`
- Texte principal `#ECEEF4`, texte secondaire `#9AA0B4`
- Accent principal (actions, XP) : turquoise `#4FD1C5`
- Accent chaud (pièces, récompenses) : ambre `#F5B544`
- Raretés : commune gris clair, rare bleu `#5B8DEF`, légendaire violet `#A78BFA`
- Alerte douce (série en danger) : corail `#FF7A6B`

**Typographie** : Space Grotesk pour les titres et les chiffres, Inter pour le texte, hébergées dans le projet.

**La créature** : un petit esprit fait de lumière et de formes géométriques simples (cercles, losanges, facettes), qui flotte et respire doucement. Des yeux simples, pas de bouche ni de traits de bébé. Elle exprime ses émotions par le mouvement et la lumière. Elle est **dessinée entièrement en SVG par le code**.

**Les évolutions** : 4 stades (Étincelle, deux formes intermédiaires, forme finale). La branche dépend de la catégorie de tâches dominante :

- **Corps** (sport, santé, sommeil) : formes anguleuses et dynamiques, teinte chaude
- **Esprit** (études, lecture, apprentissage) : formes en couronne ou en orbite, teinte bleutée
- **Création** (projets perso, art, musique) : formes asymétriques et vivantes, teinte violette
- **Ordre** (maison, admin, rangement) : formes symétriques et cristallines, teinte turquoise

**Le « jus »** : particules quand on coche une tâche, barre d'XP fluide, carte qui se retourne en 3D, petits sons générés par le code (désactivables), écran d'évolution spectaculaire. Respecter le réglage « réduire les animations ».

## Règles du jeu

**Tâches**

- Taille (petite, moyenne, grosse) et catégorie (Corps, Esprit, Création, Ordre).
- Récompenses : petite 10 XP / 5 pièces, moyenne 25 XP / 12 pièces, grosse 50 XP / 25 pièces.
- Ponctuelles ou récurrentes (tous les jours, certains jours de la semaine).

**Cartes du jour**

- Chaque jour à partir de 5 h, 3 cartes face cachée, tirées d'une banque d'environ 60 défis courts.
- Raretés : commune (70 %, normale), rare (25 %, double), légendaire (5 %, triple + un objet).
- Une relance gratuite par jour. Bonus si les 3 cartes sont terminées dans la journée.

**Expéditions (minuteur de concentration)**

- Durée 15, 25 ou 45 minutes, tâche liée facultative.
- La créature part explorer, puis revient avec du butin (pièces, XP bonus, parfois un objet ; plus c'est long, plus l'objet rare est probable).
- Abandon : retour anticipé, butin réduit, sans autre pénalité.
- Le minuteur s'appuie sur l'heure de départ enregistrée, pas sur un compteur.

**Niveaux et évolution** : courbe d'XP progressive, éclosion après 3 tâches, évolutions aux niveaux 5, 15 et 30.

**Série et conséquence douce**

- Un jour compte si au moins une tâche ou une carte est faite.
- Après 2 jours sans activité : la créature s'endort, son nid se couvre d'une brume grise, la série retombe à zéro.
- Un joker par semaine protège la série d'un jour manqué.
- Au retour : réveil content, message bienveillant. Jamais de mort, jamais de perte de niveau ou d'objets.

**Le nid** : l'espace de la créature sur l'accueil. Les pièces achètent du décor en boutique ; le butin d'expédition débloque des objets exclusifs.

## Écrans

1. **Bienvenue** : 3 écrans courts, puis réception de l'œuf.
2. **Accueil** : créature dans son nid, niveau et XP, série, pièces, raccourcis cartes et expédition, ajout de tâche.
3. **Tâches** : liste du jour, ajout rapide, validation par un geste satisfaisant.
4. **Cartes du jour** : les 3 cartes à retourner et valider.
5. **Expédition** : choix de la durée, minuteur plein écran, retour avec butin.
6. **Nid et boutique** : décoration et achats.
7. **Profil** : statistiques, historique des évolutions, réglages (sons, thème, sauvegarde).

Navigation par une barre en bas, pensée pour le pouce. Aussi propre sur ordinateur que sur téléphone.

## Technique

- React + Vite + TypeScript, PWA installable et hors connexion.
- Données sur l'appareil (IndexedDB), sans compte ni serveur, export/import JSON.
- Hébergement gratuit sur GitHub Pages, aucun service payant.
- Sons via Web Audio API. Pas de vibrations.
- Accessibilité : contrastes, lisibilité, réduction des animations.
- Code propre et découpé.

## Ordre de construction

1. Base du projet, design system (couleurs, typos, composants) et navigation.
2. Tâches, XP, pièces et sauvegarde locale.
3. Créature en SVG : œuf, éclosion, 4 stades, branches d'évolution, animations de base.
4. Cartes du jour.
5. Expéditions.
6. Série, joker et conséquence douce.
7. Nid et boutique.
8. Le « jus » : animations, particules, sons, écran d'évolution.
9. PWA, export de sauvegarde et mise en ligne sur GitHub Pages.

À chaque étape, vérifier l'affichage sur mobile et ordinateur avant de passer à la suite.

## Hors prototype

Comptes et synchronisation, notifications, défis entre amis, missions proposées par une IA, publication sur les stores.
