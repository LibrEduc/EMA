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
- `arduino_generator_pins` / `_scrub` — lot A de `arduino_generator.ts` (pins + scrub/quote)
- `arduino_generator_init_vars` — lot B de `arduino_generator.ts` (collecte / déclarations globales dans `init`)
- `arduino_generator_validate` / `_debug` — lot C (validation + snapshot bags)
- Guides débutant : `DEBUTER_CODE.md`, `GLOSSAIRE.md`, `TUTORIEL_MICRO_BLOC.md`, `AJOUTER_BLOC_NOYAU.md` (+ toolbox / extension déjà là)
- **`src/index.ts`** découpé → `src/demo/demo_*.ts` + `continuous_toolbox.ts`
- **`board_profiles/`** par famille (façade `index.ts`) ; smoke `tests/add-block-smoke.test.ts`
- **`npm run build:extensions`** ; smoke `tests/extension-pack-smoke.test.ts`
- **`array_sync_*` / `variables_declare_*` / `shell_shortcuts_help_i18n`**
- **`shell_shortcuts_help`** → dialog / edit / façade ; **`configure_procedure_*`** ; **`array_declare_*`** (declare/create/fix/get_index)

- `order.ts` + `arduino_code_format.ts` — générateur
- `shared.ts` ≈ **193 L** façade (était ~1250 L)

| Priorité | Sujet | Notes |
|----------|--------|--------|
| Haute | ~~Boot DOM démo (`getElementById` + `!`)~~ | ✅ `demo/demo_dom.ts` — résolution unique + bandeau + abort |
| Moyenne | ~~Pipeline unique extensions `.ts` → `.js`~~ | ✅ `npm run build:extensions` + sources runtime-contrat (`extensions/servo/*.ts`) |
| Moyenne | ~~Isoler `blockly_patches.ts`~~ | ✅ façade + `src/blockly_patches/*` |
| Moyenne | ~~Extraire `BOARD_PROFILES` hors de `boards.ts`~~ | ✅ `board_profiles/` (familles) / `boards.ts` (validateurs) |
| Moyenne | ~~Étendre `core-api.test.ts`~~ | ✅ boards + `createUcBlockly` (jsdom) ; interop CJS plugins |
| Basse | ~~Factoriser mutators `+/-`~~ | ✅ `plus_minus_mutator.ts` (`createPartListPlusMinusMutator` + `registerMutatorOnce`) ; array / libre / switch |

| Basse | ~~Headers packs + `@version`~~ | ✅ SPDX sur `extensions/servo` runtime `.js` |
| — | ~~`array_sync` / `variables_declare`~~ | ✅ façades + modules ownership/access/literal / declare_* |
| — | ~~i18n aide raccourcis~~ | ✅ `shell_shortcuts_help_i18n.ts` |
| Moyenne | ~~Shell help dialog / edit~~ | ✅ `shell_shortcuts_help_{dialog,edit}.ts` + façade |
| Moyenne | ~~`configure_procedure_blocks`~~ | ✅ types / plus_minus / defs / calls |
| Moyenne | ~~`array_declare_defs`~~ | ✅ declare / create / fix / get_index + shared |
| — | `shortcut_preferences.ts` | Laissé (~413 L) : storage + apply trop entrelacés |
| Basse | `ucblockly_workspace_manager` / `workspace_flex` / shell démo | Gros mais hors chemin blocs débutant |

### Produits dérivés (suivi croisé)

| Projet | Fait (P0 / P1) | Suite |
|--------|----------------|--------|
| BlocklyDuino-v3 | Lint stub ; README kernel ; **`styles/` découpé** (+ `fonts.css`) ; [MICROPYTHON.md](../../BlocklyDuino/BlocklyDuino-v3/docs/MICROPYTHON.md) ; **`app.ts` → `app/`** (workspace, shell_ui, toolbar, language, types) | — |
| Factory-v3 | `sync` + overlay README ; **`branding.ts`** SPDX ; **modal export** → `factory_extension_modal_i18n.ts` | Split toolbar plus loin si besoin |

Voir aussi [ARCHITECTURE.md](./ARCHITECTURE.md) et [REPARTITION_FICHIERS.md](./REPARTITION_FICHIERS.md).
