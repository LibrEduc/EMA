<div align="center">

![µcBlockly](../public/assets/logo_µcBlockly.png)

# Suivi d’améliorations (v3)

</div>

Document de suivi **à jour pour la v3** (Blockly 13). Les anciennes notes de revue (tailles de fichiers, flags `ENABLE_*`, « aucun test ») sont obsolètes et ont été retirées.

---

## Déjà en place (ne pas rouvrir)

- Séparation **core / host / demo** (`package.json` exports, [KERNEL.md](./KERNEL.md))
- Cycle `shared` ↔ `block_types_registry` cassé (injection `registerVariableTypeForBlockResolver`)
- Génération : workspace vide sans stubs ; setup/loop vides émis si les blocs sont présents ; erreurs de définition de listes en section globale
- Headers GPL + `@packageDocumentation` uniformes ; quasi zéro `any` / `@ts-ignore`
- Tests sous `tests/*.test.ts` (générateurs, typing, fields, convertisseur rduino, core-api, instances)
- Doc instances : [INSTANCES.md](./INSTANCES.md)
- **Entrée contributeur clarifiée** : pack runtime = chemin par défaut ([AJOUTER_EXTENSION.md](./AJOUTER_EXTENSION.md)) ; guide noyau en secondaire

---

## Pistes encore ouvertes

### Fait récemment (découpage)

- `blockly_i18n.ts` — `getBlocklyMsg*` + warnings
- `shared_blockly_checks.ts` — `getBlocklyCompatibleChecks` + checks tableaux
- `shared_board_int.ts` — `enforceIntOnlyValueInputs` / handlers board
- `shared_var_scope.ts` — scope procédure vs global
- `shared_procedures.ts` — ARG checks / types paramètres (+ bind inférence)
- `shared_type_inference.ts` — `inferConnectedValueType`
- `shared_variable_model.ts` — flags mutables + sync numérique
- `shared_variable_resolve.ts` — `resolveVariableTypeForBlock`
- `shared_variable_handlers.ts` — `handleVariablesSetChange` / revalidate*
- `array_sync.ts` + `array_mutators.ts` — découpage de `array.ts` (ownership / sync / mutators)
- `variables_types` / `_access` / `_declare` / `_cast_local` — découpage de `variables.ts`
- `toolbox_types` / `toolbox_data` / `toolbox_filters` — découpage de `toolbox.ts`
- `toolbox/builder.ts` + `toolbox/categories/*` — une catégorie = un fichier
- `logic_switch.ts` + `logic_if_extras.ts` — découpage de `logic.ts`
- `board_shared` / `_structure` / `_io` / `_time` / `_conversion` / `_serial` / `_pins` — découpage de `board.ts`
- `configure_math` / `_loop` / `_text` / `_procedure` (+ `_logic` existant) — découpage de `configure_standard_blocks.ts`
- `generators/.../blocks/array_*` — découpage du générateur `array.ts` (helpers / list / declare / bitmap)
- `categories/.../array_list_defs` + `array_declare_defs` — découpage des définitions de blocs `array.ts`
- `generators/.../blocks/board_*` — découpage du générateur `board.ts` (structure / io / time / serial / conversion)
- `generators/.../blocks/math_*` — découpage du générateur `math.ts` (literals / ops / checks / list_random)
- `generators/.../blocks/text_*` — découpage du générateur `text.ts` (expr / literals / ops / transform / io)
- `block_types_array_infer` / `_dynamic` / `_compat` — découpage de `block_types_registry.ts`
- `strict_connection_array` / `_procedure` (+ `_type_utils`) — découpage de `strict_connection_checker.ts`
- `order.ts` + `arduino_code_format.ts` — générateur
- `shared.ts` ≈ **193 L** façade (était ~1250 L)

| Priorité | Sujet | Notes |
|----------|--------|--------|
| Haute | ~~Boot DOM démo (`getElementById` + `!`)~~ | ✅ `demo/demo_dom.ts` — résolution unique + bandeau + abort |
| Moyenne | Pipeline unique extensions `.ts` → `.js` | Éviter dérive dual (ex. `extensions/servo`) |
| Moyenne | ~~Isoler `blockly_patches.ts`~~ | ✅ façade + `src/blockly_patches/*` |
| Moyenne | ~~Extraire `BOARD_PROFILES` hors de `boards.ts`~~ | ✅ `board_profiles.ts` (données) / `boards.ts` (validateurs) |
| Moyenne | ~~Étendre `core-api.test.ts`~~ | ✅ boards + `createUcBlockly` (jsdom) ; interop CJS plugins |
| Basse | Factoriser mutators `+/-` | `array` / `libre` / `logic` |
| Basse | ~~Headers packs + `@version`~~ | ✅ SPDX sur `extensions/servo` runtime `.js` |

### Produits dérivés (suivi croisé)

| Projet | Fait (P0 / P1) | Suite |
|--------|----------------|--------|
| BlocklyDuino-v3 | Lint stub ; README kernel ; **`styles/` découpé** (+ `fonts.css`) ; [MICROPYTHON.md](../../BlocklyDuino/BlocklyDuino-v3/docs/MICROPYTHON.md) ; **`app.ts` → `app/`** (workspace, shell_ui, toolbar, language, types) | — |
| Factory-v3 | `sync` + overlay README ; **`branding.ts`** SPDX ; **modal export** → `factory_extension_modal_i18n.ts` | Split toolbar plus loin si besoin |

Voir aussi [ARCHITECTURE.md](./ARCHITECTURE.md) et [REPARTITION_FICHIERS.md](./REPARTITION_FICHIERS.md).
