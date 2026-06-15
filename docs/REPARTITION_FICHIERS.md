# Répartition des fonctions entre fichiers – Analyse et améliorations

## 1. Duplications identifiées

### 1.1 `getBlocklyMsg` / `getBlocklyMsgOr`

| Fichier | Rôle |
|--------|------|
| **`categories/blockly/shared.ts`** | Source canonique (exportée). |
| **`generators/arduino/configure_standard_blocks.ts`** | Copies locales (l.70–94), utilisées pour tooltips et dropdown procédures. |
| **`generators/arduino/typed_variables_flyout.ts`** | Copie locale de `getBlocklyMsg` (l.18–22), pour "NEW_VARIABLE". |

**Recommandation :** Faire importer `getBlocklyMsg` et `getBlocklyMsgOr` depuis `shared` dans `configure_standard_blocks` et `typed_variables_flyout`, et supprimer les copies locales.

---

### 1.2 `getVariableTypeLabel` / options de dropdown type variable

| Fichier | Rôle |
|--------|------|
| **`categories/blockly/variables.ts`** | `getVariableTypeLabel`, `getVariableTypeDropdownOptions` (locaux), utilisés pour `variables_set_type` et `variables_define`. |
| **`generators/arduino/configure_standard_blocks.ts`** | Même logique en local : `getVariableTypeLabel`, `getTypeDropdownOptions` (l.95–103), pour les types d’arguments de procédures. |

**Recommandation :** Exporter `getVariableTypeLabel` et `getVariableTypeDropdownOptions` depuis `variables.ts`, les réutiliser dans `configure_standard_blocks` et supprimer les doublons.

---

### 1.3 Type `VariableWithMutableType`

| Fichier | Rôle |
|--------|------|
| **`categories/blockly/shared.ts`** | Type exporté (avec `__ucbManualType`, etc.). |
| **`generators/arduino/configure_standard_blocks.ts`** | Définition locale équivalente (l.75–80). |

**Recommandation :** Importer `VariableWithMutableType` depuis `shared` dans `configure_standard_blocks` et supprimer la définition locale.

---

### 1.4 Wrapper « set type + manuel »

Dans `configure_standard_blocks`, un wrapper appelle `variable_utils.setVariableType` puis fixe `__ucbManualType = true` (l.81–88). La même idée apparaît dans `variables_set_type` (onchange) et dans `handleVariablesSetChange` (shared).

**Recommandation :** Introduire un helper partagé, par ex. `setVariableTypeAndMarkManual(variable, type)` dans `shared` (ou `variable_utils` si on y centralise `__ucbManualType`), et l’utiliser dans `configure_standard_blocks`, `variables_set_type` et éventuellement `handleVariablesSetChange` pour éviter la duplication de logique.

---

## 2. Répartition actuelle – points corrects

- **`block_types.ts`** : règles de types pures (`TYPE_COMPATIBILITY`, `CAST_TYPE_TO_INTERNAL`, `getInternalTypeForCast`, `getCompatibleTypes`, `isTypeCompatible`, `getVariableTypeOptions`). Pas de Blockly. Documenté dans [TYPES_ET_COMPATIBILITES.md](./TYPES_ET_COMPATIBILITES.md).
- **`block_types_registry.ts`** : registre, `checkTypeCompatibility` (côté Blockly), `getCompatibleTypesForCheck`, application aux blocs. Utilise `block_types`. Bonne séparation.
- **`variable_utils.ts`** : `setVariableType`, `clearVariableType`, `normalizeVariableType`. Utilisé par shared, variables, logic, configure_standard_blocks, blockly_application_type. Rôle clair.
- **`shared.ts`** : i18n, inférence de type, helpers variables/blocs, avertissements, validation. Centralise le réutilisable entre categories/blockly. Cohérent.

---

## 3. Améliorations structurelles optionnelles

### 3.1 Découpage de `shared.ts`

`shared` mêle i18n, inférence de types, handlers de variables, messages d’avertissement, validation. On pourrait extraire :

- **`blockly_i18n.ts`** (ou `i18n.ts` dans blockly) : `getBlocklyMsg`, `getBlocklyMsgOr` → utilisé partout.
- **`type_inference.ts`** : `inferConnectedValueType`, `normalizeBlocklyTypeToVariableType`, `getFirstCheckType`, `inferProcedureCallReturnType`.

Intérêt : responsabilités plus nettes. Coût : plus de fichiers et de refactoring. À faire seulement si on prévoit d’enrichir fortement i18n ou inférence.

### 3.2 `logic.ts` (≈ 456 lignes)

Contient switch/case, mutator, `applySwitchCaseTyping`, tooltips, etc. On pourrait isoler la partie « switch » dans un `logic_switch.ts` et garder `logic.ts` pour le reste + orchestration. Optionnel, surtout si on touche souvent au switch.

### 3.3 `variables.ts` (≈ 627 lignes)

Beaucoup de définitions de blocs (get, set, local, const, init, define, set_type). Un découpage en `variables_get.ts`, `variables_set.ts`, `variables_const.ts`, etc. est possible, mais éparpille une logique déjà liée. À considérer seulement si le fichier devient difficile à maintenir.

---

## 4. Plan d’action proposé

### Priorité 1 – Dedup immédiate (impact rapide, peu de risque) ✅ FAIT

1. **`getBlocklyMsg` / `getBlocklyMsgOr`**  
   - `configure_standard_blocks` et `typed_variables_flyout` importent depuis `shared`, suppression des copies locales.

2. **`getVariableTypeLabel` / `getVariableTypeDropdownOptions`**  
   - Export depuis `variables.ts`, réutilisation dans `configure_standard_blocks`, suppression des doublons.

3. **`VariableWithMutableType`**  
   - Import depuis `shared` dans `configure_standard_blocks`, suppression de la définition locale.

### Priorité 2 – Centraliser la logique « set type + manuel » ✅ FAIT

4. **Helper `setVariableTypeAndMarkManual`**  
   - Ajout dans `shared` (ou `variable_utils` selon choix d’architecture), utilisation dans `configure_standard_blocks` et `variables_set_type`. `handleVariablesSetChange` continue d'utiliser `setVariableType` + `__ucbManualType = false` (inférence, pas manuel).

### Priorité 3 – Optionnel

5. Extraction **`blockly_i18n`** / **`type_inference`** si croissance de ces parties.
6. Découpage **`logic_switch`** / **`variables_*`** si besoin de clarté ou de collaboration sur des zones très ciblées.

---

## 5. Dépendances actuelles (grosses lignes)

- **`categories/blockly`** → `generators/arduino` (shared utilise block_types_registry, variable_utils, debug).  
- **`generators/arduino`** → `categories/blockly` : uniquement si on fait importer `shared` / `variables` depuis `configure_standard_blocks` et `typed_variables_flyout`. Boucle évitée : pas d’import categories → generators dans les mêmes chaînes que generators → categories.

Souhaitable de documenter dans le README ou l’architecture que **`generators/arduino` peut dépendre de `categories/blockly`** pour i18n et helpers variables, de façon limitée et explicite.
