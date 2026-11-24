# HANDOFF — Passation entre assistants IA

Ce fichier permet de transférer proprement le contexte du projet d'un assistant IA à un autre (Claude, Codex, Gemini, Copilot, etc.) sans perte d'information.

---

## 1. Checklist de prise en main pour le nouvel assistant

Avant toute modification de code :
1. Lire [ARCHITECTURE.md](./ARCHITECTURE.md) (règles strictes : 1 classe max par fichier, tout élément animé ou potentiellement mobile hérite de `Vehicle`, catalogue Craig Reynolds GDC 99).
2. Lire [P5JS_BEST_PRACTICES.md](./P5JS_BEST_PRACTICES.md) (optimisation `draw()`, `p5.Vector`, `push()`/`pop()`, `p5.disableFriendlyErrors`, profilage).
3. Vérifier l'état courant dans [README.md](./README.md) et la section **État actuel** ci-dessous.
4. **En fin de session / après une tâche significative** : mettre à jour [README.md](./README.md) (inventaire des sketches + journal des évolutions) et ajouter une entrée dans le journal de passation ci-dessous.

---

## 2. État actuel du projet

- **Dépôt** : `SteeringBehavioursM2IA2_Mrrakech_2026_2027/`
- **Stack** : JavaScript ES6 + p5.js (fichiers chargés via `<script>` dans `index.html`, sans bundler).
- **Sketches existants** :
  - `1-Seek/`
  - `2-PursueEvade/` et `2-PursueEvade_correction/`
  - `3-Arrival/` et `3-Arrival_correction/` (`Snake`, `SnakeWander` héritant de `Vehicle`)
  - `4-Wander/`
- **Documentation & automatisation** :
  - `ARCHITECTURE.md`, `P5JS_BEST_PRACTICES.md`, `README.md`, `HANDOFF.md`
  - `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `.github/copilot-instructions.md`
  - `scripts/update-readme.sh` (synchronise la table des sketches dans `README.md`)

---

## 3. Journal de passation (à compléter à chaque session)

### Passation #1 — 2026-11-23
- **Assistant sortant** : Copilot
- **Travail effectué** :
  - Lecture et synthèse de l'article GDC 1999 de Craig Reynolds (*Steering Behaviors For Autonomous Characters*).
  - Récupération et synthèse des bonnes pratiques officielles p5.js dans `P5JS_BEST_PRACTICES.md`.
  - Rédaction de `ARCHITECTURE.md` formalisant : 1 classe max par fichier, tout élément graphique animé ou potentiellement mobile est un `Vehicle` (ou sous-classe), et catalogue des comportements standards.
  - Mise à jour de `README.md` avec sections auto-générées + script `scripts/update-readme.sh`.
  - Création des fichiers d'instructions IA : `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `.github/copilot-instructions.md`.
- **Décisions prises** :
  - Conservation de l'architecture sans bundler (`<script>` dans `index.html`) cohérente avec les sketches existants du cours.
  - Convention de nommage : classes en `PascalCase`, fichiers en `camelCase` (`vehicle.js`, `animatedScore.js`, etc.).
- **Prochaines étapes suggérées** :
  - Implémenter les prochains sketches/applications (ex. : Obstacle Avoidance, Path Following, Flow Field, Flocking / Boids, ou un mini-jeu complet respectant `Vehicle` pour joueur, ennemis, missiles, obstacles et score animé).
- **Points d'attention** :
  - Certains sketches existants antérieurs à ces règles (ex. `2-PursueEvade/bouncingBall.js`) n'héritent pas encore forcément de `Vehicle` : ne les refactorer que si demandé, mais appliquer strictement `extends Vehicle` pour tout nouveau développement.

### Passation #2 — 2026-11-23
- **Assistant sortant** : Copilot
- **Travail effectué** :
  - Implémentation de la tâche 1 dans `1-Seek` : plusieurs vaisseaux, curseurs de paramètres, panneau repliable et mode debug.
  - Ajout de l'affichage conditionnel des vecteurs vitesse rouges.
- **Fichiers créés / modifiés** :
  - `1-Seek/sketch.js`
  - `1-Seek/vehicle.js`
  - `1-Seek/style.css`
  - `README.md`
- **Décisions prises** :
  - Le panneau utilise les contrôles DOM p5.js existants et reste superposé en haut du canvas.
  - Le raccourci `D` est ignoré lorsque le focus est dans un élément de formulaire.
- **Prochaines étapes** :
  - Implémenter la tâche 2 : dégradé radial arc-en-ciel suivant la souris.

---

### Modèle d'entrée pour les prochaines passations

```markdown
### Passation #N — YYYY-MM-DD
- **Assistant sortant** : (Claude / Codex / Gemini / Copilot / autre)
- **Travail effectué** :
  - ...
- **Fichiers créés / modifiés** :
  - ...
- **Décisions prises** :
  - ...
- **Prochaines étapes** :
  - ...
- **Points d'attention / bugs connus** :
  - ...
```

### Passation #3 — 2026-11-23
- **Assistant sortant** : Copilot
- **Travail effectué** :
  - Correction du raccourci clavier du mode debug dans `1-Seek`.
  - La touche `D` ou `d` inverse maintenant systématiquement l'état du debug et synchronise la checkbox.
- **Fichiers créés / modifiés** :
  - `1-Seek/sketch.js`
  - `HANDOFF.md`
- **Décisions prises** :
  - Le raccourci clavier reste actif même lorsqu'un contrôle du panneau a précédemment reçu le focus.
- **Préférence de workflow** :
  - Mettre à jour `HANDOFF.md` après chaque opération de développement.
- **Prochaines étapes** :
  - Implémenter la tâche 2 : dégradé radial arc-en-ciel suivant la souris.

### Passation #4 — 2026-11-23
- **Assistant sortant** : Gemini
- **Travail effectué** :
  - Implémentation de la tâche 2 dans `1-Seek` conformément à `1-Seek/1-Specification.md` :
    - Dégradé radial arc-en-ciel animé centré sur `(mouseX, mouseY)`, rendu derrière la cible et les vaisseaux via `drawingContext.createRadialGradient` avec anneaux concentriques et fondu quadratique en périphérie.
    - Phase d'animation rebouclée modulo `360` (`gradientPhase`) pour éviter toute croissance indéfinie et animer le dégradé même lorsque la souris est immobile.
    - Ajout dans le panneau de contrôle d'une section **Dégradé radial** avec les 5 curseurs spécifiés : `Rayon du dégradé` (`50..1000`, init `350`), `Vitesse d'animation` (`0..2`, pas `0.01`, init `0.2`), `Opacité` (`0..255`, init `180`), `Nombre d'anneaux` (`10..200`, init `80`), `Décalage des couleurs` (`0..360`, init `0`).
    - Mise en cache des paramètres dans `gradientSettings` (aucune lecture DOM dans `draw()`), et ajout d'un défilement vertical borné sur `.controls__content`.
  - Vérification syntaxique (`node --check`) et mise à jour de `README.md` (`./scripts/update-readme.sh` + journal des évolutions).
- **Fichiers créés / modifiés** :
  - `1-Seek/sketch.js`
  - `1-Seek/style.css`
  - `README.md`
  - `HANDOFF.md`
