# HANDOFF

## Ã‰tat du projet

Le dÃ©pÃ´t contient six dÃ©monstrations p5.js autour de Seek, Pursue/Evade, Arrival et Wander. Les bibliothÃ¨ques p5.js sont embarquÃ©es dans chaque exemple. Les exemples historiques utilisent encore `vehicle.js` et `Vehicle`; les nouvelles applications doivent utiliser `Vehicule.js` et `Vehicule`.

## DÃ©cisions prises

- Une classe maximum par fichier, sauf classe interne nÃ©cessaire.
- Tout Ã©lÃ©ment animÃ© ou potentiellement mobile est un `Vehicule` ou une sous-classe.
- Les objets spÃ©cialisÃ©s hÃ©ritent de `Vehicule`.
- Les comportements de Reynolds sont des calculs de forces sÃ©parÃ©s de l'intÃ©gration et du rendu.
- Le README possÃ¨de une section gÃ©nÃ©rÃ©e par `scripts/update-readme.ps1`.
- Les pages de rÃ©fÃ©rence Reynolds et p5.js ont Ã©tÃ© tÃ©lÃ©chargÃ©es dans `article_craig_reynolds/`.

## Prochaine Ã©tape recommandÃ©e

CrÃ©er une classe canonique `Vehicule.js` rÃ©utilisable, puis migrer progressivement les nouveaux exemples vers cette base. Ajouter ensuite des dÃ©monstrations isolÃ©es pour Obstacle Avoidance, Flocking et Path Following, chacune avec son propre objectif pÃ©dagogique.

## ProcÃ©dure de reprise

1. Lire [ARCHITECTURE.md](./ARCHITECTURE.md), [docs/p5-coding-guidelines.md](./docs/p5-coding-guidelines.md) et ce fichier.
2. Inspecter l'application ciblÃ©e et lancer sa page avec un serveur statique.
3. DÃ©crire le comportement Reynolds visÃ© et les paramÃ¨tres avant de modifier le code.
4. ImplÃ©menter une classe par fichier et garder `sketch.js` comme orchestrateur.
5. Tester visuellement, vÃ©rifier la console, exÃ©cuter `scripts/update-readme.ps1`, puis consigner le rÃ©sultat ici.

## Journal

### 2026-11-23

- Cadre d'architecture et conventions p5.js crÃ©Ã©s.
- Instructions ajoutÃ©es pour AGENTS, Claude, Codex, Gemini et GitHub Copilot.
- RÃ©fÃ©rences locales Reynolds et p5.js tÃ©lÃ©chargÃ©es.
- Aucun comportement existant n'a Ã©tÃ© modifiÃ©.

### 2026-11-23 â€” SpÃ©cification 1 implÃ©mentÃ©e

- L'exemple `1-Seek` accepte de 1 Ã  200 vÃ©hicules via un curseur.
- Les curseurs de vitesse maximale et d'accÃ©lÃ©ration maximale pilotent `maxSpeed` et `maxForce` de tous les vÃ©hicules.
- Les contrÃ´les sont regroupÃ©s dans une zone supÃ©rieure semi-transparente et repliable.
- La touche `D` et la checkbox activent le mÃªme Ã©tat de debug ; les vecteurs de vitesse rouges sont visibles uniquement dans cet Ã©tat.
- Un dÃ©gradÃ© radial arc-en-ciel suit la souris. Son rayon, sa vitesse de couleur, sa saturation et son opacitÃ© sont rÃ©glables.
- La spÃ©cification est archivÃ©e dans `1-Specification.md`.
- Validation navigateur Ã  effectuer ensuite sur `1-Seek/index.html`.

### 2026-11-23 â€” Correction avant validation

- Correction du callback du curseur de nombre de vaisseaux afin de cibler le libellÃ© de valeur situÃ© dans `controls.count`.

### 2026-11-23 â€” Validation navigateur

