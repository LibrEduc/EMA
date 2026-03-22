# Documentation API — µcBlockly

Ce site est généré avec **[TypeDoc](https://typedoc.org/)** à partir des sources TypeScript dans `src/`.

## Générer la documentation

```bash
npm run docs
```

La sortie HTML est écrite dans **`docs/api/`**. Ouvrez `docs/api/index.html` dans un navigateur (ou servez le dossier avec un serveur HTTP statique).

## Conventions de commentaires (TSDoc)

Les commentaires suivent la spécification **[TSDoc](https://tsdoc.org/)**, compatible avec TypeDoc et validée par ESLint (`eslint-plugin-tsdoc`).

- **`@packageDocumentation`** — en tête de fichier : rôle du module (affiché par TypeDoc).
- **`@module`** — identifiant hiérarchique du module (ex. `Arduino.Generators.Math`).
- **`@description`**, **`@remarks`** — description courte / détails.
- **`@param`**, **`@returns`** — API publiques (fonctions, méthodes).
- **`@license`**, **`@author`** — métadonnées si besoin.

Évitez les balises **`@fileoverview`** (héritage JSDoc) : intégrez le texte dans `@remarks` ou `@description` du bloc `@packageDocumentation`.

Pour plus de détails, voir [docs/ARCHITECTURE.md](./ARCHITECTURE.md) et [docs/CONTRIBUTING.md](./CONTRIBUTING.md).
