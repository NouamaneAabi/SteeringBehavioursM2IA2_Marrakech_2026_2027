# Spécification — Exemple 4-Wander (Comportement Wander de Craig Reynolds)

## 1. Objectif général

Mettre en œuvre le comportement **Wander** tel que décrit par **Craig W. Reynolds** (*Steering Behaviors For Autonomous Characters*, GDC 1999) sur les vaisseaux spatiaux (`Vehicle`), avec visualisation complète de tous les éléments géométriques en mode debug et réglages interactifs en temps réel.

---

## 2. Tâche 1 — Implémentation canonique de `Wander` & mode Debug complet [DONE]

### 2.1 Comportement `wander()` (`4-Wander/vehicle.js`)
- Projeter un cercle de rayon `wanderRadius` à distance `distanceCercle` devant le véhicule le long de son axe *forward* (`vel.heading()`).
- Calculer le point cible sur la circonférence à l'angle `wanderTheta + vel.heading()`.
- Perturber `wanderTheta` à chaque frame par un petit déplacement aléatoire borné (`random(-displaceRange, displaceRange)`).
- Calculer la force de steering directe vers ce point (`p5.Vector.sub(pointSurLeCercle, this.pos)` bornée par `maxForce`), retournée en tant que `p5.Vector` pur.
- Appliquer le pipeline `applyBehaviors()` → `applyForce()` → `update()`.

### 2.2 Visualisation Debug (`Vehicle.debug === true`, touche `D` ou checkbox)
Afficher pour chaque vaisseau :
- la ligne pointillée de distance (`pos` → `pointDevant`) ;
- le centre du cercle de wander (`pointDevant`, point rouge) ;
- le cercle de wander (`wanderRadius`, cercle blanc) ;
- le rayon interne (`pointDevant` → `pointSurLeCercle`) ;
- le point cible sur le cercle (`pointSurLeCercle`, point vert) ;
- le vecteur direction désirée (`pos` → `pointSurLeCercle`, jaune) ;
- la flèche de force de steering résultante (orange) et le vecteur vitesse (cyan).

### 2.3 Interface utilisateur
- Panneau repliable semi-transparent en haut à droite permettant de régler :
  - `Nombre de vaisseaux` (`1..100`, défaut `20`) ;
  - `Vitesse Max` (`1..20`, défaut `6`) ;
  - `Force Max` (`0.05..2`, défaut `0.2`) ;
  - `Rayon Wander` (`5..150`, défaut `50`) ;
  - `Distance Wander` (`20..300`, défaut `150`) ;
  - `Amplitude angle (displace)` (`0.05..1`, défaut `0.3`) ;
  - `Longueur traînée` (`0..60`, défaut `15`) ;
  - case à cocher `Mode Debug (touche D)` synchronisée avec `d` / `D`.
