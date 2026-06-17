<div align="center">

![µcBlockly](../public/assets/logo_µcBlockly.png)

# Liste des fonctions exportées

</div>

> **Note :** inventaire généré par `npm run extract-functions`. La documentation API interactive : `npm run docs` → [TYPEDOC.md](./TYPEDOC.md).

Total: 324 fonctions

---


## a11y_labels.ts

### getA11yLabel

**Fichier:** `a11y_labels.ts` (ligne 61)

**Signature:** `export const getA11yLabel = (key: A11yLabelKey): string =>`

**Description:**

Returns a localized accessibility label for layout controls.

---


## block_debug_context_menu.ts

### applyBlockDebugMetadata

**Fichier:** `block_debug_context_menu.ts` (ligne 204)

**Signature:** `export function applyBlockDebugMetadata(): void`

**Description:**

Annoter les définitions Blockly avec debugDefinitionFn (optionnel, après enregistrement).

---

### installBlockDebugContextMenu

**Fichier:** `block_debug_context_menu.ts` (ligne 124)

**Signature:** `export function installBlockDebugContextMenu(): void`

**Description:**

Enregistre les entrées de menu contextuel debug (une seule fois).

---


## block_levels.ts

### applyLevelsToAllBlockDefinitions

**Fichier:** `block_levels.ts` (ligne 46)

**Signature:** `export function applyLevelsToAllBlockDefinitions(`

**Description:**

Applique levels sur chaque entrée de Blockly.Blocks.
@param levels - Chaîne CSV (ex. "1, 2, 3").

---

### getBlockDefinitionLevels

**Fichier:** `block_levels.ts` (ligne 64)

**Signature:** `export function getBlockDefinitionLevels(blockType: string): string | undefined`

**Description:**

Retourne la chaîne levels d'un type de bloc, ou undefined.

---

### parseBlockLevels

**Fichier:** `block_levels.ts` (ligne 72)

**Signature:** `export function parseBlockLevels(levels: string | undefined): number[]`

**Description:**

Parse levels CSV en liste de numéros.

---


## blockly_application_type.ts

### BlocklyApplication

**Fichier:** `blockly_application_type.ts` (ligne 137)

**Signature:** `export class BlocklyApplication implements BlocklyApplicationType`

**Description:**

Application state and configuration (workspace, toolbox, language, plugins).

---


## blockly_patches.ts

### patchBlockChangeForProcedureCompat

**Fichier:** `blockly_patches.ts` (ligne 174)

**Signature:** `export function patchBlockChangeForProcedureCompat(): void`

**Description:**

Procedure blocks may replay mutation XML while loadExtraState expects JSON.
Also skip missing `${argId}_TYPE` fields during arg creation event mirroring.

---

### patchBlocklyDefensive

**Fichier:** `blockly_patches.ts` (ligne 253)

**Signature:** `export function patchBlocklyDefensive(): void`

**Description:**

Applies defensive patches (setParent, removeTypedBlock, removeTopBlock).

---

### patchConnectionCheckerForConstBlock

**Fichier:** `blockly_patches.ts` (ligne 69)

**Signature:** `export function patchConnectionCheckerForConstBlock(): void`

**Description:**

Extends ConnectionChecker so that connecting any value block to variables_const
is always allowed.

---

### patchFieldVariableValidation

**Fichier:** `blockly_patches.ts` (ligne 126)

**Signature:** `export function patchFieldVariableValidation(): void`

**Description:**

Extends FieldVariable validation and initModel for flyout/insertion-marker handling.

---

### patchVariableMapCreateVariable

**Fichier:** `blockly_patches.ts` (ligne 102)

**Signature:** `export function patchVariableMapCreateVariable(workspace: Blockly.Workspace): void`

**Description:**

Extends VariableMap.createVariable to normalize types and avoid duplicates.

---


## boards.ts

### getBoardDropdownOptions

**Fichier:** `boards.ts` (ligne 1130)

**Signature:** `export function getBoardDropdownOptions(boardId: BoardId):`

**Description:**

Returns dropdown options (digital, PWM, analog, serial baud) for a given board.
Used so block pin dropdowns match the selected board.

---

### pinAnalogValidator

**Fichier:** `boards.ts` (ligne 1088)

**Signature:** `export const pinAnalogValidator = (text: string, boardId: BoardId = DEFAULT_BOARD_ID): string | null =>`

**Description:** *Aucune documentation*

---

### pinDigitalValidator

**Fichier:** `boards.ts` (ligne 1076)

**Signature:** `export const pinDigitalValidator = (text: string, boardId: BoardId = DEFAULT_BOARD_ID): string | null =>`

**Description:** *Aucune documentation*

---

### pinDualValidator

**Fichier:** `boards.ts` (ligne 1112)

**Signature:** `export const pinDualValidator = (text: string, boardId: BoardId = DEFAULT_BOARD_ID): string | null =>`

**Description:** *Aucune documentation*

---

### pinGroveAnalogValidator

**Fichier:** `boards.ts` (ligne 1104)

**Signature:** `export const pinGroveAnalogValidator = (text: string, boardId: BoardId = DEFAULT_BOARD_ID): string | null =>`

**Description:** *Aucune documentation*

---

### pinGroveDigitalValidator

**Fichier:** `boards.ts` (ligne 1097)

**Signature:** `export const pinGroveDigitalValidator = (text: string, boardId: BoardId = DEFAULT_BOARD_ID): string | null =>`

**Description:** *Aucune documentation*

---

### pinInterruptValidator

**Fichier:** `boards.ts` (ligne 1080)

**Signature:** `export const pinInterruptValidator = (text: string, boardId: BoardId = DEFAULT_BOARD_ID): string | null =>`

**Description:** *Aucune documentation*

---

### pinPWMValidator

**Fichier:** `boards.ts` (ligne 1084)

**Signature:** `export const pinPWMValidator = (text: string, boardId: BoardId = DEFAULT_BOARD_ID): string | null =>`

**Description:** *Aucune documentation*

---

### pinSoftSerialValidator

**Fichier:** `boards.ts` (ligne 1092)

**Signature:** `export const pinSoftSerialValidator = (text: string, boardId: BoardId = DEFAULT_BOARD_ID): string | null =>`

**Description:** *Aucune documentation*

---


## categories\blockly\array.ts

### defineArrayBlocks

**Fichier:** `categories\blockly\array.ts` (ligne 496)

**Signature:** `export const defineArrayBlocks = (): void =>`

**Description:**

Registers S4e-style array blocks (Array_create_with, Array_declare, Array_create,
Array_getIndex_in_list, Array_getIndex_in_array, Array_modify, Array_fix).

---


## categories\blockly\board.ts

### defineBoardBlocks

**Fichier:** `categories\blockly\board.ts` (ligne 95)

**Signature:** `export const defineBoardBlocks = (): void =>`

**Description:**

Registers board (s4e) blocks: setup, loop, digital/analog I/O, delay, map, tone.

---

### refreshBoardPinDropdowns

**Fichier:** `categories\blockly\board.ts` (ligne 591)

**Signature:** `export function refreshBoardPinDropdowns(workspace: Blockly.Workspace): void`

**Description:**

Updates all pin and serial dropdowns in the workspace to match the currently selected board.
Call this when the board menu selection changes.
Uses setOptions when available; otherwise updates the menu generator so the dropdown shows the new list.

---


## categories\blockly\colour.ts

### defineColourBlocks

**Fichier:** `categories\blockly\colour.ts` (ligne 72)

**Signature:** `export const defineColourBlocks = (): void =>`

**Description:**

Registers colour blocks and custom color picker fields.

---


## categories\blockly\field_colour_hsv_sliders.ts

### LocalizedFieldColourHsvSliders

**Fichier:** `categories\blockly\field_colour_hsv_sliders.ts` (ligne 91)

**Signature:** `export class LocalizedFieldColourHsvSliders extends FieldColourHsvSliders`

**Description:**

HSV sliders field with localized labels.

---


## categories\blockly\field_colour_picker.ts

### FieldColorPicker

**Fichier:** `categories\blockly\field_colour_picker.ts` (ligne 134)

**Signature:** `export class FieldColorPicker extends Blockly.FieldTextInput`

**Description:**

Custom Blockly field that renders an iro.js color picker.

---


## categories\blockly\index.ts

### defineAllTypedVariableBlocks

**Fichier:** `categories\blockly\index.ts` (ligne 73)

**Signature:** `export const defineAllTypedVariableBlocks = (): void =>`

**Description:**

Registers all typed variable blocks and extensions (get/set/define/local and standard block extensions).

---

### defineBlocklyArduinoCompatBlocks

**Fichier:** `categories\blockly\index.ts` (ligne 60)

**Signature:** `export const defineBlocklyArduinoCompatBlocks = (): void =>`

**Description:**

Registers BlocklyArduino compatibility blocks.

---


## categories\blockly\libre.ts

### defineLibreBlocks

**Fichier:** `categories\blockly\libre.ts` (ligne 56)

**Signature:** `export const defineLibreBlocks = (): void =>`

**Description:**

Registers the Libre category blocks (legacy rduino null category).

---


## categories\blockly\logic.ts

### defineControlsSwitchBlocks

**Fichier:** `categories\blockly\logic.ts` (ligne 308)

**Signature:** `export const defineControlsSwitchBlocks = (): void =>`

**Description:**

Registers the controls_switch block definitions and typing.

---


## categories\blockly\loops.ts

### defineLoopsBlocks

**Fichier:** `categories\blockly\loops.ts` (ligne 134)

**Signature:** `export const defineLoopsBlocks = (): void =>`

**Description:**

Redéfinit `controls_forEach` : menu des tableaux (variables `list`) au lieu d'une entrée valeur.

---


## categories\blockly\math.ts

### defineMathCompatBlocks

**Fichier:** `categories\blockly\math.ts` (ligne 50)

**Signature:** `export const defineMathCompatBlocks = (): void =>`

**Description:**

Registers math compatibility blocks for µcBlockly.

---


## categories\blockly\shared.ts

### areLoopBoundTypesCompatible

**Fichier:** `categories\blockly\shared.ts` (ligne 985)

**Signature:** `export const areLoopBoundTypesCompatible = (`

**Description:**

Returns true when two loop bound types can coexist (int/float may mix).

---

### configureListVariableField

**Fichier:** `categories\blockly\shared.ts` (ligne 281)

**Signature:** `export const configureListVariableField = (field: Blockly.FieldVariable): void =>`

**Description:**

Configures a FieldVariable for list/array variables only.

---

### configureScalarVariableField

**Fichier:** `categories\blockly\shared.ts` (ligne 269)

**Signature:** `export const configureScalarVariableField = (field: Blockly.FieldVariable): void =>`

**Description:**

