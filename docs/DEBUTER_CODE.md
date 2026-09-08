# Débuter dans le code µcBlockly

Guide d’orientation pour **entrer dans le dépôt**, le maintenir et y ajouter des éléments sans se perdre.

## Par où commencer ?

1. Lire [ARCHITECTURE.md](./ARCHITECTURE.md) (layout `src/`, noyau vs démo).
2. Suivre la **checklist 1er PR** dans [CONTRIBUTING.md](./CONTRIBUTING.md).
3. Respecter [CONVENTIONS.md](./CONVENTIONS.md) (en-têtes, découpage fichiers, TSDoc).
4. Garder [GLOSSAIRE.md](./GLOSSAIRE.md) sous la main.

## Ne commence **pas** par `src/index.ts`

`index.ts` + `src/demo/` = **boot de la démo** (DOM, menus, a11y, plugins, resize). Ce n’est **pas** le cœur des blocs.

| Si tu veux… | Ouvre plutôt… |
|-------------|----------------|
| Forme d’un bloc | `src/categories/blockly/` |
| Code C++ émis | `src/generators/arduino/blocks/` |
| Menu latéral | `src/toolbox/categories/` |
| Types / connexions | `block_types*`, `strict_connection*`, `configure_*_blocks.ts` |
| Pins d’une carte | `src/board_profiles/` (données) + `boards.ts` (validateurs) |
| Matériel (servo…) | `extensions/` |
| Embed produit | `src/core/` ([KERNEL.md](./KERNEL.md)) |

## Que veux-tu faire ?

| Objectif | Guide / dossier |
|----------|-----------------|
| Changer le **menu** (toolbox) | **[MODIFIER_TOOLBOX.md](./MODIFIER_TOOLBOX.md)** → `src/toolbox/categories/` |
| Ajouter un bloc **noyau** (UI + C++ + type) | **[AJOUTER_BLOC_NOYAU.md](./AJOUTER_BLOC_NOYAU.md)** |
| Tutoriel pas à pas + test smoke | **[TUTORIEL_MICRO_BLOC.md](./TUTORIEL_MICRO_BLOC.md)** |
| Ajouter du **matériel** (servo, capteur…) | **[AJOUTER_EXTENSION.md](./AJOUTER_EXTENSION.md)** → `extensions/` + `npm run build:extensions` |
| Comprendre les **types / connexions** | [TYPES_ET_COMPATIBILITES.md](./TYPES_ET_COMPATIBILITES.md) |
| Instances nommées | [INSTANCES.md](./INSTANCES.md) |
| Embed / API publique | [KERNEL.md](./KERNEL.md) |
| Où sont les gros modules découpés ? | [REPARTITION_FICHIERS.md](./REPARTITION_FICHIERS.md) |

## Arbre de décision (debug)

```
Le bloc n’apparaît pas dans le menu ?
  → toolbox/categories/ + toolbox_data.ts  (MODIFIER_TOOLBOX)

Le bloc est là mais pas de / mauvais code C++ ?
  → generators/arduino/blocks/ + spread dans generators/arduino.ts

Deux blocs ne se connectent pas (prise rouge) ?
  → check setCheck / setOutput + TYPES_ET_COMPATIBILITES
  → strict_connection_* / configure_*_blocks.ts

Mauvais pins / carte ?
  → board_profiles/<famille>.ts  puis boards.ts (validateurs)

Matériel externe (servo, capteur) ?
  → extensions/  (pas le noyau)

Bug UI démo (menu, resize, a11y) ?
  → src/demo/  (pas categories/ ni generators/)
```

## Carte rapide des dossiers

```
src/
  categories/blockly/     ← forme des blocs (init, champs, mutators)
  generators/arduino/
    blocks/               ← code Arduino émis (un domaine = plusieurs petits fichiers)
    block_types/          ← type de sortie d’un bloc
    arduino_generator*.ts ← moteur (init, scrub, pins, format sketch)
    configure_*_blocks.ts ← règles de connexion typées sur blocs standards
  toolbox/categories/     ← contenu du menu latéral
  board_profiles/         ← données pins/CPU par famille de cartes
  extensions/             ← packs runtime (hors rebuild)
  core/ / host/ / demo/   ← noyau embed / shell produit / démo
  index.ts                ← orchestration démo uniquement
```

## Règle d’or

- **Hardware / nouveau périphérique** → pack `extensions/` d’abord.
- **Améliorer un bloc déjà dans le noyau** → couches de [AJOUTER_BLOC_NOYAU.md](./AJOUTER_BLOC_NOYAU.md).
- **Seulement afficher / cacher / réordonner** → [MODIFIER_TOOLBOX.md](./MODIFIER_TOOLBOX.md).

Après une modification : `npm run build:lib` puis `npm run test` (et `npm run dev` pour voir l’UI).
