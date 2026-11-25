# Instructions pour les assistants IA

Avant toute modification, lire [ARCHITECTURE.md](./ARCHITECTURE.md), [docs/p5-coding-guidelines.md](./docs/p5-coding-guidelines.md) et [HANDOFF.md](./HANDOFF.md). Respecter une classe maximum par fichier et la règle « tout élément animé est un `Vehicule` ou une sous-classe ».

Inspecter l'exemple concerné avant d'éditer. Préserver les corrections pédagogiques existantes. Pour une nouvelle entité, créer un fichier dédié qui étend `Vehicule`, puis l'instancier depuis `sketch.js`. Ne pas mélanger une correction avec une refonte globale.

Après modification, ouvrir l'application concernée avec un serveur statique, vérifier la console du navigateur et mettre à jour [HANDOFF.md](./HANDOFF.md) ainsi que le README avec `scripts/update-readme.ps1`.
