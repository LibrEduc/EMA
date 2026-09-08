# Tutoriel : micro-bloc noyau (pas à pas)

Objectif : comprendre les **4 couches** en suivant un exemple minimal `math_double` (double un nombre).  
Ce tutoriel **ne modifie pas** le dépôt en production : le comportement est verrouillé par `tests/add-block-smoke.test.ts`.

> Matériel (servo…) → préfère [AJOUTER_EXTENSION.md](./AJOUTER_EXTENSION.md).  
> Carte d’entrée → [DEBUTER_CODE.md](./DEBUTER_CODE.md).

## Prérequis

```bash
npm install
npm run test -- tests/add-block-smoke.test.ts
```

## Les 4 couches (rappel)

| # | Couche | Où |
|---|--------|-----|
| 1 | UI (`Blockly.Blocks[…]`) | `src/categories/blockly/` |
| 2 | Générateur C++ | `src/generators/arduino/blocks/` |
| 3 | Type de sortie | `src/generators/arduino/block_types/` |
| 4 | Toolbox | `src/toolbox/categories/` |

Détail : [AJOUTER_BLOC_NOYAU.md](./AJOUTER_BLOC_NOYAU.md).

## Exercice guidé (dans un test)

Le smoke test enregistre un bloc **éphémère** `ucb_smoke_double` :

1. Définition UI avec entrée `NUM` (`Number`) et sortie `Number`
2. Générateur qui émet `((expr) * 2)`
3. Workspace + `workspaceToCode` → le sketch contient `* 2`

Lis `tests/add-block-smoke.test.ts` : c’est le « vrai » exemple exécutable.

## Si tu veux le faire dans le noyau (vrai PR)

1. Ajoute la définition dans un fichier math (ou `math_extras.ts` + façade)
2. Ajoute le générateur dans `math_ops.ts` (ou fichier dédié réexporté)
3. Ajoute le type dans `block_types/math.ts`
4. Ajoute `block("math_double")` dans `toolbox/categories/maths.ts`
5. `npm run build:lib && npm run test && npm run dev`

## Vérifier après toute modif

```bash
npm run build:lib
npm run test
```

## Voir aussi

- [GLOSSAIRE.md](./GLOSSAIRE.md)
- [TYPES_ET_COMPATIBILITES.md](./TYPES_ET_COMPATIBILITES.md)
- [MODIFIER_TOOLBOX.md](./MODIFIER_TOOLBOX.md)
