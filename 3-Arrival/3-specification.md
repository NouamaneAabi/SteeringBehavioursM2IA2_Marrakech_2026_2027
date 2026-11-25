# Spécification — Exemple 3-Arrival (Serpent articulé avec `Arrival`)

## 1. Objectif général

Transformer le sketch `3-Arrival` en une démonstration interactive du comportement **Arrival** de Craig Reynolds (GDC 1999) appliquée à un serpent articulé (`Snake`) composé d'une tête (`SnakeHead`) et d'une chaîne d'anneaux (`SnakeRing`), tous héritant de `Vehicle` (`extends Vehicle`) avec **une classe maximum par fichier**.

---

## 2. Périmètre et découpage en tâches

- **Tâche 1** : Serpent articulé (`Snake`, `SnakeHead`, `SnakeRing` héritant de `Vehicle`) suivant la souris avec `Arrival`, rayon dégressif, lignes semi-transparentes, curseurs de réglage (nombre d'anneaux, vitesse/accélération tête et anneaux pour l'effet élastique) et mode debug.
- **Tâche 2** : Améliorations visuelles du serpent (yeux, langue fourchue, dégradé de couleurs le long du corps) et ciblage de nourriture.
- **Tâche 3** : Plusieurs serpents (avec mode `Wander` autonome ou poursuite de cibles).

---

## 3. Tâche 1 — Serpent articulé (`Snake`), rayon dégressif et effet élastique [DONE]

### 3.1 Architecture des classes (`extends Vehicle`, 1 classe / fichier)
- `SnakeHead` (`3-Arrival/snakeHead.js`, `extends Vehicle`) :
  - suit la souris (`target`) avec le comportement `arrive(target)` ;
  - mémorise son dernier cap (`heading`) afin de garder une orientation stable même à l'arrêt.