- `1-Seek/index.html` se charge dans le navigateur avec le canvas p5 et la zone de contrÃ´les.
- L'accordÃ©on masque et affiche correctement les contrÃ´les.
- La touche `D` active la checkbox de debug ; l'Ã©tat de la checkbox est donc synchronisÃ© avec le raccourci.
- Les curseurs vÃ©rifiÃ©s dans le DOM ont les bornes et pas attendus : nombre `1â€“200 / 1`, vitesse `0â€“20 / 0.01`, accÃ©lÃ©ration `0â€“10 / 0.01`.
- Les curseurs supplÃ©mentaires du dÃ©gradÃ© sont prÃ©sents : rayon, vitesse des couleurs, saturation et opacitÃ©.

### 2026-11-23 â€” Test guidÃ© supplÃ©mentaire

- Test navigateur rejouÃ© depuis `1-Seek/index.html`.
- Le canvas est prÃ©sent et les 7 curseurs sont chargÃ©s.
- Le curseur du nombre de vaisseaux atteint bien les valeurs `1` et `200` avec les touches `Home` et `End`.
- La touche `D` dÃ©sactive correctement le debug et la checkbox revient Ã  l'Ã©tat dÃ©cochÃ©.

### 2026-11-23 â€” Extension mini-jeu

- `1-Seek` devient une mission jouable : guider la flotte vers 18 cristaux avec la balise souris.
- Ajout d'un score, d'un combo, d'un HUD et d'un respawn des cristaux aprÃ¨s collecte.
- Ajout d'un boost temporaire avec `ESPACE`, d'une pause avec `P` et d'une remise Ã  zÃ©ro avec `R`.
- Ajout de la classe `Pickup` dans `1-Seek/pickup.js`, sous-classe de `Vehicle` conformÃ©ment Ã  l'architecture.
- Ajout d'un rendu plus stylÃ© : halo des vaisseaux, balise animÃ©e, cristaux colorÃ©s et HUD futuriste.

### 2026-11-23 â€” Validation mini-jeu

- La page recharge correctement avec le canvas, 7 curseurs, le HUD, 20 vaisseaux et 18 cristaux.
- La classe `Pickup` est chargÃ©e dans le navigateur.
- `P` active puis dÃ©sactive la pause.
- `R` remet le score Ã  zÃ©ro et recrÃ©e la flotte et les cristaux.

### 2026-11-23 â€” Test de collecte

- Un vaisseau placÃ© sur un cristal dÃ©clenche bien la collecte : le score et le combo augmentent.
- La partie a ensuite Ã©tÃ© remise dans son Ã©tat initial avec `R` : score `00000`, combo `x1`, flotte `20/20`.

### 2026-11-23 â€” ScÃ©narios Seek, Wander et Flee

- Ajout d'un menu dÃ©roulant avec trois scÃ©narios dans `1-Seek/sketch.js`.
- ScÃ©nario 1 : comportement Seek vers la balise souris, comportement historique conservÃ©.
- ScÃ©nario 2 : chaque vaisseau explore avec une direction renouvelÃ©e toutes les 4 secondes, puis poursuit le cristal le plus proche dans un rayon de 230 pixels.
- ScÃ©nario 3 : les cristaux appliquent `Flee` envers le vaisseau le plus proche dans un rayon de 220 pixels et se dÃ©placent rÃ©ellement.
- `Pickup.move()` rÃ©utilise l'intÃ©gration de `Vehicle`, conformÃ©ment Ã  la rÃ¨gle des entitÃ©s graphiques basÃ©es sur un vÃ©hicule.

### 2026-11-23 â€” Validation des scÃ©narios

- Le menu expose bien les trois options : suivre la souris, explorer puis poursuivre, cibles en fuite.
- La sÃ©lection bascule correctement sur les Ã©tats internes `scenario = 2` et `scenario = 3`.
- Le scÃ©nario 2 initialise une minuterie de changement de direction sur les vaisseaux.
- Le scÃ©nario 3 conserve les 18 instances `Pickup` et leur logique de fuite.
- La page a Ã©tÃ© remise au scÃ©nario 1 avec `R` : score `00000`, combo `x1`.

### 2026-11-23 â€” Direction visuelle renforcÃ©e

