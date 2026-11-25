# Steering Behaviors en p5.js

Collection d'applications pédagogiques consacrées aux steering behaviors de Craig Reynolds, dans le cadre du module M2 IA 2 — Marrakech 2026–2027.

## Règles du projet

Les décisions d'architecture et les conventions communes sont décrites dans [ARCHITECTURE.md](./ARCHITECTURE.md). Les consignes destinées aux assistants sont disponibles dans [AGENTS.md](./AGENTS.md), [CLAUDE.md](./CLAUDE.md), [CODEX.md](./CODEX.md), [GEMINI.md](./GEMINI.md) et [.github/copilot-instructions.md](./.github/copilot-instructions.md).

## Exemples disponibles

<!-- BEGIN GENERATED: examples -->
- `1-Seek` - recherche d'une cible.
- `2-PursueEvade` - poursuite et evitement.
- `2-PursueEvade_correction` - poursuite et evitement.
- `3-Arrival` - arrivee avec ralentissement.
- `3-Arrival_correction` - arrivee avec ralentissement.
- `4-Wander` - errance controlee.
<!-- END GENERATED: examples -->

Chaque dossier peut être ouvert directement avec un serveur statique local. Les bibliothèques p5.js sont déjà présentes dans les exemples.

## Références téléchargées

- [Article de Craig Reynolds — Steering Behaviors](./article_craig_reynolds/gdc99-steering-behaviors.html)
- [Tutoriels officiels p5.js](./article_craig_reynolds/p5-tutorials.html)
- [Référence officielle p5.js](./article_craig_reynolds/p5-reference.html)
- [Bonnes pratiques p5.js du projet](./docs/p5-coding-guidelines.md)

## Mise à jour automatique

La section des exemples est générée à partir des dossiers numérotés par [scripts/update-readme.ps1](./scripts/update-readme.ps1). Exécuter `powershell -ExecutionPolicy Bypass -File scripts/update-readme.ps1` après l'ajout ou le renommage d'une application. Le script est sans dépendance et conserve les sections écrites à la main.

## Passation entre assistants

Le contexte de travail courant, les décisions et les prochaines étapes sont consignés dans [HANDOFF.md](./HANDOFF.md).
