<div align="center">

![µcBlockly](../public/assets/logo_µcBlockly.png)

# Répartition des fonctions entre fichiers – Analyse et améliorations

</div>

## 1. Duplications identifiées (historique — corrigées depuis 2.1.5 / v3)

Les sections ci-dessous décrivent d’anciennes duplications **déjà résolues**. Voir §4 « Plan d’action ». Pour les pistes encore ouvertes en v3, voir [CODE_IMPROVEMENTS.md](./CODE_IMPROVEMENTS.md).


### 1.1 `getBlocklyMsg` / `getBlocklyMsgOr` ✅

| Fichier | Rôle |
|--------|------|
| **`categories/blockly/shared.ts`** | Source canonique (exportée). |
| **`generators/arduino/configure_standard_blocks.ts`** | Importe depuis `shared`. |
| **`generators/arduino/typed_variables_flyout.ts`** | Importe depuis `shared`. |

---

### 1.2 Labels / options de dropdown type variable ✅

| Fichier | Rôle |
|--------|------|
| **`categories/blockly/variables.ts`** | `getArduinoTypeLabel`, `getArduinoTypeDropdownOptions` (exportés). |
| **`generators/arduino/configure_standard_blocks.ts`** | Importe `getArduinoTypeDropdownOptions` depuis `variables.ts`. |

---

### 1.3 Type `VariableWithMutableType` ✅

| Fichier | Rôle |
|--------|------|
| **`categories/blockly/shared.ts`** | Type exporté (avec `__ucbManualType`, etc.). |
| **`generators/arduino/configure_standard_blocks.ts`** | Import depuis `shared`. |

---

### 1.4 Wrapper « set type + manuel » ✅

Helper **`setVariableTypeAndMarkManual`** dans `shared`, utilisé dans `configure_standard_blocks` et `variables_set_type`.

---

## 2. Répartition actuelle – points corrects

- **`block_types.ts`** : règles de types pures (`TYPE_COMPATIBILITY`, `ARDUINO_TYPE_TO_INTERNAL`, `getInternalTypeForArduinoType`, `getCompatibleTypes`, `isTypeCompatible`, `getVariableTypeOptions`). Pas de Blockly. Documenté dans [TYPES_ET_COMPATIBILITES.md](./TYPES_ET_COMPATIBILITES.md).
- **`block_types_registry.ts`** : registre, `checkTypeCompatibility` (côté Blockly), `getCompatibleTypesForCheck`, application aux blocs. Utilise `block_types`. Bonne séparation.
- **`variable_utils.ts`** : `setVariableType`, `clearVariableType`, `normalizeVariableType`. Utilisé par shared, variables, logic, configure_standard_blocks, workspace manager. Rôle clair.
- **`shared.ts`** : façade (~193 L) ; logique dans `shared_*.ts` / `blockly_i18n.ts`.

---

## 3. Améliorations structurelles optionnelles

### 3.1 Découpage de `shared.ts`

`shared` mêle i18n, inférence de types, handlers de variables, messages d’avertissement, validation.

**Fait :**

- **`blockly_i18n.ts`** : `getBlocklyMsg`, `getBlocklyMsgOr`, warnings typés
- **`shared_blockly_checks.ts`** : `getBlocklyCompatibleChecks`, checks Array_declare / index
- **`shared_board_int.ts`** : `enforceIntOnlyValueInputs`, handlers board
- **`shared_var_scope.ts`** : procédure vs global (`hasRealGlobalVariableUse`, …)
- **`shared_procedures.ts`** : types ARG / paramètres ; `bindInferConnectedValueType`
- **`shared_type_inference.ts`** : `inferConnectedValueType`, `normalizeBlocklyTypeToVariableType`
- **`shared_variable_model.ts`** : `VariableWithMutableType`, sync numérique
- **`shared_variable_resolve.ts`** : `resolveVariableTypeForBlock`, …
- **`shared_variable_handlers.ts`** : `handleVariablesSetChange`, revalidate*

`shared.ts` ≈ **193 L** : façade + `configure*VariableField` / `syncListVariableFromField` uniquement.

Découpage **`shared.ts`** : **terminé** pour l’objectif « god module ».

### 3.1bis `array.ts` (définitions blocs) ✅

