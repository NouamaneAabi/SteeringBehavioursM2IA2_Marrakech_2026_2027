# Spécification — Exemple 2-PursueEvade (Combat aérien : Poursuite & Évasion)

## 1. Objectif général

Transformer le sketch `2-PursueEvade` en une simulation interactive de combat aérien basée sur les **Steering Behaviors** de Craig Reynolds (GDC 1999) : avions attaquants, avions cibles, système de verrouillage radar (*lock / délock*), tir de missiles à tête chercheuse (`pursuePerfect`), animations d'explosion et manœuvres d'évasion (`evadePerfect`).

Toutes les entités mobiles ou animées (avions, missiles, particules/fragments d'explosion) doivent hériter de `Vehicle` (`extends Vehicle`) avec **une classe maximum par fichier**.

---

## 2. Périmètre et découpage en tâches

- **Tâche 1** : Deux avions (attaquant et cible), cercle de détection, système de lock/délock temporisé, mode debug et panneau UI en haut à droite.
- **Tâche 2** : Tir de missile à tête chercheuse (`Missile extends Vehicle`) avec `pursuePerfect`, point d'interception, vitesse réglable et animation d'explosion à l'impact.
- **Tâche 3** : Gestion de plusieurs avions attaquants et plusieurs avions cibles via curseurs (1 attaquant et 1 cible par défaut).
- **Tâche 4** : Détection du lock par les avions cibles, clignotement vert/rouge après 1 s et comportement `evadePerfect` dans `Vehicle`.

---

## 3. Tâche 1 — Deux avions, lock/délock et panneau UI [DONE]

### 3.1 Architecture des avions
- `Plane` (`2-PursueEvade/plane.js`, `extends Vehicle`) : classe de base pour les avions avec rendu d'avion encapsulé dans `push()`/`pop()`, déplacement autonome par steering (`wander()`), et rebouclage aux bords (`edges()`).
- `AttackerPlane` (`2-PursueEvade/attackerPlane.js`, `extends Plane`) : avion attaquant équipé d'un radar circulaire.
- `TargetPlane` (`2-PursueEvade/targetPlane.js`, `extends Plane`) : avion cible pouvant être verrouillé (*locké*).

### 3.2 Détection, lock et délock
- L'attaquant possède un cercle de détection de rayon **`400` px** par défaut.
- Lorsqu'un avion cible entre dans ce cercle de détection :
  - il passe à l'état **locké** et sa couleur devient **rouge** (avec réticule de verrouillage) ;
  - l'attaquant applique le comportement **`seek`** vers cet avion cible **uniquement tant que la cible reste dans le cercle de détection** (dès qu'elle en sort, l'attaquant arrête `seek` et reprend `wander()`).
- Lorsqu'un avion cible locké sort du cercle de détection de l'attaquant :
  - un minuteur de délock démarre ;
  - s'il reste hors du cercle pendant plus de **`5` secondes**, il est **délocké** et repasse en **vert** ;
  - s'il rentre dans le cercle avant l'expiration des `5` s, le minuteur est réinitialisé et le lock est conservé.

### 3.3 Interface utilisateur et mode debug
- Panneau de contrôle semi-transparent et repliable placé en **haut à droite** de l'écran (style identique à `1-Seek`).
- Contrôles de la tâche 1 :

| Paramètre | Minimum | Maximum | Pas | Valeur initiale |
|---|---:|---:|---:|---:|
| Rayon de détection | 50 | 600 | 1 | 400 |
| Temps de délock (s) | 0.5 | 15 | 0.5 | 5 |

- **Mode Debug** : case à cocher `Debug` dans le panneau synchronisée avec la touche clavier `d` / `D` (désactivé par défaut).
- Lorsque le mode debug est actif :
  - afficher le cercle de détection de l'attaquant (et les informations de lock / vecteur vitesse).

---

## 4. Tâche 2 — Missile à tête chercheuse et explosion [DONE]

- Lorsqu'un avion cible est locké, **`1` seconde** plus tard l'attaquant tire par défaut **2 missiles** à tête chercheuse (`Missile` dans `2-PursueEvade/missile.js`, `extends Vehicle`) : un sur la droite et un sur la gauche de l'avion, qui avancent perpendiculairement à l'avion (**±90°**) pendant **`0,3` seconde** avant d'activer le comportement **`pursuePerfect`**.
- Le missile prend l'avion cible comme `target` et utilise le comportement **`pursuePerfect`** après sa phase d'éjection de `0,3` s.
- Visualiser le **point d'interception** calculé par `pursuePerfect` (le trait vert reliant le missile au point d'interception n'apparaît qu'en **mode debug**, avec une transparence marquée).
- La vitesse du missile vaut **`1,5×`** celle des avions par défaut, et sa vitesse max, son **accélération maximale (`maxForce`)**, sa **durée de vie maximale** (`5` s par défaut) ainsi que le **nombre maximum de missiles vivants par attaquant** (`2` par défaut) sont réglables par curseurs dans le panneau UI.
- Animations distinctes de fin de vie des missiles :
  - **Impact sur une cible** : explosion de feu (`ExplosionParticle extends Vehicle`), l'avion cible et le missile disparaissent, et une nouvelle cible réapparaît aléatoirement (1 pour 1).
  - **Auto-destruction / expiration** (ou perte de cible) : nuage de fumée gris-bleuté qui se dilate et se dissipe (`SmokePuff extends Vehicle`), distinct visuellement de l'explosion d'impact.