Configures a FieldVariable for scalar variables (excludes list/array variables).
@param field - FieldVariable instance to configure.

---

### getArrayIndexBlocklyChecks

**Fichier:** `categories\blockly\shared.ts` (ligne 263)

**Signature:** `export const getArrayIndexBlocklyChecks = (): string[] => ["int", "Number"];`

**Description:**

Checks Blockly pour les entrées d'index de tableau (entiers uniquement).

---

### getArrayListUntypedWarningText

**Fichier:** `categories\blockly\shared.ts` (ligne 104)

**Signature:** `export const getArrayListUntypedWarningText = (): string =>`

**Description:**

Warning when a list block has no connected element values yet.

---

### getBlocklyCompatibleChecks

**Fichier:** `categories\blockly\shared.ts` (ligne 178)

**Signature:** `export const getBlocklyCompatibleChecks = (`

**Description:**

Converts a variable type into Blockly connection checks.
@param type - Variable or inferred type.
@param strict - When true, int does not accept Number (so float blocks are rejected); for list "define" downward type checking.
@returns Array of compatible checks or null when not applicable.
@remarks
Built on {@link getCompatibleTypesForCheck} from `block_types_registry`.
See `docs/TYPES_ET_COMPATIBILITES.md` for the mapping table (bool→Boolean, int→Number, etc.).

---

### getBlocklyMsg

**Fichier:** `categories\blockly\shared.ts` (ligne 68)

**Signature:** `export const getBlocklyMsg = (key: string): string =>`

**Description:**

Retrieves a Blockly message by key.
@param key - Message key to look up.
@returns The localized message or the key if missing.

---

### getBlocklyMsgOr

**Fichier:** `categories\blockly\shared.ts` (ligne 79)

**Signature:** `export const getBlocklyMsgOr = (key: string, fallback: string): string =>`

**Description:**

Retrieves a Blockly message or returns a fallback.
@param key - Message key to look up.
@param fallback - Fallback text when the key is missing.
@returns The localized message or the fallback value.

---

### getConstWarningText

**Fichier:** `categories\blockly\shared.ts` (ligne 124)

**Signature:** `export const getConstWarningText = (): string =>`

**Description:**

Returns the warning text for const assignments.

---

### getDeclareContenuBlocklyChecks

**Fichier:** `categories\blockly\shared.ts` (ligne 244)

**Signature:** `export const getDeclareContenuBlocklyChecks = (`

**Description:**

Checks Blockly pour l'entrée contenu d'Array_declare (size ou contains).
Le filtrage sémantique int/float/etc. est complété par StrictConnectionChecker.

---

### getDeclareElementBlocklyChecks

**Fichier:** `categories\blockly\shared.ts` (ligne 258)

**Signature:** `export const getDeclareElementBlocklyChecks = (internalType: string): string[] =>`

**Description:**

Checks Blockly pour les éléments d'un littéral de liste ou de Array_with.

---

### getListVariableOutputCheck

**Fichier:** `categories\blockly\shared.ts` (ligne 322)

**Signature:** `export const getListVariableOutputCheck = (): string => "__NO_TYPE__";`

**Description:**

Output check for variables_get when VAR is Blockly-only (`list`), not an Arduino type.

---

### getProcedureDefArgumentType

**Fichier:** `categories\blockly\shared.ts` (ligne 413)

**Signature:** `export const getProcedureDefArgumentType = (`

**Description:**

Declared type of a procedure definition argument (reads `${argId}_TYPE` on procedures_def*).

---

### getProcedureParameterDeclaredType

**Fichier:** `categories\blockly\shared.ts` (ligne 365)

**Signature:** `export const getProcedureParameterDeclaredType = (`

**Description:**

Returns the type declared on a procedure parameter (menu on procedures_def*), if any.
@param contextBlock - When set, only matches if this block lies inside that procedure.

---

### getTypeMismatchWarningText

**Fichier:** `categories\blockly\shared.ts` (ligne 116)

**Signature:** `export const getTypeMismatchWarningText = (varType: string, connectedType: string): string =>`

**Description:**

Builds the warning text for type mismatches.
@param varType - Variable's declared type.
@param connectedType - Type inferred from the connected block.
@returns Localized mismatch warning message.

---

### getUntypedWarningText

**Fichier:** `categories\blockly\shared.ts` (ligne 99)

**Signature:** `export const getUntypedWarningText = (): string => getBlocklyMsg("TYPED_VAR_UNTYPED_WARNING");`

**Description:**

Returns the warning text for untyped variables.

---

### handleBoardIntInputBlockChange

**Fichier:** `categories\blockly\shared.ts` (ligne 541)

**Signature:** `export const handleBoardIntInputBlockChange = (`

**Description:**

Enforces integer-only values on board block inputs (PWM, map, tone frequency).

---

### handleVariablesSetChange

**Fichier:** `categories\blockly\shared.ts` (ligne 1296)

**Signature:** `export const handleVariablesSetChange = (`

**Description:**

Handles variable assignment changes to enforce typing rules.
@param block - Variable set block.
@param event - Blockly change event.
@param label - Block label for warnings.

---

### hasConnectedAssignmentForVariable

**Fichier:** `categories\blockly\shared.ts` (ligne 1217)

**Signature:** `export const hasConnectedAssignmentForVariable = (`

**Description:**

Checks whether a variable has any connected assignment blocks.
Uses getVariableUsesById to avoid iterating all blocks.
@param workspace - Workspace to search.
@param variableId - Target variable ID.
@returns True when at least one assignment has a connected value.

---

### hasRealGlobalVariableUse

**Fichier:** `categories\blockly\shared.ts` (ligne 653)

**Signature:** `export const hasRealGlobalVariableUse = (`

**Description:**

True when the variable is genuinely read/written in setup, loop, or global scope.

---

### inferChangeByRequiredType

**Fichier:** `categories\blockly\shared.ts` (ligne 1126)

**Signature:** `export const inferChangeByRequiredType = (`

**Description:**

Infers int/float required by all math_change blocks using a variable.

---

### inferChangeByRequiredTypeFromBlock

**Fichier:** `categories\blockly\shared.ts` (ligne 1113)

**Signature:** `export const inferChangeByRequiredTypeFromBlock = (`

**Description:**

Infers int/float required by a math_change block from its DELTA input.

---

### inferConnectedValueType

**Fichier:** `categories\blockly\shared.ts` (ligne 1179)

**Signature:** `export const inferConnectedValueType = (block: Blockly.Block | null): string | null =>`

**Description:**

Infers a block's output type from its definition or connection.
@param block - Connected block or null.
@returns Normalized type or null when unknown.

---

### inferLocalAssignmentValueType

**Fichier:** `categories\blockly\shared.ts` (ligne 713)

**Signature:** `export const inferLocalAssignmentValueType = (`

**Description:**

Infers the value type inside a `variables_local` wrapper (or null).

---

### inferLoopCounterType

**Fichier:** `categories\blockly\shared.ts` (ligne 1068)

**Signature:** `export const inferLoopCounterType = (`

**Description:**

Infers the loop-counter type implied by controls_for blocks using a variable.
@param workspace - Workspace containing the variable uses.
@param variableId - Target variable ID.
@returns int, float, or null when not used as a numeric loop counter.

---

### inferLoopCounterTypeFromForBlock

**Fichier:** `categories\blockly\shared.ts` (ligne 1037)

**Signature:** `export const inferLoopCounterTypeFromForBlock = (`

**Description:**

Infers int/float for the counter variable of a controls_for block from its bounds.
@param forBlock - controls_for block instance.
@returns Counter type or null when bounds are not fully numeric.

---

### inferNumericInputType

**Fichier:** `categories\blockly\shared.ts` (ligne 950)

**Signature:** `export const inferNumericInputType = (block: Blockly.Block | null): string | null =>`

**Description:**

Infers the numeric type of a value block connected to a loop bound input.
@param block - Connected block or null.
@returns Normalized numeric type or null when unknown/non-numeric.

---

### inferProcedureCallArgSourceType

**Fichier:** `categories\blockly\shared.ts` (ligne 436)

**Signature:** `export const inferProcedureCallArgSourceType = (`

**Description:**

Infers the source type of a value plugged into a procedure call argument.

---

### inferRequiredNumericTypeForVariable

**Fichier:** `categories\blockly\shared.ts` (ligne 1158)

**Signature:** `export const inferRequiredNumericTypeForVariable = (`

**Description:**

Aggregates int/float required by loop counters and change-by blocks for a variable.

---

### isBlockOnMainWorkspace

**Fichier:** `categories\blockly\shared.ts` (ligne 878)

**Signature:** `export const isBlockOnMainWorkspace = (block: Blockly.Block): boolean =>`

**Description:**

Returns true when the block lives on the main workspace (not flyout/toolbox).

---

### isGlobalVariableAssignment

**Fichier:** `categories\blockly\shared.ts` (ligne 705)

**Signature:** `export const isGlobalVariableAssignment = (block: Blockly.Block): boolean =>`

**Description:**

True when a set block assigns a global variable (no `local` wrapper).

---

### isLoopCounterVariableCompatible

**Fichier:** `categories\blockly\shared.ts` (ligne 1027)

**Signature:** `export const isLoopCounterVariableCompatible = (`

**Description:**

Checks whether a variable type can serve as a loop counter of the given type.

---

### isProcedureParameterBindingUse

**Fichier:** `categories\blockly\shared.ts` (ligne 627)

**Signature:** `export const isProcedureParameterBindingUse = (`

**Description:**

Procedure def header / call shell: binds a parameter name without a global read/write.

---

### isVariableProcedureParameter

**Fichier:** `categories\blockly\shared.ts` (ligne 600)

**Signature:** `export const isVariableProcedureParameter = (`

**Description:**

True when the variable is declared as a parameter on any procedure definition.

---

### isVariableUsedOutsideProcedureBodies

**Fichier:** `categories\blockly\shared.ts` (ligne 594)

**Signature:** `export const isVariableUsedOutsideProcedureBodies = (`

**Description:**

True when the variable appears in setup, loop, or global scope (not only as a procedure parameter).

---

### isVariableUseOutsideProcedureBody

**Fichier:** `categories\blockly\shared.ts` (ligne 589)

**Signature:** `export const isVariableUseOutsideProcedureBody = (block: Blockly.Block): boolean =>`

**Description:**

True when the block is in setup/loop/global scope (not inside a procedure body).

---

### normalizeBlocklyTypeToVariableType

**Fichier:** `categories\blockly\shared.ts` (ligne 329)

**Signature:** `export const normalizeBlocklyTypeToVariableType = (type: string): string =>`

**Description:**

Normalizes Blockly check types to µcBlockly variable types.
@param type - Blockly check type string.
@returns Normalized µcBlockly variable type.

---

### resolveGlobalVariableType