| Fichier | Rôle |
|---------|------|
| **`array_sync.ts`** | Ownership déclarations listes, sync types / index, handlers `onchange` |
| **`array_mutators.ts`** | Mutators +/- `Array_with` / `Array_list_literal` |
| **`array_list_defs.ts`** | with / literal / get / modify / set |
| **`array_declare_defs.ts`** | declare / create / form / getIndex_in_array |
| **`array_bitmap.ts`** (+ `_grid`) | Bitmap |
| **`array.ts`** | Façade `defineArrayBlocks` + réexports sync publics |

### 3.2 `logic.ts` ✅

| Fichier | Rôle |
|---------|------|
| **`logic_switch.ts`** | Switch/case, mutator, typage des cases |
| **`logic_if_extras.ts`** | Blocs logique hors switch (if extras, etc.) |
| **`logic.ts`** | Façade + `defineControlsSwitchBlocks` |

### 3.2bis `board.ts` ✅

| Fichier | Rôle |
|---------|------|
| **`board_shared.ts`** | Helpers, styles, pin dropdowns, `registerExtensionPinDropdowns` |
| **`board_structure.ts`** | setup / loop / comment / include / define |
| **`board_io.ts`** | I/O digital/analog, pulse, map, tone |
| **`board_time.ts`** | delay / millis |
| **`board_conversion.ts`** | Conversions |
| **`board_serial.ts`** | Série |
| **`board_pins.ts`** | `refreshBoardPinDropdowns` |
| **`board.ts`** | Façade `defineBoardBlocks` + réexports publics |

### 3.3 `variables.ts` ✅

| Fichier | Rôle |
|---------|------|
| **`variables_types.ts`** | Labels / dropdowns types Arduino |
| **`variables_access.ts`** | get/set dynamique + extension blocs standards |
| **`variables_declare.ts`** | set_type, const, set_init, define |
| **`variables_cast_local.ts`** | cast + variables_local |
| **`variables.ts`** | Façade (réexports) |

### 3.4 `toolbox.ts` ✅

| Fichier | Rôle |
|---------|------|
| **`toolbox/builder.ts`** | Helpers débutant `block()` / `category()` |
| **`toolbox/categories/*.ts`** | Une catégorie = un fichier |
| **`toolbox_data.ts`** | Ordre d’assemblage |
| **`toolbox_types.ts`** / **`toolbox_filters.ts`** | Types + filtres |
| **`toolbox.ts`** | Façade |

Guide : [MODIFIER_TOOLBOX.md](./MODIFIER_TOOLBOX.md).

### 3.5 `configure_standard_blocks.ts` ✅

| Fichier | Rôle |
|---------|------|
| **`configure_math_blocks.ts`** | `math_number` typé |
| **`configure_logic_blocks.ts`** | `logic_compare` / `logic_ternary` (déjà extrait) |
| **`configure_loop_blocks.ts`** | `controls_repeat_ext` / `controls_for` |
| **`configure_text_blocks.ts`** | `text_append` |
| **`configure_procedure_blocks.ts`** | defs / calls procédures + dropdowns types |
| **`configure_standard_blocks.ts`** | Façade `configureStandardBlocks` |

### 3.6 Générateur `blocks/array.ts` ✅

| Fichier | Rôle |
|---------|------|
| **`array_helpers.ts`** | Littéraux, init texte, bitmap copy, erreurs globales |
| **`array_list.ts`** | `Array_list_*`, `Array_with`, get/modify/set |
| **`array_declare.ts`** | `Array_declare` / `create` / `fix` / `getIndex_in_array` |
| **`array_bitmap.ts`** | `Array_bitmap` / `Array_bitmap_get` |
| **`array.ts`** | Façade (réexports pour `arduino.ts`) |

### 3.7 Définitions blocs `categories/blockly/array.ts` ✅

| Fichier | Rôle |
|---------|------|
| **`array_list_defs.ts`** | with / literal / get / modify / set |
| **`array_declare_defs.ts`** | declare / create / form / getIndex_in_array |
| **`array_sync.ts`** / **`array_mutators.ts`** | Sync ownership + mutators +/- |
| **`array_bitmap.ts`** (+ `_grid`) | Bitmap (déjà séparé) |
| **`array.ts`** | Façade `defineArrayBlocks` + réexports sync |

### 3.8 Générateur `blocks/board.ts` ✅

| Fichier | Rôle |
|---------|------|
| **`board_structure.ts`** | setup / loop / comment / include / define |
| **`board_io.ts`** | digital/analog I/O, pulseIn, map, tone |
| **`board_time.ts`** | delay / millis |
| **`board_serial.ts`** | Serial.* |
| **`board_conversion.ts`** | toint / tofloat / constrain… |
| **`board.ts`** | Façade (réexports pour `arduino.ts`) |

