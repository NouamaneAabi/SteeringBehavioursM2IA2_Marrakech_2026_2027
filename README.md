# Steering Behaviors — Applications p5.js (M2 IA2 Marrakech 2026–2027)

Ensemble d'applications et d'exercices interactifs en **p5.js** mettant en œuvre les **Steering Behaviors** de **Craig W. Reynolds** (*Steering Behaviors For Autonomous Characters*, GDC 1999).

---

## Documentation du projet

- [ARCHITECTURE.md](./ARCHITECTURE.md) — Principes d'architecture (`Vehicle`, héritage, 1 classe/fichier, catalogue des comportements de Craig Reynolds)
- [P5JS_BEST_PRACTICES.md](./P5JS_BEST_PRACTICES.md) — Bonnes pratiques de codage et d'optimisation p5.js
- [HANDOFF.md](./HANDOFF.md) — Journal de passation entre assistants IA et checklist de reprise
- Instructions IA : [CLAUDE.md](./CLAUDE.md) · [AGENTS.md](./AGENTS.md) · [GEMINI.md](./GEMINI.md) · [.github/copilot-instructions.md](./.github/copilot-instructions.md)

---

## Règles clés de développement

1. **Une classe maximum par fichier** (sauf classe interne).
2. **Tout élément graphique animé (ou potentiellement mobile) est un `Vehicle`** (`vehicle.js`) ou une **sous-classe de `Vehicle`** (`class Foo extends Vehicle`) et se déplace via les steering behaviors (`applyForce` + `update`).
3. **Même les éléments fixes susceptibles de se déplacer** (obstacles, cibles, bonus, etc.) héritent de `Vehicle`.
4. **Mise à jour continue** : ce `README.md` doit être mis à jour automatiquement à chaque ajout, modification ou suppression de sketch ou de classe (par l'assistant IA ou via `./scripts/update-readme.sh`).

---

## Inventaire des sketches et modules

<!-- AUTO-GENERATED:SKETCHES:START -->
| Dossier | Description | Fichiers principaux |
| --- | --- | --- |
| `1-Seek/` | Comportement de base **Seek** & **Flee** vers une cible | `sketch.js`, `soundEngine.js`, `target.js`, `targetFragment.js`, `test.js`, `vehicle.js` |
| `2-PursueEvade/` | Comportements **Pursuit** & **Evasion** avec cible mobile | `attackerPlane.js`, `battlePlane.js`, `bouncingBall.js`, `explosionParticle.js`, `flare.js`, `missile.js`, `plane.js`, `sketch.js`, `smokePuff.js`, `target.js`, `targetPlane.js`, `vehicle.js` |
| `2-PursueEvade_correction/` | Correction de **Pursuit** & **Evasion** | `bouncingBall.js`, `sketch.js`, `target.js`, `vehicle.js` |
| `3-Arrival/` | Comportement **Arrival** avec zone de freinage | `cockroachLeader.js`, `cockroachMissile.js`, `cockroachSoldier.js`, `food.js`, `gridShaderLayer.js`, `ringHitEffect.js`, `sketch.js`, `snake.js`, `snakeHead.js`, `snakeRing.js`, `snakeShaderTexture.js`, `textFragment.js`, `texteAnime.js`, `vehicle.js` |
| `3-Arrival_correction/` | Correction **Arrival** + démonstrations `Snake` / `SnakeWander` | `sketch.js`, `snake.js`, `snakeWander.js`, `vehicle.js` |
| `4-Wander/` | Comportement **Wander** avec traînée et sprite | `sketch.js`, `vehicle.js` |
<!-- AUTO-GENERATED:SKETCHES:END -->

---

## Lancer un sketch en local

Ouvrir le dossier du sketch souhaité avec l'extension **Live Server** de VS Code, ou démarrer un serveur HTTP local à la racine du dépôt :

```bash
python3 -m http.server 8000
```

Puis ouvrir `http://localhost:8000/1-Seek/` (ou le dossier de votre choix) dans le navigateur.

---

## Journal des évolutions récentes

<!-- AUTO-GENERATED:CHANGELOG:START -->
- **2026-11-24** : Implémentation canonique de **Wander** (Craig Reynolds GDC 1999) dans `4-Wander` (`4-specification.md`) : pipeline `applyBehaviors()` → `applyForce()` → `update()`, visualisation debug complète (cercle, distance, rayon, point cible, direction désirée, force de steering, vitesse) et panneau de contrôle repliable.
- **2026-11-24** : Implémentation de la **tâche 5** de `3-Arrival` : escadron de cafards mangeables (`CockroachLeader` + `CockroachSoldier` en formation 4×4 avec zone d'exclusion devant le leader), tir périodique de missiles (`CockroachMissile` en `seek` sur les anneaux du serpent, `RingHitEffect` et perte d'anneau ou mort à la tête), objectif de longueur par niveau et opacité de la grille à `100%`.
- **2026-11-24** : Implémentation de la **tâche 4** de `3-Arrival` : tête du serpent expressive (`SnakeHead` avec yeux suivant la souris + langue fourchue animée), classe `Food` (`extends Vehicle`, nourriture flottante allongeant le serpent à l'impact) et système de niveaux chronométrés (`"Niveau N"` au centre, couleur de grille par niveau, objectif croissant et HUD).
- **2026-11-24** : Implémentation de la **tâche 3** de `3-Arrival` : shaders GLSL animés sur le corps du serpent (`SnakeShaderTexture` : Écailles animées, Plasma néon, Ondes cyber, Lave / Magma) avec UI de paramètres générée dynamiquement selon le shader choisi, et grille déformable semi-transparente en fond d'écran (`GridShaderLayer`) réagissant au passage du serpent.
- **2026-11-24** : Ajout de la répulsion dans `3-Arrival` (`Vehicle.flee` + `TextFragment`) : les points du texte fuient la souris, la tête et les anneaux du serpent dans un rayon de `100` px, puis reviennent en `arrive` dès que la zone est libre.
- **2026-11-24** : Implémentation de la **tâche 2** de `3-Arrival` : classes `TexteAnime` et `TextFragment` (`extends Vehicle`, 1 classe/fichier) générant `"Marrakech EMSI"` via `textToPoints()` avec choix de police (`Inconsolata`, `Arial Bold`, `Courier New Bold`, `Chalkduster`) et champ de saisie du texte dans la UI.
- **2026-11-24** : Enrichissement de `3-Arrival/snake.js` : enveloppe lisse semi-transparente reliant les cercles pour former le corps du serpent (`quadraticCurveTo`) avec texture procédurale d'écailles pré-calculée hors écran.
- **2026-11-24** : Implémentation de la **tâche 1** de `3-Arrival` (`3-specification.md`) : classes `Snake`, `SnakeHead` et `SnakeRing` (`extends Vehicle`, 1 classe/fichier), suivi de la souris avec `arrive`, rayon dégressif, lignes semi-transparentes, curseurs (nombre d'anneaux = `30` par défaut, vitesse/accélération tête et anneaux pour l'effet élastique) et mode debug (`D`).
- **2026-11-24** : Implémentation de la **tâche 7** de `2-PursueEvade` (Scénario 1) : contre-mesures `Flare` (`extends Vehicle`, cercles jaunes flottants, durée de vie `3` s), stock de `100` flares lâchés par 10 avec virage brutal + accélération de `0,5` s, label du stock sous l'avion et redirection des missiles vers le flare le plus proche.
- **2026-11-24** : Implémentation de la **tâche 6** de `2-PursueEvade` : menu déroulant de scénarios (`Scénario 1 : Attaquants vs Cibles` et `Scénario 2 : Battle Royale`), classe `BattlePlane extends Plane` (à la fois attaquant et cible, élimination sans réapparition, détection du vainqueur unique avec bandeau et halo doré).
- **2026-11-24** : Ajout dans `2-PursueEvade` d'une animation distincte de dissipation en fumée (`SmokePuff extends Vehicle`) lorsqu'un missile expire de lui-même (vs explosion de feu `ExplosionParticle` à l'impact) et d'un curseur `Missiles max / attaquant` (`2` par défaut).
- **2026-11-24** : Implémentation de la **tâche 5** de `2-PursueEvade` : cercle de détection des missiles (`150` px par défaut, debug) sur `TargetPlane`, fuite boostée (`flee`) avec barre d'endurance (2 s fuite / 1 s régénération), retour aux valeurs de base et 4 curseurs dédiés dans la UI.
- **2026-11-24** : Implémentation de la **tâche 4** de `2-PursueEvade` : durée de vie max des missiles (`5` s par défaut, réglable par curseur), ajout de `evadePerfect()` dans `Vehicle`, clignotement vert/rouge des avions cibles après `1` s de lock et bascule vers `evadePerfect`.
- **2026-11-24** : Implémentation de la **tâche 3** de `2-PursueEvade` : gestion de plusieurs avions attaquants et plusieurs avions cibles réglables par curseurs (`1` et `1` par défaut), coordination multi-verrous sur `TargetPlane`, et réapparition 1 pour 1 à la mort d'une cible.
- **2026-11-24** : Implémentation de la **tâche 2** de `2-PursueEvade` : ajustements tâche 1 (rayon de détection `400` px par défaut, arrêt de `seek` dès la sortie du cercle), tir de `Missile` (`extends Vehicle`) 1 s après le lock avec `pursuePerfect` et visualisation du point d'interception, curseur de vitesse missile (`×2` par défaut) et explosion (`ExplosionParticle extends Vehicle`) à l'impact.
- **2026-11-24** : Spécification complète de `2-PursueEvade` (`2-specification.md`, Tâches 1 à 4) et implémentation de la **tâche 1** : `Plane`, `AttackerPlane` et `TargetPlane` (sous-classes de `Vehicle`), radar de détection (`300` px), lock rouge / délock vert après `5` s, mode debug (`D` + checkbox) et panneau UI repliable en haut à droite.
- **2026-11-23** : Implémentation de la tâche 7 de `1-Seek` : moteur audio natif Web Audio (`SoundEngine`) avec spatialisation stéréo G/D (`StereoPannerNode`), explosion/agonie à la mort d'une cible, pulsation grave périodique s'accélérant quand le nombre de cibles diminue, curseur `Volume` et bouton `Musique / Sons ON/OFF`.
- **2026-11-23** : Ajout des vagues progressives dans `1-Seek` : lorsque toutes les cibles sont éliminées, recréation automatique du nombre défini par le curseur avec vitesse max (`+15 %`/vague) et accélération (`+10 %`/vague) renforcées, et affichage du numéro de vague dans le HUD.
- **2026-11-23** : Ajout de l'éclatement en 8 parts de camembert (`TargetFragment extends Vehicle`, animation 0,3 s) dans `1-Seek` : dans le scénario 3, une cible touchée éclate et meurt définitivement sans réapparaître.
- **2026-11-23** : Implémentation de la tâche 6 de `1-Seek` : endurance des cibles (2 s de fuite / 1 s de régénération + barre visuelle), points de vie initiaux (`5..10` affichés au centre, `-1` par contact, mort à `0`), boost ×3 des vaisseaux en poursuite et compteur de cibles en haut à droite.
- **2026-11-23** : Implémentation de la tâche 5 de `1-Seek` : menu déroulant de scénarios (1 : souris, 2 : patrouille aléatoire 4 s + chasse aux cibles, 3 : fuite temporaire des cibles), cercle de détection des cibles (`100` px, debug) et boost de `maxSpeed`/`maxForce` jusqu'à `300` px avec curseurs dédiés.
- **2026-11-23** : Implémentation de la tâche 4 de `1-Seek` : cercle de détection des vaisseaux (`150` px, curseur `20..200`, visible en debug), `seek` vers la cible la plus proche, réapparition aléatoire au contact (`< 5` px) et nombre de cibles par défaut passé à `1`.
- **2026-11-23** : Implémentation de la tâche 3 de `1-Seek` : cibles mobiles (`Target` héritant de `Vehicle`) avec vitesse aléatoire dans `[-7, 7]`, couleur claire, rayon `10..100`, rebond sur les bords et curseur `Nombre de cibles` (`0..20`).
- **2026-11-23** : Implémentation de la tâche 2 de `1-Seek` : dégradé radial arc-en-ciel animé suivant la souris et ses 5 curseurs de paramétrage (rayon, vitesse d'animation, opacité, nombre d'anneaux, décalage des couleurs).
- **2026-11-23** : Implémentation de la tâche 1 de `1-Seek` : panneau de contrôle repliable, paramètres multi-vaisseaux et mode debug synchronisé avec la touche `D`.
- **2026-11-23** : Mise en place de l'architecture complète (`ARCHITECTURE.md`, `P5JS_BEST_PRACTICES.md`, `HANDOFF.md`), des fichiers d'instructions IA (`CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `.github/copilot-instructions.md`) et du script de mise à jour `scripts/update-readme.sh`.
<!-- AUTO-GENERATED:CHANGELOG:END -->