**Fichier:** `categories\blockly\shared.ts` (ligne 804)

**Signature:** `export const resolveGlobalVariableType = (`

**Description:**

Resolves global variable type from global assignments only (ignores `local` wrappers).

---

### resolveMathChangeVariableId

**Fichier:** `categories\blockly\shared.ts` (ligne 1096)

**Signature:** `export const resolveMathChangeVariableId = (block: Blockly.Block): string | null =>`

**Description:**

Resolves the variable ID targeted by a math_change block (field or connected getter).

---

### resolveMathNumberBlockType

**Fichier:** `categories\blockly\shared.ts` (ligne 890)

**Signature:** `export const resolveMathNumberBlockType = (block: Blockly.Block): "int" | "float" =>`

**Description:**

Resolves math_number typing: int by default until on main workspace,
then int/float from the NUM field via identifyMathNumberType.

---

### resolveVariableTypeForBlock

**Fichier:** `categories\blockly\shared.ts` (ligne 761)

**Signature:** `export const resolveVariableTypeForBlock = (`

**Description:**

Resolves the effective type of a variable for a specific block (scope-aware).

---

### revalidateBoardIntInputBlocks

**Fichier:** `categories\blockly\shared.ts` (ligne 577)

**Signature:** `export const revalidateBoardIntInputBlocks = (`

**Description:**

Revalidates integer-only inputs on board blocks after workspace changes.

---

### revalidateLocalWrapperBlocks

**Fichier:** `categories\blockly\shared.ts` (ligne 1254)

**Signature:** `export const revalidateLocalWrapperBlocks = (`

**Description:**

Re-runs onchange on `variables_local` wrappers so their output type tracks inner values.

---

### revalidateProcedureCallBlocks

**Fichier:** `categories\blockly\shared.ts` (ligne 484)

**Signature:** `export const revalidateProcedureCallBlocks = (`

**Description:**

Disconnects incompatible values on procedure call blocks and refreshes ARG input checks.

---

### revalidateTypedNumericBlocks

**Fichier:** `categories\blockly\shared.ts` (ligne 1273)

**Signature:** `export const revalidateTypedNumericBlocks = (`

**Description:**

Re-runs onchange handlers for blocks whose variable typing depends on child values
(e.g. math_change when a math_number field is edited).

---

### revalidateVariableBlocksForId

**Fichier:** `categories\blockly\shared.ts` (ligne 828)

**Signature:** `export const revalidateVariableBlocksForId = (`

**Description:**

Re-runs onchange on variable get/set blocks referencing a variable.

---

### setVariableTypeAndMarkManual

**Fichier:** `categories\blockly\shared.ts` (ligne 132)

**Signature:** `export const setVariableTypeAndMarkManual = (`

**Description:**

Sets a variable's type and marks it as manually chosen (e.g. via dropdown).
@param variable - Variable model to update.
@param type - New type string.

---

### shouldOmitGlobalVariableDeclaration

**Fichier:** `categories\blockly\shared.ts` (ligne 674)

**Signature:** `export const shouldOmitGlobalVariableDeclaration = (`

**Description:**

Returns true when a workspace variable must not receive a global declaration.
Procedure parameters are omitted unless they are also used as real globals.

---

### shouldSkipVariableChange

**Fichier:** `categories\blockly\shared.ts` (ligne 855)

**Signature:** `export const shouldSkipVariableChange = (`

**Description:**

Determines whether a variable change event should be ignored.

---

### syncListVariableFromBlock

**Fichier:** `categories\blockly\shared.ts` (ligne 315)

**Signature:** `export const syncListVariableFromBlock = (block: Blockly.Block): void =>`

**Description:**

@deprecated Use {@link syncListVariableFromField} with `"VAR"`.

---

### syncListVariableFromField

**Fichier:** `categories\blockly\shared.ts` (ligne 298)

**Signature:** `export const syncListVariableFromField = (`

**Description:**

Ensures the variable selected on a list-category block has Blockly type `list`.

---

### syncNumericVariableType

**Fichier:** `categories\blockly\shared.ts` (ligne 145)

**Signature:** `export const syncNumericVariableType = (`

**Description:**

Aligns a numeric variable with the type required by loops and change-by blocks.
Promotes int ↔ float according to aggregated usage; never overrides manual types.

---

### syncProcedureCallArgInputChecks

**Fichier:** `categories\blockly\shared.ts` (ligne 451)

**Signature:** `export const syncProcedureCallArgInputChecks = (callBlock: Blockly.Block): void =>`

**Description:**

Applies setCheck on each ARG input from the procedure definition parameter types.

---

### unifyLoopBoundTypes

**Fichier:** `categories\blockly\shared.ts` (ligne 1000)

**Signature:** `export const unifyLoopBoundTypes = (`

**Description:**

Unifies loop bound types; any float bound promotes the counter to float.

---

### validateSingleChar

**Fichier:** `categories\blockly\shared.ts` (ligne 89)

**Signature:** `export const validateSingleChar = (value: string): string =>`

**Description:**

Normalizes a string to a single character.
@param value - Input string value.
@returns First character or empty string for falsy input.

---


## categories\blockly\text.ts

### defineTextCompatBlocks

**Fichier:** `categories\blockly\text.ts` (ligne 45)

**Signature:** `export const defineTextCompatBlocks = (): void =>`

**Description:**

Registers text literal blocks for µcBlockly (Arduino C: "", '', raw).

---


## categories\blockly\variables.ts

### createArduinoScalarTypeField

**Fichier:** `categories\blockly\variables.ts` (ligne 115)

**Signature:** `export const createArduinoScalarTypeField = (`

**Description:**

Arduino scalar type dropdown; maps invalid values (e.g. `list`) to `int` on load.

---

### defineVariablesCastBlock

**Fichier:** `categories\blockly\variables.ts` (ligne 255)

**Signature:** `export const defineVariablesCastBlock = (): void =>`

**Description:**

Value block: cast a connected expression, e.g. (byte)(toto) when a get block is plugged in.

---

### defineVariablesConstBlock

**Fichier:** `categories\blockly\variables.ts` (ligne 482)

**Signature:** `export const defineVariablesConstBlock = (): void =>`

**Description:**

Registers the const declaration block.

---

### defineVariablesDefineBlock

**Fichier:** `categories\blockly\variables.ts` (ligne 665)

**Signature:** `export const defineVariablesDefineBlock = (): void =>`

**Description:**

Registers the variable definition block used by s4e compatibility.

---

### defineVariablesGetDynamicBlock

**Fichier:** `categories\blockly\variables.ts` (ligne 138)

**Signature:** `export const defineVariablesGetDynamicBlock = (): void =>`

**Description:**

Registers the dynamic variables_get block with typing support.

---

### defineVariablesLocalBlock

**Fichier:** `categories\blockly\variables.ts` (ligne 302)

**Signature:** `export const defineVariablesLocalBlock = (): void =>`

**Description:**

Registers the "local" wrapper block for scoped variables.

---

### defineVariablesSetDynamicBlock

**Fichier:** `categories\blockly\variables.ts` (ligne 214)

**Signature:** `export const defineVariablesSetDynamicBlock = (): void =>`

**Description:**

Registers the dynamic variables_set block with typing support.

---

### defineVariablesSetInitBlock

**Fichier:** `categories\blockly\variables.ts` (ligne 574)

**Signature:** `export const defineVariablesSetInitBlock = (): void =>`

**Description:**

Registers the typed variable initialization block.

---

### defineVariablesSetTypeBlock

**Fichier:** `categories\blockly\variables.ts` (ligne 361)

**Signature:** `export const defineVariablesSetTypeBlock = (): void =>`

**Description:**

Registers the block that forces a variable type.

---

### extendStandardVariablesGetBlock

**Fichier:** `categories\blockly\variables.ts` (ligne 754)

**Signature:** `export const extendStandardVariablesGetBlock = (): void =>`

**Description:**

Extends the standard variables_get block with typed behavior.

---

### extendStandardVariablesSetBlock

**Fichier:** `categories\blockly\variables.ts` (ligne 829)

**Signature:** `export const extendStandardVariablesSetBlock = (): void =>`

**Description:**

Extends the standard variables_set block with typed behavior.

---

### getArduinoTypeDropdownOptions

**Fichier:** `categories\blockly\variables.ts` (ligne 75)

**Signature:** `export const getArduinoTypeDropdownOptions = (): Blockly.MenuOption[] =>`

**Description:**

Shared Blockly menu options for every Arduino type dropdown
(variables_set_init, variables_set_type, variables_cast, procedures, lists).

---

### getArduinoTypeLabel

**Fichier:** `categories\blockly\variables.ts` (ligne 68)

**Signature:** `export const getArduinoTypeLabel = (type: string): string =>`

**Description:**

Returns the display label for an Arduino type (Blockly.Msg `VAR_CAST_TYPE_*`).

---


## code_editor.ts

### LazyMonacoEditor

**Fichier:** `code_editor.ts` (ligne 36)

**Signature:** `export class LazyMonacoEditor`

**Description:**

Lazily initializes Monaco Editor to avoid heavy startup cost.

---


## continuous_metrics_overlay_flyout.ts

### ContinuousMetricsOverlayFlyout

**Fichier:** `continuous_metrics_overlay_flyout.ts` (ligne 46)

**Signature:** `export class ContinuousMetricsOverlayFlyout extends ContinuousMetrics`

**Description:**

Comme {@link ContinuousMetrics}, mais le flyout ne réduit pas la zone du workspace : il se
superpose (comportement proche de la toolbox à catégories classique).

---


## generators\arduino\arduino_generator.ts

### ArduinoGenerator

**Fichier:** `generators\arduino\arduino_generator.ts` (ligne 96)

**Signature:** `export class ArduinoGenerator extends Blockly.CodeGenerator`

**Description:**

Arduino code generator class.
Extends Blockly.CodeGenerator to provide Arduino-specific code generation.

---


## generators\arduino\arduino_types.ts

### getArduinoType

**Fichier:** `generators\arduino\arduino_types.ts` (ligne 179)

**Signature:** `export function getArduinoType(typeName: string): ArduinoType | undefined`

**Description:**

Looks up an Arduino type definition by name.
@param typeName - Type name to resolve.
@returns Type definition or undefined.

---

### getArduinoTypeNames

**Fichier:** `generators\arduino\arduino_types.ts` (ligne 190)

**Signature:** `export function getArduinoTypeNames(): string[]`

**Description:**

Returns the list of available Arduino type names.

---

### getDefaultValueForType

**Fichier:** `generators\arduino\arduino_types.ts` (ligne 227)

**Signature:** `export function getDefaultValueForType(typeName: string): string`

**Description:**

Returns a default literal for a given Arduino type.
@param typeName - Target Arduino type name.
@returns Default literal string.