- Ajout de 110 Ã©toiles animÃ©es dans `1-Seek/particle.js`.
- Ajout de particules d'impact lors de chaque collecte.
- Ajout d'un halo et d'une flamme plus visibles pendant le boost.
- Ajout d'une barre de progression, d'un badge de scÃ©nario et d'une notification de score dans le HUD.
- Ajout d'un vignettage pour renforcer la profondeur de l'Ã©cran.

### 2026-11-23 â€” Validation affichage et feedback

- Le navigateur charge le canvas, `Particle`, 110 Ã©toiles, 18 cristaux, la barre de progression et la notification de score.
- Une collecte testÃ©e produit bien un score, un combo et des particules d'impact.

### 2026-11-24 â€” Snake Arrival

- Travail dÃ©placÃ© vers `3-Arrival` comme demandÃ©.
- Ajout de `Snake`, sous-classe de `Vehicle`, qui orchestre la tÃªte et les anneaux.
- Ajout de `SnakeHead`, sous-classe de `Vehicle`, avec le comportement `Arrival` vers la souris.
- Ajout de `SnakeRing`, sous-classe de `Vehicle`, chaque anneau suivant un point derriÃ¨re son leader.
- Le premier anneau suit la tÃªte ; les suivants suivent l'anneau prÃ©cÃ©dent.
- Le nombre d'anneaux est rÃ©glable de 1 Ã  100, avec 30 par dÃ©faut.
- Ajout de `3-Arrival/3-Specification.md` avec les tÃ¢ches du scÃ©nario Snake et les prochaines Ã©volutions.
- Ajout d'un HUD, d'un fond spatial avec grille, d'une cible lumineuse, d'une tÃªte expressive et d'anneaux nÃ©on.
- Validation navigateur Ã  effectuer sur `3-Arrival/index.html`.

### 2026-11-24 â€” Validation Snake

- `3-Arrival/index.html` charge correctement le canvas, le HUD et les trois classes du serpent.
- Le curseur reconstruit correctement le serpent avec 1, 30 et 100 anneaux.
- La tÃªte et les anneaux sont bien des instances de sous-classes de `Vehicle`.
- La touche `D` active et dÃ©sactive `Vehicle.debug` ainsi que la checkbox synchronisÃ©e.
- La dÃ©monstration a Ã©tÃ© remise Ã  sa valeur par dÃ©faut : 30 anneaux.

### 2026-11-24 â€” Snake clean

- Remplacement du suivi direct instable par une trajectoire mÃ©morisÃ©e de la tÃªte.
- Chaque anneau vise maintenant un point rÃ©gulier de cette trajectoire, situÃ© derriÃ¨re le point prÃ©cÃ©dent.
- Suppression du rebond circulaire des anneaux et ajout de limites propres Ã  l'Ã©cran pour Ã©viter les sauts de trajectoire.
- Correction douce de la position aprÃ¨s l'intÃ©gration afin de prÃ©server un espacement visuel constant.
- Mesure navigateur aprÃ¨s 900 ms : espacement entre Ã©lÃ©ments compris entre environ 17 et 24 pixels, pour une distance cible de 23 pixels.

### 2026-11-24 â€” RÃ©alisme du serpent

- Ajout d'une ondulation latÃ©rale progressive basÃ©e sur la tangente de la trajectoire mÃ©morisÃ©e.
- Ajout de curseurs pour l'amplitude et la frÃ©quence de l'ondulation.
- Remplacement de la tÃªte triangulaire par une tÃªte de serpent avec forme organique, yeux et langue fourchue animÃ©e.
- Rendu des anneaux avec textures, variations de taille et corps qui se rÃ©trÃ©cit vers la queue.
- SpÃ©cification enrichie dans `3-Arrival/3-Specification.md`.
- Validation navigateur Ã  effectuer aprÃ¨s rechargement.

### 2026-11-24 â€” Validation rÃ©alisme

- Les curseurs `Anneaux`, `Ondulation` et `FrÃ©quence` sont prÃ©sents dans le navigateur.
- `Snake`, `SnakeHead` et `SnakeRing` se chargent correctement.
- AprÃ¨s 900 ms d'animation, les distances entre Ã©lÃ©ments restent comprises entre environ 19 et 25 pixels pour une cible de 23 pixels.
- L'amplitude active est 7 et la frÃ©quence active est 0.09.