### 3.9 Générateur `blocks/math.ts` ✅

| Fichier | Rôle |
|---------|------|
| **`math_literals.ts`** | number / percent / angle / constant |
| **`math_ops.ts`** | arithmetic / single / trig / round / modulo / constrain / atan2 / change |
| **`math_checks.ts`** | interval / number_property |
| **`math_list_random.ts`** | on_list / random_int / random_float |
| **`math_helpers.ts`** | includes + helpers (déjà existant) |
| **`math.ts`** | Façade (réexports pour `arduino.ts`) |

### 3.10 Générateur `blocks/text.ts` ✅

| Fichier | Rôle |
|---------|------|
| **`text_expr.ts`** | quote / toTextExpression / textExpression |
| **`text_literals.ts`** | text / no_quote / multiline / date / char |
| **`text_ops.ts`** | join / append / length / index / charAt / substring |
| **`text_transform.ts`** | case / trim / count / replace / reverse |
| **`text_io.ts`** | print / prompt_ext |
| **`text_helpers.ts`** | helpers C++ injectés (déjà existant) |
| **`text.ts`** | Façade (réexports pour `arduino.ts`) |

### 3.11 `block_types_registry.ts` ✅

| Fichier | Rôle |
|---------|------|
| **`block_types_array_infer.ts`** | Inférence types listes / math_number |
| **`block_types_dynamic.ts`** | `DYNAMIC_TYPE_FUNCTIONS` + resolver variables |
| **`block_types_compat.ts`** | `checkTypeCompatibility` / `getCompatibleTypesForCheck` |
| **`block_types_registry.ts`** | Façade registry + `applyBlockTypesFromRegistry` |

### 3.12 `strict_connection_checker.ts` ✅

| Fichier | Rôle |
|---------|------|
| **`strict_connection_array.ts`** | Checks connexions Array_* / list literal |
| **`strict_connection_procedure.ts`** | Checks ARG* appels de procédures |
| **`strict_connection_type_utils.ts`** | resolve types / switch-case / helpers partagés |
| **`strict_connection_checker.ts`** | Classe + orchestration + registration |

### 3.13 `arduino_generator.ts` (lots A + B + C) ✅

| Fichier | Rôle |
|---------|------|
| **`arduino_generator_pins.ts`** | `recordPinUsage` / types pin |
| **`arduino_generator_scrub.ts`** | quote / scrub / format commentaires |
| **`arduino_generator_init_vars.ts`** | collecte vars + déclarations globales (`init`) |
| **`arduino_generator_validate.ts`** | validation soft + format user function |
| **`arduino_generator_debug.ts`** | snapshot / reset bags |
| **`arduino_code_format.ts`** | assemblage sketch (déjà) |
| **`order.ts`** | précédence (déjà) |
| **`arduino_generator.ts`** | Classe façade |

Guides débutant : [DEBUTER_CODE.md](./DEBUTER_CODE.md), [GLOSSAIRE.md](./GLOSSAIRE.md), [TUTORIEL_MICRO_BLOC.md](./TUTORIEL_MICRO_BLOC.md), [AJOUTER_BLOC_NOYAU.md](./AJOUTER_BLOC_NOYAU.md), [MODIFIER_TOOLBOX.md](./MODIFIER_TOOLBOX.md).

### 3.14 Démo `index.ts` + profils cartes ✅

| Fichier | Rôle |
|---------|------|
| **`demo/demo_globals.ts`** | Expose Blockly / générateur / Monaco sur `window` |
| **`demo/demo_layout.ts`** | Layout session + dimensions host |
| **`demo/demo_boards_menu.ts`** | Remplissage du menu cartes |
| **`demo/demo_a11y_attrs.ts`** | ARIA régions démo |
| **`demo/continuous_toolbox.ts`** | Register continuous toolbox |
| **`demo/demo_ui_handlers.ts`** | Menus / boutons → `BlocklyApplication` |
| **`demo/demo_lifecycle.ts`** | DOMContentLoaded / onload / beforeunload |
| **`index.ts`** | Orchestration courte |
| **`board_profiles/`** | Données pins par famille (`profiles_*.ts` + façade) |

### 3.15 Extensions runtime + sync/variables/shell ✅