---

## 5. Tâche 3 — Plusieurs avions attaquants et cibles [DONE]

- Permettre de simuler plusieurs avions attaquants et plusieurs avions cibles simultanément.
- Ajouter deux curseurs dans le panneau UI :
  - `Nombre d'attaquants` (défaut `1`) ;
  - `Nombre de cibles` (défaut `1`).
- Synchroniser les tableaux d'avions sans réinitialiser les avions existants lorsque les curseurs changent.

---

## 6. Tâche 4 — Réaction d'évasion des avions cibles (`evadePerfect`) [DONE]

- Ajouter la méthode **`evadePerfect(vehicle)`** dans la classe `Vehicle` (`2-PursueEvade/vehicle.js`) : force opposée à `pursuePerfect(vehicle)` (réutilisable par toutes les sous-classes).
- Les avions cibles savent qu'ils sont lockés et depuis combien de temps.
- Au bout de **`1` seconde** de lock :
  - l'avion cible se met à **clignoter en vert et en rouge** ;
  - il bascule son comportement de steering sur **`evadePerfect`** vis-à-vis de l'attaquant qui l'a locké.

---

## 7. Tâche 5 — Détection des missiles, fuite boostée (`flee`) et endurance [DONE]

- Chaque avion cible (`TargetPlane`) possède un **cercle de détection des missiles** de rayon **`150` px** par défaut (réglable par curseur, visible en mode debug).
- Lorsqu'un missile entre dans ce cercle de détection, l'avion cible applique prioritairement le comportement **`flee`** face au missile le plus proche, sur le même modèle que `1-Seek` :
  - augmentation temporaire de sa vitesse maximale (`fleeMaxSpeed`, défaut `9`) et de son accélération maximale (`fleeMaxForce`, défaut `0.7`) jusqu'à atteindre la distance de sécurité (`300` px par défaut) ;
  - **endurance** : `2` s de fuite maximum, puis `1` s de régénération complète avant de pouvoir fuir à nouveau, avec **barre d'endurance visible** au-dessus de l'avion cible ;
  - retour aux valeurs de base (`baseMaxSpeed`, `baseMaxForce`) dès la fin de la fuite.
- Curseurs réglables dans la UI (section **Fuite des cibles (missiles)**) :
  - `Rayon détection missiles` (`50..400`, défaut `150`) ;
  - `Distance sécurité missiles` (`100..600`, défaut `300`) ;
  - `Vitesse max fuite cible` (`5..20`, défaut `9`) ;
  - `Accél. max fuite cible` (`0.1..3`, défaut `0.7`).