---

### isValueValidForType

**Fichier:** `generators\arduino\arduino_types.ts` (ligne 206)

**Signature:** `export function isValueValidForType(typeName: string, value: number): boolean`

**Description:**

Checks whether a numeric value fits the given Arduino type.
@param typeName - Target Arduino type name.
@param value - Numeric value to validate.
@returns True when the value is within range.

---


## generators\arduino\block_types_registry.ts

### applyBlockTypesFromRegistry

**Fichier:** `generators\arduino\block_types_registry.ts` (ligne 563)

**Signature:** `export function applyBlockTypesFromRegistry(): void`

**Description:**

Applies registered block type metadata to Blockly blocks.

---

### checkTypeCompatibility

**Fichier:** `generators\arduino\block_types_registry.ts` (ligne 490)

**Signature:** `export function checkTypeCompatibility(`

**Description:**

Checks whether two types are compatible for connection.
@param sourceType - Source type from the connected block.
@param targetType - Target expected type.
@returns True when compatible.

---

### findListDeclarationBlock

**Fichier:** `generators\arduino\block_types_registry.ts` (ligne 221)

**Signature:** `export function findListDeclarationBlock(`

**Description:**

Finds the list declaration block for a workspace variable id.

---

### getCompatibleTypesForCheck

**Fichier:** `generators\arduino\block_types_registry.ts` (ligne 462)

**Signature:** `export function getCompatibleTypesForCheck(type: string | null | undefined): string[] | null`

**Description:**

Returns Blockly check types compatible with a given µcBlockly type.
@param type - Normalized type string.
@returns Array of checks or null when unavailable.

---

### hasArrayListConnectedElements

**Fichier:** `generators\arduino\block_types_registry.ts` (ligne 201)

**Signature:** `export function hasArrayListConnectedElements(block: Blockly.Block): boolean`

**Description:**

True when at least one ADD input has a connected value block.

---

### identifyMathNumberType

**Fichier:** `generators\arduino\block_types_registry.ts` (ligne 93)

**Signature:** `export function identifyMathNumberType(`

**Description:**

Infers int/float from a math_number field value.

---

### inferArrayElementTypeFromBlock

**Fichier:** `generators\arduino\block_types_registry.ts` (ligne 187)

**Signature:** `export function inferArrayElementTypeFromBlock(block: Blockly.Block): string`

**Description:**

Infers the element type of an Array_with block from all connected inputs.
Numeric types unify (int + float → float); float literals promote to float.

---

### inferArrayElementTypeFromInputs

**Fichier:** `generators\arduino\block_types_registry.ts` (ligne 134)

**Signature:** `export function inferArrayElementTypeFromInputs(`

**Description:**

Infers element type from named value inputs (e.g. Array_declare contenu/contenu2).
Numeric types unify (int + float → float); float literals promote to float.

---

### inferArrayGetIndexElementType

**Fichier:** `generators\arduino\block_types_registry.ts` (ligne 262)

**Signature:** `export function inferArrayGetIndexElementType(block: Blockly.Block): string`

**Description:** *Aucune documentation*

---

### inferListVariableElementType

**Fichier:** `generators\arduino\block_types_registry.ts` (ligne 241)

**Signature:** `export function inferListVariableElementType(`

**Description:**

Element type (int, char, …) of a list variable from its declaration block.

---


## generators\arduino\block_types.ts

### getArduinoTypeLabelKey

**Fichier:** `generators\arduino\block_types.ts` (ligne 136)

**Signature:** `export function getArduinoTypeLabelKey(typeKey: string): string`

**Description:**

Blockly.Msg key for a type dropdown label (e.g. `byte` → `VAR_CAST_TYPE_BYTE`).

---

### getCompatibleTypes

**Fichier:** `generators\arduino\block_types.ts` (ligne 247)

**Signature:** `export function getCompatibleTypes(targetType: string | null | undefined): string[]`

**Description:**

Returns compatible types for a target type.
@param targetType - Target type to match.
@returns List of compatible types (includes the target type).

---

### getCppTypeName

**Fichier:** `generators\arduino\block_types.ts` (ligne 181)

**Signature:** `export function getCppTypeName(typeKey: string): string`

**Description:**

C++ type name emitted in generated Arduino code.

---

### getInternalTypeForArduinoType

**Fichier:** `generators\arduino\block_types.ts` (ligne 143)

**Signature:** `export function getInternalTypeForArduinoType(typeKey: string): string`

**Description:**

Internal µcBlockly type for connection checking.

---

### getVariableTypeOptions

**Fichier:** `generators\arduino\block_types.ts` (ligne 220)

**Signature:** `export function getVariableTypeOptions(): string[]`

**Description:**

Returns the ordered list of Arduino types for Blockly dropdown menus.

---

### isArduinoScalarType

**Fichier:** `generators\arduino\block_types.ts` (ligne 225)

**Signature:** `export function isArduinoScalarType(type: string | null | undefined): type is ArduinoTypeKey`

**Description:**

True when the type can appear in Arduino scalar type dropdowns (excludes `list`).

---

### isArrayElementTypeCompatible

**Fichier:** `generators\arduino\block_types.ts` (ligne 201)

**Signature:** `export function isArrayElementTypeCompatible(`

**Description:**

Compatibilité stricte pour les entrées des blocs liste (sans char ↔ string).

---

### isDeclareContainsTypeCompatible

**Fichier:** `generators\arduino\block_types.ts` (ligne 190)

**Signature:** `export function isDeclareContainsTypeCompatible(`

**Description:**

Vérifie qu'une valeur connectée en mode « contains » correspond au type du menu Array_declare.
@param sourceInternalType - Type interne µcBlockly du bloc source (int, float, bool, …).
@param arduinoTypeField - Clé du menu déroulant (int, float, uint, string, …).

---

### isTypeCompatible

**Fichier:** `generators\arduino\block_types.ts` (ligne 261)

**Signature:** `export function isTypeCompatible(sourceType: string | null | undefined, targetType: string | null | undefined): boolean`

**Description:**

Checks if a source type can connect to a target type.
@param sourceType - Source type from a connected block.
@param targetType - Target expected type.
@returns True when compatible.

---

### normalizeBlocklyCheckToInternalType

**Fichier:** `generators\arduino\block_types.ts` (ligne 157)

**Signature:** `export function normalizeBlocklyCheckToInternalType(`

**Description:**

Maps Blockly output/check types to internal µcBlockly types.
Colour blocks use Blockly check `Colour` but variables and arrays use `string`.

---

### resolveArduinoScalarVariableType

**Fichier:** `generators\arduino\block_types.ts` (ligne 233)

**Signature:** `export function resolveArduinoScalarVariableType(`

**Description:**

Returns an Arduino scalar type for Blockly UI / generators, or null (= {@link __NO_TYPE__}).
Blockly-only types such as `list` are not Arduino types.

---


## generators\arduino\blocks\array.ts

### Array_create

**Fichier:** `generators\arduino\blocks\array.ts` (ligne 266)

**Signature:** `export const Array_create = function (`

**Description:**

Array_create - int arr[size]; or int arr[] = \{...\}; (1D-5D with FieldVariable)

---

### Array_declare

**Fichier:** `generators\arduino\blocks\array.ts` (ligne 205)

**Signature:** `export const Array_declare = function (`

**Description:**

Array_declare - int arr[size]; or int arr[] = \{...\};

---

### Array_fix

**Fichier:** `generators\arduino\blocks\array.ts` (ligne 329)

**Signature:** `export const Array_fix = function (`

**Description:**

Array_fix - arr[i] = value; or arr[i][j] = value;

---

### Array_getIndex_in_array

**Fichier:** `generators\arduino\blocks\array.ts` (ligne 347)

**Signature:** `export const Array_getIndex_in_array = function (`

**Description:**

Array_getIndex_in_array - arr[i] or arr[i][j]

---

### Array_getIndex_in_list

**Fichier:** `generators\arduino\blocks\array.ts` (ligne 179)

**Signature:** `export const Array_getIndex_in_list = function (`

**Description:**

Array_getIndex_in_list - list[index] (index 0-based, comme en C/Arduino)

---

### Array_list_literal

**Fichier:** `generators\arduino\blocks\array.ts` (ligne 130)

**Signature:** `export const Array_list_literal = function (`

**Description:**

Array_list_literal - list literal value for Array_declare / Array_create.

---

### Array_modify

**Fichier:** `generators\arduino\blocks\array.ts` (ligne 192)

**Signature:** `export const Array_modify = function (`

**Description:**

Array_modify - listVar[indice] = value;

---

### Array_with

**Fichier:** `generators\arduino\blocks\array.ts` (ligne 149)

**Signature:** `export const Array_with = function (`

**Description:**

Array_with - define [variable] as global list (declaration before setup()).

---


## generators\arduino\blocks\board.ts

### board_base_inout_analog_read

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 94)

**Signature:** `export function board_base_inout_analog_read(block: Block, _generator: ArduinoGenerator): [string, Order]`

**Description:** *Aucune documentation*

---

### board_base_inout_analog_write

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 82)

**Signature:** `export function board_base_inout_analog_write(block: Block, generator: ArduinoGenerator): string`

**Description:** *Aucune documentation*

---

### board_base_inout_analog_write_slider

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 88)

**Signature:** `export function board_base_inout_analog_write_slider(block: Block, _generator: ArduinoGenerator): string`

**Description:** *Aucune documentation*

---

### board_base_inout_buildin_led

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 58)

**Signature:** `export function board_base_inout_buildin_led(block: Block, generator: ArduinoGenerator): string`

**Description:** *Aucune documentation*

---

### board_base_inout_digital_read

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 71)

**Signature:** `export function board_base_inout_digital_read(block: Block, generator: ArduinoGenerator): [string, Order]`

**Description:** *Aucune documentation*

---

### board_base_inout_digital_write

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 64)

**Signature:** `export function board_base_inout_digital_write(block: Block, generator: ArduinoGenerator): string`

**Description:** *Aucune documentation*

---

### board_base_inout_highlow

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 77)

**Signature:** `export function board_base_inout_highlow(block: Block, _generator: ArduinoGenerator): [string, Order]`

**Description:** *Aucune documentation*

---

### board_base_inout_map

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 132)

**Signature:** `export function board_base_inout_map(block: Block, generator: ArduinoGenerator): [string, Order]`

**Description:** *Aucune documentation*

---

### board_base_inout_notone

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 146)

**Signature:** `export function board_base_inout_notone(block: Block, generator: ArduinoGenerator): string`

**Description:** *Aucune documentation*

---

### board_base_inout_pin_mode

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 126)

**Signature:** `export function board_base_inout_pin_mode(block: Block, _generator: ArduinoGenerator): string`

