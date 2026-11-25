# Spécification — Exemple 1-Seek

## 1. Objectif général

Faire évoluer l'exemple `1-Seek` en une démonstration interactive de steering
behaviors. L'utilisateur doit pouvoir modifier les paramètres de la simulation
sans recharger la page, afficher ou masquer les informations de debug, et
visualiser un dégradé radial animé suivant la souris.

La simulation conserve le comportement **Seek** : chaque vaisseau se dirige
vers la cible représentée par la position de la souris.

## 2. Périmètre

La présente spécification couvre :

- la gestion d'un groupe de vaisseaux ;
- le réglage de paramètres physiques avec des curseurs ;
- le panneau de contrôle repliable ;
- le mode debug activable par l'interface et au clavier ;
- le dégradé radial animé autour de la souris ;
- les curseurs de paramétrage du dégradé ;
- les cibles mobiles (`Target`) avec rebond sur les bords et réglage de leur nombre (Tâche 3) ;
- la détection et la poursuite de la cible la plus proche par les vaisseaux (Tâche 4) ;
- la fuite temporaire accélérée des cibles face aux vaisseaux (Tâche 5) ;
- le système d'endurance, de points de vie et le compteur de cibles (Tâche 6).

## 3. Tâche 1 — Paramètres de la simulation et mode debug [DONE]

### 3.1 Panneau de contrôle

Créer une zone de contrôle située en haut de l'écran :

- positionnée au-dessus du canvas ;
- semi-transparente afin de laisser entrevoir l'animation ;
- lisible sur un fond sombre ;
- repliable et dépliable comme un accordéon ;
- ouverte au démarrage ;
- utilisable avec la souris et le clavier sans bloquer la simulation.

Le panneau doit afficher, pour chaque paramètre, son libellé, son curseur et sa
valeur courante. La valeur affichée doit être mise à jour lorsque le curseur
change.

### 3.2 Nombre de vaisseaux

Ajouter un curseur `Nombre de vaisseaux` avec les caractéristiques suivantes :

- minimum : `1` ;
- maximum : `200` ;
- pas : `1` ;
- valeur initiale recommandée : `1`.

Le tableau de vaisseaux doit être synchronisé avec la valeur du curseur :

- si la valeur augmente, créer les nouveaux vaisseaux avec des positions
  initiales réparties aléatoirement dans le canvas ;
- si la valeur diminue, supprimer les vaisseaux excédentaires ;
- conserver les vaisseaux existants autant que possible afin d'éviter une
  réinitialisation visuelle à chaque changement ;
- tous les vaisseaux doivent utiliser le même comportement Seek.

### 3.3 Vitesse maximale

Ajouter un curseur `Vitesse maximale` avec :

- minimum : `0` ;
- maximum : `20` ;
- pas : `0.01` ;
- valeur initiale recommandée : `4`.

La valeur du curseur doit être appliquée à `maxSpeed` pour chaque vaisseau,
sans modifier directement leur position dans la boucle de rendu.

### 3.4 Accélération maximale

Ajouter un curseur `Accélération maximale` avec :

- minimum : `0` ;
- maximum : `10` ;
- pas recommandé : `0.01` ;
- valeur initiale recommandée : `0.1`.

Dans le modèle actuel, ce paramètre correspond à la force de pilotage maximale
(`maxForce`) utilisée par le comportement Seek. La valeur doit être appliquée
à tous les vaisseaux.

### 3.5 Activation du mode debug

Ajouter :

- une case à cocher `Debug` dans le panneau ;
- un raccourci clavier `D` permettant d'inverser l'état du debug.

Le clavier et la case à cocher doivent rester synchronisés. La touche `D` doit
fonctionner avec `d` et `D`, sans provoquer d'action lorsque l'utilisateur
écrit dans un champ de formulaire.

Lorsque le debug est activé :

- afficher le vecteur vitesse de chaque vaisseau en rouge ;
- conserver une flèche lisible, partant du centre du vaisseau et orientée selon
  sa vitesse ;
- ne pas afficher ces vecteurs lorsque le debug est désactivé.

Le mode debug doit être désactivé par défaut. Le rendu normal ne doit contenir
aucun vecteur vitesse rouge.

## 4. Tâche 2 — Dégradé radial arc-en-ciel [DONE]

### 4.1 Rendu général

Ajouter un dégradé radial animé dont le centre suit la position de la souris :