---

## 8. Tâche 6 — Menu des scénarios & Mode Battle Royale [DONE]

- Ajouter un menu déroulant **`Scénario`** dans le panneau UI :
  - **Scénario 1 — Attaquants vs Cibles** : mode classique (attaquants + cibles régénérées 1 pour 1).
  - **Scénario 2 — Battle Royale** : un seul type d'avion (`BattlePlane` dans `2-PursueEvade/battlePlane.js`, `extends Plane`).
- En mode **Battle Royale** :
  - Tous les avions sont à la fois attaquants et cibles potentielles : ils peuvent se détecter entre eux (`candidate !== this`), se verrouiller, se tirer des missiles, clignoter et exécuter `evadePerfect` 1 s après un lock, et fuir les missiles ennemis (`missile.owner !== this`) avec boost et barre d'endurance.
  - Les avions détruits **ne réapparaissent pas**.
  - Lorsqu'il ne reste plus qu'**un seul survivant**, il est déclaré **vainqueur** (affichage d'un bandeau de victoire et halo doré autour de l'avion vainqueur).
  - Un curseur `Avions (Battle Royale)` (`2..20`, défaut `8`) permet de régler le nombre d'avions au départ.

---

## 9. Tâche 7 — Contre-mesures Flares (Scénario 1) [DONE]

- Création de la classe **`Flare`** (`2-PursueEvade/flare.js`, `extends Vehicle`, 1 classe/fichier) :
  - petits cercles jaunes lumineux qui flottent très doucement dans l'espace par steering ;
  - durée de vie de **`3` secondes** (`3000` ms) ;
  - peuvent être pris pour cible par les missiles.
- Sur **`TargetPlane`** (Scénario 1) :
  - stock initial de **`100` flares**, lâchés par groupes de **`10`** lorsqu'un missile entre dans le cercle de détection (inutilisables lorsque le stock atteint `0`) ;
  - petit label sous l'avion indiquant le nombre de flares restants ;
  - lors du largage des flares, l'avion change **brutalement de direction** (virage sec à ±90°) et **accélère pendant `0,5` s**.
- Sur **`Missile`** (Scénario 1) :
  - compare en permanence la distance à sa cible initiale (`initialTarget`) et aux flares lâchés par cet avion (`flare.owner === initialTarget`) ;
  - si un flare est plus proche que la cible initiale, il devient la nouvelle cible du missile ;
  - lorsqu'un missile touche un flare, le missile (et le flare) meurt.

---

## 7. Critères d'acceptation

### Tâche 1
- [ ] Un avion attaquant et un avion cible (`extends Plane extends Vehicle`) évoluent sur le canvas.
- [ ] L'avion cible passe au rouge dès qu'il entre dans le cercle de détection de `300` px.
- [ ] L'avion cible repasse au vert après `5` s passées hors du cercle de détection.
- [ ] Le rayon de détection et le temps de délock sont réglables par curseurs.
- [ ] Le panneau UI est en haut à droite, semi-transparent et repliable.
- [ ] Le cercle de détection est visible uniquement en mode debug (touche `d`/`D` ou checkbox synchronisée).

### Tâche 2
- [ ] Un `Missile` (`extends Vehicle`) est tiré 1 s après le lock, utilise `pursuePerfect` et affiche le point d'interception.
- [ ] La vitesse du missile vaut 2× celle des avions par défaut et est réglable par curseur.
- [ ] À l'impact, cible et missile disparaissent avec une animation d'explosion.

### Tâche 3
- [ ] Le nombre d'attaquants et le nombre de cibles sont réglables par curseurs (1 et 1 par défaut).

### Tâche 4
- [ ] `evadePerfect` est implémenté dans `Vehicle`.
- [ ] Après 1 s de lock, l'avion cible clignote vert/rouge et exécute `evadePerfect`.