**Description:** *Aucune documentation*

---

### board_base_inout_pulsein

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 113)

**Signature:** `export function board_base_inout_pulsein(block: Block, _generator: ArduinoGenerator): [string, Order]`

**Description:** *Aucune documentation*

---

### board_base_inout_pulsein_timeout

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 119)

**Signature:** `export function board_base_inout_pulsein_timeout(block: Block, generator: ArduinoGenerator): [string, Order]`

**Description:** *Aucune documentation*

---

### board_base_inout_tone

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 139)

**Signature:** `export function board_base_inout_tone(block: Block, generator: ArduinoGenerator): string`

**Description:** *Aucune documentation*

---

### board_base_loop

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 53)

**Signature:** `export function board_base_loop(block: Block, generator: ArduinoGenerator): string`

**Description:** *Aucune documentation*

---

### board_base_setup

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 37)

**Signature:** `export function board_base_setup(block: Block, generator: ArduinoGenerator): string`

**Description:**

@license
Copyright (C) 2023-2024 ASTUCE (Sébastien Canet microcompany)
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
You should have received a copy of the GNU General Public License
along with this program.  If not, see https://www.gnu.org/licenses/.
SPDX-License-Identifier: GPL-3.0-or-later

---

### board_base_setup_loop

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 44)

**Signature:** `export function board_base_setup_loop(block: Block, generator: ArduinoGenerator): string`

**Description:** *Aucune documentation*

---

### board_base_time_delay

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 99)

**Signature:** `export function board_base_time_delay(block: Block, generator: ArduinoGenerator): string`

**Description:** *Aucune documentation*

---

### board_base_time_delay_sec

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 108)

**Signature:** `export function board_base_time_delay_sec(block: Block, generator: ArduinoGenerator): string`

**Description:** *Aucune documentation*

---

### board_base_time_millis

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 104)

**Signature:** `export function board_base_time_millis(_block: Block, _generator: ArduinoGenerator): [string, Order]`

**Description:** *Aucune documentation*

---

### board_conversion_constrain

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 238)

**Signature:** `export function board_conversion_constrain(block: Block, generator: ArduinoGenerator): [string, Order]`

**Description:** *Aucune documentation*

---

### board_conversion_tobyte

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 228)

**Signature:** `export function board_conversion_tobyte(block: Block, generator: ArduinoGenerator): [string, Order]`

**Description:** *Aucune documentation*

---

### board_conversion_tochar

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 223)

**Signature:** `export function board_conversion_tochar(block: Block, generator: ArduinoGenerator): [string, Order]`

**Description:** *Aucune documentation*

---

### board_conversion_tofloat

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 218)

**Signature:** `export function board_conversion_tofloat(block: Block, generator: ArduinoGenerator): [string, Order]`

**Description:** *Aucune documentation*

---

### board_conversion_toint

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 213)

**Signature:** `export function board_conversion_toint(block: Block, generator: ArduinoGenerator): [string, Order]`

**Description:** *Aucune documentation*

---

### board_conversion_toString

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 233)

**Signature:** `export function board_conversion_toString(block: Block, generator: ArduinoGenerator): [string, Order]`

**Description:** *Aucune documentation*

---

### board_serial_available

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 182)

**Signature:** `export function board_serial_available(_block: Block, _generator: ArduinoGenerator): [string, Order]`

**Description:** *Aucune documentation*

---

### board_serial_begin

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 152)

**Signature:** `export function board_serial_begin(block: Block, generator: ArduinoGenerator): string`

**Description:** *Aucune documentation*

---

### board_serial_flush

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 174)

**Signature:** `export function board_serial_flush(_block: Block, _generator: ArduinoGenerator): string`

**Description:** *Aucune documentation*

---

### board_serial_parseFloat

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 208)

**Signature:** `export function board_serial_parseFloat(_block: Block, _generator: ArduinoGenerator): [string, Order]`

**Description:** *Aucune documentation*

---

### board_serial_parseInt

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 204)

**Signature:** `export function board_serial_parseInt(_block: Block, _generator: ArduinoGenerator): [string, Order]`

**Description:** *Aucune documentation*

---

### board_serial_peek

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 191)

**Signature:** `export function board_serial_peek(_block: Block, _generator: ArduinoGenerator): [string, Order]`

**Description:** *Aucune documentation*

---

### board_serial_print

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 158)

**Signature:** `export function board_serial_print(block: Block, generator: ArduinoGenerator): string`

**Description:** *Aucune documentation*

---

### board_serial_printfor

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 168)

**Signature:** `export function board_serial_printfor(block: Block, generator: ArduinoGenerator): string`

**Description:** *Aucune documentation*

---

### board_serial_println

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 163)

**Signature:** `export function board_serial_println(block: Block, generator: ArduinoGenerator): string`

**Description:** *Aucune documentation*

---

### board_serial_read

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 178)

**Signature:** `export function board_serial_read(_block: Block, _generator: ArduinoGenerator): [string, Order]`

**Description:** *Aucune documentation*

---

### board_serial_readString

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 195)

**Signature:** `export function board_serial_readString(_block: Block, _generator: ArduinoGenerator): [string, Order]`

**Description:** *Aucune documentation*

---

### board_serial_readStringUntil

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 199)

**Signature:** `export function board_serial_readStringUntil(block: Block, generator: ArduinoGenerator): [string, Order]`

**Description:** *Aucune documentation*

---

### board_serial_write

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 186)

**Signature:** `export function board_serial_write(block: Block, generator: ArduinoGenerator): string`

**Description:** *Aucune documentation*

---


## generators\arduino\blocks\colour.ts

### color_picker_custom

**Fichier:** `generators\arduino\blocks\colour.ts` (ligne 59)

**Signature:** `export function color_picker_custom(block: Block): [string, Order]`

**Description:**

Generates Arduino code for the custom colour picker value.
@param block - Blockly block instance.
@returns Code string with order.

---

### color_picker_hsv

**Fichier:** `generators\arduino\blocks\colour.ts` (ligne 72)

**Signature:** `export function color_picker_hsv(block: Block): [string, Order]`

**Description:**

Generates Arduino code for the HSV picker value.
@param block - Blockly block instance.
@returns Code string with order.

---

### colour_blend

**Fichier:** `generators\arduino\blocks\colour.ts` (ligne 138)

**Signature:** `export function colour_blend(`

**Description:**

Generates Arduino code for blending two colours.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### colour_picker

**Fichier:** `generators\arduino\blocks\colour.ts` (ligne 49)

**Signature:** `export function colour_picker(block: Block): [string, Order]`

**Description:**

Generates Arduino code for a colour picker value.
@param block - Blockly block instance.
@returns Code string with order.

---

### colour_random

**Fichier:** `generators\arduino\blocks\colour.ts` (ligne 82)

**Signature:** `export function colour_random(`

**Description:**

Generates Arduino code for a random colour.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### colour_rgb

**Fichier:** `generators\arduino\blocks\colour.ts` (ligne 109)

**Signature:** `export function colour_rgb(`

**Description:**

Generates Arduino code for RGB colour composition.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---


## generators\arduino\blocks\libre.ts

### libre_end

**Fichier:** `generators\arduino\blocks\libre.ts` (ligne 63)

**Signature:** `export function libre_end(block: Block, _generator: ArduinoGenerator): string`

**Description:** *Aucune documentation*

---

### libre_in

**Fichier:** `generators\arduino\blocks\libre.ts` (ligne 47)

**Signature:** `export function libre_in(_block: Block, _generator: ArduinoGenerator): [string, Order]`

**Description:**

Generates a C++ comment from the block's TEXT field (if non-empty).

---

### libre_in_out

**Fichier:** `generators\arduino\blocks\libre.ts` (ligne 55)

**Signature:** `export function libre_in_out(block: Block, _generator: ArduinoGenerator): string`

**Description:** *Aucune documentation*

---

### libre_loop

**Fichier:** `generators\arduino\blocks\libre.ts` (ligne 67)

**Signature:** `export function libre_loop(block: Block, generator: ArduinoGenerator): string`

**Description:** *Aucune documentation*

---

### libre_loop_do_inside

**Fichier:** `generators\arduino\blocks\libre.ts` (ligne 97)

**Signature:** `export function libre_loop_do_inside(block: Block, generator: ArduinoGenerator): string`

**Description:** *Aucune documentation*

---

### libre_loop_do_inside_in

**Fichier:** `generators\arduino\blocks\libre.ts` (ligne 102)

**Signature:** `export function libre_loop_do_inside_in(block: Block, generator: ArduinoGenerator): string`

**Description:** *Aucune documentation*

---

### libre_loop_inside

**Fichier:** `generators\arduino\blocks\libre.ts` (ligne 77)

**Signature:** `export function libre_loop_inside(block: Block, generator: ArduinoGenerator): string`

**Description:** *Aucune documentation*

---

### libre_loop_inside_in

**Fichier:** `generators\arduino\blocks\libre.ts` (ligne 82)

**Signature:** `export function libre_loop_inside_in(block: Block, generator: ArduinoGenerator): string`

**Description:** *Aucune documentation*

---

### libre_loop_inside_in_mutator

**Fichier:** `generators\arduino\blocks\libre.ts` (ligne 87)

**Signature:** `export function libre_loop_inside_in_mutator(block: Block, generator: ArduinoGenerator): string`

**Description:** *Aucune documentation*

---

### libre_loop_with_return

**Fichier:** `generators\arduino\blocks\libre.ts` (ligne 72)

**Signature:** `export function libre_loop_with_return(block: Block, generator: ArduinoGenerator): string`

**Description:** *Aucune documentation*

---

### libre_out

**Fichier:** `generators\arduino\blocks\libre.ts` (ligne 51)

**Signature:** `export function libre_out(block: Block, _generator: ArduinoGenerator): string`

**Description:** *Aucune documentation*

---

### libre_start

**Fichier:** `generators\arduino\blocks\libre.ts` (ligne 59)

**Signature:** `export function libre_start(block: Block, _generator: ArduinoGenerator): string`

**Description:** *Aucune documentation*

---


## generators\arduino\blocks\logic.ts

### controls_if

**Fichier:** `generators\arduino\blocks\logic.ts` (ligne 50)

**Signature:** `export function controls_if(block: Block, generator: ArduinoGenerator)`

**Description:**

Generates Arduino code for if/else control blocks.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Generated code string.

---

### controls_switch

**Fichier:** `generators\arduino\blocks\logic.ts` (ligne 201)

**Signature:** `export function controls_switch(`

**Description:**

Generates Arduino code for switch/case blocks.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Generated code string.

---

### logic_boolean

**Fichier:** `generators\arduino\blocks\logic.ts` (ligne 178)

**Signature:** `export function logic_boolean(`

**Description:**

