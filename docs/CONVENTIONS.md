# Conventions partagées — µcBlockly · BlocklyDuino v3 · Factory v3 · BlocklyStudio

Document **canonique** pour l’écosystème. Les autres projets y renvoient ; en cas de divergence, ce fichier (dans µcBlockly) fait foi, avec les adaptations de copyright / arborescence indiquées ci-dessous.

| Projet | Rôle | Racine code | Copyright en-tête |
|--------|------|-------------|-------------------|
| **µcBlockly** | Noyau Blockly + générateur Arduino | `src/`, `extensions/` | `Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)` |
| **BlocklyDuino-v3** | Application hôte | `src/` | `Copyright 2026 ASTUCE (Sébastien Canet) / BlocklyDuino` |
| **BlocklyDuinoFactory-v3** | Créateur de blocs | `overlay/` (+ fork `upstream/` AGPL) | idem BlocklyDuino |
| **BlocklyStudio** | Coquille page + modules | `src/`, `public/`, `scripts/` | `Copyright 2026 ASTUCE (Sébastien Canet) / BlocklyStudio` |

Licence unique : **AGPL-3.0-or-later** (`SPDX-License-Identifier: AGPL-3.0-or-later`).

---

## 1. En-tête de fichier (obligatoire)

Ordre fixe, deux blocs distincts :

```ts
/**
 * @packageDocumentation
 * @module Project.Area.Topic
 * @description One concise English sentence.
 * @remarks
 * Optional context: why this module exists, non-obvious constraints,
 * links to related modules. Prefer bullets for several points.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright … ASTUCE …
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
```

Règles :

- **Pas** de licence verbeuse (« This program is free software… ») dans les sources — le texte complet est dans `LICENSE`.
- **Pas** de copyright Google / Apache dans les sources produit (Factory : fork `upstream/` aussi en AGPL ; provenance Apache uniquement dans `NOTICE`).
- `@module` : PascalCase segments séparés par `.` (ex. `Arduino.Generators.Logic`, `Host.Settings`, `Factory.Overlay.Branding`).
- Fichiers très petits (types-only, re-export) : `@packageDocumentation` + `@description` suffisent ; `@remarks` optionnel.
- Extensions runtime (`.js` ESM) : en-tête licence compact + court commentaire de contrat d’export ; pas besoin de TypeDoc complet.

---

## 2. Documentation des symboles (TSDoc)

Langue des commentaires API : **anglais** (TypeDoc / lisibilité cross-équipe).  
Chaînes UI, README produit, docs pédagogiques : **français** autorisé (souvent préféré).

### Fonctions / méthodes exportées

```ts
/**
 * What it does in one sentence (not a Title Case rewrite of the name).
 * @param workspace - Blockly workspace to scan.
 * @param language - Codegen target (`arduino` or `micropython`).
 * @returns Generated source code.
 */
export function workspaceToCode(...) { ... }
```

- Toujours `@param` / `@returns` utiles (pas de tautologie `@param x - \`x\` value.`).
- Types complexes : préciser les valeurs attendues (`arduino` \| `micropython`, pas `fr` \| `en` si ce n’est pas ça).
- `@throws` seulement si l’appelant doit vraiment gérer l’erreur.
- Méthodes de classe publiques : même règle ; privates : JSDoc court ou commentaire `//` si le « pourquoi » n’est pas évident.

### Ce qu’il ne faut pas faire

- Descriptions auto « Workspace To Code » / « Gets The ».
- Dupliquer le type TypeScript dans le prose (`@param n - number`).
- `@fileoverview` (legacy) — fusionner dans `@description` / `@remarks`.

---

## 3. Commentaires *dans* les fonctions

Expliquer le **pourquoi**, pas le **quoi** évident.

```ts
// Defer until drag ends: flyout drops fire events while isDragging is still true.
queueWorkspaceEnforcement(workspace, () => enforce(workspace));
```

Éviter :

```ts
// Increment i
i++;
```

Autorisé : garde-fous non évidents, contournements Blockly, invariants, TODO datés (`// TODO(2026-09): …`).

---

## 4. Découpage en fichiers

| Principe | Détail |
|----------|--------|
| **Une responsabilité** | Un module = un sujet (ex. enforcer structure ≠ enforcer types). |
| **Taille** | Viser **&lt; ~400 lignes** ; découper au-delà de **~500–600** sauf tables de données. |
| **Façade** | `index.ts` / `foo.ts` réexporte ; logique dans `foo_*.ts`. |
| **UI blocs ≠ génération** | Définitions blocs séparées des générateurs (µcBlockly : `categories/` vs `generators/`). |
| **Host vs noyau** | Code produit (menus, settings, upload) hors du kernel embed. |
| **Factory** | Personnalisations dans `overlay/` ; sync `upstream/` via script (relicense AGPL). |
| **Nommage** | `snake_case.ts` pour les modules ; exports camelCase / PascalCase. |

Quand ajouter un fichier : si deux concerns distincts, ou si un fichier mélange i18n + DOM + codegen.

---

## 5. Style de code TypeScript

- `type` / `interface` exportés documentés brièvement.
- Préférer `const` + fonctions nommées exportées ; classes seulement si état / polymorphisme Blockly.
- Imports : types avec `import type` quand possible.
- Pas de `any` sans justification locale (`// eslint-disable-next-line` + pourquoi).
- Indentation **2 espaces**, UTF-8 (voir `.editorconfig`).
- Guillemets : **doubles** `"` dans le code TS produit (aligné ESLint µcBlockly) ; respecter le style local d’un fichier déjà cohérent lors d’un petit patch.
- Pas de refactor opportuniste hors demande.

---

## 6. Documentation hors code

| Artefact | Où |
|----------|-----|
| Architecture / où changer quoi | `docs/ARCHITECTURE.md` (µcBlockly) ; README + docs courts dans les apps |
| Contribuer | `docs/CONTRIBUTING.md` (chaque dépôt, pointe vers ce fichier pour le style) |
| Inventaire fonctions | `npm run extract-functions` → `docs/functions-list.md` (µcBlockly) |
| API générée | TypeDoc (`npm run docs`) quand le projet l’expose |
| Licence / provenance fork | `LICENSE`, `NOTICE` |

Mettre à jour la doc **dans le même PR** qu’un changement de layout ou d’API publique.

---

## 7. Checklist avant commit / PR

1. En-tête `@packageDocumentation` + `@license` AGPL compact présents.
2. Symboles exportés documentés (anglais, params exacts).
3. Commentaires internes = pourquoi.
4. Fichier pas devenu un « god module » (>600 L sans raison).
5. `npm run lint` / `test` du dépôt concerné.
6. Pas de copyright / SPDX Apache résiduel dans le code produit.

---

## 8. Références croisées

- µcBlockly : [ARCHITECTURE.md](./ARCHITECTURE.md), [CONTRIBUTING.md](./CONTRIBUTING.md), [KERNEL.md](./KERNEL.md)
- BlocklyDuino-v3 : `docs/CONTRIBUTING.md`, `README.md`
- Factory v3 : `docs/CONTRIBUTING.md`, `NOTICE`, `UPSTREAM.md`
- BlocklyStudio : `docs/CONTRIBUTING.md`, `docs/CONVENTIONS.md`, `docs/INVENTAIRE_HOST_STUDIO.md`