### 2026-11-24 â€” Croissance et obstacles

- Le serpent commence maintenant avec 8 anneaux au lieu de 30.
- Ajout de `Food`, sous-classe de `Vehicle` : chaque cristal mangÃ© ajoute 2 anneaux et augmente le score.
- Ajout de `Obstacle`, sous-classe de `Vehicle`, avec rendu de rocher stylisÃ©.
- Ajout d'un Ã©vitement anticipÃ© de la tÃªte autour des obstacles.
- Une collision de n'importe quel anneau ou de la tÃªte dÃ©clenche une fin de partie.
- Ajout de la touche `R` pour recommencer avec 8 anneaux et un score nul.
- SpÃ©cification mise Ã  jour avec la tÃ¢che de croissance et d'Ã©vitement.

### 2026-11-24 â€” Correction affichage initial

- Correction du HUD pour afficher 8 anneaux au dÃ©marrage, comme le serpent rÃ©el.

### 2026-11-24 â€” SÃ©curitÃ© du dÃ©part

- Les cristaux sont maintenant placÃ©s Ã  plus de 140 pixels de la tÃªte au dÃ©marrage et aprÃ¨s chaque respawn.
- Le serpent commence donc toujours visiblement avec ses 8 anneaux avant la premiÃ¨re collecte.

### 2026-11-24 â€” Validation croissance et obstacles

- Au premier affichage, le serpent dÃ©marre avec 8 anneaux, 7 cristaux et 5 obstacles.
- Une collision avec une nourriture testÃ©e ajoute bien 2 anneaux et augmente le score.
- Une collision forcÃ©e avec un obstacle active bien `gameOver`.
- La remise Ã  zÃ©ro restaure 8 anneaux, un score nul et une partie active.

### 2026-11-24 — Croissance lissée et prédateur

- Suppression complète des obstacles dans 3-Arrival : classe, chargement, dessin et collisions retirés.
- La nourriture demande maintenant une croissance progressive : un anneau est ajouté toutes les quelques images jusqu’à atteindre la cible.
- Ajout de Predator.js, une sous-classe de Vehicle utilisant une poursuite prédictive temporaire.
- Le prédateur apparaît après un délai, suit le serpent quelques secondes, puis disparaît ; R réinitialise aussi le cycle.

### 2026-11-24 — Correctif de croissance

- Ajout du traitement d’animation dans Snake.update : la cible de croissance est transformée en anneaux progressivement, avec un intervalle de cinq images.
- Vérification navigateur : démarrage avec 8 anneaux, 7 cristaux, classe Obstacle absente et classe Predator chargée.

### 2026-11-24 — Validation finale

- Le navigateur démarre avec 8 anneaux, 7 cristaux, sans obstacle et sans prédateur initial.
- La croissance progressive a été observée pendant le déplacement et le score augmente avec les cristaux.
- Le prédateur peut être créé par le cycle prévu et possède une durée de vie d’environ 9 secondes.
- La touche R restaure 8 anneaux, un score nul et supprime le prédateur.

### 2026-11-24 — Étape 1 : architecture et états

- Encodage corrigé avec meta UTF-8 et réécriture des textes accentués.
- Ajout de config.js pour les difficultés et Game.js pour l’état menu/partie/pause/game over/victoire.
- Ajout d’un écran titre avec bouton Jouer, sélection de difficulté, meilleur score local et commandes.
- Ajout des raccourcis P/Échap pour pause/menu, R pour rejouer et Entrée pour démarrer.
- Panneau de réglages responsive corrigé avec grille adaptable pour éviter les chevauchements.
- sketch.js réorganisé autour des états de jeu, avec resize responsive conservé.

### 2026-11-24 — Correctif curseurs étape 1

- Correction de la lecture des curseurs Ondulation et Fréquence après la réorganisation de l’interface.
- Le premier test du bouton Jouer avait détecté une erreur JavaScript ; le correctif utilise explicitement slider.value().

### 2026-11-24 — Validation de l’étape 1