Generates Arduino code for boolean literals.
@param block - Blockly block instance.
@returns Generated code tuple.

---

### logic_compare

**Fichier:** `generators\arduino\blocks\logic.ts` (ligne 100)

**Signature:** `export function logic_compare(`

**Description:**

Generates Arduino code for comparison operations.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Generated code tuple.

---

### logic_negate

**Fichier:** `generators\arduino\blocks\logic.ts` (ligne 162)

**Signature:** `export function logic_negate(`

**Description:**

Generates Arduino code for boolean negation.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Generated code tuple.

---

### logic_null

**Fichier:** `generators\arduino\blocks\logic.ts` (ligne 190)

**Signature:** `export function logic_null(): [string, Order]`

**Description:**

Generates Arduino code for null literal.
@returns Generated code tuple.

---

### logic_operation

**Fichier:** `generators\arduino\blocks\logic.ts` (ligne 129)

**Signature:** `export function logic_operation(`

**Description:**

Generates Arduino code for boolean operations.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Generated code tuple.

---

### logic_ternary

**Fichier:** `generators\arduino\blocks\logic.ts` (ligne 246)

**Signature:** `export function logic_ternary(`

**Description:**

Generates Arduino code for ternary expressions.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Generated code tuple.

---


## generators\arduino\blocks\loops.ts

### controls_flow_statements

**Fichier:** `generators\arduino\blocks\loops.ts` (ligne 323)

**Signature:** `export function controls_flow_statements(`

**Description:**

Generates Arduino code for flow statements (break/continue).
@param block - Blockly block instance.
@returns Generated code string.

---

### controls_for

**Fichier:** `generators\arduino\blocks\loops.ts` (ligne 164)

**Signature:** `export function controls_for(`

**Description:**

Generates Arduino code for numeric for-loops.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Generated code string.

---

### controls_forEach

**Fichier:** `generators\arduino\blocks\loops.ts` (ligne 281)

**Signature:** `export function controls_forEach(`

**Description:**

Generates Arduino code for foreach loops.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Generated code string.

---

### controls_repeat_ext

**Fichier:** `generators\arduino\blocks\loops.ts` (ligne 104)

**Signature:** `export function controls_repeat_ext(`

**Description:**

Generates Arduino code for repeat loops with a count.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Generated code string.

---

### controls_whileUntil

**Fichier:** `generators\arduino\blocks\loops.ts` (ligne 140)

**Signature:** `export function controls_whileUntil(`

**Description:**

Generates Arduino code for while/until loops.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Generated code string.

---


## generators\arduino\blocks\math_helpers.ts

### addListHelpers

**Fichier:** `generators\arduino\blocks\math_helpers.ts` (ligne 98)

**Signature:** `export function addListHelpers(generator: ArduinoGenerator): void`

**Description:**

Injects list helper functions into the generator.
@param generator - Arduino generator instance.

---

### addMathInclude

**Fichier:** `generators\arduino\blocks\math_helpers.ts` (ligne 47)

**Signature:** `export function addMathInclude(generator: ArduinoGenerator): void`

**Description:**

Adds math include headers to the generator.
Only needed for libm symbols (sin, sqrt, pow, …) not provided by Arduino.h alone.
@param generator - Arduino generator instance.

---

### addPrimeHelper

**Fichier:** `generators\arduino\blocks\math_helpers.ts` (ligne 77)

**Signature:** `export function addPrimeHelper(generator: ArduinoGenerator): void`

**Description:**

Injects a prime-check helper into the generator.
@param generator - Arduino generator instance.

---

### addSqrtHelper

**Fichier:** `generators\arduino\blocks\math_helpers.ts` (ligne 55)

**Signature:** `export function addSqrtHelper(generator: ArduinoGenerator): void`

**Description:**

Injects an integer square-root helper (avoids &lt;math.h&gt; for list statistics).
@param generator - Arduino generator instance.

---


## generators\arduino\blocks\math.ts

### inout_angle_maths

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 99)

**Signature:** `export function inout_angle_maths(block: Block): [string, Order]`

**Description:**

Generates Arduino code for an angle literal.
@param block - Blockly block instance.
@returns Code string with order.

---

### math_arithmetic

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 110)

**Signature:** `export function math_arithmetic(`

**Description:**

Generates Arduino code for arithmetic expressions.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### math_atan2

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 478)

**Signature:** `export function math_atan2(`

**Description:**

Generates Arduino code for atan2.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### math_change

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 78)

**Signature:** `export function math_change(`

**Description:**

Generates Arduino code for a change-by statement.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Statement code string.

---

### math_constant

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 268)

**Signature:** `export function math_constant(block: Block): [string, Order]`

**Description:**

Generates Arduino code for math constants.
@param block - Blockly block instance.
@returns Code string with order.

---

### math_constrain

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 436)

**Signature:** `export function math_constrain(`

**Description:**

Generates Arduino code for constrain(min, max).
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### math_interval

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 202)

**Signature:** `export function math_interval(`

**Description:**

Generates Arduino code for interval comparisons.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### math_modulo

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 417)

**Signature:** `export function math_modulo(`

**Description:**

Generates Arduino code for modulo operation.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### math_number

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 55)

**Signature:** `export function math_number(block: Block): [string, Order]`

**Description:**

Generates Arduino code for a numeric literal.
@param block - Blockly block instance.
@returns Code string with order.

---

### math_number_property

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 292)

**Signature:** `export function math_number_property(`

**Description:**

Generates Arduino code for numeric property checks.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### math_on_list

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 378)

**Signature:** `export function math_on_list(`

**Description:**

Generates Arduino code for list math operations.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### math_percent

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 66)

**Signature:** `export function math_percent(block: Block): [string, Order]`

**Description:**

Generates Arduino code for a percentage literal (0-100 mapped to 0-1).
@param block - Blockly block instance.
@returns Code string with order.

---

### math_random_float

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 467)

**Signature:** `export function math_random_float(): [string, Order]`

**Description:**

Generates Arduino code for a random float between 0 and 1.
@returns Code string with order.

---

### math_random_int

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 453)

**Signature:** `export function math_random_int(`

**Description:**

Generates Arduino code for a random integer in a range.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### math_round

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 352)

**Signature:** `export function math_round(`

**Description:**

Generates Arduino code for rounding operations.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### math_single

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 141)

**Signature:** `export function math_single(`

**Description:**

Generates Arduino code for single-operand math operations.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### math_trig

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 243)

**Signature:** `export function math_trig(`

**Description:**

Generates Arduino code for trigonometric functions.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---


## generators\arduino\blocks\procedures.ts

### procedures_callnoreturn

**Fichier:** `generators\arduino\blocks\procedures.ts` (ligne 311)

**Signature:** `export function procedures_callnoreturn(`

**Description:**

Generates Arduino code for calling a procedure without return value.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Statement code string.

---

### procedures_callreturn

**Fichier:** `generators\arduino\blocks\procedures.ts` (ligne 289)

**Signature:** `export function procedures_callreturn(`

**Description:**

Generates Arduino code for calling a procedure with return value.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### procedures_defnoreturn

**Fichier:** `generators\arduino\blocks\procedures.ts` (ligne 261)

**Signature:** `export const procedures_defnoreturn = function (`

**Description:**

Generates Arduino code for a procedure without return value.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Function definition code.

---

### procedures_defreturn

**Fichier:** `generators\arduino\blocks\procedures.ts` (ligne 216)

**Signature:** `export function procedures_defreturn(`

**Description:**

Generates Arduino code for a procedure with return value.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Function definition code.

---

### procedures_ifreturn

**Fichier:** `generators\arduino\blocks\procedures.ts` (ligne 332)

**Signature:** `export function procedures_ifreturn(`

**Description:**

Generates Arduino code for if-return blocks.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Statement code string.

---


## generators\arduino\blocks\text_helpers.ts

### addTextHelpers

**Fichier:** `generators\arduino\blocks\text_helpers.ts` (ligne 129)

**Signature:** `export function addTextHelpers(generator: ArduinoGenerator): void`

**Description:**

Adds helper functions for text list operations (count, replace, reverse).
@param generator - Arduino generator instance.

---

### addTitleCaseHelper

**Fichier:** `generators\arduino\blocks\text_helpers.ts` (ligne 63)

**Signature:** `export function addTitleCaseHelper(generator: ArduinoGenerator): void`

**Description:**

Title-case helper without ctype (ASCII letter checks only).
@param generator - Arduino generator instance.

---

### addTrimHelper

**Fichier:** `generators\arduino\blocks\text_helpers.ts` (ligne 118)

**Signature:** `export function addTrimHelper(`

**Description:**

Injects only the trim helper required for the selected mode.
@param generator - Arduino generator instance.
@param mode - BOTH, LEFT, or RIGHT.

---

### addUpperLowerHelper

**Fichier:** `generators\arduino\blocks\text_helpers.ts` (ligne 46)

**Signature:** `export function addUpperLowerHelper(generator: ArduinoGenerator): void`

**Description:**

Legacy rduino-style upper/lower case helper (Arduino String methods, no ctype).
@param generator - Arduino generator instance.

---


## generators\arduino\blocks\text.ts

### text

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 89)

**Signature:** `export function text(block: Block): [string, Order]`

**Description:**

Generates Arduino code for a quoted text literal.
@param block - Blockly block instance.
@returns Code string with order.

---

### text_append

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 174)

**Signature:** `export function text_append(`

**Description:**

Generates Arduino code to append text to a variable.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Statement code string.

---

### text_changeCase

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 326)

**Signature:** `export function text_changeCase(`

**Description:**

Generates Arduino code for text case changes.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### text_char

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 133)

**Signature:** `export function text_char(block: Block): [string, Order]`

**Description:**

Generates Arduino code for a single character literal.
@param block - Blockly block instance.
@returns Code string with order.

---

### text_charAt

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 239)

**Signature:** `export function text_charAt(`

**Description:**

Generates Arduino code to access a character at position.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### text_count

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 375)

**Signature:** `export function text_count(`

**Description:**

Generates Arduino code for counting substrings.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### text_date

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 122)

**Signature:** `export function text_date(block: Block): [string, Order]`

**Description:**

Generates Arduino code for a date literal.
@param block - Blockly block instance.
@returns Code string with order.

---

### text_getSubstring

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 282)

**Signature:** `export function text_getSubstring(`

**Description:**

Generates Arduino code for substring extraction.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### text_indexOf

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 221)

**Signature:** `export function text_indexOf(`

**Description:**

Generates Arduino code for substring index lookup.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### text_isEmpty

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 206)

**Signature:** `export function text_isEmpty(`

**Description:**

Generates Arduino code for is-empty checks.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### text_join

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 145)

**Signature:** `export function text_join(`

**Description:**

Generates Arduino code to concatenate text parts.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### text_length

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 191)

