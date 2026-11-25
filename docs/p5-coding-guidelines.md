# Bonnes pratiques de codage p5.js

Ce guide adapte les recommandations p5.js aux simulations de steering behaviors. Les pages officielles consultées sont archivées dans `article_craig_reynolds/` afin de garder une référence locale lorsque le réseau est indisponible.

## Structure

- Utiliser `setup()` pour créer le canvas, charger les ressources et initialiser l'état.
- Utiliser `draw()` pour orchestrer une frame : entrée, simulation, rendu.
- Garder les classes et la logique métier dans des fichiers séparés ; une classe par fichier.
- Charger les scripts dans `index.html` dans un ordre explicite : p5, classe de base, sous-classes, puis `sketch.js`.
- Préférer `const` et `let`, éviter `var` et les variables globales inutiles.

## Vecteurs et animation

- Utiliser `p5.Vector` pour position, vitesse, accélération, forces et directions.
- Ne pas créer de vecteur temporaire à chaque opération dans une boucle dense sans nécessité ; réutiliser les objets lorsque la lisibilité reste bonne.
- Limiter les forces avant de les appliquer et limiter la vitesse après intégration.
- Remettre l'accélération à zéro à la fin de chaque mise à jour.
- Ne jamais appeler une fonction de rendu depuis un comportement.

## Rendu

- Encapsuler chaque transformation avec `push()`/`pop()`.
- Utiliser `translate()` puis `rotate()` pour orienter un véhicule dans son repère local.
- Dessiner un véhicule dans son repère local autour de `(0, 0)` ; le rendu ne doit pas réécrire sa position.
- Centraliser les couleurs, tailles et options de debug afin de régler rapidement une démonstration.
- Redimensionner le canvas via `windowResized()` si l'application est responsive.

## Performance et robustesse

- Éviter `random()` non contrôlé dans `draw()` : pour Wander, conserver une cible et modifier progressivement son angle.
- Parcourir les voisins avec une distance au carré lorsque seule la comparaison est nécessaire.
- Prévoir des valeurs par défaut valides et vérifier les cibles nulles avant de calculer une force.
- Ne pas charger de ressource ou créer de canvas dans `draw()`.
- Utiliser un seed lors d'une démonstration reproductible.

## Lisibilité et pédagogie

- Nommer les unités dans les commentaires lorsque cela évite une ambiguïté (`pixels/frame`, `pixels/second`).
- Expliquer la formule `force = desiredVelocity - velocity` près de sa première implémentation.
- Documenter le rôle de chaque paramètre de comportement et ses effets visuels.
- Conserver les démonstrations simples : une idée principale par application.
- Ajouter un mode de debug pour vitesse, force, cible, rayon de perception et chemin.

## Références

- [Tutoriels p5.js](../article_craig_reynolds/p5-tutorials.html)
- [Référence p5.js](../article_craig_reynolds/p5-reference.html)
- [Craig Reynolds, Steering Behaviors](../article_craig_reynolds/gdc99-steering-behaviors.html)