| Fichier / script | Rôle |
|------------------|------|
| **`npm run build:extensions`** | Transpile `extensions/*/{blocks,generator.*}.ts` → `.js` |
| **`extensions/runtime_ctx.d.ts`** | Types du `ctx` injecté (sans import noyau) |
| **`array_sync_ownership` / `_access` / `_literal`** | Découpage sync listes |
| **`variables_declare_*`** | Un fichier par bloc déclaratif |
| **`shell_shortcuts_help_i18n.ts`** | Libellés / helpers i18n de l’aide raccourcis |

### 3.16 Mutators +/- ✅

| Fichier | Rôle |
|---------|------|
| **`plus_minus_mutator.ts`** | `createPartListPlusMinusMutator`, `registerMutatorOnce`, réexport +/- fields |
| **`array_mutators.ts`** | Listes `Array_with` / `Array_list_literal` (config) |
| **`libre.ts`** | Boucles libres multi-`LOOP` (config) |
| **`logic_switch.ts`** | Switch/case (spécifique) + `registerMutatorOnce` |

### 3.17 Vague moyenne (shell / procédures / array declare) ✅

| Fichier | Rôle |
|---------|------|
| **`shell_shortcuts_help_dialog.ts`** | Chrome dialog + sections readonly |
| **`shell_shortcuts_help_edit.ts`** | Capture clavier + section éditable |
| **`shell_shortcuts_help.ts`** | Façade open / refresh / register |
| **`configure_procedure_types.ts`** | Types / helpers procédures |
| **`configure_procedure_plus_minus.ts`** | Patch +/- + ARG |
| **`configure_procedure_defs.ts`** | defreturn / defnoreturn |
| **`configure_procedure_calls.ts`** | callreturn / callnoreturn |
| **`configure_procedure_blocks.ts`** | Façade |
| **`array_declare_shared.ts`** | Helpers declare/create |
| **`array_declare_declare.ts`** | `Array_declare` |
| **`array_declare_create.ts`** | `Array_create` |
| **`array_declare_fix.ts`** | `Array_fix` |
| **`array_declare_get_index.ts`** | `Array_getIndex_in_array` |
| **`array_declare_defs.ts`** | Façade `defineArrayDeclareBlocks` |

---

## 4. Plan d’action proposé

### Priorité 1 – Dedup immédiate (impact rapide, peu de risque) ✅ FAIT

1. **`getBlocklyMsg` / `getBlocklyMsgOr`**  
   - `configure_standard_blocks` et `typed_variables_flyout` importent depuis `shared`, suppression des copies locales.

2. **`getArduinoTypeLabel` / `getArduinoTypeDropdownOptions`**
   - Export depuis `variables.ts`, réutilisation dans `configure_standard_blocks`, suppression des doublons.

3. **`VariableWithMutableType`**  
   - Import depuis `shared` dans `configure_standard_blocks`, suppression de la définition locale.

### Priorité 2 – Centraliser la logique « set type + manuel » ✅ FAIT

4. **Helper `setVariableTypeAndMarkManual`**  
   - Ajout dans `shared` (ou `variable_utils` selon choix d’architecture), utilisation dans `configure_standard_blocks` et `variables_set_type`. `handleVariablesSetChange` continue d'utiliser `setVariableType` + `__ucbManualType = false` (inférence, pas manuel).

### Priorité 3 – Optionnel

5. Extraction **`blockly_i18n`** / **`type_inference`** / handlers variables — ✅ FAIT (`shared_*.ts`).
6. Découpage **`variables_*`**, **`logic_*`**, **`board_*`** ✅ FAIT.

---

## 5. Dépendances actuelles (grosses lignes)

- **`categories/blockly`** → `generators/arduino` (shared utilise block_types_registry, variable_utils, debug).  
- **`generators/arduino`** → **`categories/blockly`** : imports limités et explicites (`shared`, `variables`) depuis `configure_standard_blocks` et `typed_variables_flyout`. Documenté dans [ARCHITECTURE.md](./ARCHITECTURE.md) et [README.md](../README.md).

---

## Voir aussi

- [ARCHITECTURE.md](./ARCHITECTURE.md) — organisation du dépôt et scripts npm ;
- [TYPES_ET_COMPATIBILITES.md](./TYPES_ET_COMPATIBILITES.md) — typage des blocs ;
- [CONTRIBUTING.md](./CONTRIBUTING.md) — guide contributeur.