- centre du dégradé : `(mouseX, mouseY)` ;
- couleurs réparties sur l'arc-en-ciel ;
- animation continue, même lorsque la souris ne bouge pas ;
- rendu placé derrière la cible et les vaisseaux ;
- absence de débordement visuel gênant en dehors du canvas ;
- conservation d'un contraste suffisant pour distinguer les vaisseaux.

Le dégradé ne doit pas déplacer la cible ni modifier le calcul du
comportement Seek. Il s'agit uniquement d'un effet visuel.

### 4.2 Paramètres réglables

Ajouter au panneau les curseurs suivants :

| Paramètre | Minimum | Maximum | Pas | Valeur initiale recommandée |
|---|---:|---:|---:|---:|
| Rayon du dégradé | 50 | 1000 | 1 | 350 |
| Vitesse d'animation | 0 | 2 | 0.01 | 0.2 |
| Opacité | 0 | 255 | 1 | 180 |
| Nombre d'anneaux | 10 | 200 | 1 | 80 |
| Décalage des couleurs | 0 | 360 | 1 | 0 |

Comportement attendu de ces paramètres :

- `Rayon du dégradé` contrôle la distance entre le centre et la périphérie ;
- `Vitesse d'animation` contrôle la variation temporelle des couleurs ;
- `Opacité` contrôle l'intensité visuelle de l'effet ;
- `Nombre d'anneaux` contrôle la finesse du dégradé ;
- `Décalage des couleurs` fait tourner la palette autour du cercle
  chromatique.

La palette doit parcourir les teintes de l'arc-en-ciel de façon cyclique. La
valeur d'animation doit être bornée ou rebouclée afin d'éviter une croissance
indéfinie au fil des frames.

### 4.3 Qualité et performance

- Le dégradé doit être recalculé à partir de la position courante de la souris
  et des paramètres courants.
- Les références aux curseurs et aux valeurs DOM doivent être mises en cache
  dans `setup()` ; aucun sélecteur DOM ne doit être recherché à chaque frame.
- Le choix de l'algorithme de rendu (anneaux, lignes, couche graphique hors
  écran ou autre) doit conserver une animation fluide avec 200 vaisseaux.
- Les transformations et styles p5.js doivent être isolés avec `push()` et
  `pop()` lorsque cela est nécessaire.

## 5. Contraintes d'architecture

Respecter les conventions du dépôt :

- une classe maximum par fichier ;
- tout élément animé ou potentiellement mobile est un `Vehicle` ou une
  sous-classe de `Vehicle` ;
- les forces de steering sont calculées par les comportements puis appliquées
  avec `applyForce()` ;
- le cycle `applyBehaviors()` → `applyForce()` → `update()` doit être conservé ;
- ne pas modifier directement la position des vaisseaux dans `draw()`, hors
  initialisation et gestion des bords ;
- encapsuler l'affichage propre à chaque vaisseau dans `push()`/`pop()`.

Le panneau de contrôle et l'effet de fond peuvent utiliser les API DOM et p5.js
existantes, sans ajouter de dépendance externe.

## 6. Critères d'acceptation

### Tâche 1

- [ ] Le panneau est visible en haut, semi-transparent et repliable.
- [ ] Le curseur du nombre de vaisseaux accepte exactement les valeurs de `1`
      à `200` par pas de `1`.
- [ ] Le curseur de vitesse accepte les valeurs de `0` à `20` par pas de
      `0.01`.
- [ ] Le curseur d'accélération maximale accepte les valeurs de `0` à `10`.
- [ ] Le nombre de vaisseaux visibles suit le curseur sans rechargement.
- [ ] La case `Debug` et la touche `D` activent/désactivent le même état.
- [ ] Les vecteurs vitesse rouges sont visibles uniquement en mode debug.

### Tâche 2

- [ ] Le centre du dégradé suit la souris.
- [ ] Le dégradé est animé sans mouvement de souris.
- [ ] Les couleurs couvrent l'arc-en-ciel.
- [ ] Les cinq paramètres du dégradé sont réglables dans le panneau.
- [ ] Les valeurs affichées correspondent toujours aux valeurs réellement
      utilisées par le rendu.
- [ ] L'animation reste utilisable avec 200 vaisseaux et le panneau ouvert.

### Régression