- **Décisions prises** :
  - Utilisation de `drawingContext.createRadialGradient` avec 2 color stops par anneau (un seul appel `ctx.fill()` par frame) pour concilier rendu net des anneaux, absence de cumul d'alpha et fluidité avec 200 vaisseaux.
  - Conservation intégrale du raccourci `D`/`d` et du pipeline `Vehicle` (`applyBehaviors` → `applyForce` → `update`).
- **Prochaines étapes** :
  - Implémenter les nouvelles tâches ajoutées dans `1-Seek/1-Specification.md` :
    1. **Tâche 3** : cibles mobiles (`Target` héritant de `Vehicle`, vitesse aléatoire dans `[-7, 7]`, couleur claire, rayon `10..100`, rebond sur les bords, curseur `0..20`).
    2. **Tâche 4** : cercle de détection des vaisseaux (`150` px, curseur `20..200`, visible en debug), `seek` vers la cible la plus proche, réapparition aléatoire si distance `< 5` px.
    3. **Tâche 5** : cercle de détection des cibles (`100` px, réglable, visible en debug), fuite avec boost temporaire de `maxSpeed` et `maxForce` jusqu'à `300` px (paramètres réglables).
    4. **Tâche 6** : endurance des cibles (2 s de fuite / 1 s de régénération + barre visuelle), points de vie (5..10 affichés au centre, `-1` par contact, mort à 0) et compteur de cibles en haut à droite.
- **Points d'attention / bugs connus** :
  - Aucun bug connu ; vérification visuelle interactive à faire dans le navigateur (`1-Seek/index.html`).

### Passation #5 — 2026-11-23
- **Assistant sortant** : Gemini
- **Travail effectué** :
  - Ajout des tâches 3 à 6 dans `1-Seek/1-Specification.md` et ajout des marqueurs de statut `[DONE]`, `[CURRENT]` et `[TODO]` sur chaque tâche.
  - Implémentation de la **tâche 3** dans `1-Seek` :
    - Refonte de `Target` (`1-Seek/target.js`, `extends Vehicle`) : rayon aléatoire `10..100`, position initiale contrainte dans le canvas, couleur aléatoire claire (`RGB` dans `150..255`), direction aléatoire et vitesse dans `[-7, 7]` (`maxSpeed = 7`), rebond sur les bords dans `edges()`, rendu isolé par `push()`/`pop()` dans `show()`.
    - Ajout dans `1-Seek/sketch.js` du tableau `targets`, du curseur `Nombre de cibles` (`0..20`, pas `1`, valeur initiale `5`), de `setTargetCount()` et du cycle `applyBehaviors()` → `update()` → `edges()` → `show()` pour chaque cible.
  - Passage de la tâche 3 à `[DONE]` dans `1-Seek/1-Specification.md`, vérification syntaxique (`node --check`) et mise à jour de `README.md`.
- **Fichiers créés / modifiés** :
  - `1-Seek/target.js`
  - `1-Seek/sketch.js`
  - `1-Seek/1-Specification.md`
  - `README.md`
  - `HANDOFF.md`
- **Directive de workflow** :
  - Dans les spécifications (`1-Seek/1-Specification.md`), toujours maintenir les balises `[DONE]` (tâches terminées), `[CURRENT]` (tâche en cours) et `[TODO]` (tâches à faire) à la fin des titres de tâches.
- **Prochaines étapes** :
  - Implémenter la **tâche 4** (`[TODO]`) : cercle de détection autour des vaisseaux (`150` px par défaut, curseur `20..200`, visible en mode debug), `seek` vers la cible la plus proche dans le cercle, et réapparition aléatoire de la cible lorsque distance `< 5` px.
  - Puis **tâche 5** (`[TODO]`) et **tâche 6** (`[TODO]`).
- **Points d'attention / bugs connus** :
  - Aucun bug connu ; vérification visuelle interactive à faire dans le navigateur (`1-Seek/index.html`).

### Passation #6 — 2026-11-23
- **Assistant sortant** : Gemini
- **Travail effectué** :
  - Passage du nombre de cibles par défaut à `1` (dans `1-Seek/sketch.js` et `1-Seek/1-Specification.md`).
  - Implémentation de la **tâche 4** dans `1-Seek` :
    - Ajout de `detectionRadius = 150`, `findClosestTarget(targets)` (comparaison optimisée par distance au carré), `drawDetectionCircle()` (visible quand `Vehicle.debug === true`) et mise à jour de `applyBehaviors(target, targets)` dans `1-Seek/vehicle.js` pour faire `seek` sur la cible la plus proche dans le cercle de détection (sinon sur la souris).
    - Ajout de `respawn()` dans `1-Seek/target.js` pour replacer la cible aléatoirement dans les limites du canvas.
    - Ajout du curseur `Rayon de détection (vaisseaux)` (`20..200`, pas `1`, initial `150`) et de `checkVehicleTargetContact(vehicle)` (distance au carré `< 25`, soit `< 5` px) dans `1-Seek/sketch.js`.
  - Mise à jour des statuts `[DONE]` / `[TODO]` dans `1-Seek/1-Specification.md`, vérification syntaxique (`node --check`) et mise à jour de `README.md`.
- **Fichiers créés / modifiés** :
  - `1-Seek/vehicle.js`
  - `1-Seek/target.js`
  - `1-Seek/sketch.js`
  - `1-Seek/1-Specification.md`
  - `README.md`
  - `HANDOFF.md`
- **Prochaines étapes** :
  - Implémenter la **tâche 5** (`[TODO]`) : cercle de détection des cibles (`100` px, réglable et visible en debug), fuite temporaire (`flee`) avec boost de `maxSpeed` et `maxForce` jusqu'à `300` px de distance (valeurs réglables par curseurs).
  - Puis **tâche 6** (`[TODO]`) : endurance des cibles (2 s de fuite / 1 s de régénération + barre), points de vie (`5..10` affichés au centre, `-1` par contact, mort à `0`) et compteur de cibles en haut à droite.
- **Points d'attention / bugs connus** :
  - Aucun bug connu ; vérification visuelle interactive à faire dans le navigateur (`1-Seek/index.html`).

### Passation #7 — 2026-11-23
- **Assistant sortant** : Gemini
- **Travail effectué** :
  - Ajout d'un menu déroulant **Scénario** dans le panneau de contrôle (`1-Seek/sketch.js`, `1-Seek/style.css`) :
    - `Scénario 1 : Suivre la souris` (`seek` vers la souris).
    - `Scénario 2 : Chasse aux cibles` (patrouille aléatoire `randomPatrol()` changeant de direction toutes les 4 s via steering, puis `seek` sur la cible la plus proche dans le cercle de détection).
    - `Scénario 3 : Fuite des cibles` (idem scénario 2 + fuite temporaire des cibles).
  - Implémentation de la **tâche 5** dans `1-Seek/target.js` et `1-Seek/sketch.js` :
    - Cercle de détection des cibles (`detectionRadius = 100`, curseur `20..300`, visible en mode debug avec cercle de sécurité affiché pendant la fuite).
    - Fuite temporaire (`flee` hérité de `Vehicle`) avec boost de `maxSpeed` (`fleeMaxSpeed = 12`) et `maxForce` (`fleeMaxForce = 0.8`) jusqu'à atteindre `safeDistance = 300` px du vaisseau le plus proche, avec 4 curseurs réglables dans la section **Fuite des cibles**.
  - Ajout de la détection avec boost **x3** (`maxSpeed` et `maxForce`) sur `Vehicle` lorsqu'une cible est détectée dans le cercle de détection (conservation de `baseMaxSpeed` / `baseMaxForce` synchronisées avec les curseurs).
  - Passage de la tâche 5 à `[DONE]` dans `1-Seek/1-Specification.md`, vérification syntaxique (`node --check`) et mise à jour de `README.md`.
