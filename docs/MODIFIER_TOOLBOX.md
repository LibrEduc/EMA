# Modifier la toolbox (guide débutant)

Ce guide explique comment **ajouter, retirer ou réordonner des blocs** dans le menu latéral (toolbox) de µcBlockly, **sans** toucher au moteur Blockly.

## Où éditer ?

Chaque catégorie a **son fichier** :

```
src/toolbox/categories/
  logic.ts      ← Logique (si, comparer, …)
  loops.ts      ← Boucles
  maths.ts      ← Math
  board.ts      ← Carte / broches / série
  lists.ts
  …
src/toolbox_data.ts   ← ordre des catégories dans le menu
```

> Pour de **nouveaux** blocs matériels (servo, capteurs…), le chemin recommandé reste un **pack** sous `extensions/` — voir [AJOUTER_EXTENSION.md](./AJOUTER_EXTENSION.md).  
> Pour un **nouveau bloc noyau** (définition + C++ + type) : [AJOUTER_BLOC_NOYAU.md](./AJOUTER_BLOC_NOYAU.md).  
> Carte d’entrée : [DEBUTER_CODE.md](./DEBUTER_CODE.md).
>
> Ce guide concerne surtout la toolbox **noyau** déjà compilée.

## Exemple : ajouter un bloc dans Logique

Ouvre `src/toolbox/categories/logic.ts` :

```ts
export const logicCategory = category("CAT_LOGIC", {
  style: "logic_category",
  icon: "fa-diagram-project",
}, [
  block("controls_if"),
  block("controls_ifelse"),
  block("controls_switch"),   // ← ajoute une ligne
  // …
]);
```

1. Ajoute `block("id_du_bloc")` dans le tableau.
2. L’`id` doit être un type de bloc **déjà défini** (ex. dans `src/categories/blockly/`).
3. Relance `npm run dev` (ou rebuild) pour voir le résultat.

## Retirer un bloc

Supprime (ou commente) la ligne `block("…")` correspondante.

## Changer l’ordre des catégories

Édite la liste dans `src/toolbox_data.ts` :

```ts
buildToolbox([
  searchCategory,
  libreCategory,
  boardCategory,
  logicCategory,   // déplace ces lignes
  loopsCategory,
  // …
])
```

## Helpers disponibles (`src/toolbox/builder.ts`)

| Helper | Rôle | Exemple |
|--------|------|---------|
| `block("type")` | Un bloc | `block("controls_if")` |
| `block("type", { inputs })` | Bloc avec shadows | voir ci-dessous |
| `category(name, opts, […])` | Catégorie / sous-catégorie | `category("CAT_LOGIC", { style, icon }, […])` |
| `sep()` | Séparateur | entre listes et variables |
| `search("CAT_SEARCH")` | Barre de recherche | déjà dans `search.ts` |
| `numberShadow(1000)` | Valeur nombre par défaut | entrée DELAY |
| `textShadow("hi")` | Texte par défaut | entrée TEXT |

### Bloc avec valeur par défaut (shadow)

```ts
import { block, numberShadow } from "../builder";

block("board_base_time_delay", {
  inputs: {
    DELAY_TIME: numberShadow(1000),
  },
})
```

### Sous-catégorie

```ts
category("CAT_BOARD", { style: "board_category", icon: "fa-microchip" }, [
  category("CAT_BOARD_TIME", { style: "board_category", icon: "fa-clock" }, [
    block("board_base_time_millis"),
  ]),
])
```

## Créer une nouvelle catégorie noyau

1. Crée `src/toolbox/categories/ma_categorie.ts` sur le modèle de `logic.ts`.
2. Importe-la dans `src/toolbox_data.ts` et ajoute-la dans `buildToolbox([...])`.
3. Ajoute la clé i18n (`CAT_…`) dans `src/languages/` si besoin.

## Checklist

- [ ] Le `type` du bloc existe déjà (définition Blockly)
- [ ] Fichier de catégorie modifié (ou nouveau fichier + import dans `toolbox_data.ts`)
- [ ] `npm run dev` / build OK
- [ ] Pas besoin de modifier `toolbox_types.ts` ni les filtres board pour un simple ajout de bloc
