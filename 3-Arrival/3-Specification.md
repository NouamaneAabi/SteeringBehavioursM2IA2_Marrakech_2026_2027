# Spécification 3 — Snake Arrival

## Tâche 1 — Serpent piloté par la souris

- Snake, SnakeHead et SnakeRing sont des sous-classes de Vehicle.
- La tête utilise Arrival vers la souris.
- Chaque anneau suit une position historique derrière le serpent, avec une ondulation douce.
- Le curseur règle le nombre d’anneaux et les curseurs règlent l’ondulation.

## Tâche 2 — Direction artistique

- Ajouter une tête expressive, des anneaux lumineux, une langue fourchue et une ligne de traînée.
- Afficher un HUD lisible et un mode debug avec la touche D.

## Tâche 3 — Croissance et prédateur — implémentée

- Le serpent commence avec 8 anneaux.
- Les cristaux sont mangés par la tête et demandent une croissance progressive.
- Les anneaux supplémentaires apparaissent un par un, afin d’éviter un agrandissement brutal.
- Un prédateur apparaît périodiquement, poursuit la tête avec une prédiction de trajectoire et disparaît après quelques secondes.
- Le joueur doit éloigner la souris du prédateur tout en continuant à manger.
- R réinitialise la partie.

## Tâche 4 — À venir

- Ajouter plusieurs types de nourriture et des bonus temporaires.
- Ajouter des niveaux et des prédateurs avec des profils différents.
- Ajouter un meilleur score et des effets sonores.