- Le navigateur affiche maintenant l’écran titre en français avec les accents corrects.
- Le bouton Jouer démarre la partie sans erreur.
- P met la partie en pause et P la reprend.
- Un état game over masque le HUD, et Échap revient au menu.
- Les curseurs restent lisibles dans le panneau responsive.
- Le meilleur score est écrit dans localStorage via Game.js.

### 2026-11-24 — Étape 2 : difficultés, prédateurs et obstacles

- DIFFICULTY contient maintenant vitesse/force, détection, délai et durée des cristaux, rayon Arrival, obstacles, vies et progression.
- WEIGHTS centralise les poids Pursue, Wander, Separation, obstacle avoidance et boundary avoidance.
- WORLD centralise les constantes de génération, dégâts, boue et progression.
- Ajout de Obstacle.js avec rochers irréguliers non superposés et génération éloignée du serpent.
- Predator.js gère Hunter, Patroller et Ambusher avec Pursue, Wander, Separation, récupération et évitement.
- Le contact prédateur retire un anneau et active une invincibilité temporaire.
- Snake applique l’évitement d’obstacles et des bordures ; le mode D affiche les vecteurs, la prédiction, la détection et les zones d’évitement.
- La progression toutes les 30 secondes augmente le multiplicateur plafonné et affiche NIVEAU +N.
- Une zone de boue ralentit temporairement la tête.

### 2026-11-24 — Ajustement génération des rochers

- Réduction de la marge d’espacement à 45 pixels pour permettre de placer le nombre d’obstacles configuré sur les écrans courants tout en conservant l’absence de chevauchement.

### 2026-11-24 — Paramètres actifs de difficulté

- Les vies de difficulté sont maintenant consommées à chaque contact avec un prédateur, avec perte d’un anneau et invincibilité temporaire.
- Les cristaux utilisent leur durée de vie configurée et réapparaissent après expiration.
- La zone de boue est créée à chaque partie et applique son ralentissement au serpent.
- Le fichier Food.js a été nettoyé après l’ajout de la durée de vie pour éviter toute duplication.

### 2026-11-24 — Validation finale étape 2

- Cauchemar validé : 9 rochers, 4 prédateurs, types Hunter/Patroller/Ambusher, zone de boue et 1 vie.
- Après quelques frames, les forces d’évitement et la position prédite Pursue sont présentes.
- La durée de vie des cristaux suit bien la difficulté Cauchemar : 8000 ms.
- Le contact prédateur déclenche bien la perte d’anneau et le game over lorsque la vie configurée est épuisée.

### 2026-11-24 — Étape 2.5 : style et fiabilisation en cours

- Ajout de PALETTE et SNAKE_STYLE dans config.js.
- Rochers réduits à 14–28 px avant adaptation proportionnelle à la taille du canvas.
- Distance d’évitement recalée avec obstacle.r et une marge dédiée.
- Rendu des anneaux remplacé par un dégradé tête vers queue, écailles en losange/arcs, contour néon et pulse de croissance.
- Tête enrichie avec squash/stretch, yeux orientés vers la cible, halo et langue fourchue animée.
- Correction de la vitesse de base de la boue et suppression des variables predator/nextPredatorAt devenues mortes.
- Predator conserve désormais baseMaxSpeed et calcule sa vitesse de burst sans dérive cumulative.

### 2026-11-24 — Validation finale étape 2.5

- Écran titre rechargé : le bouton JOUER est visible et lance bien la partie.
- Facile testé pendant 30 secondes : 3 obstacles et 1 prédateur.
- Normal testé pendant 30 secondes : 5 obstacles et 2 prédateurs, la partie reste active pendant le test.
- Difficile testé pendant 30 secondes : 7 obstacles et 3 prédateurs.
- Cauchemar testé pendant 30 secondes : 9 obstacles et 4 prédateurs.
- Les sessions difficiles peuvent naturellement terminer en game over avant la fin des 30 secondes ; le canvas et la boucle de rendu continuent sans erreur.
- Debug activé et vérifié : avoidanceForce et predictedPosition sont disponibles.
- Les rayons observés des rochers sont maintenant nettement réduits et adaptés au canvas.
- Aucun doublon de createObstacles, updatePredators ou variable predator singulière restante.