**Signature:** `export function text_length(`

**Description:**

Generates Arduino code for text length.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### text_multiline

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 111)

**Signature:** `export function text_multiline(block: Block): [string, Order]`

**Description:**

Generates Arduino code for a multiline quoted text literal.
@param block - Blockly block instance.
@returns Code string with order.

---

### text_no_quote

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 100)

**Signature:** `export function text_no_quote(block: Block): [string, Order]`

**Description:**

Generates Arduino code for a raw text literal without quotes.
@param block - Blockly block instance.
@returns Code string with order.

---

### text_print

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 427)

**Signature:** `export function text_print(`

**Description:**

Generates Arduino code for printing text.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Statement code string.

---

### text_prompt_ext

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 443)

**Signature:** `export function text_prompt_ext(`

**Description:**

Generates Arduino code for prompt text (input).
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### text_replace

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 392)

**Signature:** `export function text_replace(`

**Description:**

Generates Arduino code for replacing substrings.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### text_reverse

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 411)

**Signature:** `export function text_reverse(`

**Description:**

Generates Arduino code for reversing text.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### text_trim

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 350)

**Signature:** `export function text_trim(`

**Description:**

Generates Arduino code for trimming text.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---


## generators\arduino\blocks\variables_typed.ts

### variables_cast

**Fichier:** `generators\arduino\blocks\variables_typed.ts` (ligne 177)

**Signature:** `export const variables_cast = function (`

**Description:**

Generates Arduino code for variables_cast: (type)(expression).

---

### variables_const

**Fichier:** `generators\arduino\blocks\variables_typed.ts` (ligne 251)

**Signature:** `export const variables_const = function (`

**Description:**

Generates Arduino code for const variable declaration.
Always emits a declaration when the block has a variable name; type is inferred
from the connected block when present, otherwise from the variable model or default "int".
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Generated code string.

---

### variables_define

**Fichier:** `generators\arduino\blocks\variables_typed.ts` (ligne 300)

**Signature:** `export const variables_define = function (`

**Description:**

Generates Arduino code for variable definition blocks.
Emits a preprocessor macro: #define varName value (e.g. #define toto true).
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Generated code string.

---

### variables_get_dynamic

**Fichier:** `generators\arduino\blocks\variables_typed.ts` (ligne 158)

**Signature:** `export const variables_get_dynamic = function (`

**Description:**

Generates Arduino code for variables_get_dynamic.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Generated code tuple.

---

### variables_local

**Fichier:** `generators\arduino\blocks\variables_typed.ts` (ligne 127)

**Signature:** `export const variables_local = function (`

**Description:**

Generates Arduino code for the local wrapper block.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Generated code tuple.

---

### variables_set_dynamic

**Fichier:** `generators\arduino\blocks\variables_typed.ts` (ligne 68)

**Signature:** `export const variables_set_dynamic = function (`

**Description:**

Generates Arduino code for variables_set_dynamic with typing.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Generated code string.

---

### variables_set_init

**Fichier:** `generators\arduino\blocks\variables_typed.ts` (ligne 278)

**Signature:** `export const variables_set_init = function (`

**Description:**

Generates Arduino code for typed variable initialization.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Generated code string.

---

### variables_set_type

**Fichier:** `generators\arduino\blocks\variables_typed.ts` (ligne 193)

**Signature:** `export const variables_set_type = function (`

**Description:**

Generator for variables_set_type block.
This block only changes the variable type in the workspace; no code is emitted.
@param _block - Blockly block instance (unused, for API consistency).
@param _generator - Arduino generator instance (unused, for API consistency).
@returns Empty string (no generated code).

---


## generators\arduino\blocks\variables.ts

### variables_get

**Fichier:** `generators\arduino\blocks\variables.ts` (ligne 76)

**Signature:** `export const variables_get = function (`

**Description:**

Generates Arduino code for variables_get.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Generated code tuple.

---

### variables_set

**Fichier:** `generators\arduino\blocks\variables.ts` (ligne 48)

**Signature:** `export const variables_set = function (`

**Description:**

Generates Arduino code for variables_set.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Generated code string.

---


## generators\arduino\configure_standard_blocks.ts

### configureStandardBlocks

**Fichier:** `generators\arduino\configure_standard_blocks.ts` (ligne 66)

**Signature:** `export function configureStandardBlocks(): void`

**Description:**

Applies typed variable behavior to standard Blockly blocks.

---


## generators\arduino\debug.ts

### debugLog

**Fichier:** `generators\arduino\debug.ts` (ligne 54)

**Signature:** `export function debugLog(...args: unknown[]): void`

**Description:**

Logs debug output when the debug flag is enabled.
@param args - Values to log.

---

### isDebugEnabled

**Fichier:** `generators\arduino\debug.ts` (ligne 38)

**Signature:** `export function isDebugEnabled(): boolean`

**Description:**

Indique si le mode debug (switch UI ou localStorage) est actif.

---


## generators\arduino\procedures_flyout.ts

### createProceduresFlyout

**Fichier:** `generators\arduino\procedures_flyout.ts` (ligne 54)

**Signature:** `export function createProceduresFlyout(`

**Description:**

Flyout : blocs setup()/loop() Arduino, puis séparateur, puis procédures Blockly.

---

### registerProceduresCategory

**Fichier:** `generators\arduino\procedures_flyout.ts` (ligne 72)

**Signature:** `export function registerProceduresCategory(`

**Description:**

Enregistre le callback de la catégorie PROCEDURE dans la toolbox.

---


## generators\arduino\strict_connection_checker.ts

### registerStrictConnectionChecker

**Fichier:** `generators\arduino\strict_connection_checker.ts` (ligne 959)

**Signature:** `export function registerStrictConnectionChecker(workspace: Blockly.Workspace): void`

**Description:**

Installs the strict connection checker on an existing workspace.
Use registerStrictConnectionCheckerInRegistry() BEFORE Blockly.inject() instead for best results.
@param workspace - Target workspace.

---

### registerStrictConnectionCheckerInRegistry

**Fichier:** `generators\arduino\strict_connection_checker.ts` (ligne 942)

**Signature:** `export function registerStrictConnectionCheckerInRegistry(): void`

**Description:**

Registers the StrictConnectionChecker in Blockly's registry as the default checker.
MUST be called BEFORE Blockly.inject() so the workspace uses our checker from the start.

---

### StrictConnectionChecker

**Fichier:** `generators\arduino\strict_connection_checker.ts` (ligne 54)

**Signature:** `export class StrictConnectionChecker extends Blockly.ConnectionChecker`

**Description:**

Custom ConnectionChecker that extends Blockly's default ConnectionChecker
to use getBlockType() for source blocks, providing stricter type checking.

---


## generators\arduino\strict_type_enforcer.ts

### installStrictTypeEnforcer

**Fichier:** `generators\arduino\strict_type_enforcer.ts` (ligne 81)

**Signature:** `export function installStrictTypeEnforcer(`

**Description:**

Installs post-connection type enforcement.
@param workspace - Target workspace.
@param options - Enforcer options.

---

### uninstallStrictTypeEnforcer

**Fichier:** `generators\arduino\strict_type_enforcer.ts` (ligne 68)

**Signature:** `export function uninstallStrictTypeEnforcer(workspace: Blockly.Workspace): void`

**Description:**

Uninstalls a previously installed strict type enforcer.
@param workspace - Target workspace.

---


## generators\arduino\typed_variables_flyout.ts

### createTypedVariablesFlyout

**Fichier:** `generators\arduino\typed_variables_flyout.ts` (ligne 46)

**Signature:** `export function createTypedVariablesFlyout(`

**Description:**

Builds the typed variables flyout contents.
@param workspace - Workspace used to resolve variables.
@returns Array of flyout items.

---

### registerTypedVariablesCategory

**Fichier:** `generators\arduino\typed_variables_flyout.ts` (ligne 169)

**Signature:** `export function registerTypedVariablesCategory(`

**Description:**

Registers the typed variables toolbox category callback.
@param workspace - Workspace whose toolbox is being configured.

---


## generators\arduino\variable_scope.ts

### emitLocalDeclaration

**Fichier:** `generators\arduino\variable_scope.ts` (ligne 167)

**Signature:** `export function emitLocalDeclaration(`

**Description:**

Enregistre une déclaration locale dans le bon contexte Arduino.

---

### isArrayAssignmentValueBlock

**Fichier:** `generators\arduino\variable_scope.ts` (ligne 48)

**Signature:** `export function isArrayAssignmentValueBlock(block: Block | null): boolean`

**Description:**

Valeur de liste connectée à un bloc set (littéral ou local enveloppant un littéral).

---

### isArrayListStatementBlock

**Fichier:** `generators\arduino\variable_scope.ts` (ligne 62)

**Signature:** `export function isArrayListStatementBlock(block: Block | null): boolean`

**Description:**

Bloc instruction « define variable as list » (déclaration globale).

---

### isArrayValueBlock

**Fichier:** `generators\arduino\variable_scope.ts` (ligne 40)

**Signature:** `export function isArrayValueBlock(block: Block | null): boolean`

**Description:**

Blocs littéraux de liste (valeur branchée dans variables_set ou Array_declare).

---

### localDeclarationTag

**Fichier:** `generators\arduino\variable_scope.ts` (ligne 187)

**Signature:** `export function localDeclarationTag(`

**Description:**

Identifiant stable pour une déclaration locale.

---

### resolveLocalVariableScope

**Fichier:** `generators\arduino\variable_scope.ts` (ligne 112)

**Signature:** `export function resolveLocalVariableScope(block: Block): LocalVariableScope`

**Description:**

Détermine si un bloc variables_set se trouve dans setup(), loop() ou une procédure.

---

### unwrapValueBlock

**Fichier:** `generators\arduino\variable_scope.ts` (ligne 69)

**Signature:** `export function unwrapValueBlock(block: Block | null): Block | null`

**Description:**

Déplie un bloc « local » pour atteindre la valeur réelle.

---

### usesLocalVariableDeclaration

**Fichier:** `generators\arduino\variable_scope.ts` (ligne 79)

**Signature:** `export function usesLocalVariableDeclaration(valueBlock: Block | null): boolean`

**Description:**

Affectation produisant une déclaration locale (wrapper « local » ou liste).

---


## generators\arduino\variable_utils.ts

### clearVariableType

**Fichier:** `generators\arduino\variable_utils.ts` (ligne 116)

**Signature:** `export function clearVariableType(`

**Description:**

Clears a variable's type metadata.
@param variable - Variable model to update.

---

### isListVariable

**Fichier:** `generators\arduino\variable_utils.ts` (ligne 66)

**Signature:** `export function isListVariable(`

**Description:** *Aucune documentation*

---

### isListVariableType