- **Fichiers créés / modifiés** :
  - `1-Seek/vehicle.js`
  - `1-Seek/target.js`
  - `1-Seek/sketch.js`
  - `1-Seek/style.css`
  - `1-Seek/1-Specification.md`
  - `README.md`
  - `HANDOFF.md`
- **Prochaines étapes** :
  - Implémenter la **tâche 6** (`[TODO]`) : endurance des cibles (2 s de fuite max, puis régénération en 1 s + barre d'endurance visible), points de vie initiaux (`5..10`, affichés au centre en couleur contrastée, `-1` par contact, mort à `0`) et compteur du nombre de cibles en haut à droite de l'écran.
- **Points d'attention / bugs connus** :
  - Aucun bug connu ; vérification visuelle interactive à faire dans le navigateur (`1-Seek/index.html`).

### Passation #8 — 2026-11-23
- **Assistant sortant** : Gemini
- **Travail effectué** :
  - Implémentation de la **tâche 6** dans `1-Seek/target.js` et `1-Seek/sketch.js` :
    - **Endurance** sur `Target` : fuite limitée à 2 s (`staminaDrainDurationMs = 2000`), blocage en régénération complète pendant 1 s (`staminaRegenDurationMs = 1000`, `isRegeneratingStamina`), mise à jour basée sur `deltaTime`, et affichage de la barre d'endurance au-dessus de chaque cible (`drawStaminaBar()`, vert en état normal/fuite, orange en régénération forcée).
    - **Points de vie et mort** : PV initiaux aléatoires entre `5` et `10` (`Math.floor(random(5, 11))`), affichés au centre du cercle en couleur sombre contrastée (`drawHealth()`), perte de `1` PV par contact via `takeDamage(1)` (réapparition aléatoire si `hp > 0`, suppression du tableau `targets` à `hp === 0`).
    - **Compteur HUD** : `drawTargetCounter()` affiche le nombre de cibles restantes en haut à droite de l'écran.
  - Passage de la tâche 6 à `[DONE]` dans `1-Seek/1-Specification.md`, vérification syntaxique (`node --check`) et mise à jour de `README.md`.
- **Fichiers créés / modifiés** :
  - `1-Seek/target.js`
  - `1-Seek/sketch.js`
  - `1-Seek/1-Specification.md`
  - `README.md`
  - `HANDOFF.md`
- **Prochaines étapes** :
  - Toutes les tâches spécifiées dans `1-Seek/1-Specification.md` (Tâches 1 à 6) sont `[DONE]`. En attente de nouvelles tâches pour `1-Seek` ou passage au prochain sketch.
- **Points d'attention / bugs connus** :
  - Aucun bug connu ; vérification visuelle interactive à faire dans le navigateur (`1-Seek/index.html`).

### Passation #9 — 2026-11-23
- **Assistant sortant** : Gemini
- **Travail effectué** :
  - Création de la classe `TargetFragment` (`1-Seek/targetFragment.js`, `extends Vehicle`, 1 classe/fichier) pour animer l'éclatement d'une cible en **8 parts de camembert** (`arc(..., PIE)`) sur **0,3 s** (`300` ms) via steering (`seek` vers un point radial extérieur + rotation et fondu d'opacité).
  - Chargement de `targetFragment.js` dans `1-Seek/index.html` et intégration dans `1-Seek/sketch.js` (`shatterTarget`, `updateAndDrawTargetFragments`).
  - Dans le **Scénario 3**, lorsqu'un vaisseau touche une cible (`distance < target.r + vehicle.r`), elle éclate immédiatement en 8 morceaux et meurt définitivement sans réapparaître (et dans le scénario 2, elle éclate également lorsqu'elle atteint `0` PV).
  - Remplacement du seuil de contact fixe (`< 5` px) par la somme des rayons (`movingTarget.r + vehicle.r`, comparée au carré) dans `checkVehicleTargetContact()`.
  - Restauration exacte de la vitesse initiale (`initialSpeed`) et de l'accélération initiale (`baseMaxForce`, `acc.set(0, 0)`) d'une cible à la fin d'une fuite dans `Target.stopFleeing()`.
  - Ajout des vagues progressives (`targetWave`) : lorsque toutes les cibles sont éliminées (`targets.length === 0` et curseur `> 0`), recréation du nombre indiqué par le curseur avec `speedMultiplier = 1 + (wave - 1) * 0.15` et `forceMultiplier = 1 + (wave - 1) * 0.1`, avec affichage de la vague dans le compteur HUD en haut à droite.
  - Vérification syntaxique (`node --check`) et mise à jour de `1-Seek/1-Specification.md`, `README.md` (`./scripts/update-readme.sh` + changelog) et `HANDOFF.md`.
- **Fichiers créés / modifiés** :
  - `1-Seek/targetFragment.js` (nouveau)
  - `1-Seek/index.html`
  - `1-Seek/sketch.js`
  - `1-Seek/1-Specification.md`
  - `README.md`
  - `HANDOFF.md`
- **Prochaines étapes** :
  - Toutes les tâches de `1-Seek/1-Specification.md` sont `[DONE]`. En attente de nouvelles évolutions ou du prochain sketch.
- **Points d'attention / bugs connus** :
  - Aucun bug connu ; vérification visuelle interactive à faire dans le navigateur (`1-Seek/index.html`).

### Passation #10 — 2026-11-23
- **Assistant sortant** : Gemini
- **Travail effectué** :
  - Implémentation de la **tâche 7** (`1-Seek/soundEngine.js`, `1-Seek/index.html`, `1-Seek/sketch.js`, `1-Seek/style.css`) :
    - Création de `SoundEngine` (API native Web Audio, 1 classe/fichier, sans fichier audio externe) avec déverrouillage automatique sur interaction utilisateur (`mousePressed` / `keyPressed` / bouton audio).
    - **Effet de mort / explosion spatialisé G/D** (`playTargetDeath`) via `StereoPannerNode` (`pan` calculé depuis `x / width`), combinant un bruit blanc filtré (explosion/éclatement) et un oscillateur `sawtooth` en chute rapide (agonie adaptée au rayon de la cible).
    - **Musique contextuelle adaptative** (`updateMusic` / `playMusicStep` / `playWaveStart`) : boucle synthwave / arcade en Ré mineur (kick, basse `sawtooth` filtrée bien audible sur haut-parleurs d'ordinateur, arpège stéréo et hi-hat en poursuite) passant par un `DynamicsCompressorNode`. Le tempo (96 → 168 BPM), la brillance du filtre et la densité rythmique évoluent dynamiquement selon le nombre de cibles restantes, les poursuites/fuites actives et le numéro de vague (+ arpège de nouvelle vague).
    - Ajout dans le panneau de la section **Audio (Web Audio)** avec le bouton **Musique / Sons ON/OFF** et le curseur **Volume** (`0..100`, défaut `60`).
    - Mise en cache de `desiredTargetCount` pour éviter toute lecture DOM dans `draw()`.
  - Passage de la tâche 7 à `[DONE]` dans `1-Seek/1-Specification.md`, vérification syntaxique (`node --check`) et mise à jour de `README.md` (`./scripts/update-readme.sh` + changelog).
- **Fichiers créés / modifiés** :
  - `1-Seek/soundEngine.js` (nouveau)
  - `1-Seek/index.html`
  - `1-Seek/sketch.js`
  - `1-Seek/style.css`
  - `1-Seek/1-Specification.md`
  - `README.md`
  - `HANDOFF.md`
- **Prochaines étapes** :
  - Toutes les tâches spécifiées dans `1-Seek/1-Specification.md` (Tâches 1 à 7) sont `[DONE]`. En attente de nouvelles tâches pour `1-Seek` ou passage au prochain sketch.
- **Points d'attention / bugs connus** :
  - L'audio Web Audio démarre dès la première interaction (clic ou touche) conformément à la politique autoplay des navigateurs.

### Passation #11 — 2026-11-24
- **Assistant sortant** : Gemini
- **Travail effectué** :
  - Rédaction de la spécification complète `2-PursueEvade/2-specification.md` (Tâches 1 à 4 avec balises `[DONE]` / `[CURRENT]` / `[TODO]`).
  - Implémentation de la **tâche 1** dans `2-PursueEvade/` (1 classe max par fichier, héritage strict de `Vehicle`) :
    - `2-PursueEvade/plane.js` (`class Plane extends Vehicle`) : vol autonome par steering `wander()`, dessin d'avion encapsulé dans `push()`/`pop()`.
    - `2-PursueEvade/attackerPlane.js` (`class AttackerPlane extends Plane`) : radar de détection (`detectionRadius = 300`), délai de délock (`unlockDelayMs = 5000`), `updateLock()`, `applyBehaviors()` faisant `seek` sur la cible tant qu'elle est lockée (sinon `wander()`), cercle de détection et compte à rebours de délock visibles en mode debug.
    - `2-PursueEvade/targetPlane.js` (`class TargetPlane extends Plane`) : vert par défaut, rouge + réticule quand locké.
    - `2-PursueEvade/vehicle.js` : ajout de `static debug = false` et encapsulation `push()`/`pop()` dans `show()`.
    - `2-PursueEvade/sketch.js`, `style.css`, `index.html` : panneau UI semi-transparent et repliable en **haut à droite**, curseurs `Rayon de détection` (`50..600`, défaut `300`) et `Temps de délock (s)` (`0.5..15`, défaut `5`), checkbox `Debug` synchronisée avec la touche `d`/`D`.
  - Vérification syntaxique (`node --check`) et mise à jour de `README.md` (`./scripts/update-readme.sh` + changelog).
- **Fichiers créés / modifiés** :
  - `2-PursueEvade/2-specification.md` (nouveau)
  - `2-PursueEvade/plane.js` (nouveau)
  - `2-PursueEvade/attackerPlane.js` (nouveau)
  - `2-PursueEvade/targetPlane.js` (nouveau)
  - `2-PursueEvade/vehicle.js`
  - `2-PursueEvade/sketch.js`
  - `2-PursueEvade/style.css`
  - `2-PursueEvade/index.html`
  - `README.md`
  - `HANDOFF.md`
- **Prochaines étapes** :
  - Attendre validation/test de la **tâche 1** de `2-PursueEvade`, puis implémenter :
    - **Tâche 2** (`[TODO]`) : tir de `Missile` (`extends Vehicle`) 1 s après le lock avec `pursuePerfect`, point d'interception visible, vitesse 2× réglable par curseur, disparition et explosion à l'impact.
    - **Tâche 3** (`[TODO]`) : plusieurs avions attaquants et cibles réglables par curseurs (`1` et `1` par défaut).
    - **Tâche 4** (`[TODO]`) : clignotement vert/rouge après 1 s de lock et `evadePerfect` dans `Vehicle`.
- **Points d'attention / bugs connus** :
  - Aucun bug connu ; prêt pour test utilisateur dans le navigateur (`2-PursueEvade/index.html`).

### Passation #12 — 2026-11-24
- **Assistant sortant** : Gemini
- **Travail effectué** :
  - Ajustements **tâche 1** dans `2-PursueEvade` :
    - Rayon de détection par défaut passé à **`400` px** (`AttackerPlane`, `sketch.js`, `2-specification.md`).
    - Arrêt immédiat du comportement `seek` dès que la cible sort du cercle de détection (`targetInRange === false`), tout en conservant le compte à rebours de délock de 5 s.
  - Implémentation de la **tâche 2** dans `2-PursueEvade` :
    - Sécurisation de `pursuePerfect()` (et `computePerfectInterceptionPoint()`) dans `2-PursueEvade/vehicle.js` contre les `NaN` (trajectoires colinéaires ou cible plus rapide) + visualisation du point d'interception (réticule + ligne).
    - Création de `Missile` (`2-PursueEvade/missile.js`, `extends Vehicle`) : tirés par salve de **2** (ailes droite et gauche à **±90°**), avancent perpendiculairement pendant **`0,3` s** avant de basculer sur `pursuePerfect` (trait vert vers le point d'interception visible uniquement en mode debug avec faible opacité), vitesse par défaut **`1,5×`** celle des avions et accélération max (`maxForce = 0.45`) toutes deux réglables par curseurs.
    - Création de `ExplosionParticle` (`2-PursueEvade/explosionParticle.js`, `extends Vehicle`) : animation d'explosion à l'impact (32 particules en steering radial) lors de la destruction simultanée de l'avion cible et du missile ; chaque cible détruite donne immédiatement naissance à **2 nouvelles cibles**.
    - Ajout dans `2-PursueEvade/sketch.js` du curseur `Vitesse missile (× avion)`, du bouton `Relancer la simulation`, du HUD de manche et du redémarrage automatique avec `+1` cible à chaque manche (`1`, `2`, `3`, …) lorsque toutes les cibles sont détruites.
  - Passage de la tâche 2 à `[DONE]` dans `2-PursueEvade/2-specification.md`, vérification syntaxique (`node --check`) et mise à jour de `README.md`.
- **Fichiers créés / modifiés** :
  - `2-PursueEvade/missile.js` (nouveau)
  - `2-PursueEvade/explosionParticle.js` (nouveau)
  - `2-PursueEvade/vehicle.js`
  - `2-PursueEvade/attackerPlane.js`
  - `2-PursueEvade/sketch.js`
  - `2-PursueEvade/index.html`
  - `2-PursueEvade/2-specification.md`
  - `README.md`
  - `HANDOFF.md`
- **Prochaines étapes** :
  - **Tâche 3** (`[TODO]`) : gérer plusieurs avions attaquants et plusieurs avions cibles réglables par curseurs (`1` attaquant et `1` cible par défaut).
  - **Tâche 4** (`[TODO]`) : ajouter `evadePerfect` dans `Vehicle`, clignotement vert/rouge des cibles 1 s après lock et bascule vers `evadePerfect`.
- **Points d'attention / bugs connus** :
  - Aucun bug connu ; prêt pour test utilisateur dans le navigateur (`2-PursueEvade/index.html`).

### Passation #13 — 2026-11-24
- **Assistant sortant** : Gemini
- **Travail effectué** :
  - Remplacement de la multiplication par 2 des cibles par une réapparition **1 pour 1** à la mort d'une cible dans `2-PursueEvade/sketch.js`.
  - Implémentation de la **tâche 3** dans `2-PursueEvade/` :
    - Gestion de plusieurs `AttackerPlane` (`attackers`) et plusieurs `TargetPlane` (`targetPlanes`), synchronisés sans réinitialisation via deux nouveaux curseurs : `Nombre d'attaquants` (`1..15`, défaut `1`) et `Nombre de cibles` (`1..20`, défaut `1`).
    - Coordination multi-verrous sur `TargetPlane` (`lockedByAttackers = new Set()`) afin qu'une cible lockée par plusieurs attaquants reste verrouillée tant qu'au moins un attaquant la cible.
    - Mise à jour du HUD (`Attaquants : N · Cibles : M`).
  - Passage de la tâche 3 à `[DONE]` dans `2-PursueEvade/2-specification.md`, vérification syntaxique (`node --check`) et mise à jour de `README.md`.
- **Fichiers créés / modifiés** :
  - `2-PursueEvade/targetPlane.js`
  - `2-PursueEvade/attackerPlane.js`
  - `2-PursueEvade/sketch.js`
  - `2-PursueEvade/2-specification.md`
  - `README.md`
  - `HANDOFF.md`
- **Prochaines étapes** :
  - **Tâche 4** (`[TODO]`) : ajouter `evadePerfect(vehicle)` dans `2-PursueEvade/vehicle.js` (force opposée à `pursuePerfect`), suivi du temps de lock dans `TargetPlane`, clignotement vert/rouge au bout de `1` s de lock et bascule vers `evadePerfect`.
- **Points d'attention / bugs connus** :
  - Aucun bug connu ; prêt pour test utilisateur dans le navigateur (`2-PursueEvade/index.html`).

### Passation #14 — 2026-11-24
- **Assistant sortant** : Gemini
- **Travail effectué** :
  - Ajout de la **durée de vie maximale des missiles** (`5` s par défaut, curseur `Durée de vie missile (s)` de `1` à `15` s) dans `2-PursueEvade/missile.js` (`ageMs`, `maxLifeMs`, `isExpired()`) et `2-PursueEvade/sketch.js` (auto-destruction avec petite explosion à expiration).
  - Implémentation de la **tâche 4** dans `2-PursueEvade/` :
    - Ajout de `evadePerfect(vehicle, showInterception = false)` dans `2-PursueEvade/vehicle.js` (force opposée à `pursuePerfect`, réutilisable par toutes les sous-classes de `Vehicle`).
    - Mise à jour de `2-PursueEvade/targetPlane.js` : suivi du temps de lock (`lockElapsedMs`), bascule en évasion (`isEvading = true`) au bout de `1` s de lock avec **clignotement vert/rouge** dans `show()` et exécution de `evadePerfect()` vis-à-vis de l'attaquant verrouilleur le plus proche dans `applyBehaviors()`.
    - Correction dans `2-PursueEvade/attackerPlane.js` : remplacement du tir unique par lock (`missileFiredForLock`) par un compte à rebours périodique (`fireCountdownMs` : premier tir à `1` s, puis rechargement toutes les `2` s tant que la cible reste lockée, y compris pendant son évasion).
  - Passage de la tâche 4 à `[DONE]` dans `2-PursueEvade/2-specification.md`, vérification syntaxique (`node --check`) et mise à jour de `README.md`.
- **Fichiers créés / modifiés** :
  - `2-PursueEvade/vehicle.js`
  - `2-PursueEvade/missile.js`
  - `2-PursueEvade/targetPlane.js`
  - `2-PursueEvade/sketch.js`
  - `2-PursueEvade/2-specification.md`
  - `README.md`
  - `HANDOFF.md`
- **Prochaines étapes** :
  - Toutes les tâches de `2-PursueEvade/2-specification.md` (Tâches 1 à 4) sont `[DONE]`. En attente de retours de test, de nouvelles tâches ou du passage au dossier suivant (`3-Arrival/`).
- **Points d'attention / bugs connus** :
  - Aucun bug connu ; prêt pour test utilisateur dans le navigateur (`2-PursueEvade/index.html`).

### Passation #15 — 2026-11-24
- **Assistant sortant** : Gemini
- **Travail effectué** :
  - Ajout et implémentation de la **tâche 5** dans `2-PursueEvade/` (détection des missiles et fuite boostée avec endurance sur `TargetPlane`, reprise du modèle de `1-Seek`) :
    - `2-PursueEvade/targetPlane.js` : cercle de détection des missiles (`missileDetectionRadius = 150`, visible en mode debug), distance de sécurité (`missileSafeDistance = 300`), fuite prioritaire `flee(closestMissile)` avec boost temporaire (`fleeMaxSpeed = 9`, `fleeMaxForce = 0.7`), endurance (`2` s de fuite max / `1` s de régénération complète) avec barre visuelle (`drawStaminaBar()`), et retour propre aux paramètres initiaux (`stopFleeingMissile()`).
    - `2-PursueEvade/sketch.js` & `style.css` : passage de `missiles` à `plane.applyBehaviors(missiles)`, ajout de la section **Fuite des cibles (missiles)** avec 4 curseurs réglables (`Rayon détection missiles`, `Distance sécurité missiles`, `Vitesse max fuite cible`, `Accél. max fuite cible`), synchronisation lors des respawns.
  - Passage de la tâche 5 à `[DONE]` dans `2-PursueEvade/2-specification.md`, vérification syntaxique (`node --check`) et mise à jour de `README.md`.
- **Fichiers créés / modifiés** :
  - `2-PursueEvade/targetPlane.js`
  - `2-PursueEvade/sketch.js`
  - `2-PursueEvade/style.css`
  - `2-PursueEvade/2-specification.md`
  - `README.md`
  - `HANDOFF.md`
- **Prochaines étapes** :
  - Toutes les tâches de `2-PursueEvade/2-specification.md` (Tâches 1 à 5) sont `[DONE]`. En attente de nouvelles tâches, d'un commit/push ou du passage au dossier suivant.
- **Points d'attention / bugs connus** :
  - Aucun bug connu ; prêt pour test utilisateur dans le navigateur (`2-PursueEvade/index.html`).

### Passation #16 — 2026-11-24
- **Assistant sortant** : Gemini
- **Travail effectué** :
  - Création de `SmokePuff` (`2-PursueEvade/smokePuff.js`, `extends Vehicle`, 1 classe/fichier) : animation de dissipation en nuage de fumée gris-bleuté (expansion + fondu) lorsqu'un missile expire de lui-même (ou perd sa cible), distincte de l'explosion de feu (`ExplosionParticle`) déclenchée lors d'un impact sur une cible.
  - Ajout de la propriété `owner` sur `Missile` et du paramètre réglable **Missiles max / attaquant** (`1..10`, défaut `2`) dans `2-PursueEvade/sketch.js` et `2-PursueEvade/attackerPlane.js` (`canFire`) : chaque attaquant respecte strictement son quota de missiles vivants simultanés.
  - Vérification syntaxique (`node --check`) et mise à jour de `2-PursueEvade/2-specification.md`, `README.md` (`./scripts/update-readme.sh` + changelog) et `HANDOFF.md`.
- **Fichiers créés / modifiés** :
  - `2-PursueEvade/smokePuff.js` (nouveau)
  - `2-PursueEvade/index.html`
  - `2-PursueEvade/missile.js`
  - `2-PursueEvade/attackerPlane.js`
  - `2-PursueEvade/sketch.js`
  - `2-PursueEvade/2-specification.md`
  - `README.md`
  - `HANDOFF.md`
- **Prochaines étapes** :
  - Toutes les tâches de `2-PursueEvade/2-specification.md` (Tâches 1 à 5) sont `[DONE]`. En attente de nouvelles tâches, d'un commit/push ou du passage au dossier suivant.
- **Points d'attention / bugs connus** :
  - Aucun bug connu ; prêt pour test utilisateur dans le navigateur (`2-PursueEvade/index.html`).

### Passation #17 — 2026-11-24
- **Assistant sortant** : Gemini
- **Travail effectué** :
  - Ajout et implémentation de la **tâche 6** dans `2-PursueEvade/` :
    - Création de `BattlePlane` (`2-PursueEvade/battlePlane.js`, `extends Plane`, 1 classe/fichier) : avion polyvalent combinant détection/lock/tir d'attaquant (`candidate !== this`) et survie de cible (fuite boostée des missiles ennemis `missile.owner !== this` avec barre d'endurance, clignotement et `evadePerfect` 1 s après un lock).
    - Ajout d'un menu déroulant **Scénario** dans `2-PursueEvade/sketch.js` et `style.css` : `Scénario 1 : Attaquants vs Cibles` et `Scénario 2 : Battle Royale` (avec curseur `Avions (Battle Royale)` de `2..20`, défaut `8`).
    - En **Battle Royale**, les avions détruits ne sont pas régénérés ; le dernier survivant est couronné **vainqueur** (halo doré pulsant + bandeau de victoire).
  - Passage de la tâche 6 à `[DONE]` dans `2-PursueEvade/2-specification.md`, vérification syntaxique (`node --check`) et mise à jour de `README.md`.
- **Fichiers créés / modifiés** :
  - `2-PursueEvade/battlePlane.js` (nouveau)
  - `2-PursueEvade/index.html`
  - `2-PursueEvade/sketch.js`
  - `2-PursueEvade/style.css`
  - `2-PursueEvade/2-specification.md`
  - `README.md`
  - `HANDOFF.md`
- **Prochaines étapes** :
  - Toutes les tâches de `2-PursueEvade/2-specification.md` (Tâches 1 à 6) sont `[DONE]`. En attente de retours de test, d'un commit/push ou du passage au dossier suivant.
- **Points d'attention / bugs connus** :
  - Aucun bug connu ; prêt pour test utilisateur dans le navigateur (`2-PursueEvade/index.html`).

### Passation #18 — 2026-11-24
- **Assistant sortant** : Gemini
- **Travail effectué** :
  - Ajout et implémentation de la **tâche 7** dans `2-PursueEvade/` (contre-mesures Flares pour le Scénario 1) :
    - Création de `Flare` (`2-PursueEvade/flare.js`, `extends Vehicle`, 1 classe/fichier) : petits cercles jaunes lumineux qui flottent très doucement par steering, durée de vie `3` s (`3000` ms).
    - Mise à jour de `2-PursueEvade/targetPlane.js` : stock initial de `100` flares (`flareCount`), largage par groupes de `10` (`tryReleaseFlares`) dès qu'un missile entre dans `missileDetectionRadius`, virage brutal perpendiculaire + accélération pendant `0,5` s (`breakTimerMs = 500`), label `Flares: N` affiché sous l'avion.
    - Mise à jour de `2-PursueEvade/missile.js` et `2-PursueEvade/sketch.js` : `Missile.selectTarget(flares)` bascule sur le flare le plus proche appartenant à `initialTarget` s'il est plus proche que l'avion ; au contact d'un flare, le missile et le flare sont détruits (petite explosion) et l'avion survit.
  - Passage de la tâche 7 à `[DONE]` dans `2-PursueEvade/2-specification.md`, vérification syntaxique (`node --check`) et mise à jour de `README.md`.
- **Fichiers créés / modifiés** :
  - `2-PursueEvade/flare.js` (nouveau)
  - `2-PursueEvade/index.html`
  - `2-PursueEvade/missile.js`
  - `2-PursueEvade/targetPlane.js`
  - `2-PursueEvade/sketch.js`
  - `2-PursueEvade/2-specification.md`
  - `README.md`
  - `HANDOFF.md`
- **Prochaines étapes** :
  - Toutes les tâches de `2-PursueEvade/2-specification.md` (Tâches 1 à 7) sont `[DONE]`. En attente de retours de test, d'un commit/push ou du passage au dossier suivant.
- **Points d'attention / bugs connus** :
  - Aucun bug connu ; prêt pour test utilisateur dans le navigateur (`2-PursueEvade/index.html`).

### Passation #19 — 2026-11-24
- **Assistant sortant** : Gemini
- **Travail effectué** :
  - Rédaction de `3-Arrival/3-specification.md` (Tâches 1 à 3 avec balises `[DONE]` / `[TODO]`).
  - Implémentation de la **tâche 1** dans `3-Arrival/` (1 classe max par fichier, toutes sous-classes de `Vehicle`) :
    - `3-Arrival/snakeHead.js` (`class SnakeHead extends Vehicle`) : suit la souris avec `arrive(target, 0)`, mémorise `heading`.
    - `3-Arrival/snakeRing.js` (`class SnakeRing extends Vehicle`) : suit un point calculé derrière le maillon précédent (`getFollowPointBehind`) avec `arrive(followPoint, 0)` et paramètres `maxSpeed` / `maxForce` indépendants pour l'effet élastique.
    - `3-Arrival/snake.js` (`class Snake extends Vehicle`) : orchestre la tête et les anneaux (`30` par défaut), rayon dégressif de la tête à la queue, lignes de liaison semi-transparentes (`drawConnectorLines()`).
    - `3-Arrival/vehicle.js` : suppression de la classe `Target` inutilisée en fin de fichier afin de respecter strictement la règle « 1 classe max par fichier ».
    - `3-Arrival/sketch.js`, `style.css`, `index.html` : panneau UI repliable en haut à droite avec curseurs `Nombre d'anneaux` (`1..100`, défaut `30`), `Vitesse max tête`, `Accélération max tête`, `Vitesse max anneaux`, `Accélération max anneaux`, et mode `Debug` synchronisé avec `d`/`D`.
  - Correction de la fluidité et de l'arrêt du serpent dans `3-Arrival` : remplacement de la projection sur `heading` par `arrive(leader.pos, gapDistance)` (aligné sur `3-Arrival_correction`), mise à jour séquentielle maillon par maillon dans `Snake.applyBehaviors()`, seuil de vitesse pour `heading` (`magSq() > 0.25`) et zone morte à l'arrêt pour supprimer les micro-mouvements.
  - Ajout dans `3-Arrival/snake.js` d'une enveloppe de corps semi-transparente au contour lisse (`buildSmoothBodyContour` + `traceSmoothClosedPath` en `quadraticCurveTo`) et d'une texture procédurale d'écailles pré-calculée dans `createScalesPattern()` (`createGraphics()`).
  - Passage de la tâche 1 à `[DONE]` dans `3-Arrival/3-specification.md`, vérification syntaxique (`node --check`) et mise à jour de `README.md`.
- **Fichiers créés / modifiés** :
  - `3-Arrival/3-specification.md` (nouveau)
  - `3-Arrival/snakeHead.js` (nouveau)
  - `3-Arrival/snakeRing.js` (nouveau)
  - `3-Arrival/snake.js` (nouveau)
  - `3-Arrival/vehicle.js`
  - `3-Arrival/sketch.js`
  - `3-Arrival/style.css`
  - `3-Arrival/index.html`
  - `README.md`
  - `HANDOFF.md`
- **Prochaines étapes** :
  - Attendre le test de la **tâche 1** de `3-Arrival`, puis spécifier/implémenter les tâches suivantes (`Tâche 2` : enrichissement visuel / cibles alimentaires, `Tâche 3` : multi-serpents & mode autonome).
- **Points d'attention / bugs connus** :
  - Aucun bug connu ; prêt pour test utilisateur dans le navigateur (`3-Arrival/index.html`).

### Passation #20 — 2026-11-24
- **Assistant sortant** : Gemini
- **Travail effectué** :
  - Implémentation de la **tâche 2** dans `3-Arrival/` (`TexteAnime` & `TextFragment`, 1 classe/fichier, `extends Vehicle`) :
    - `3-Arrival/vehicle.js` : implémentation de `flee(target)` (`seek(target).mult(-1)`).
    - `3-Arrival/textFragment.js` (`class TextFragment extends Vehicle`) : petits véhicules circulaires appliquant `flee` si la souris, la tête ou un anneau du serpent se trouve à moins de `40` px par défaut (réglable par curseur `10..200`, comparaison par distance au carré), sinon `arrive(target, 0)` avec zone morte à l'arrêt.
    - `3-Arrival/texteAnime.js` (`class TexteAnime extends Vehicle`) : centrage via `textBounds()` + `textToPoints()`, texte par défaut `"Marrakech EMSI"`, réutilisation fluide des fragments existants lors d'un changement de texte ou de police.
    - Copie de 3 polices locales dans `3-Arrival/assets/` (`ArialBold.ttf`, `CourierNewBold.ttf`, `Chalkduster.ttf`) en plus de `inconsolata.otf`.
    - Ajout dans `3-Arrival/sketch.js` & `style.css` d'un champ texte **Texte** et d'un menu déroulant **Police**, avec protection du raccourci `D` lors de la saisie dans un champ de formulaire.
  - Passage de la tâche 2 à `[DONE]` dans `3-Arrival/3-specification.md`, vérification syntaxique (`node --check`) et mise à jour de `README.md`.
- **Fichiers créés / modifiés** :
  - `3-Arrival/textFragment.js` (nouveau)
  - `3-Arrival/texteAnime.js` (nouveau)
  - `3-Arrival/assets/ArialBold.ttf`, `CourierNewBold.ttf`, `Chalkduster.ttf` (nouveaux)
  - `3-Arrival/index.html`
  - `3-Arrival/style.css`
  - `3-Arrival/sketch.js`
  - `3-Arrival/3-specification.md`
  - `README.md`
  - `HANDOFF.md`
- **Prochaines étapes** :
  - Attendre le test de `TexteAnime` / `Snake` dans `3-Arrival/index.html`, puis passer à la **tâche 3** (`[TODO]`) ou à de nouvelles consignes.
- **Points d'attention / bugs connus** :
  - Aucun bug connu ; prêt pour test utilisateur dans le navigateur (`3-Arrival/index.html`).

### Passation #21 — 2026-11-24
- **Assistant sortant** : Gemini
- **Travail effectué** :
  - Implémentation de la **tâche 3** dans `3-Arrival/` (shaders GLSL via tampons `WEBGL` hors écran `createGraphics(..., WEBGL)`) :
    - `3-Arrival/snakeShaderTexture.js` (`class SnakeShaderTexture extends Vehicle`) : 4 shaders animés sélectionnables pour la texture du corps du serpent (`Écailles animées`, `Plasma néon`, `Ondes cyber`, `Lave / Magma`), chacun avec ses propres paramètres décrits dans `PRESETS` pour générer dynamiquement les curseurs correspondants dans la UI (`rebuildShaderParamsUI`).
    - `3-Arrival/gridShaderLayer.js` (`class GridShaderLayer extends Vehicle`) : grille semi-transparente en fond d'écran rendue par shader GLSL à demi-résolution (`0.5×`) qui se déforme au passage de la tête et des anneaux du serpent (`u_points[32]`), avec curseurs dédiés (`Espacement grille`, `Rayon déformation`, `Force déformation`, `Opacité grille`, `Épaisseur grille`).
    - Intégration dans `3-Arrival/snake.js`, `3-Arrival/sketch.js`, `3-Arrival/style.css` et `3-Arrival/index.html`.
    - Ajout des réglages contrastés par défaut et des contrôles associés : `Couleur du texte` (`#fbbf24`), `Taille des points` (`1.5..8`, défaut `3.2`), `Couleur du fond` (`#070b18`) et `Couleur des mailles` (`#3b82f6`).
  - Passage de la tâche 3 à `[DONE]` dans `3-Arrival/3-specification.md`, vérification syntaxique (`node --check`) et mise à jour de `README.md`.
- **Fichiers créés / modifiés** :
  - `3-Arrival/snakeShaderTexture.js` (nouveau)
  - `3-Arrival/gridShaderLayer.js` (nouveau)
  - `3-Arrival/snake.js`
  - `3-Arrival/sketch.js`
  - `3-Arrival/style.css`
  - `3-Arrival/index.html`
  - `3-Arrival/3-specification.md`
  - `README.md`
  - `HANDOFF.md`
- **Prochaines étapes** :
  - Toutes les tâches de `3-Arrival/3-specification.md` (Tâches 1 à 3) sont `[DONE]`. En attente de retours de test, d'un commit/push ou du passage au dossier suivant (`4-Wander/`).
- **Points d'attention / bugs connus** :
  - Aucun bug connu ; prêt pour test utilisateur dans le navigateur (`3-Arrival/index.html`).

### Passation #22 — 2026-11-24
- **Assistant sortant** : Gemini
- **Travail effectué** :
  - Implémentation de la **tâche 4** dans `3-Arrival/` :
    - `3-Arrival/snakeHead.js` : yeux orientés dont les pupilles suivent en permanence la position de la souris (`drawEyes()`) et langue fourchue animée qui sort et oscille périodiquement (`drawForkedTongue()`).
    - `3-Arrival/food.js` (`class Food extends Vehicle`, 1 classe/fichier) : objets comestibles qui apparaissent aléatoirement, flottent doucement via steering avec rebond sur les bords et s'allument d'un halo pulsant.
    - `3-Arrival/snake.js` : ajout de `grow(amount = 1)` pour allonger le serpent lorsqu'il mange un `Food`.
    - `3-Arrival/sketch.js` & `index.html` : système de niveaux chronométrés (`startLevel`, `getLevelConfig`, `checkFoodCollisions`, `drawLevelHud`, `drawGameOverBanner`), affichant `"Niveau N"` au centre via `TexteAnime`, changeant la couleur de la grille à chaque niveau (`LEVEL_GRID_COLORS`) et augmentant l'objectif / réduisant le temps imparti.
  - Passage de la tâche 4 à `[DONE]` dans `3-Arrival/3-specification.md`, vérification syntaxique (`node --check`) et mise à jour de `README.md`.
- **Fichiers créés / modifiés** :
  - `3-Arrival/food.js` (nouveau)
  - `3-Arrival/snakeHead.js`
  - `3-Arrival/snake.js`
  - `3-Arrival/sketch.js`
  - `3-Arrival/index.html`
  - `3-Arrival/3-specification.md`
  - `README.md`
  - `HANDOFF.md`
- **Prochaines étapes** :
  - Toutes les tâches de `3-Arrival/3-specification.md` (Tâches 1 à 4) sont `[DONE]`. En attente de retours de test, d'un commit/push ou du passage au dossier suivant (`4-Wander/`).
- **Points d'attention / bugs connus** :
  - Aucun bug connu ; prêt pour test utilisateur dans le navigateur (`3-Arrival/index.html`).

### Passation #23 — 2026-11-24
- **Assistant sortant** : Gemini
- **Travail effectué** :
  - Implémentation de la **tâche 5** dans `3-Arrival/` (1 classe/fichier, toutes `extends Vehicle`) :
    - `3-Arrival/gridShaderLayer.js` & `sketch.js` : opacité de la grille passée à **`100%` (`1.0`)** par défaut.
    - `3-Arrival/cockroachLeader.js` (`class CockroachLeader extends Vehicle`) : patrouille autonome (`wander()`), orientation de la formation basée uniquement sur le vecteur de déplacement entre deux frames (`moveDirectionAngle`, jamais `heading` seul), zone d'exclusion frontale (`frontZoneDistance = 85`, `frontZoneRadius = 75`, visible en mode debug), arrêt périodique toutes les `5..10` s pour donner l'ordre de tir.
    - `3-Arrival/cockroachSoldier.js` (`class CockroachSoldier extends Vehicle`) : formation **4×4** derrière le leader (`arrive` sur son slot), arrêt complet quand le leader s'arrête (`leader.isHalted`), fuite prioritaire (`flee`) s'il se trouve dans la zone d'exclusion devant le leader (*Leader Following*).
    - `3-Arrival/gridShaderLayer.js` : déformation de la grille également par les cafards (`cockroachLeader`, `cockroachSoldiers`) et leurs missiles (`cockroachMissiles`), portée à 64 points max.
    - `3-Arrival/texteAnime.js` & `sketch.js` : affichage de `"Niveau N"` pendant 2 s puis mutation vers `longueur / objectif` avec naissance des nouveaux points depuis les fragments existants (aucun point venant des bords de l'écran).
    - `3-Arrival/cockroachMissile.js` (`class CockroachMissile extends Vehicle`) & `3-Arrival/ringHitEffect.js` (`class RingHitEffect extends Vehicle`) : missiles en `seek` vers les anneaux du serpent (durée de vie max `1,5` s) ; perte de l'anneau + mini animation à l'impact sur un anneau, mort du serpent si un missile touche la tête.
    - `3-Arrival/snake.js` (`removeRingAt()`) & `3-Arrival/sketch.js` : rééquilibrage (`Food` = `+3` anneaux, cafards = `+1` anneau), promotion d'un soldat en leader si le leader est mangé, réapparition des cafards mangés après `5` s à une position aléatoire (`arrive` vers leur slot 4×4), fuite (`flee`) des cafards à l'approche du serpent (`60` px par défaut, réglable par curseur, à vitesse inchangée) et objectif des niveaux basé sur la **longueur du serpent** (`goalLength`).
  - Passage de la tâche 5 à `[DONE]` dans `3-Arrival/3-specification.md`, vérification syntaxique (`node --check`) et mise à jour de `README.md`.
- **Fichiers créés / modifiés** :
  - `3-Arrival/cockroachLeader.js` (nouveau)
  - `3-Arrival/cockroachSoldier.js` (nouveau)
  - `3-Arrival/cockroachMissile.js` (nouveau)
  - `3-Arrival/ringHitEffect.js` (nouveau)
  - `3-Arrival/gridShaderLayer.js`
  - `3-Arrival/snake.js`
  - `3-Arrival/sketch.js`
  - `3-Arrival/index.html`
  - `3-Arrival/3-specification.md`
  - `README.md`
  - `HANDOFF.md`
- **Prochaines étapes** :
  - Toutes les tâches de `3-Arrival/3-specification.md` (Tâches 1 à 5) sont `[DONE]`. En attente de retours de test, d'un commit/push ou du passage au dossier suivant (`4-Wander/`).
- **Points d'attention / bugs connus** :
  - Aucun bug connu ; prêt pour test utilisateur dans le navigateur (`3-Arrival/index.html`).

### Passation #24 — 2026-11-24
- **Assistant sortant** : Gemini
- **Travail effectué** :
  - Implémentation canonique du comportement **Wander** (Craig Reynolds, GDC 1999) dans `4-Wander/` :
    - `4-Wander/vehicle.js` : `wander()` projette le cercle de rayon `wanderRadius` à `distanceCercle` devant le vaisseau, calcule le point sur la circonférence avec perturbation `displaceRange` sur `wanderTheta`, et retourne directement le vecteur `pointSurLeCercle - pos` borné par `maxForce` (appliqué par `applyBehaviors()` → `applyForce()` → `update()`).
    - Mode debug complet (`drawWanderDebug()`, `Vehicle.debug === true`) : ligne pointillée de distance, cercle de wander blanc, centre rouge, rayon interne, point cible vert, vecteur direction jaune, vecteur vitesse cyan et flèche de force de steering orange.
    - `4-Wander/sketch.js` & `style.css` : panneau UI repliable en haut à droite avec curseurs `Nombre de vaisseaux` (`1..100`), `Vitesse Max`, `Force Max`, `Rayon Wander`, `Distance Wander`, `Amplitude angle`, `Longueur traînée` et checkbox `Mode Debug (touche D)` synchronisée avec `d`/`D`.
    - Rédaction de `4-Wander/4-specification.md`.
  - Vérification syntaxique (`node --check`) et mise à jour de `README.md`.
- **Fichiers créés / modifiés** :
  - `4-Wander/4-specification.md` (nouveau)
  - `4-Wander/vehicle.js`
  - `4-Wander/sketch.js`
  - `4-Wander/style.css`
  - `README.md`
  - `HANDOFF.md`
- **Prochaines étapes** :
  - Tester `4-Wander/index.html` (notamment en mode debug avec la touche `D`), ou ajouter de nouvelles tâches dans `4-Wander/`.
- **Points d'attention / bugs connus** :
  - Aucun bug connu ; prêt pour test utilisateur dans le navigateur (`4-Wander/index.html`).
