# Spécification 1 — Seek

## Tâche 1

- Ajouter un curseur de nombre de vaisseaux : minimum 1, maximum 200, pas 1.
- Ajouter un curseur de vitesse maximale : 0 à 20, pas 0,01.
- Ajouter un curseur d'accélération maximale : 0 à 10.
- Afficher les curseurs dans une zone supérieure semi-transparente, repliable comme un accordéon.
- Synchroniser le raccourci `D` et la checkbox du mode debug.
- Afficher les vecteurs vitesse en rouge uniquement lorsque le debug est actif.

## Tâche 2

- Animer un dégradé radial centré sur la souris.
- Utiliser les couleurs de l'arc-en-ciel.
- Exposer des curseurs pour le rayon, la vitesse de changement des couleurs, la saturation et l'opacité.

## Tâche 3 — Scénarios de poursuite et de fuite

- Ajouter un menu déroulant pour sélectionner le scénario actif.
- Scénario 1 : les vaisseaux suivent la balise contrôlée par la souris.
- Scénario 2 : les vaisseaux changent de direction toutes les 4 secondes jusqu'à voir un cristal dans leur rayon de perception, puis le poursuivent.
- Scénario 3 : les cristaux utilisent le comportement `Flee` lorsqu'un vaisseau s'approche.