- [ ] La cible reste positionnée sur la souris.
- [ ] Les vaisseaux continuent de converger vers la cible avec Seek.
- [ ] Le canvas s'adapte au redimensionnement de la fenêtre.
- [ ] Le sketch fonctionne sans bibliothèque ou dépendance supplémentaire.

## 7. Tâche 3 — Cibles mobiles (`Target`) [DONE]

### 7.1 Comportement et apparence
- Chaque cible est un cercle, instance de la classe `Target` (`1-Seek/target.js`, sous-classe de `Vehicle`).
- **Vitesse initiale aléatoire** : direction aléatoire et vitesse comprise entre `-7` et `+7`.
- **Couleur** : aléatoire mais **claire** (haute luminosité pour rester bien lisible sur fond sombre et sur le dégradé).
- **Rayon** : aléatoire entre `10` et `100` pixels.
- **Bords de l'écran** : par défaut, les cibles **rebondissent** sur les bords du canvas (inversion de la composante de vitesse concernée et recalage dans les limites du canvas).

### 7.2 Paramètre réglable
Ajouter au panneau un curseur :

| Paramètre | Minimum | Maximum | Pas | Valeur initiale recommandée |
|---|---:|---:|---:|---:|
| Nombre de cibles | 0 | 20 | 1 | 1 |

- Le tableau de cibles est synchronisé avec le curseur sans réinitialiser les cibles déjà présentes.

---

## 8. Tâche 4 — Détection et poursuite des cibles par les vaisseaux [DONE]

### 8.1 Cercle de détection des vaisseaux
- Chaque vaisseau possède un cercle de détection autour de lui :
  - rayon par défaut : `150` pixels ;
  - réglable par curseur dans le panneau entre `20` et `200` pixels (pas `1`) ;
  - **visible en mode debug** (`Vehicle.debug === true`).

### 8.2 Sélection de cible et contact
- Lorsqu'un vaisseau détecte une cible dans son cercle de détection, il applique `seek` sur cette cible et augmente temporairement sa vitesse maximale (`maxSpeed`) ainsi que son accélération maximale (`maxForce`) d'un facteur **x3** tant que la cible reste détectée.
- Si plusieurs cibles se trouvent dans le cercle de détection, le vaisseau sélectionne **la plus proche** (comparaison optimisée via distances au carré).
- Si aucune cible n'est détectée, le vaisseau continue de faire `seek` vers la souris.
- **Contact** : une cible est touchée lorsque la distance entre sa position et celle du vaisseau est inférieure à la somme de leurs rayons (`distance < target.r + vehicle.r`).

---

## 9. Tâche 5 — Scénarios et fuite des cibles face aux vaisseaux [DONE]

### 9.0 Menu déroulant des scénarios
Ajouter un menu déroulant `Scénario` dans le panneau de contrôle permettant de choisir entre :
- **Scénario 1 — Suivre la souris** : les vaisseaux font `seek` vers la souris.
- **Scénario 2 — Chasse aux cibles** : les vaisseaux ne suivent plus la souris ; ils se déplacent aléatoirement (changement de direction toutes les **4 secondes** via steering) jusqu'à détecter une cible dans leur cercle de détection, puis foncent dessus (`seek` sur la plus proche).
- **Scénario 3 — Fuite des cibles** : comportement du scénario 2 pour les vaisseaux, et les cibles fuient temporairement lorsqu'un vaisseau entre dans leur cercle de détection.

### 9.1 Cercle de détection des cibles
- Chaque cible possède un cercle de détection autour d'elle :
  - rayon par défaut : `100` pixels ;
  - réglable par curseur dans le panneau (ex. `20` à `300`, pas `1`) ;
  - **visible en mode debug**.

### 9.2 Comportement de fuite temporaire
- Lorsqu'une cible détecte un vaisseau dans son cercle de détection, elle déclenche une fuite (`flee`) vis-à-vis de ce vaisseau (le plus proche).
- Pendant la fuite, la cible augmente temporairement sa vitesse maximale (`maxSpeed`) et son accélération maximale (`maxForce`).
- Elle maintient cette fuite jusqu'à se trouver à au moins `300` pixels de distance du vaisseau poursuivant, puis revient à sa vitesse et son accélération normales.
- Les paramètres suivants sont réglables par curseurs dans le panneau :
  - rayon de détection des cibles (défaut `100`) ;
  - distance de fin de fuite / sécurité (défaut `300`) ;
  - vitesse max en fuite (boost temporaire) ;
  - accélération max en fuite (boost temporaire).