**Fichier:** `generators\arduino\variable_utils.ts` (ligne 62)

**Signature:** `export function isListVariableType(type: string | null | undefined): boolean`

**Description:** *Aucune documentation*

---

### isVariablesDefineBlock

**Fichier:** `generators\arduino\variable_utils.ts` (ligne 48)

**Signature:** `export function isVariablesDefineBlock(`

**Description:**

Indique si le type de bloc correspond à une déclaration globale typée.

---

### normalizeVariableType

**Fichier:** `generators\arduino\variable_utils.ts` (ligne 148)

**Signature:** `export function normalizeVariableType(`

**Description:**

Normalizes null/"null" types to empty string.
@param variable - Variable model to normalize.

---

### setVariableType

**Fichier:** `generators\arduino\variable_utils.ts` (ligne 77)

**Signature:** `export function setVariableType(`

**Description:**

Sets a variable's type metadata and updates the model.
@param variable - Variable model to update.
@param type - New type string.

---

### tagVariableAsList

**Fichier:** `generators\arduino\variable_utils.ts` (ligne 106)

**Signature:** `export function tagVariableAsList(`

**Description:**

Tags a workspace variable as a list/array variable (`list`).

---


## index.ts

### registerContinuousToolboxComponents

**Fichier:** `index.ts` (ligne 648)

**Signature:** `export const registerContinuousToolboxComponents = (): void =>`

**Description:**

Registers components needed for the continuous toolbox.
@public
@remarks
Registers ContinuousCategory, ContinuousMetrics, ContinuousFlyout,
ContinuousToolbox, and custom flyout inflaters. Also injects CSS
for the continuous toolbox appearance.

---

### unregisterContinuousToolboxComponents

**Fichier:** `index.ts` (ligne 725)

**Signature:** `export const unregisterContinuousToolboxComponents = (): void =>`

**Description:**

Unregisters continuous toolbox components and restores defaults.
@public
@remarks
Removes custom CSS styles, restores standard Blockly categories
and flyout inflaters, and unregisters the continuous toolbox components.

---


## language.ts

### changeLanguageToolbox

**Fichier:** `language.ts` (ligne 300)

**Signature:** `export const changeLanguageToolbox = (`

**Description:**

Returns a toolbox configuration with translated category labels.
@param newLang - Target language code.
@param toolbox - Source toolbox configuration.
@returns Translated toolbox configuration.

---

### getLangParamFromDropdown

**Fichier:** `language.ts` (ligne 190)

**Signature:** `export const getLangParamFromDropdown = (): string =>`

**Description:**

Gets the selected language from the dropdown and syncs the URL.
@returns Selected language code.

---

### getLangParamFromUrl

**Fichier:** `language.ts` (ligne 180)

**Signature:** `export const getLangParamFromUrl = (): string =>`

**Description:**

Gets the language code from the URL query string.
@returns Language code, defaulting to "en".

---

### HTML_changeLanguage

**Fichier:** `language.ts` (ligne 201)

**Signature:** `export const HTML_changeLanguage = (newLang: string): void =>`

**Description:**

Applies translations to DOM elements with language keys.
@param newLang - Target language code.

---

### HTML_populateLanguages

**Fichier:** `language.ts` (ligne 259)

**Signature:** `export const HTML_populateLanguages = (blocklyObject: BlocklyApplicationType): void =>`

**Description:**

Populates the language dropdown from the application language map.
@param blocklyObject - Blockly application instance with language metadata.

---


## languages\array_messages.ts

### mergeArrayMessages

**Fichier:** `languages\array_messages.ts` (ligne 188)

**Signature:** `export function mergeArrayMessages(lang: string): void`

**Description:**

Merge ARRAY_* messages into Blockly.Msg for the given language.

---


## languages\board_messages.ts

### mergeBoardMessages

**Fichier:** `languages\board_messages.ts` (ligne 363)

**Signature:** `export function mergeBoardMessages(lang: string): void`

**Description:**

Merge ARDUINO_* / SERIAL_* (s4e) messages into Blockly.Msg for the given language.

---


## program_structure_enforcer.ts

### installProgramStructureEnforcer

**Fichier:** `program_structure_enforcer.ts` (ligne 144)

**Signature:** `export function installProgramStructureEnforcer(`

**Description:**

Installe l'enforceur : blocs non raccordés (previous ou output seul) → inactifs.

---

### isInActiveProgram

**Fichier:** `program_structure_enforcer.ts` (ligne 73)

**Signature:** `export function isInActiveProgram(block: Blockly.Block): boolean`

**Description:**

Indique si le bloc doit rester actif sur le workspace.

---

### uninstallProgramStructureEnforcer

**Fichier:** `program_structure_enforcer.ts` (ligne 125)

**Signature:** `export function uninstallProgramStructureEnforcer(`

**Description:**

Désinstalle l'enforceur de structure de programme.

---

### updateProgramStructureDisabledState

**Fichier:** `program_structure_enforcer.ts` (ligne 105)

**Signature:** `export function updateProgramStructureDisabledState(`

**Description:**

Met à jour l'état actif/inactif de tous les blocs du workspace principal.

---


## toolbox_search_i18n.ts

### registerToolboxSearchI18n

**Fichier:** `toolbox_search_i18n.ts` (ligne 52)

**Signature:** `export function registerToolboxSearchI18n(): void`

**Description:**

Registers the multilingual toolbox-search category.
Call once after importing `\@blockly/toolbox-search`.

---


## toolbox.ts

### applyToolboxBlockLevels

**Fichier:** `toolbox.ts` (ligne 58)

**Signature:** `export function applyToolboxBlockLevels(`

**Description:**

Ajoute la propriété levels à chaque entrée kind:"block" (récursif).

---

### getToolboxForCurrentBoard

**Fichier:** `toolbox.ts` (ligne 912)

**Signature:** `export function getToolboxForCurrentBoard(toolbox: ToolboxConfiguration): ToolboxConfiguration`

**Description:**

Returns the toolbox to use for the workspace: without the board category if
no board is selected, otherwise a clone of the full toolbox.
Read the current selection from the board menu in the DOM.

---

### getToolboxWithoutBoardCategory

**Fichier:** `toolbox.ts` (ligne 899)

**Signature:** `export function getToolboxWithoutBoardCategory(toolbox: ToolboxConfiguration): ToolboxConfiguration`

**Description:**

Returns a deep clone of the toolbox with the board category (CAT_BOARD) removed.
Used when no board is selected so the toolbox does not show board blocks.

---


## tools.ts

### addReplaceParamToUrl

**Fichier:** `tools.ts` (ligne 40)

**Signature:** `export const addReplaceParamToUrl = (url: string, param: string, value: string): string =>`

**Description:**

Adds or replaces a query parameter in a URL string.
@param url - Input URL string.
@param param - Query parameter name.
@param value - Query parameter value.
@returns Updated URL with the parameter applied.

---

### buildCurrentUrlWithSearchParam

**Fichier:** `tools.ts` (ligne 57)

**Signature:** `export function buildCurrentUrlWithSearchParam(param: string, value: string): string`

**Description:**

Builds pathname + updated search + hash for the current page (same-origin URL without host).
Use with {@link pushStateReplaceSearchParam} so the browser keeps the correct path and fragment (#).
@param param - Query parameter name.
@param value - New value for the parameter.
@returns Full path string suitable for `history.pushState` (pathname + search + hash).

---

### pushStateReplaceSearchParam

**Fichier:** `tools.ts` (ligne 67)

**Signature:** `export function pushStateReplaceSearchParam(param: string, value: string): void`

**Description:**

Updates one query parameter and pushes history state (full pathname + search + hash).
@param param - Query parameter name.
@param value - New value for the parameter.

---

### setPluginsInURL

**Fichier:** `tools.ts` (ligne 76)

**Signature:** `export const setPluginsInURL = (pluginName: string, pluginKey: string): void =>`

**Description:**

Updates plugin flags in the URL based on a checkbox state.
@param pluginName - DOM checkbox element id.
@param pluginKey - URL key representing the plugin.

---


## workspace_flex.ts

### initializeBottomPanelToggleButton

**Fichier:** `workspace_flex.ts` (ligne 212)

**Signature:** `export const initializeBottomPanelToggleButton = (): void =>`

**Description:** *Aucune documentation*

---

### initializeRightPanelToggleButton

**Fichier:** `workspace_flex.ts` (ligne 181)

**Signature:** `export const initializeRightPanelToggleButton = (): void =>`

**Description:** *Aucune documentation*

---

### saveLayoutToSessionStorage

**Fichier:** `workspace_flex.ts` (ligne 46)

**Signature:** `export const saveLayoutToSessionStorage = (): void =>`

**Description:**

Persists layout flex grow values to session storage.

---

### updateBottomPanelToggleButton

**Fichier:** `workspace_flex.ts` (ligne 101)

**Signature:** `export const updateBottomPanelToggleButton = (): void =>`

**Description:** *Aucune documentation*

---

### updateResizerAriaValue

**Fichier:** `workspace_flex.ts` (ligne 243)

**Signature:** `export const updateResizerAriaValue = (resizer: HTMLElement): void =>`

**Description:** *Aucune documentation*

---

### updateRightPanelToggleButton

**Fichier:** `workspace_flex.ts` (ligne 83)

**Signature:** `export const updateRightPanelToggleButton = (): void =>`

**Description:** *Aucune documentation*

---


## workspace_layout_utils.ts

### parsePositiveFlex

**Fichier:** `workspace_layout_utils.ts` (ligne 37)

**Signature:** `export const parsePositiveFlex = (rawValue: string | null | undefined, fallback = 0): number =>`

**Description:**

@license
Copyright (C) 2023-2024 ASTUCE (Sébastien Canet microcompany)
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
You should have received a copy of the GNU General Public License
along with this program.  If not, see https://www.gnu.org/licenses/.
SPDX-License-Identifier: GPL-3.0-or-later

---

### snapNearZeroFlex

**Fichier:** `workspace_layout_utils.ts` (ligne 42)

**Signature:** `export const snapNearZeroFlex = (previous: HTMLElement, next: HTMLElement): void =>`

**Description:** *Aucune documentation*

---


## workspace_resize.ts

### getWorkspaceSvgRef

**Fichier:** `workspace_resize.ts` (ligne 47)

**Signature:** `export function getWorkspaceSvgRef(): Blockly.WorkspaceSvg | null`

**Description:**

Returns the registered workspace, if any (e.g. for flex-resizer mouseup).

---

### registerWorkspaceForSvgResize

**Fichier:** `workspace_resize.ts` (ligne 40)

**Signature:** `export function registerWorkspaceForSvgResize(workspace: Blockly.Workspace): void`

**Description:**

Registers the Blockly workspace used for SVG resize (avoids circular import with index.ts).

---

