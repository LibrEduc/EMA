# Ajouter un bloc dans le noyau (guide débutant)

Ce guide explique comment ajouter un **nouveau bloc compilé dans µcBlockly** (définition UI + code Arduino + type + toolbox).

> **Chemin recommandé pour le matériel** (servo, capteurs…) : pack runtime **sans rebuild** — [AJOUTER_EXTENSION.md](./AJOUTER_EXTENSION.md).  
> Utilise ce guide seulement si tu modifies le **noyau** (logique, math, board, listes…).

## Carte mentale (4 couches)

```
1. Apparence / champs     →  src/categories/blockly/
2. Code C++ généré        →  src/generators/arduino/blocks/
3. Type de sortie         →  src/generators/arduino/block_types/
4. Présence dans le menu  →  src/toolbox/categories/  (+ toolbox_data.ts)
```

Branchement final :

- définitions : `src/categories/blockly/index.ts` (`defineXxxBlocks`)
- générateurs : `src/generators/arduino.ts` (`...spread` du module)
- types : `src/generators/arduino/block_types/index.ts`

## Exemple minimal (valeur)

Imagine un bloc `math_double` qui double un nombre.

### 1. Définition (UI)

Dans un fichier de catégorie (ex. `src/categories/blockly/math.ts` ou un nouveau `math_extras.ts` importé par la façade) :

```ts
Blockly.Blocks["math_double"] = {
  init(this: Blockly.Block) {
    this.appendValueInput("NUM").setCheck("Number").appendField("double");
    this.setOutput(true, "Number");
    this.setStyle("math_blocks");
  },
};
```

Enregistre-le dans `defineMathCompatBlocks` / `defineArrayBlocks` / etc. via `index.ts`.

### 2. Générateur Arduino

Dans `src/generators/arduino/blocks/math_ops.ts` (ou un fichier dédié réexporté par `math.ts`) :

```ts
export function math_double(
  block: Block,
  generator: ArduinoGenerator,
): [string, Order] {
  const num = generator.valueToCode(block, "NUM", Order.NONE) || "0";
  return [`((${num}) * 2)`, Order.MULTIPLICATION];
}
```

Vérifie que `src/generators/arduino.ts` importe déjà le module `math` (spread `...math`).  
Si tu crées un **nouveau** fichier module, ajoute `import * as monModule` + `...monModule` dans ce fichier.

### 3. Type de sortie

Dans `src/generators/arduino/block_types/math.ts` :

```ts
math_double: "int", // ou "float" / "__DYNAMIC__…"
```

Les types dynamiques sont câblés dans `block_types_dynamic.ts` — voir [TYPES_ET_COMPATIBILITES.md](./TYPES_ET_COMPATIBILITES.md).

### 4. Toolbox

Dans `src/toolbox/categories/maths.ts` :

```ts
block("math_double"),
```

Détails : [MODIFIER_TOOLBOX.md](./MODIFIER_TOOLBOX.md).

### 5. Vérifier

```bash
npm run build:lib
npm run test
npm run dev
```

## Où chercher un exemple existant ?

| Besoin | Exemple |
|--------|---------|
| Blocs carte (setup, pins, série) | `categories/blockly/board_*.ts` + `generators/.../blocks/board_*.ts` |
| Listes / tableaux | `array_list_defs.ts` + `generators/.../blocks/array_*.ts` |
| Texte | `categories/blockly/text.ts` + `generators/.../blocks/text_*.ts` |
| Connexions typées strictes | `strict_connection_*.ts`, `configure_*_blocks.ts` |

## Conventions

- En-têtes + TSDoc anglais : [CONVENTIONS.md](./CONVENTIONS.md)
- Un fichier ≈ une responsabilité ; viser &lt; ~400 lignes
- Commentaires dans le corps : **pourquoi**, pas paraphraser le code

## Voir aussi

- [TUTORIEL_MICRO_BLOC.md](./TUTORIEL_MICRO_BLOC.md) — pas à pas + smoke test
- [DEBUTER_CODE.md](./DEBUTER_CODE.md) — carte d’entrée contributeur
- [GLOSSAIRE.md](./GLOSSAIRE.md)
- [AJOUTER_EXTENSION.md](./AJOUTER_EXTENSION.md) — packs runtime (préféré pour le hardware)
- [ARCHITECTURE.md](./ARCHITECTURE.md) — vue d’ensemble
- [REPARTITION_FICHIERS.md](./REPARTITION_FICHIERS.md) — découpages déjà faits