## OpÃ©ration â€” Ã‰tape 3 : intÃ©gration cristaux spÃ©ciaux, power-ups et combo
- Date : 2026-11-24
- Modifications : ajout de `CRYSTAL_TYPES`, `POWERUPS`, combo x1 Ã  x5, score pondÃ©rÃ© par cristal, textes flottants, barre de combo et mode Survie.
- Fichiers ajoutÃ©s/modifiÃ©s : `3-Arrival/PowerUpManager.js`, `config.js`, `Food.js`, `Predator.js`, `Snake.js`, `SnakeHead.js`, `Game.js`, `sketch.js`, `style.css`, `index.html`.
- Correction : `Snake.show(target)` transmet maintenant la cible Ã  `SnakeHead.show(targetPosition)`.
- Ã‰tat : implÃ©mentation terminÃ©e, validation navigateur en cours.

- Correction de validation : le statut HUD reÃ§oit dÃ©sormais sa propre classe, le combo utilise bien `hud.combo.elt`, et `windowResized()` protÃ¨ge la cible avant initialisation.
- Ajout dâ€™un point dâ€™inspection navigateur non visible (`window.neonSerpent`) pour valider les systÃ¨mes alÃ©atoires de lâ€™Ã©tape 3 de faÃ§on reproductible.

### Validation navigateur â€” Ã‰tape 3
- Clic rÃ©el sur `JOUER` : menu masquÃ©, partie lancÃ©e, HUD visible.
- Cristaux forcÃ©s successivement : normal +10, dorÃ© +100 avec combo x2, bleu +45 avec ralentissement actif, rouge +60 avec bouclier actif, violet +100 avec aimant actif.
- Combo vÃ©rifiÃ© : 5 collectes rapides donnent `comboCount=5` et `comboMultiplier=5`.
- Victoire vÃ©rifiÃ©e en mode Niveaux en atteignant `targetScore`; game over vÃ©rifiÃ© par contact forcÃ© avec un prÃ©dateur et une vie restante.
- Mode Survie vÃ©rifiÃ© : la partie reste en Ã©tat `playing` mÃªme aprÃ¨s dÃ©passement de lâ€™objectif.
- Aucun nouvel Ã©vÃ©nement `pageError` sur une ouverture propre aprÃ¨s correction du HUD.
- RÃ©sultat : Ã©tape 3 fonctionnelle, en attente de validation utilisateur avant lâ€™Ã©tape 4.



## OpÃ©ration â€” Ã‰tape 3.5 : plaisir de jeu et IA prÃ©datrice
- Diagnostic mesurÃ© avant modification : en Normal, `maxSpeed=5.58` contre `5.0` pour le serpent, le code contenait `min(this.detectionRadius, 120)`, et la prÃ©diction de debug Ã©tait Ã©crasÃ©e.
- Ajouts : vitesse de croisiÃ¨re par ratio, prÃ©diction plafonnÃ©e Ã  0,5 s, Ã©tats TRAQUE/PRÃ‰PARATION/CHARGE/Ã‰PUISÃ‰/Ã‰TOURDI/FUITE, flanqueur, patrouilleur et embusquÃ© diffÃ©renciÃ©s.
- Ajouts gameplay en cours : dash Espace/clic, Ã©nergie, near-miss, mode chasseur, vagues progressives et alertes de bord.
- Fichiers modifiÃ©s : `config.js`, `Predator.js`, `Game.js`, `sketch.js`.
- Validation navigateur complÃ¨te Ã  effectuer aprÃ¨s rechargement.

- Optimisation : suppression des dÃ©gradÃ©s radiaux recrÃ©Ã©s Ã  chaque frame ; lâ€™Ã©clairage de la souris utilise dÃ©sormais un cercle translucide et la vignette est mise en cache par taille de canvas.

