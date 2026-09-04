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
| BlocklyDuino-v3 | Lint stub ; README kernel ; **`styles/` découpé** (+ `fonts.css`) ; [MICROPYTHON.md](../../BlocklyDuino/BlocklyDuino-v3/docs/MICROPYTHON.md) | Affiner `app.ts` si besoin |
| Factory-v3 | `sync` + overlay README ; **`branding.ts`** SPDX ; **modal export** → `factory_extension_modal_i18n.ts` | Split toolbar plus loin si besoin |

Voir aussi [ARCHITECTURE.md](./ARCHITECTURE.md) et [REPARTITION_FICHIERS.md](./REPARTITION_FICHIERS.md).