- `SnakeRing` (`3-Arrival/snakeRing.js`, `extends Vehicle`) :
  - suit un point situé **derrière** le maillon précédent (la tête pour le 1er anneau, l'anneau `i - 1` pour les suivants) avec `arrive(followPoint)` ;
  - ses paramètres `maxSpeed` et `maxForce` sont réglables indépendamment de la tête pour obtenir un effet plus ou moins **élastique**.
- `Snake` (`3-Arrival/snake.js`, `extends Vehicle`) :
  - orchestre la tête (`head`) et le tableau d'anneaux (`rings`) via `applyBehaviors(target)`, `update()`, `show()` ;
  - gère l'ajustement dynamique du nombre d'anneaux sans réinitialiser les anneaux existants.

### 3.2 Rendu visuel (Tâche 1)
- La tête et chaque anneau sont dessinés sous forme de **cercles**.
- Le **rayon diminue progressivement** de la tête jusqu'à la queue en fonction de la longueur du serpent.
- La tête et les anneaux successifs sont reliés par des **lignes semi-transparentes** et enveloppés par une **surface de corps semi-transparente au contour lisse** (`quadraticCurveTo`) habillée d'une **texture procédurale d'écailles** pré-calculée hors écran.

### 3.3 Paramètres réglables (panneau UI repliable)

| Paramètre | Minimum | Maximum | Pas | Valeur initiale |
|---|---:|---:|---:|---:|
| Nombre d'anneaux | 1 | 100 | 1 | 30 |
| Vitesse max tête | 1 | 20 | 0.5 | 8 |
| Accélération max tête | 0.05 | 2 | 0.05 | 0.4 |
| Vitesse max anneaux | 1 | 25 | 0.5 | 10 |
| Accélération max anneaux | 0.05 | 3 | 0.05 | 2 |

- **Mode Debug** : case à cocher `Debug (touche D)` synchronisée avec la touche `d` / `D` (`Vehicle.debug`).

---

## 4. Tâche 2 — Texte animé par particules (`TexteAnime` & `TextFragment`) [DONE]

- Création de `TextFragment` (`3-Arrival/textFragment.js`, `extends Vehicle`) :
  - petits véhicules circulaires appliquant `arrive` vers leur point cible respectif ;
  - fuient (`flee`) la souris, la tête du serpent et ses anneaux dès qu'un de ces éléments entre dans un rayon de **`40` px** par défaut (réglable par curseur `Rayon répulsion texte` entre `10` et `200` px) ; lorsqu'aucun élément n'est dans ce cercle, ils reviennent sur leur point cible avec `arrive`.
- Création de `TexteAnime` (`3-Arrival/texteAnime.js`, `extends Vehicle`) :
  - génère les points centrés à l'écran via `font.textBounds()` et `font.textToPoints()` (texte par défaut : `"Marrakech EMSI"`) ;
  - réutilise les fragments existants lors d'un changement de texte ou de police pour une transition fluide.
- Interface utilisateur :
  - menu déroulant **Police** (`Inconsolata`, `Arial Bold`, `Courier New Bold`, `Chalkduster` chargées dans `preload()`) ;
  - champ texte **Texte** permettant de modifier dynamiquement le texte affiché.

---

## 5. Tâche 3 — Shaders animés (corps du serpent & grille déformable) [DONE]

- **Textures shaders animées sur le corps du serpent** (`SnakeShaderTexture` dans `3-Arrival/snakeShaderTexture.js`, `extends Vehicle`) :
  - rendu hors écran `WEBGL` (`createGraphics(..., WEBGL)`) appliqué à l'enveloppe lisse du serpent ;
  - menu déroulant permettant de choisir parmi plusieurs shaders : **Écailles animées**, **Plasma néon**, **Ondes cyber**, **Lave / Magma** ;
  - **génération dynamique de l'UI** des paramètres (curseurs) en fonction du shader sélectionné.
- **Grille déformable en fond d'écran** (`GridShaderLayer` dans `3-Arrival/gridShaderLayer.js`, `extends Vehicle`) :
  - shader `WEBGL` semi-transparent dessiné en arrière-plan ;
  - se déforme dynamiquement au passage de la tête et des anneaux du serpent ;
  - paramètres réglables dans le panneau UI (espacement, rayon de déformation, force de déformation, opacité, épaisseur, couleur du fond et des mailles).

---

## 6. Tâche 4 — Tête expressive, nourriture (`Food`) et niveaux chronométrés [DONE]

- **Tête du serpent** (`SnakeHead` dans `3-Arrival/snakeHead.js`) :
  - **yeux expressifs** dont les pupilles suivent la position de la souris ;
  - **langue fourchue animée** qui sort et oscille périodiquement à l'avant de la tête.
- **Objets à manger** (`Food` dans `3-Arrival/food.js`, `extends Vehicle`) :
  - apparaissent aléatoirement et flottent doucement sur l'écran via steering (rebond souple sur les bords) ;
  - lorsque la tête du serpent les mange, ils disparaissent et le serpent s'allonge (`+1` anneau).
- **Système de niveaux** :
  - chaque niveau affiche `"Niveau N"` au centre via `TexteAnime` et applique une **couleur de grille** distincte ;
  - objectif de nourriture à manger dans un **temps imparti** (de plus en plus difficile à chaque niveau), avec HUD en haut à gauche et écran de fin de partie / redémarrage si le timer expire.

---

## 7. Tâche 5 — Escadron de cafards (formation 4×4), missiles et objectif de longueur [DONE]

- **Opacité de la grille** : réglée à **`100%` (`1.0`)** par défaut pour une meilleure lisibilité.
- **Cafards mangeables** (`extends Vehicle`, 1 classe/fichier) :
  - `CockroachLeader` (`3-Arrival/cockroachLeader.js`) : se déplace par steering (`wander()`), possède une **zone d'exclusion devant lui** (visible en debug), et s'arrête toutes les **5 à 10 secondes** pour ordonner aux soldats de tirer.
  - `CockroachSoldier` (`3-Arrival/cockroachSoldier.js`) : suit sa place dans une **formation 4×4** derrière le leader via `arrive`, tout en **fuyant (`flee`) la zone située devant le leader** s'il s'y trouve (*Leader Following*).
  - Le serpent peut manger les cafards (`+1` anneau) tandis que la nourriture (`Food`) rapporte **`+3` anneaux** pour rester la source principale de croissance. Si le leader est mangé, un des soldats est **promu leader**. Tout cafard mangé **réapparaît au bout de 5 secondes** à une position aléatoire et rejoint sa place dans la formation 4×4 par `arrive`.
  - Lorsqu'un cafard (leader ou soldat) détecte la tête du serpent dans un rayon de **`60` px** par défaut (réglable par curseur), il le **fuit (`flee`) sans changer sa vitesse maximale**.
- **Missiles des cafards** (`CockroachMissile` dans `3-Arrival/cockroachMissile.js`, `extends Vehicle`) :
  - tirés par les soldats sur ordre du leader et dirigés par **`seek`** vers des **anneaux du serpent** (durée de vie max **`1,5` s**) ;
  - à l'impact sur un anneau : déclenchement d'une mini animation (`RingHitEffect` dans `3-Arrival/ringHitEffect.js`, `extends Vehicle`) et perte de cet anneau par le serpent ;
  - si un missile touche la **tête du serpent**, le serpent meurt (fin de partie).
- **Objectif des niveaux** : atteindre une **longueur cible** du serpent dans le temps imparti.

---

## 6. Critères d'acceptation (Tâche 1)

- [ ] `Snake`, `SnakeHead` et `SnakeRing` héritent tous de `Vehicle` (1 classe par fichier).
- [ ] La tête utilise `arrive` sur la souris.
- [ ] Chaque anneau suit un point derrière le maillon précédent (le 1er anneau suit la tête).
- [ ] Le serpent comporte `30` anneaux par défaut, réglables par curseur.
- [ ] La vitesse max et l'accélération max de la tête et des anneaux sont réglables par curseurs (effet élastique).
- [ ] Le rayon des cercles diminue le long du serpent et des lignes semi-transparentes relient les maillons.