- Ajustement dâ€™Ã©quilibrage : vies 6/4/3/2 et ratios de croisiÃ¨re 0,78/0,88/0,92/0,95 pour Facile/Normal/Difficile/Cauchemar.
- Les vagues arrivent maintenant dÃ¨s chaque palier de 30 s ; le premier renfort est progressif et annoncÃ© Ã  lâ€™Ã©cran.
- Un near-miss rÃ©alisÃ© pendant le dash utilise le bonus `DASH.evadeBonus`.

 - Correction vague : la VAGUE 2 fait bien apparaÃ®tre le premier renfort au palier de 30 s.

### Validation finale Ã‰tape 3.5
- Mesure initiale confirmÃ©e : Normal `5,58/5,00`, anticipation fixe `120` prÃ©sente, rÃ©cupÃ©ration inutilisÃ©e pour chasseur/patrouilleur.
- AprÃ¨s correction : Normal `4,50/5,00`, ratio `0,90`, anticipation fixe absente, dash actif avec Ã©nergie `55/100` aprÃ¨s activation.
- Transitions testÃ©es : TRAQUE â†’ PRÃ‰PARATION â†’ CHARGE â†’ Ã‰PUISÃ‰ ; contact â†’ Ã‰TOURDI ; mode chasseur â†’ Ã©limination temporaire.
- Campagne rÃ©elle de 60 s par difficultÃ©, avant le dernier ajustement de vies : Facile 6 contacts, Normal 4, Difficile 3, Cauchemar 2 ; `window.onerror` a retournÃ© zÃ©ro erreur pour les quatre essais.
- Mesure de performance : `frameRate()` p5 entre 47,2 et 55,2 FPS pendant cette automatisation ; le comptage de frames de lâ€™onglet masquÃ© variait entre 22,7 et 29,2 FPS. Cette diffÃ©rence vient du plafonnement de lâ€™onglet automatisÃ© ; le seuil 60 FPS nâ€™est pas dÃ©montrÃ© par cet environnement.
- Dernier Ã©quilibrage : vies Facile/Normal/Difficile/Cauchemar = 12/6/4/2 pour rendre le mode Facile jouable deux minutes sans mouvement, tout en conservant des charges tÃ©lÃ©graphiÃ©es et Ã©vitables.

- Ajustement final : cooldown dâ€™attaque par difficultÃ© (18 s, 10 s, 7 s, 5 s) afin de limiter la rÃ©pÃ©tition des contacts en Facile.
- Correction finale : la collision respecte dÃ©sormais la rÃ©cupÃ©ration complÃ¨te du prÃ©dateur aprÃ¨s Ã©tourdissement ; cela empÃªche les contacts rÃ©pÃ©tÃ©s immÃ©diatement aprÃ¨s une charge.

### DerniÃ¨re vÃ©rification aprÃ¨s correction de rÃ©cupÃ©ration
- Partie Facile observÃ©e 20 s : 1 contact, Ã©tat `playing`, 0 erreur `window.onerror`.
- Les campagnes de 60 s prÃ©cÃ©dentes restent reportÃ©es comme mesure de rÃ©fÃ©rence ; la correction finale empÃªche les contacts rÃ©pÃ©tÃ©s pendant la rÃ©cupÃ©ration et nÃ©cessite une nouvelle campagne complÃ¨te si une mesure FPS stable hors onglet automatisÃ© est disponible.



## OpÃ©ration â€” Ã‰tape 3.6 : banc de test joueur simulÃ©
- Ajout de `3-Arrival/tests/player-bot.js`, externe au code de jeu.
- Le bot vise le cristal le plus proche, fuit sous 150 px et dÃ©clenche le dash sous 200 px aprÃ¨s une rÃ©action alÃ©atoire.
- Profils : moyen (rÃ©action 300â€“400 ms, dash 60 %) et bon (150â€“250 ms, dash 90 %).
- Ajout de compteurs de test : contacts, charges esquivÃ©es et cristaux mangÃ©s.
- Ajout de `DEBUG_HOOKS=false` par dÃ©faut ; hooks et erreurs ne sont exposÃ©s que lorsque ce flag est activÃ©.
- VisibilitÃ© : la prÃ©paration affiche maintenant une ligne de trajectoire mÃªme sans debug et intensifie la flÃ¨che dâ€™alerte pendant prÃ©paration/charge.


