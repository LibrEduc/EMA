<div align="center">

<img src="public/assets/logo_µcBlockly.png" alt="µcBlockly" width="128" height="128" style="vertical-align: middle;">

# µcBlockly

**Programmation visuelle de microcontrôleurs avec Blockly**

[![compilation status](https://github.com/A-S-T-U-C-E/ucBlockly/actions/workflows/node.js.yml/badge.svg?event=push)](https://github.com/A-S-T-U-C-E/ucBlockly/actions/workflows/node.js.yml)

<p>
  Construit avec
  <a href="https://developers.google.com/blockly">
    <img src="https://docs.blockly.com/images/logos/logo_only.png" alt="Blockly" width="32" height="32" style="vertical-align: middle;">
    Blockly
  </a>
  — génération de code Arduino/C++ à partir de blocs.
</p>

[Contribuer](docs/CONTRIBUTING.md) · [Noyau](docs/KERNEL.md) · [Architecture](docs/ARCHITECTURE.md) · [Documentation API](docs/TYPEDOC.md) · [Changelog](CHANGELOG.md) · [Wiki](https://wiki.libreduc.cc/fr:arduino:ucblockly)

</div>

---

## Compatibilité

**v3.0.0** nécessite **Blockly 13** (`blockly` ^13 et plugins `@blockly/*` alignés). Une intégration encore en Blockly 12 doit rester sur µcBlockly 2.x.

## Démarrage rapide

```bash
npm install
npm run dev      # serveur de développement (Webpack, rechargement à chaud)
npm run build    # build de production
```

Ouvrez l’URL affichée par Webpack (ou `public/index.html` après build) pour l’éditeur Blockly.

## Scripts npm

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement avec rechargement à chaud |
| `npm run build` | Compilation TypeScript + bundle Webpack (production) |
| `npm run build:lib` | Compilation TypeScript uniquement (`build/`) |
| `npm run lint` | ESLint sur `src/` (avec correction automatique) |
| `npm run test` | Tests de génération Arduino et convertisseur Blockly@rduino |
| `npm run check-translations` | Vérifie la cohérence des fichiers de langue |
| `npm run convert-rduino` | Convertit une sauvegarde Blockly@rduino vers le format µcBlockly |
| `npm run generate-favicon` | Régénère favicon et icônes à partir du logo |
| `npm run extract-functions` | Régénère l'inventaire `docs/functions-list.md` |
| `npm run docs` | Génère la documentation API TypeDoc dans `docs/api/` |

## Documentation

| Document | Contenu |
|----------|---------|
| [CHANGELOG.md](CHANGELOG.md) | Journal des versions et ruptures de compatibilité |
| [docs/KERNEL.md](docs/KERNEL.md) | Surface publique du noyau embeddable (`createUcBlockly`) |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Structure du code, conventions, flux principaux |
| [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md) | Coque UI, raccourcis clavier, repères ARIA |
| [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | Guide pour les contributeurs |
| [docs/TYPEDOC.md](docs/TYPEDOC.md) | Génération et conventions de la doc API |
| [docs/TYPES_ET_COMPATIBILITES.md](docs/TYPES_ET_COMPATIBILITES.md) | Typage des blocs et règles de compatibilité |
| [docs/INSTANCES.md](docs/INSTANCES.md) | Instances nommées (FieldInstance, Servo, collisions variables) |
| [docs/REPARTITION_FICHIERS.md](docs/REPARTITION_FICHIERS.md) | Analyse de la répartition du code entre fichiers |
| [docs/CODE_IMPROVEMENTS.md](docs/CODE_IMPROVEMENTS.md) | Pistes d’amélioration et optimisations |
| [docs/CONVERT_RDUINO.md](docs/CONVERT_RDUINO.md) | Conversion de sauvegardes Blockly@rduino |
| [docs/AJOUTER_EXTENSION.md](docs/AJOUTER_EXTENSION.md) | **Chemin recommandé** : ajouter un pack de blocs (ex. Servo) sans rebuild |
| [docs/AJOUTER_CATEGORIE_SERVOMOTEUR.md](docs/AJOUTER_CATEGORIE_SERVOMOTEUR.md) | Alternative : intégrer une catégorie **dans le noyau** (rebuild) |
| [docs/serialization-analysis.md](docs/serialization-analysis.md) | Sérialisation Blockly (sauvegarde/chargement) |
| [docs/functions-list.md](docs/functions-list.md) | Inventaire des fonctions exportées |
| [docs/INTEGRATION_DEPOT.md](docs/INTEGRATION_DEPOT.md) | Intégrer µcBlockly dans un autre projet |
| [Wiki LibrEduc](https://wiki.libreduc.cc/fr:arduino:ucblockly) | Miroir public des aides Markdown |

## Ressources visuelles

Le logo et les favicons sont dans `public/assets/` :

- `logo_µcBlockly.png` — logo principal (documentation, favicon source)
- `favicon-16x16.png`, `favicon-32x32.png`, `favicon-48x48.png`, `favicon.ico`, `apple-touch-icon.png` — icônes du site

Pour régénérer les favicons après modification du logo : `npm run generate-favicon`.

## Licence

GPL-3.0-or-later — voir les en-têtes des fichiers sources et [`LICENSE`](LICENSE).

Journal des modifications : [CHANGELOG.md](CHANGELOG.md).
