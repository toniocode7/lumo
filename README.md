# Lumo

Appli de productivité gamifiée : tes vraies tâches font grandir une créature de lumière.
Le cahier des charges complet est dans [BRIEF.md](BRIEF.md).

- Tâches, cartes du jour, expéditions (minuteur de concentration), série avec joker
- Créature dessinée en SVG : œuf, éclosion, 4 branches d'évolution
- Créature vivante : elle suit ton doigt, réagit quand tu la touches, te parle,
  et le lien avec elle débloque de nouvelles réactions
- Coffres à ouvrir (toutes les 5 tâches, à chaque niveau, et contre l'Ombre)
- L'Ombre de la semaine : un boss que chaque XP gagné fait reculer
- Nid à décorer, boutique, objets à trouver
- Sons et particules générés par le code, désactivables
- Appli installable (PWA), fonctionne hors connexion, données sur l'appareil,
  export / import de la sauvegarde

## Lancer en local

```bash
npm install
npm run dev     # http://localhost:5173
npm test        # règles du jeu, sauvegarde
npm run build   # version de production dans dist/
```

## Mise en ligne (GitHub Pages, gratuit)

Le workflow `.github/workflows/deploy.yml` teste, construit et publie l'appli à chaque
push sur `main`. Une seule fois, dans le dépôt GitHub :

1. **Settings → Pages → Build and deployment → Source : « GitHub Actions »**
2. Fusionner le travail dans `main` (ou relancer le workflow depuis l'onglet **Actions**)

L'appli est ensuite disponible sur `https://<compte>.github.io/lumo/`.
Sur iPhone : l'ouvrir dans Safari, bouton Partager, « Sur l'écran d'accueil ».

## Organisation du code

- `src/game/` : règles du jeu, sans interface (testées dans `game.test.ts`)
- `src/components/` : briques d'interface, créature, nid, objets
- `src/screens/` : un fichier par écran
- `src/fx/` : sons et particules
- `src/styles/tokens.css` : couleurs, espacements, typographie

## Avancement

- [x] 1. Base du projet, design system et navigation
- [x] 2. Tâches, XP, pièces et sauvegarde locale
- [x] 3. Créature en SVG
- [x] 4. Cartes du jour
- [x] 5. Expéditions
- [x] 6. Série, joker et conséquence douce
- [x] 7. Nid et boutique
- [x] 8. Le « jus »
- [x] 9. PWA, sauvegarde, bienvenue et mise en ligne
