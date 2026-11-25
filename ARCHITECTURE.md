# Architecture du projet

## Intention

Le projet rassemble des applications p5.js qui illustrent les steering behaviors de Craig Reynolds. Le modèle central est le véhicule autonome : une entité possède un état cinématique, calcule une force de pilotage à partir de son environnement, intègre cette force, puis se dessine.

## Règles non négociables

1. **Une classe maximum par fichier**, sauf classe interne nécessaire à l'implémentation.
2. **Tout élément graphique animé est un `Vehicule`** ou une sous-classe de `Vehicule`. Une entité qui peut se déplacer maintenant ou plus tard suit donc le même modèle.
3. **Tout élément fixe susceptible de se déplacer** — obstacle, mur mobile, cible animée, porte, projectile stationnaire — est aussi un `Vehicule` ou une sous-classe de `Vehicule`.
4. Les objets spécialisés (`Joueur`, `Ennemi`, `VaisseauSpatial`, `Missile`, `ScoreAnime`, etc.) dérivent de `Vehicule`. Ils ajoutent leur identité, leurs paramètres et leur rendu ; ils ne dupliquent pas l'intégration physique.
5. Le fichier de référence pour les nouvelles classes est `Vehicule.js` avec une classe `Vehicule`. Les anciens exemples peuvent conserver `vehicle.js`/`Vehicle` pour préserver leur caractère historique ; toute nouvelle application suit la convention canonique.
6. Les comportements calculent des forces. Ils ne modifient pas directement `pos` ou `vel`. Le cycle est : `resetForces()` → `applyBehaviors()` → `update(dt)` → `bounds/contacts` → `show()`.
7. La simulation et le rendu restent séparés : `update()` ne dessine pas, `show()` ne change pas la physique.
8. Les forces sont limitées par `maxForce`, la vitesse par `maxSpeed`, et l'accélération est remise à zéro après intégration.
9. Les pondérations de comportements sont explicites et centralisées dans une méthode ou une configuration d'entité.
10. Les coordonnées, rayons, vitesses et forces utilisent `p5.Vector` ; aucune copie manuelle de logique vectorielle n'est créée sans raison.

## Contrat minimal de `Vehicule`

Un véhicule possède au minimum `pos`, `vel`, `acc`, `maxSpeed`, `maxForce` et `r`. Il expose `applyForce(force)`, `update(dt)`, `show()` et les comportements nécessaires. `update()` doit intégrer l'accélération, limiter la vitesse, avancer la position et réinitialiser l'accélération. Si le projet utilise le delta time, les forces et limites doivent rester cohérentes avec cette unité.

## Catalogue de comportements de Reynolds

- **Seek** : vitesse désirée vers une cible, puis force `desired - velocity`.
- **Flee** : inverse de Seek, éventuellement limité à une distance de menace.
- **Arrival** : Seek avec vitesse désirée réduite à l'approche de la cible.
- **Pursuit** : Seek vers une position future estimée à partir de la vitesse de la cible.
- **Evade** : Flee vers une position future estimée du poursuivant.
- **Wander** : variation contrôlée d'une cible projetée devant le véhicule ; le bruit aléatoire ne doit pas produire de téléportation.
- **Obstacle avoidance** : sonde devant le véhicule, détection de l'obstacle le plus menaçant et force latérale de dégagement.
- **Wall following** : projection de sondes sur une surface et maintien d'une distance de sécurité.
- **Path following** : projection sur un chemin, cible en avance sur le chemin, puis Seek/Arrival.
- **Separation** : répulsion pondérée des voisins proches.
- **Alignment** : moyenne des vitesses des voisins.
- **Cohesion** : Seek vers le centre de masse des voisins.
- **Collision avoidance** : évitement anticipé des trajectoires convergentes.
- **Group behaviors** : combinaison de séparation, alignement, cohésion et évitement, avec priorités explicites lorsque les forces sont incompatibles.

Le papier de référence est archivé dans [article_craig_reynolds/gdc99-steering-behaviors.html](./article_craig_reynolds/gdc99-steering-behaviors.html). Toute nouvelle implémentation doit indiquer le comportement illustré et ses paramètres principaux.

## Organisation recommandée d'une application

```text
nom-application/
├── index.html
├── sketch.js              # orchestration p5 : setup/draw, pas de classe métier
├── Vehicule.js            # classe de base, une seule classe
├── Joueur.js              # sous-classe spécialisée, si nécessaire
├── Obstacle.js            # sous-classe Vehicule si l'obstacle est mobile
├── style.css
└── libraries/p5.min.js
```

`sketch.js` instancie les entités, met à jour les cibles et orchestre la boucle. Les classes de domaine restent dans leurs fichiers. Les fonctions globales p5 (`setup`, `draw`, événements) sont réservées à l'orchestration.

## Séquence d'une frame

```text
entrée utilisateur / capteurs
        ↓
mise à jour des cibles et perception
        ↓
calcul des steering forces
        ↓
intégration de chaque Vehicule
        ↓
contraintes, limites, collisions et bords
        ↓
rendu p5 dans un contexte push/pop
```

## Qualité et débogage

Chaque comportement important doit pouvoir afficher ses vecteurs de debug sans changer la simulation. Les valeurs `maxSpeed`, `maxForce`, rayons et distances de perception sont nommées, regroupées et ajustables. Les corrections d'un exemple doivent être faites dans un dossier dédié si l'exemple original sert de support pédagogique.