---

## 10. Tâche 6 — Endurance, points de vie et compteur de cibles [DONE]

### 10.1 Endurance des cibles
- Chaque cible dispose d'une jauge d'endurance :
  - elle ne peut fuir que pendant **2 secondes** maximum ;
  - une fois l'endurance épuisée, la fuite s'arrête et la jauge entre en phase de **régénération** ;
  - la barre met **1 seconde** à se remplir complètement avant que la cible puisse fuir à nouveau.
- Une **barre d'endurance** visuelle est dessinée pour chaque cible (indiquant le niveau courant et/ou l'état de régénération).

### 10.2 Points de vie et mort des cibles
- Au départ, chaque cible reçoit un nombre entier aléatoire de points de vie entre **5 et 10**.
- Le nombre de points de vie est affiché **au centre du cercle** de la cible, dans une couleur contrastée distincte de celle de la cible (bien lisible).
- Lorsqu'un vaisseau touche une cible (`distance < target.r + vehicle.r`) :
  - dans le **Scénario 3**, la cible éclate immédiatement en **8 morceaux en forme de parts de camembert** (`TargetFragment extends Vehicle`, animation de **0,3 s**) et meurt définitivement sans réapparaître ;
  - dans le **Scénario 2**, ses points de vie diminuent de `1` (réapparition aléatoire tant que `PV > 0`, puis éclatement en 8 morceaux et mort à `0` PV).

### 10.3 Compteur HUD et vagues progressives
- Afficher le **nombre de cibles** actuellement en vie (et le numéro de vague) en **haut à droite** de l'écran.
- Lorsque le compteur de cibles tombe à `0` après élimination (et que le curseur `Nombre de cibles` est `> 0`), recréer le nombre de cibles indiqué par le curseur pour la vague suivante, avec une vitesse maximale plus grande (`+15 %` par vague) et une accélération légèrement plus grande (`+10 %` par vague).

---

## 11. Critères d'acceptation complémentaires (Tâches 3 à 6)

### Tâche 3
- [ ] Les cibles sont des instances de `Target` (`extends Vehicle`) avec rayon `10..100`, couleur claire aléatoire et vitesse aléatoire dans `[-7, 7]`.
- [ ] Le curseur `Nombre de cibles` (`0..20`) ajuste dynamiquement le nombre de cibles.
- [ ] Les cibles rebondissent sur les bords du canvas.

### Tâche 4
- [ ] Le cercle de détection des vaisseaux (défaut `150`, curseur `20..200`) s'affiche en mode debug.
- [ ] Chaque vaisseau fait `seek` sur la cible la plus proche dans son rayon de détection.
- [ ] Au contact (`distance < 5` px), la cible disparaît et réapparaît aléatoirement.

### Tâche 5
- [ ] Le cercle de détection des cibles (défaut `100`, réglable) s'affiche en mode debug.
- [ ] Les cibles détectant un vaisseau fuient avec `maxSpeed` et `maxForce` temporairement augmentées jusqu'à `300` px (valeurs réglables par curseurs).

### Tâche 6
- [ ] Une cible fuit au maximum 2 s, puis régénère son endurance pendant 1 s avant de pouvoir fuir à nouveau, avec barre d'endurance visible.
- [ ] Chaque cible démarre avec 5 à 10 PV affichés de façon lisible au centre de son cercle, perd 1 PV par contact et meurt à 0 PV.
- [ ] Le nombre de cibles vivantes est affiché en haut à droite de l'écran.

---

## 12. Tâche 7 — Effets sonores spatialisés (Web Audio API) [DONE]

- Utiliser l'API native **Web Audio** (`SoundEngine` dans `1-Seek/soundEngine.js`, sans fichier audio externe).
- **Spatialisation gauche / droite** (`StereoPannerNode`) basée sur la position horizontale `x` de la cible dans le canvas (`-1` à gauche, `+1` à droite).
- **Son de mort / explosion** : bruit d'explosion filtré + chute rapide / agonie synthétisée lorsqu'une cible meurt.
- **Pulsation grave périodique en fond** : son basse fréquence périodique dont la fréquence (rythme et hauteur grave) augmente à mesure que le nombre de cibles restantes diminue.
- **Contrôles dans le panneau** :
  - bouton **Musique / Sons ON / OFF** ;
  - curseur **Volume** (`0..100`, pas `1`, défaut `60`).