## Étape 3.6 — correction du bot de mesure
- Le bot externe dans 3-Arrival/tests/player-bot.js ignore maintenant les cristaux en délai d'apparition.
- Il mémorise une menace dès PREPARATION et ne déclenche le dash que pendant CHARGE après son temps de réaction.
- Il expose le compteur dashes pour les tableaux de mesure.


## Étape 3.6 — itération d'équilibrage IA
- Vies fixées à 5 / 4 / 3 / 2 pour Facile / Normal / Difficile / Cauchemar.
- Itération mesurée : Facile 0.68x vitesse de croisière et délai d'attaque 24 s ; Normal 0.80x et 10 s ; Difficile 0.90x et 5 s ; Cauchemar 0.92x et 4 s.
- Forces et rayons de détection réduits progressivement pour préserver des charges lisibles et évitables.


## Étape 3.6 — revue statique
- La recherche a confirmé une seule fonction updatePredators, une seule génération d'obstacles et un seul appel central à setSlowFactor.
- Les deux occurrences de oundaryAvoidance sont dans des branches exclusives TRAQUE/PRÉPARATION-CHARGE, donc une seule force est appliquée par frame.
- Les hooks de test sont toujours activés temporairement pendant les mesures et seront remis à DEBUG_HOOKS = false avant livraison.


## Livraison 3.6
- DEBUG_HOOKS repassé à alse par défaut après les mesures.
- Nettoyage effectué dans Predator.js : variable locale inutilisée retirée.
- Mesures finales à documenter : campagne pseudo-aléatoire 3 essais x 60 s, tests IA isolés et test de performance navigateur.


## Vérification finale 3.6
- Chargement à froid du navigateur effectué.
- Clic réel sur JOUER confirmé : état playing, bouton visible avant clic.
- Console et pageerror lus après démarrage : 0 erreur dans cette vérification.
- DEBUG_HOOKS = false confirmé : window.neonSerpent absent en exécution normale.


- Le dossier fourni ne contient pas de dépôt Git à sa racine ; l'état des fichiers a donc été vérifié directement par lecture et chargement navigateur.


## Nouvelle étape A — arène Slither
- L'étape A est lancée.
- La skill de validation TypeScript référencée par le client n'est pas lisible dans l'environnement (accès refusé / chemin absent) ; validation navigateur manuelle prévue.


- Configuration arène ajoutée dans 3-Arrival/config.js : monde 4x4, 500 orbes, croissance par paliers, boost, bordures et densité par difficulté.
- Les paramètres des anciens prédateurs sont isolés pour les étapes B/C.


- Game.js refondu pour un seul mode SURVIE : score longueur + cristaux, meilleur score, durée de partie et écran de mort.


- Food.js étendu avec deux usages : petits orbes persistants et cristaux spéciaux rares ; les objets sont réutilisés lors des respawns et des drops.


- Snake.js utilise maintenant les dimensions de l'arène et remonte oundaryHit pour le choix repoussoir/mortel de la difficulté.


- sketch.js refondu pour l'étape A : caméra monde, arène 4x4, culling des orbes, boost maintenu, croissance par orbes, drops de boost, mort par bordure en difficulté élevée, HUD survie et touche F pour FPS.
- Le menu ne propose plus le mode Niveaux et le jeu n'utilise plus l'état Victoire.


- index.html corrige le titre UTF-8 vers NEON SERPENT — Arena et style.css ajoute l'affichage FPS optionnel.


## Tests navigateur étape A
- Chargement final et clic réel sur JOUER : état playing.
- Arène mesurée : 3020 x 2060 px ; nourriture créée : 512 objets (500 orbes pondérés + 12 cristaux).
- Pause/reprise validée avec P.
- Boost maintenu validé avec Espace ; relâchement confirmé.
- Bordure mortelle validée en Difficile : état gameover, longueur finale 8.
- Touche F validée : compteur FPS affiché ; mesure visible autour de 50–69 FPS selon la charge du navigateur.
- Touche D validée dans les deux sens : checkbox et état Vehicle.debug synchronisés.
- Console et pageerror lus lors du chargement final : 0 erreur.

