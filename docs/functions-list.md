<div align="center">

![µcBlockly](../public/assets/logo_µcBlockly.png)

# Liste des fonctions exportées

</div>

> **Note :** inventaire généré par `npm run extract-functions`. La documentation API interactive : `npm run docs` → [TYPEDOC.md](./TYPEDOC.md).

Total: 432 fonctions

---


## a11y_labels.ts

### getA11yLabel

**Fichier:** `a11y_labels.ts` (ligne 69)

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

Applies levels to each Blockly.Blocks entry.
@param levels - CSV string (e.g. "1, 2, 3").

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


## blockly_a11y_extensions.ts

### attachBlocklyA11yToWorkspace

**Fichier:** `blockly_a11y_extensions.ts` (ligne 142)

**Signature:** `export const attachBlocklyA11yToWorkspace = (workspace: WorkspaceSvg): void =>`

**Description:**

Applique le mode lecteur d'écran mémorisé sur un workspace (y compris après reboot).

---

### dismissKeyboardTutorial

**Fichier:** `blockly_a11y_extensions.ts` (ligne 177)

**Signature:** `export const dismissKeyboardTutorial = (): void =>`

**Description:**

Mémorise que l'utilisateur ne souhaite plus le tutoriel automatique.

---

### getScreenreaderModeEnabled

**Fichier:** `blockly_a11y_extensions.ts` (ligne 66)

**Signature:** `export const getScreenreaderModeEnabled = (): boolean => screenreaderModeEnabled;`

**Description:**

Indique si le mode lecteur d'écran Blockly est actif.

---

### isKeyboardTutorialDismissed

**Fichier:** `blockly_a11y_extensions.ts` (ligne 168)

**Signature:** `export const isKeyboardTutorialDismissed = (): boolean =>`

**Description:**

Le tutoriel clavier a été marqué comme « ne plus afficher ».

---

### refreshBlocklyA11yExtensions

**Fichier:** `blockly_a11y_extensions.ts` (ligne 163)

**Signature:** `export const refreshBlocklyA11yExtensions = (): void =>`

**Description:**

Réapplique l'état a11y après recréation du workspace Blockly.

---

### registerBlocklyA11yExtensions

**Fichier:** `blockly_a11y_extensions.ts` (ligne 151)

**Signature:** `export const registerBlocklyA11yExtensions = (getter: WorkspaceGetter): void =>`

**Description:**

Active les raccourcis de navigation avancés et la persistance du mode lecteur d'écran.

---


## blockly_patches.ts

### patchBlockChangeForProcedureCompat

**Fichier:** `blockly_patches.ts` (ligne 175)

**Signature:** `export function patchBlockChangeForProcedureCompat(): void`

**Description:**

Procedure blocks may replay mutation XML while loadExtraState expects JSON.
Also skip missing `${argId}_TYPE` fields during arg creation event mirroring.

---

### patchBlocklyDefensive

**Fichier:** `blockly_patches.ts` (ligne 254)

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

**Fichier:** `blockly_patches.ts` (ligne 127)

**Signature:** `export function patchFieldVariableValidation(): void`

**Description:**

Extends FieldVariable validation and initModel for flyout/insertion-marker handling.

---

### patchVariableMapCreateVariable

**Fichier:** `blockly_patches.ts` (ligne 103)

**Signature:** `export function patchVariableMapCreateVariable(workspace: Blockly.Workspace): void`

**Description:**

Extends VariableMap.createVariable to normalize types and avoid duplicates.
Same name always resolves to one variable model (scalar, list, or instance).

---


## blockly_shell_focus.ts

### focusBlocklyToolbox

**Fichier:** `blockly_shell_focus.ts` (ligne 86)

**Signature:** `export const focusBlocklyToolbox = (): boolean =>`

**Description:**

Place le focus Blockly sur la toolbox ou le flyout (équivalent touche **T**).

---

### focusBlocklyWorkspace

**Fichier:** `blockly_shell_focus.ts` (ligne 68)

**Signature:** `export const focusBlocklyWorkspace = (): boolean =>`

**Description:**

Place le focus Blockly sur le workspace (équivalent touche **W**).

---

### registerShellBlocklyWorkspace

**Fichier:** `blockly_shell_focus.ts` (ligne 41)

**Signature:** `export const registerShellBlocklyWorkspace = (getter: WorkspaceGetter): void =>`

**Description:**

Registers access to the active Blockly workspace (after inject or reboot).

---


## boards.ts

### getBoardDigitalPinOptionMapping

**Fichier:** `boards.ts` (ligne 1142)

**Signature:** `export function getBoardDigitalPinOptionMapping(): Record<string, [string, string][]>`

**Description:**

Digital pin options per board id, for dependent-dropdown child menus.

---

### getBoardDropdownOptions

**Fichier:** `boards.ts` (ligne 1155)

**Signature:** `export function getBoardDropdownOptions(boardId: BoardId):`

**Description:**

Returns dropdown options (digital, PWM, analog, serial baud) for a given board.
Used so block pin dropdowns match the selected board.

---

### getBoardProfileDropdownOptions

**Fichier:** `boards.ts` (ligne 1127)

**Signature:** `export function getBoardProfileDropdownOptions(): [string, string][]`

**Description:**

Board choices for embedded per-block board dropdowns (excludes "none").

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


## categories\blockly\array_bitmap_grid.ts

### createEmptyBitmapGrid

**Fichier:** `categories\blockly\array_bitmap_grid.ts` (ligne 44)

**Signature:** `export const createEmptyBitmapGrid = (rows: number, cols: number): number[][] =>`

**Description:**

Builds an empty rows x cols grid of 0s.

---

### resizeBitmapGrid

**Fichier:** `categories\blockly\array_bitmap_grid.ts` (ligne 55)

**Signature:** `export const resizeBitmapGrid = (`

**Description:**

Resizes a bitmap grid, preserving overlapping pixels.

---


## categories\blockly\array_bitmap.ts

### defineArrayBitmapBlock

**Fichier:** `categories\blockly\array_bitmap.ts` (ligne 217)

**Signature:** `export const defineArrayBitmapBlock = (): void =>`

**Description:**

Registers Array_bitmap (declaration) and Array_bitmap_get (value grid).

---

### readBitmapDimInput

**Fichier:** `categories\blockly\array_bitmap.ts` (ligne 68)

**Signature:** `export const readBitmapDimInput = (`

**Description:**

Reads a dimension from a value input (prefers math_number NUM).

---


## categories\blockly\array.ts

### applyListDeclarationBlockWarning

**Fichier:** `categories\blockly\array.ts` (ligne 135)

**Signature:** `export const applyListDeclarationBlockWarning = (block: Blockly.Block): void =>`

**Description:**

Applique warning ownership (+ non typé pour Array_with).

---

### defineArrayBlocks

**Fichier:** `categories\blockly\array.ts` (ligne 600)

**Signature:** `export const defineArrayBlocks = (): void =>`

**Description:**

Registers S4e-style array blocks (Array_create_with, Array_declare, Array_create,
Array_getIndex_in_list, Array_getIndex_in_array, Array_modify, Array_fix).

---

### revalidateListDeclarationUniqueness

**Fichier:** `categories\blockly\array.ts` (ligne 149)

**Signature:** `export const revalidateListDeclarationUniqueness = (`

**Description:**

Revalide l'ownership des déclarations de listes sur tout le workspace.

---

### syncListDeclarationOwnership

**Fichier:** `categories\blockly\array.ts` (ligne 106)

**Signature:** `export const syncListDeclarationOwnership = (block: Blockly.Block): boolean =>`

**Description:**

Claims / releases list declaration ownership (same pattern as variables_const).
@returns true when a duplicate-owner warning was set.

---

### syncListDeclarationUniqueness

**Fichier:** `categories\blockly\array.ts` (ligne 130)

**Signature:** `export const syncListDeclarationUniqueness = (block: Blockly.Block): boolean =>`

**Description:**

Affiche un avertissement si ce bloc n'est pas le propriétaire de la déclaration.
@returns true when a duplicate warning was set.

---


## categories\blockly\board.ts

### defineBoardBlocks

**Fichier:** `categories\blockly\board.ts` (ligne 103)

**Signature:** `export const defineBoardBlocks = (): void =>`

**Description:**

Registers board (s4e) blocks: setup, loop, digital/analog I/O, delay, map, tone.

---

### refreshBoardPinDropdowns

**Fichier:** `categories\blockly\board.ts` (ligne 667)

**Signature:** `export function refreshBoardPinDropdowns(workspace: Blockly.Workspace): void`

**Description:**

Updates all pin and serial dropdowns in the workspace to match the currently selected board.
Call this when the board menu selection changes.
Uses setOptions when available; otherwise updates the menu generator so the dropdown shows the new list.

---


## categories\blockly\colour.ts

### defineColourBlocks

**Fichier:** `categories\blockly\colour.ts` (ligne 76)

**Signature:** `export const defineColourBlocks = (): void =>`

**Description:**

Registers colour blocks and custom color picker fields.

---


## categories\blockly\field_colour_a11y.ts

### formatColourAriaValue

**Fichier:** `categories\blockly\field_colour_a11y.ts` (ligne 76)

**Signature:** `export const formatColourAriaValue = (raw: string | null | undefined): string =>`

**Description:**

Screen-reader-friendly representation of a hex colour.
@remarks Used by custom colour fields' `getAriaValue` / `getText`.

---

### getColourAriaEmptyValue

**Fichier:** `categories\blockly\field_colour_a11y.ts` (ligne 38)

**Signature:** `export const getColourAriaEmptyValue = (): string =>`

**Description:**

ARIA value when the colour is missing or invalid.

---

### getColourAriaTypeName

**Fichier:** `categories\blockly\field_colour_a11y.ts` (ligne 34)

**Signature:** `export const getColourAriaTypeName = (): string =>`

**Description:**

Localized ARIA type name for a colour field.

---

### getColourHsvEditorLabel

**Fichier:** `categories\blockly\field_colour_a11y.ts` (ligne 95)

**Signature:** `export const getColourHsvEditorLabel = (): string =>`

**Description:**

Libellé du groupe éditeur curseurs HSV.

---

### getColourPickerEditorLabel

**Fichier:** `categories\blockly\field_colour_a11y.ts` (ligne 91)

**Signature:** `export const getColourPickerEditorLabel = (): string =>`

**Description:**

Libellé du groupe éditeur pipette iro.js.

---

### normalizeHexColour

**Fichier:** `categories\blockly\field_colour_a11y.ts` (ligne 45)

**Signature:** `export const normalizeHexColour = (raw: string | null | undefined): string | null =>`

**Description:**

Normalizes a hexadecimal colour (#RRGGBB).
@returns Uppercase hex or null if invalid.

---


## categories\blockly\field_colour_accessible.ts

### LocalizedFieldColour

**Fichier:** `categories\blockly\field_colour_accessible.ts` (ligne 41)

**Signature:** `export class LocalizedFieldColour extends FieldColour`

**Description:**

Colour grid field with screen-reader-friendly ARIA values.

---

### registerAccessibleFieldColour

**Fichier:** `categories\blockly\field_colour_accessible.ts` (ligne 58)

**Signature:** `export const registerAccessibleFieldColour = (): void =>`

**Description:**

Registers (or overrides) `field_colour` with the ARIA wrapper.
Do not unregister first: `@blockly/field-colour` does not auto-register on
import, and Blockly warns when unregistering a missing entry.

---


## categories\blockly\field_colour_hsv_sliders.ts

### LocalizedFieldColourHsvSliders

**Fichier:** `categories\blockly\field_colour_hsv_sliders.ts` (ligne 119)

**Signature:** `export class LocalizedFieldColourHsvSliders extends FieldColourHsvSliders`

**Description:**

HSV sliders field with localized labels and screen-reader-friendly values.

---


## categories\blockly\field_colour_picker.ts

### FieldColorPicker

**Fichier:** `categories\blockly\field_colour_picker.ts` (ligne 146)

**Signature:** `export class FieldColorPicker extends Blockly.FieldTextInput`

**Description:**

Custom Blockly field that renders an iro.js color picker.

---


## categories\blockly\field_slider_accessible.ts

### AccessibleFieldSlider

**Fichier:** `categories\blockly\field_slider_accessible.ts` (ligne 44)

**Signature:** `export class AccessibleFieldSlider extends FieldSlider`

**Description:**

Number slider with accessible on-block type and editor ARIA attributes.

---

### registerAccessibleFieldSlider

**Fichier:** `categories\blockly\field_slider_accessible.ts` (ligne 92)

**Signature:** `export const registerAccessibleFieldSlider = (): void =>`

**Description:**

Registers (or overrides) `field_slider` with the ARIA wrapper.
Prefer override over unregister to avoid Blockly console warnings.

---


## categories\blockly\index.ts

### defineAllTypedVariableBlocks

**Fichier:** `categories\blockly\index.ts` (ligne 75)

**Signature:** `export const defineAllTypedVariableBlocks = (): void =>`

**Description:**

Registers all typed variable blocks and extensions (get/set/define/local and standard block extensions).

---

### defineBlocklyArduinoCompatBlocks

**Fichier:** `categories\blockly\index.ts` (ligne 61)

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

**Fichier:** `categories\blockly\math.ts` (ligne 61)

**Signature:** `export const defineMathCompatBlocks = (): void =>`

**Description:**

Registers math compatibility blocks for µcBlockly.

---


## categories\blockly\shared_numeric.ts

### areLoopBoundTypesCompatible

**Fichier:** `categories\blockly\shared_numeric.ts` (ligne 150)

**Signature:** `export const areLoopBoundTypesCompatible = (`

**Description:**

Returns true when two loop bound types can coexist (int/float may mix).

---

### inferChangeByRequiredType

**Fichier:** `categories\blockly\shared_numeric.ts` (ligne 326)

**Signature:** `export const inferChangeByRequiredType = (`

**Description:**

Infers int/float required by all math_change blocks using a variable.

---

### inferChangeByRequiredTypeFromBlock

**Fichier:** `categories\blockly\shared_numeric.ts` (ligne 313)

**Signature:** `export const inferChangeByRequiredTypeFromBlock = (`

**Description:**

Infers int/float required by a math_change block from its DELTA input.

---

### inferLoopCounterType

**Fichier:** `categories\blockly\shared_numeric.ts` (ligne 233)

**Signature:** `export const inferLoopCounterType = (`

**Description:**

Infers the loop-counter type implied by controls_for blocks using a variable.
@param workspace - Workspace containing the variable uses.
@param variableId - Target variable ID.
@returns int, float, or null when not used as a numeric loop counter.

---

### inferLoopCounterTypeFromForBlock

**Fichier:** `categories\blockly\shared_numeric.ts` (ligne 202)

**Signature:** `export const inferLoopCounterTypeFromForBlock = (`

**Description:**

Infers int/float for the counter variable of a controls_for block from its bounds.
@param forBlock - controls_for block instance.
@returns Counter type or null when bounds are not fully numeric.

---

### inferNumericInputType

**Fichier:** `categories\blockly\shared_numeric.ts` (ligne 118)

**Signature:** `export const inferNumericInputType = (block: Blockly.Block | null): string | null =>`

**Description:**

Infers the numeric type of a value block connected to a loop bound input.
@param block - Connected block or null.
@returns Normalized numeric type or null when unknown/non-numeric.

---

### inferRequiredNumericTypeForVariable

**Fichier:** `categories\blockly\shared_numeric.ts` (ligne 358)

**Signature:** `export const inferRequiredNumericTypeForVariable = (`

**Description:**

Aggregates int/float required by loop counters and change-by blocks for a variable.

---

### isBlockOnMainWorkspace

**Fichier:** `categories\blockly\shared_numeric.ts` (ligne 94)

**Signature:** `export const isBlockOnMainWorkspace = (block: Blockly.Block): boolean =>`

**Description:**

Returns true when the block lives on the main workspace (not flyout/toolbox).

---

### isLoopCounterVariableCompatible

**Fichier:** `categories\blockly\shared_numeric.ts` (ligne 192)

**Signature:** `export const isLoopCounterVariableCompatible = (`

**Description:**

Checks whether a variable type can serve as a loop counter of the given type.

---

### isMathChangeCompatibleVariableType

**Fichier:** `categories\blockly\shared_numeric.ts` (ligne 288)

**Signature:** `export const isMathChangeCompatibleVariableType = (`

**Description:**

Types accepted on math_change VAR: untyped or numeric scalars (not String/bool/…).

---

### isNumericScalarVariableType

**Fichier:** `categories\blockly\shared_numeric.ts` (ligne 272)

**Signature:** `export const isNumericScalarVariableType = (`

**Description:**

True when a type is a numeric scalar usable by math_change (int/float/long).

---

### isUnresolvedVariableType

**Fichier:** `categories\blockly\shared_numeric.ts` (ligne 261)

**Signature:** `export const isUnresolvedVariableType = (`

**Description:**

True when a variable type is missing / not yet resolved (allowed on math_change VAR).

---

### resolveMathChangeVariableId

**Fichier:** `categories\blockly\shared_numeric.ts` (ligne 296)

**Signature:** `export const resolveMathChangeVariableId = (block: Blockly.Block): string | null =>`

**Description:**

Resolves the variable ID targeted by a math_change block (field or connected getter).

---

### resolveMathNumberBlockType

**Fichier:** `categories\blockly\shared_numeric.ts` (ligne 106)

**Signature:** `export const resolveMathNumberBlockType = (block: Blockly.Block): "int" | "float" =>`

**Description:**

Resolves math_number typing: int by default until on main workspace,
then int/float from the NUM field via identifyMathNumberType.

---

### unifyLoopBoundTypes

**Fichier:** `categories\blockly\shared_numeric.ts` (ligne 165)

**Signature:** `export const unifyLoopBoundTypes = (`

**Description:**

Unifies loop bound types; any float bound promotes the counter to float.

---


## categories\blockly\shared.ts

### configureInstanceVariableField

**Fichier:** `categories\blockly\shared.ts` (ligne 328)

**Signature:** `export const configureInstanceVariableField = (`

**Description:**

Configures a FieldVariable for instance variables only (future blocks).

---

### configureListVariableField

**Fichier:** `categories\blockly\shared.ts` (ligne 316)

**Signature:** `export const configureListVariableField = (field: Blockly.FieldVariable): void =>`

**Description:**

Configures a FieldVariable for list/array variables only.

---

### configureScalarVariableField

**Fichier:** `categories\blockly\shared.ts` (ligne 304)

**Signature:** `export const configureScalarVariableField = (field: Blockly.FieldVariable): void =>`

**Description:**

Configures a FieldVariable for scalar variables (excludes list/array variables).
@param field - FieldVariable instance to configure.

---

### getArrayIndexBlocklyChecks

**Fichier:** `categories\blockly\shared.ts` (ligne 298)

**Signature:** `export const getArrayIndexBlocklyChecks = (): string[] => ["int", "Number"];`

**Description:**

Checks Blockly pour les entrées d'index de tableau (entiers uniquement).

---

### getArrayListUntypedWarningText

**Fichier:** `categories\blockly\shared.ts` (ligne 129)

**Signature:** `export const getArrayListUntypedWarningText = (): string =>`

**Description:**

Warning when a list block has no connected element values yet.

---

### getBlocklyCompatibleChecks

**Fichier:** `categories\blockly\shared.ts` (ligne 213)

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

**Fichier:** `categories\blockly\shared.ts` (ligne 93)

**Signature:** `export const getBlocklyMsg = (key: string): string =>`

**Description:**

Retrieves a Blockly message by key.
@param key - Message key to look up.
@returns The localized message or the key if missing.

---

### getBlocklyMsgOr

**Fichier:** `categories\blockly\shared.ts` (ligne 104)

**Signature:** `export const getBlocklyMsgOr = (key: string, fallback: string): string =>`

**Description:**

Retrieves a Blockly message or returns a fallback.
@param key - Message key to look up.
@param fallback - Fallback text when the key is missing.
@returns The localized message or the fallback value.

---

### getConstWarningText

**Fichier:** `categories\blockly\shared.ts` (ligne 159)

**Signature:** `export const getConstWarningText = (): string =>`

**Description:**

Returns the warning text for const assignments.

---

### getDeclareContenuBlocklyChecks

**Fichier:** `categories\blockly\shared.ts` (ligne 279)

**Signature:** `export const getDeclareContenuBlocklyChecks = (`

**Description:**

Checks Blockly pour l'entrée contenu d'Array_declare (size ou contains).
Le filtrage sémantique int/float/etc. est complété par StrictConnectionChecker.

---

### getDeclareElementBlocklyChecks

**Fichier:** `categories\blockly\shared.ts` (ligne 293)

**Signature:** `export const getDeclareElementBlocklyChecks = (internalType: string): string[] =>`

**Description:**

Checks Blockly pour les éléments d'un littéral de liste ou de Array_with.

---

### getDuplicateListDeclarationWarningText

**Fichier:** `categories\blockly\shared.ts` (ligne 139)

**Signature:** `export const getDuplicateListDeclarationWarningText = (): string =>`

**Description:**

Warning when several list declaration blocks share the same variable.
Same conflict idea as VARIABLES_CONST_WARNING for const ownership.

---

### getListVariableOutputCheck

**Fichier:** `categories\blockly\shared.ts` (ligne 359)

**Signature:** `export const getListVariableOutputCheck = (): string => "__NO_TYPE__";`

**Description:**

Output check for variables_get when VAR is Blockly-only (`list`), not an Arduino type.

---

### getProcedureDefArgumentType

**Fichier:** `categories\blockly\shared.ts` (ligne 450)

**Signature:** `export const getProcedureDefArgumentType = (`

**Description:**

Declared type of a procedure definition argument (reads `${argId}_TYPE` on procedures_def*).

---

### getProcedureParameterDeclaredType

**Fichier:** `categories\blockly\shared.ts` (ligne 402)

**Signature:** `export const getProcedureParameterDeclaredType = (`

**Description:**

Returns the type declared on a procedure parameter (menu on procedures_def*), if any.
@param contextBlock - When set, only matches if this block lies inside that procedure.

---

### getTypeMismatchWarningText

**Fichier:** `categories\blockly\shared.ts` (ligne 151)

**Signature:** `export const getTypeMismatchWarningText = (varType: string, connectedType: string): string =>`

**Description:**

Builds the warning text for type mismatches.
@param varType - Variable's declared type.
@param connectedType - Type inferred from the connected block.
@returns Localized mismatch warning message.

---

### getUntypedWarningText

**Fichier:** `categories\blockly\shared.ts` (ligne 124)

**Signature:** `export const getUntypedWarningText = (): string => getBlocklyMsg("TYPED_VAR_UNTYPED_WARNING");`

**Description:**

Returns the warning text for untyped variables.

---

### handleBoardIntInputBlockChange

**Fichier:** `categories\blockly\shared.ts` (ligne 601)

**Signature:** `export const handleBoardIntInputBlockChange = (`

**Description:**

Enforces integer-only values on board block inputs (PWM, map, tone frequency).

---

### handleVariablesSetChange

**Fichier:** `categories\blockly\shared.ts` (ligne 1109)

**Signature:** `export const handleVariablesSetChange = (`

**Description:**

Handles variable assignment changes to enforce typing rules.
@param block - Variable set block.
@param event - Blockly change event.
@param label - Block label for warnings.

---

### hasConnectedAssignmentForVariable

**Fichier:** `categories\blockly\shared.ts` (ligne 1030)

**Signature:** `export const hasConnectedAssignmentForVariable = (`

**Description:**

Checks whether a variable has any connected assignment blocks.
Uses getVariableUsesById to avoid iterating all blocks.
@param workspace - Workspace to search.
@param variableId - Target variable ID.
@returns True when at least one assignment has a connected value.

---

### hasRealGlobalVariableUse

**Fichier:** `categories\blockly\shared.ts` (ligne 713)

**Signature:** `export const hasRealGlobalVariableUse = (`

**Description:**

True when the variable is genuinely read/written in setup, loop, or global scope.

---

### inferConnectedValueType

**Fichier:** `categories\blockly\shared.ts` (ligne 992)

**Signature:** `export const inferConnectedValueType = (block: Blockly.Block | null): string | null =>`

**Description:**

Infers a block's output type from its definition or connection.
@param block - Connected block or null.
@returns Normalized type or null when unknown.

---

### inferLocalAssignmentValueType

**Fichier:** `categories\blockly\shared.ts` (ligne 773)

**Signature:** `export const inferLocalAssignmentValueType = (`

**Description:**

Infers the value type inside a `variables_local` wrapper (or null).

---

### inferProcedureCallArgSourceType

**Fichier:** `categories\blockly\shared.ts` (ligne 473)

**Signature:** `export const inferProcedureCallArgSourceType = (`

**Description:**

Infers the source type of a value plugged into a procedure call argument.

---

### isGlobalVariableAssignment

**Fichier:** `categories\blockly\shared.ts` (ligne 765)

**Signature:** `export const isGlobalVariableAssignment = (block: Blockly.Block): boolean =>`

**Description:**

True when a set block assigns a global variable (no `local` wrapper).

---

### isProcedureParameterBindingUse

**Fichier:** `categories\blockly\shared.ts` (ligne 687)

**Signature:** `export const isProcedureParameterBindingUse = (`

**Description:**

Procedure def header / call shell: binds a parameter name without a global read/write.

---

### isVariableProcedureParameter

**Fichier:** `categories\blockly\shared.ts` (ligne 660)

**Signature:** `export const isVariableProcedureParameter = (`

**Description:**

True when the variable is declared as a parameter on any procedure definition.

---

### isVariableUsedOutsideProcedureBodies

**Fichier:** `categories\blockly\shared.ts` (ligne 654)

**Signature:** `export const isVariableUsedOutsideProcedureBodies = (`

**Description:**

True when the variable appears in setup, loop, or global scope (not only as a procedure parameter).

---

### isVariableUseOutsideProcedureBody

**Fichier:** `categories\blockly\shared.ts` (ligne 649)

**Signature:** `export const isVariableUseOutsideProcedureBody = (block: Blockly.Block): boolean =>`

**Description:**

True when the block is in setup/loop/global scope (not inside a procedure body).

---

### normalizeBlocklyTypeToVariableType

**Fichier:** `categories\blockly\shared.ts` (ligne 366)

**Signature:** `export const normalizeBlocklyTypeToVariableType = (type: string): string =>`

**Description:**

Normalizes Blockly check types to µcBlockly variable types.
@param type - Blockly check type string.
@returns Normalized µcBlockly variable type.

---

### resolveGlobalVariableType

**Fichier:** `categories\blockly\shared.ts` (ligne 868)

**Signature:** `export const resolveGlobalVariableType = (`

**Description:**

Resolves global variable type from global assignments only (ignores `local` wrappers).

---

### resolveVariableTypeForBlock

**Fichier:** `categories\blockly\shared.ts` (ligne 821)

**Signature:** `export const resolveVariableTypeForBlock = (`

**Description:**

Resolves the effective type of a variable for a specific block (scope-aware).

---

### revalidateBoardIntInputBlocks

**Fichier:** `categories\blockly\shared.ts` (ligne 637)

**Signature:** `export const revalidateBoardIntInputBlocks = (`

**Description:**

Revalidates integer-only inputs on board blocks after workspace changes.

---

### revalidateLocalWrapperBlocks

**Fichier:** `categories\blockly\shared.ts` (ligne 1067)

**Signature:** `export const revalidateLocalWrapperBlocks = (`

**Description:**

Re-runs onchange on `variables_local` wrappers so their output type tracks inner values.

---

### revalidateProcedureCallBlocks

**Fichier:** `categories\blockly\shared.ts` (ligne 543)

**Signature:** `export const revalidateProcedureCallBlocks = (`

**Description:**

Disconnects incompatible values on procedure call blocks and refreshes ARG input checks.

---

### revalidateTypedNumericBlocks

**Fichier:** `categories\blockly\shared.ts` (ligne 1086)

**Signature:** `export const revalidateTypedNumericBlocks = (`

**Description:**

Re-runs onchange handlers for blocks whose variable typing depends on child values
(e.g. math_change when a math_number field is edited).

---

### revalidateVariableBlocksForId

**Fichier:** `categories\blockly\shared.ts` (ligne 892)

**Signature:** `export const revalidateVariableBlocksForId = (`

**Description:**

Re-runs onchange on variable get/set blocks referencing a variable.

---

### setVariableTypeAndMarkManual

**Fichier:** `categories\blockly\shared.ts` (ligne 167)

**Signature:** `export const setVariableTypeAndMarkManual = (`

**Description:**

Sets a variable's type and marks it as manually chosen (e.g. via dropdown).
@param variable - Variable model to update.
@param type - New type string.

---

### shouldOmitGlobalVariableDeclaration

**Fichier:** `categories\blockly\shared.ts` (ligne 734)

**Signature:** `export const shouldOmitGlobalVariableDeclaration = (`

**Description:**

Returns true when a workspace variable must not receive a global declaration.
Procedure parameters are omitted unless they are also used as real globals.

---

### shouldSkipVariableChange

**Fichier:** `categories\blockly\shared.ts` (ligne 919)

**Signature:** `export const shouldSkipVariableChange = (`

**Description:**

Determines whether a variable change event should be ignored.

---

### syncListVariableFromField

**Fichier:** `categories\blockly\shared.ts` (ligne 342)

**Signature:** `export const syncListVariableFromField = (`

**Description:**

Ensures the variable selected on a list-category block has Blockly type `list`.

---

### syncNumericVariableType

**Fichier:** `categories\blockly\shared.ts` (ligne 180)

**Signature:** `export const syncNumericVariableType = (`

**Description:**

Aligns a numeric variable with the type required by loops and change-by blocks.
Promotes int ↔ float according to aggregated usage; never overrides manual types.

---

### syncProcedureCallArgInputChecks

**Fichier:** `categories\blockly\shared.ts` (ligne 488)

**Signature:** `export const syncProcedureCallArgInputChecks = (callBlock: Blockly.Block): void =>`

**Description:**

Applies setCheck on each ARG input from the procedure definition parameter types.

---

### validateSingleChar

**Fichier:** `categories\blockly\shared.ts` (ligne 114)

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

**Fichier:** `categories\blockly\variables.ts` (ligne 101)

**Signature:** `export const createArduinoScalarTypeField = (`

**Description:**

Arduino scalar type dropdown; maps invalid values (e.g. `list`) to `int` on load.

---

### defineVariablesCastBlock

**Fichier:** `categories\blockly\variables.ts` (ligne 241)

**Signature:** `export const defineVariablesCastBlock = (): void =>`

**Description:**

Value block: cast a connected expression, e.g. (byte)(toto) when a get block is plugged in.

---

### defineVariablesConstBlock

**Fichier:** `categories\blockly\variables.ts` (ligne 468)

**Signature:** `export const defineVariablesConstBlock = (): void =>`

**Description:**

Registers the const declaration block.

---

### defineVariablesDefineBlock

**Fichier:** `categories\blockly\variables.ts` (ligne 651)

**Signature:** `export const defineVariablesDefineBlock = (): void =>`

**Description:**

Registers the variable definition block used by s4e compatibility.

---

### defineVariablesGetDynamicBlock

**Fichier:** `categories\blockly\variables.ts` (ligne 124)

**Signature:** `export const defineVariablesGetDynamicBlock = (): void =>`

**Description:**

Registers the dynamic variables_get block with typing support.

---

### defineVariablesLocalBlock

**Fichier:** `categories\blockly\variables.ts` (ligne 288)

**Signature:** `export const defineVariablesLocalBlock = (): void =>`

**Description:**

Registers the "local" wrapper block for scoped variables.

---

### defineVariablesSetDynamicBlock

**Fichier:** `categories\blockly\variables.ts` (ligne 200)

**Signature:** `export const defineVariablesSetDynamicBlock = (): void =>`

**Description:**

Registers the dynamic variables_set block with typing support.

---

### defineVariablesSetInitBlock

**Fichier:** `categories\blockly\variables.ts` (ligne 560)

**Signature:** `export const defineVariablesSetInitBlock = (): void =>`

**Description:**

Registers the typed variable initialization block.

---

### defineVariablesSetTypeBlock

**Fichier:** `categories\blockly\variables.ts` (ligne 347)

**Signature:** `export const defineVariablesSetTypeBlock = (): void =>`

**Description:**

Registers the block that forces a variable type.

---

### extendStandardVariablesGetBlock

**Fichier:** `categories\blockly\variables.ts` (ligne 738)

**Signature:** `export const extendStandardVariablesGetBlock = (): void =>`

**Description:**

Extends the standard variables_get block with typed behavior.

---

### extendStandardVariablesSetBlock

**Fichier:** `categories\blockly\variables.ts` (ligne 813)

**Signature:** `export const extendStandardVariablesSetBlock = (): void =>`

**Description:**

Extends the standard variables_set block with typed behavior.

---

### getArduinoTypeDropdownOptions

**Fichier:** `categories\blockly\variables.ts` (ligne 73)

**Signature:** `export const getArduinoTypeDropdownOptions = (): Blockly.MenuOption[] =>`

**Description:**

Shared Blockly menu options for every Arduino type dropdown
(variables_set_init, variables_set_type, variables_cast, procedures, lists).

---

### getArduinoTypeLabel

**Fichier:** `categories\blockly\variables.ts` (ligne 66)

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

Like {@link ContinuousMetrics}, but the flyout does not shrink the workspace area: it
overlays it (behaviour close to the classic category toolbox).

---


## core\create_ucblockly.ts

### createUcBlockly

**Fichier:** `core\create_ucblockly.ts` (ligne 102)

**Signature:** `export function createUcBlockly(`

**Description:**

Creates a µcBlockly editor inside `container` without requiring demo shell DOM ids.
@param container - Host element; a child div is created for Blockly injection unless
  `options.injectionTarget` is set.
@param options - Toolbox, language, theme, and optional callbacks.
@returns API handle with workspace, code generation, and serialization.

---


## core\default_options.ts

### resolveEnforcerOptions

**Fichier:** `core\default_options.ts` (ligne 65)

**Signature:** `export function resolveEnforcerOptions(`

**Description:**

Merges partial enforcer options with {@link DEFAULT_UCBLOCKLY_ENFORCERS}.

---

### resolvePluginOptions

**Fichier:** `core\default_options.ts` (ligne 58)

**Signature:** `export function resolvePluginOptions(`

**Description:**

Merges partial plugin options with {@link DEFAULT_UCBLOCKLY_PLUGINS}.

---


## core\locale.ts

### applyUcBlocklyLocale

**Fichier:** `core\locale.ts` (ligne 57)

**Signature:** `export function applyUcBlocklyLocale(language: string): void`

**Description:**

Applies Blockly locale and µcBlockly custom messages.
@param language - ISO 639 language code (e.g. `fr`, `en`).

---

### mergeCustomBlocklyMessages

**Fichier:** `core\locale.ts` (ligne 39)

**Signature:** `export function mergeCustomBlocklyMessages(language: string, keys: readonly string[]): void`

**Description:**

Copies selected µcBlockly message keys into `Blockly.Msg`.

---


## core\register.ts

### registerUcBlocklyKernel

**Fichier:** `core\register.ts` (ligne 57)

**Signature:** `export function registerUcBlocklyKernel(`

**Description:**

Registers block definitions, types, and standard-block configuration.
Safe to call multiple times (subsequent calls are no-ops).

---

### resetUcBlocklyKernelRegistrationForTests

**Fichier:** `core\register.ts` (ligne 89)

**Signature:** `export function resetUcBlocklyKernelRegistrationForTests(): void`

**Description:**

@internal Test helper — allows re-running registration in unit tests.

---


## core\sound_toggle_control.ts

### SoundToggleControl

**Fichier:** `core\sound_toggle_control.ts` (ligne 71)

**Signature:** `export class SoundToggleControl`

**Description:**

Bottom-right speaker button that toggles Blockly workspace audio.

---


## core\ucblockly_plugins.ts

### UcBlocklyPluginHost

**Fichier:** `core\ucblockly_plugins.ts` (ligne 110)

**Signature:** `export class UcBlocklyPluginHost`

**Description:**

Manages optional Blockly workspace plugins from {@link UcBlocklyPluginOptions}.

---


## core\ucblockly_workspace_manager.ts

### UcBlocklyWorkspaceManager

**Fichier:** `core\ucblockly_workspace_manager.ts` (ligne 63)

**Signature:** `export class UcBlocklyWorkspaceManager`

**Description:**

Owns Blockly workspace injection, plugins, variables, and serialization.
Demo UI (menus, Monaco, URL) stays in {@link BlocklyApplication} (`src/demo/`).

---


## core\workspace_state.ts

### sanitizeSerializedWorkspaceState

**Fichier:** `core\workspace_state.ts` (ligne 34)

**Signature:** `export function sanitizeSerializedWorkspaceState(state: unknown): void`

**Description:**

Coerces invalid block coordinates before save/load.

---


## demo\blockly_application_shell.ts

### BlocklyApplication

**Fichier:** `demo\blockly_application_shell.ts` (ligne 119)

**Signature:** `export class BlocklyApplication implements BlocklyApplicationType`

**Description:**

Full µcBlockly demo: menus, Monaco, session storage.
Workspace logic lives in {@link UcBlocklyWorkspaceManager}.

---


## generators\arduino\arduino_generator.ts

### ArduinoGenerator

**Fichier:** `generators\arduino\arduino_generator.ts` (ligne 97)

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

**Fichier:** `generators\arduino\block_types_registry.ts` (ligne 634)

**Signature:** `export function applyBlockTypesFromRegistry(): void`

**Description:**

Applies registered block type metadata to Blockly blocks.

---

### checkTypeCompatibility

**Fichier:** `generators\arduino\block_types_registry.ts` (ligne 561)

**Signature:** `export function checkTypeCompatibility(`

**Description:**

Checks whether two types are compatible for connection.
@param sourceType - Source type from the connected block.
@param targetType - Target expected type.
@returns True when compatible.

---

### findAllListDeclarationBlocks

**Fichier:** `generators\arduino\block_types_registry.ts` (ligne 231)

**Signature:** `export function findAllListDeclarationBlocks(`

**Description:**

All list declaration blocks that reference a given variable id (workspace order).

---

### findListDeclarationBlock

**Fichier:** `generators\arduino\block_types_registry.ts` (ligne 251)

**Signature:** `export function findListDeclarationBlock(`

**Description:**

Finds the list declaration block for a workspace variable id.
Prefers the ownership claim (`__ucbDeclareBlockId`); otherwise first block.

---

### getCompatibleTypesForCheck

**Fichier:** `generators\arduino\block_types_registry.ts` (ligne 533)

**Signature:** `export function getCompatibleTypesForCheck(type: string | null | undefined): string[] | null`

**Description:**

Returns Blockly check types compatible with a given µcBlockly type.
@param type - Normalized type string.
@returns Array of checks or null when unavailable.

---

### hasArrayListConnectedElements

**Fichier:** `generators\arduino\block_types_registry.ts` (ligne 217)

**Signature:** `export function hasArrayListConnectedElements(block: Blockly.Block): boolean`

**Description:**

True when at least one ADD input has a connected value block.

---

### hasDuplicateListDeclaration

**Fichier:** `generators\arduino\block_types_registry.ts` (ligne 298)

**Signature:** `export function hasDuplicateListDeclaration(block: Blockly.Block): boolean`

**Description:**

True when another list declaration block already owns the same variable.

---

### identifyMathNumberType

**Fichier:** `generators\arduino\block_types_registry.ts` (ligne 109)

**Signature:** `export function identifyMathNumberType(`

**Description:**

Infers int/float from a math_number field value.

---

### inferArrayElementTypeFromBlock

**Fichier:** `generators\arduino\block_types_registry.ts` (ligne 203)

**Signature:** `export function inferArrayElementTypeFromBlock(block: Blockly.Block): string`

**Description:**

Infers the element type of an Array_with block from all connected inputs.
Numeric types unify (int + float → float); float literals promote to float.

---

### inferArrayElementTypeFromInputs

**Fichier:** `generators\arduino\block_types_registry.ts` (ligne 150)

**Signature:** `export function inferArrayElementTypeFromInputs(`

**Description:**

Infers element type from named value inputs (e.g. Array_declare contenu/contenu2).
Numeric types unify (int + float → float); float literals promote to float.

---

### inferArrayGetIndexElementType

**Fichier:** `generators\arduino\block_types_registry.ts` (ligne 333)

**Signature:** `export function inferArrayGetIndexElementType(block: Blockly.Block): string`

**Description:** *Aucune documentation*

---

### inferListVariableElementType

**Fichier:** `generators\arduino\block_types_registry.ts` (ligne 309)

**Signature:** `export function inferListVariableElementType(`

**Description:**

Element type (int, char, …) of a list variable from its declaration block.

---

### isPrimaryListDeclarationBlock

**Fichier:** `generators\arduino\block_types_registry.ts` (ligne 275)

**Signature:** `export function isPrimaryListDeclarationBlock(block: Blockly.Block): boolean`

**Description:**

True when this block owns the exclusive list declaration (const-like).
Falls back to workspace order when ownership is not yet claimed.

---

### registerVariableTypeForBlockResolver

**Fichier:** `generators\arduino\block_types_registry.ts` (ligne 61)

**Signature:** `export function registerVariableTypeForBlockResolver(`

**Description:**

Wires the variable type resolver once category shared helpers have loaded.
Safe to call multiple times (last registration wins).

---


## generators\arduino\block_types.ts

### getArduinoTypeLabelKey

**Fichier:** `generators\arduino\block_types.ts` (ligne 119)

**Signature:** `export function getArduinoTypeLabelKey(typeKey: string): string`

**Description:**

Blockly.Msg key for a type dropdown label (e.g. `byte` → `VAR_CAST_TYPE_BYTE`).

---

### getCompatibleTypes

**Fichier:** `generators\arduino\block_types.ts` (ligne 227)

**Signature:** `export function getCompatibleTypes(targetType: string | null | undefined): string[]`

**Description:**

Returns compatible types for a target type.
@param targetType - Target type to match.
@returns List of compatible types (includes the target type).

---

### getCppTypeName

**Fichier:** `generators\arduino\block_types.ts` (ligne 161)

**Signature:** `export function getCppTypeName(typeKey: string): string`

**Description:**

C++ type name emitted in generated Arduino code.

---

### getInternalTypeForArduinoType

**Fichier:** `generators\arduino\block_types.ts` (ligne 126)

**Signature:** `export function getInternalTypeForArduinoType(typeKey: string): string`

**Description:**

Internal µcBlockly type for connection checking.

---

### getVariableTypeOptions

**Fichier:** `generators\arduino\block_types.ts` (ligne 200)

**Signature:** `export function getVariableTypeOptions(): string[]`

**Description:**

Returns the ordered list of Arduino types for Blockly dropdown menus.

---

### isArduinoScalarType

**Fichier:** `generators\arduino\block_types.ts` (ligne 205)

**Signature:** `export function isArduinoScalarType(type: string | null | undefined): type is ArduinoTypeKey`

**Description:**

True when the type can appear in Arduino scalar type dropdowns (excludes `list`).

---

### isArrayElementTypeCompatible

**Fichier:** `generators\arduino\block_types.ts` (ligne 181)

**Signature:** `export function isArrayElementTypeCompatible(`

**Description:**

Compatibilité stricte pour les entrées des blocs liste (sans char ↔ string).

---

### isDeclareContainsTypeCompatible

**Fichier:** `generators\arduino\block_types.ts` (ligne 170)

**Signature:** `export function isDeclareContainsTypeCompatible(`

**Description:**

Vérifie qu'une valeur connectée en mode « contains » correspond au type du menu Array_declare.
@param sourceInternalType - Type interne µcBlockly du bloc source (int, float, bool, …).
@param arduinoTypeField - Clé du menu déroulant (int, float, uint, string, …).

---

### isTypeCompatible

**Fichier:** `generators\arduino\block_types.ts` (ligne 241)

**Signature:** `export function isTypeCompatible(sourceType: string | null | undefined, targetType: string | null | undefined): boolean`

**Description:**

Checks if a source type can connect to a target type.
@param sourceType - Source type from a connected block.
@param targetType - Target expected type.
@returns True when compatible.

---

### normalizeBlocklyCheckToInternalType

**Fichier:** `generators\arduino\block_types.ts` (ligne 137)

**Signature:** `export function normalizeBlocklyCheckToInternalType(`

**Description:**

Maps Blockly output/check types to internal µcBlockly types.
Colour blocks use Blockly check `Colour` but variables and arrays use `string`.

---

### resolveArduinoScalarVariableType

**Fichier:** `generators\arduino\block_types.ts` (ligne 213)

**Signature:** `export function resolveArduinoScalarVariableType(`

**Description:**

Returns an Arduino scalar type for Blockly UI / generators, or null (= {@link __NO_TYPE__}).
Blockly-only types such as `list` are not Arduino types.

---


## generators\arduino\blocks\array.ts

### Array_bitmap

**Fichier:** `generators\arduino\blocks\array.ts` (ligne 651)

**Signature:** `export const Array_bitmap = function (`

**Description:**

Array_bitmap - global 2D byte array from FieldBitmap (rows x cols of 0/1).

---

### Array_bitmap_get

**Fichier:** `generators\arduino\blocks\array.ts` (ligne 681)

**Signature:** `export const Array_bitmap_get = function (`

**Description:**

Array_bitmap_get - value: 2D 0/1 initializer from FieldBitmap.

---

### Array_create

**Fichier:** `generators\arduino\blocks\array.ts` (ligne 495)

**Signature:** `export const Array_create = function (`

**Description:**

Array_create - int arr[size]; or int arr[] = \{...\}; (1D-5D with FieldVariable)

---

### Array_declare

**Fichier:** `generators\arduino\blocks\array.ts` (ligne 428)

**Signature:** `export const Array_declare = function (`

**Description:**

Array_declare - int arr[size]; or int arr[] = \{...\};

---

### Array_fix

**Fichier:** `generators\arduino\blocks\array.ts` (ligne 564)

**Signature:** `export const Array_fix = function (`

**Description:**

Array_fix - arr[i] = value; or arr[i][j] = value;

---

### Array_getIndex_in_array

**Fichier:** `generators\arduino\blocks\array.ts` (ligne 582)

**Signature:** `export const Array_getIndex_in_array = function (`

**Description:**

Array_getIndex_in_array - arr[i] or arr[i][j]

---

### Array_getIndex_in_list

**Fichier:** `generators\arduino\blocks\array.ts` (ligne 205)

**Signature:** `export const Array_getIndex_in_list = function (`

**Description:**

Array_getIndex_in_list - list[index] (index 0-based, comme en C/Arduino)

---

### Array_list_literal

**Fichier:** `generators\arduino\blocks\array.ts` (ligne 144)

**Signature:** `export const Array_list_literal = function (`

**Description:**

Array_list_literal - list literal value for Array_declare / Array_create.

---

### Array_modify

**Fichier:** `generators\arduino\blocks\array.ts` (ligne 218)

**Signature:** `export const Array_modify = function (`

**Description:**

Array_modify - listVar[indice] = value;

---

### Array_set

**Fichier:** `generators\arduino\blocks\array.ts` (ligne 231)

**Signature:** `export const Array_set = function (`

**Description:**

Array_set - whole-list assignment: set list to [bitmap | list literal | text init].

---

### Array_with

**Fichier:** `generators\arduino\blocks\array.ts` (ligne 163)

**Signature:** `export const Array_with = function (`

**Description:**

Array_with - define [variable] as global list (declaration before setup()).

---


## generators\arduino\blocks\board.ts

### board_base_inout_analog_read

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 125)

**Signature:** `export function board_base_inout_analog_read(block: Block, _generator: ArduinoGenerator): [string, Order]`

**Description:** *Aucune documentation*

---

### board_base_inout_analog_write

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 113)

**Signature:** `export function board_base_inout_analog_write(block: Block, generator: ArduinoGenerator): string`

**Description:** *Aucune documentation*

---

### board_base_inout_analog_write_slider

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 119)

**Signature:** `export function board_base_inout_analog_write_slider(block: Block, _generator: ArduinoGenerator): string`

**Description:** *Aucune documentation*

---

### board_base_inout_buildin_led

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 64)

**Signature:** `export function board_base_inout_buildin_led(block: Block, generator: ArduinoGenerator): string`

**Description:** *Aucune documentation*

---

### board_base_inout_digital_read

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 77)

**Signature:** `export function board_base_inout_digital_read(block: Block, generator: ArduinoGenerator): [string, Order]`

**Description:** *Aucune documentation*

---

### board_base_inout_digital_read_board

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 99)

**Signature:** `export function board_base_inout_digital_read_board(`

**Description:** *Aucune documentation*

---

### board_base_inout_digital_read_grid

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 92)

**Signature:** `export function board_base_inout_digital_read_grid(`

**Description:** *Aucune documentation*

---

### board_base_inout_digital_read_pin

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 83)

**Signature:** `export function board_base_inout_digital_read_pin(`

**Description:** *Aucune documentation*

---

### board_base_inout_digital_write

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 70)

**Signature:** `export function board_base_inout_digital_write(block: Block, generator: ArduinoGenerator): string`

**Description:** *Aucune documentation*

---

### board_base_inout_highlow

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 108)

**Signature:** `export function board_base_inout_highlow(block: Block, _generator: ArduinoGenerator): [string, Order]`

**Description:** *Aucune documentation*

---

### board_base_inout_map

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 163)

**Signature:** `export function board_base_inout_map(block: Block, generator: ArduinoGenerator): [string, Order]`

**Description:** *Aucune documentation*

---

### board_base_inout_notone

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 177)

**Signature:** `export function board_base_inout_notone(block: Block, generator: ArduinoGenerator): string`

**Description:** *Aucune documentation*

---

### board_base_inout_pin_mode

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 157)

**Signature:** `export function board_base_inout_pin_mode(block: Block, _generator: ArduinoGenerator): string`

**Description:** *Aucune documentation*

---

### board_base_inout_pulsein

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 144)

**Signature:** `export function board_base_inout_pulsein(block: Block, _generator: ArduinoGenerator): [string, Order]`

**Description:** *Aucune documentation*

---

### board_base_inout_pulsein_timeout

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 150)

**Signature:** `export function board_base_inout_pulsein_timeout(block: Block, generator: ArduinoGenerator): [string, Order]`

**Description:** *Aucune documentation*

---

### board_base_inout_tone

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 170)

**Signature:** `export function board_base_inout_tone(block: Block, generator: ArduinoGenerator): string`

**Description:** *Aucune documentation*

---

### board_base_loop

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 56)

**Signature:** `export function board_base_loop(block: Block, generator: ArduinoGenerator): string`

**Description:** *Aucune documentation*

---

### board_base_setup

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 37)

**Signature:** `export function board_base_setup(block: Block, generator: ArduinoGenerator): string`

**Description:**

@license
Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
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

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 45)

**Signature:** `export function board_base_setup_loop(block: Block, generator: ArduinoGenerator): string`

**Description:** *Aucune documentation*

---

### board_base_time_delay

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 130)

**Signature:** `export function board_base_time_delay(block: Block, generator: ArduinoGenerator): string`

**Description:** *Aucune documentation*

---

### board_base_time_delay_sec

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 139)

**Signature:** `export function board_base_time_delay_sec(block: Block, generator: ArduinoGenerator): string`

**Description:** *Aucune documentation*

---

### board_base_time_millis

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 135)

**Signature:** `export function board_base_time_millis(_block: Block, _generator: ArduinoGenerator): [string, Order]`

**Description:** *Aucune documentation*

---

### board_conversion_constrain

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 269)

**Signature:** `export function board_conversion_constrain(block: Block, generator: ArduinoGenerator): [string, Order]`

**Description:** *Aucune documentation*

---

### board_conversion_tobyte

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 259)

**Signature:** `export function board_conversion_tobyte(block: Block, generator: ArduinoGenerator): [string, Order]`

**Description:** *Aucune documentation*

---

### board_conversion_tochar

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 254)

**Signature:** `export function board_conversion_tochar(block: Block, generator: ArduinoGenerator): [string, Order]`

**Description:** *Aucune documentation*

---

### board_conversion_tofloat

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 249)

**Signature:** `export function board_conversion_tofloat(block: Block, generator: ArduinoGenerator): [string, Order]`

**Description:** *Aucune documentation*

---

### board_conversion_toint

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 244)

**Signature:** `export function board_conversion_toint(block: Block, generator: ArduinoGenerator): [string, Order]`

**Description:** *Aucune documentation*

---

### board_conversion_toString

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 264)

**Signature:** `export function board_conversion_toString(block: Block, generator: ArduinoGenerator): [string, Order]`

**Description:** *Aucune documentation*

---

### board_serial_available

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 213)

**Signature:** `export function board_serial_available(_block: Block, _generator: ArduinoGenerator): [string, Order]`

**Description:** *Aucune documentation*

---

### board_serial_begin

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 183)

**Signature:** `export function board_serial_begin(block: Block, generator: ArduinoGenerator): string`

**Description:** *Aucune documentation*

---

### board_serial_flush

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 205)

**Signature:** `export function board_serial_flush(_block: Block, _generator: ArduinoGenerator): string`

**Description:** *Aucune documentation*

---

### board_serial_parseFloat

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 239)

**Signature:** `export function board_serial_parseFloat(_block: Block, _generator: ArduinoGenerator): [string, Order]`

**Description:** *Aucune documentation*

---

### board_serial_parseInt

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 235)

**Signature:** `export function board_serial_parseInt(_block: Block, _generator: ArduinoGenerator): [string, Order]`

**Description:** *Aucune documentation*

---

### board_serial_peek

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 222)

**Signature:** `export function board_serial_peek(_block: Block, _generator: ArduinoGenerator): [string, Order]`

**Description:** *Aucune documentation*

---

### board_serial_print

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 189)

**Signature:** `export function board_serial_print(block: Block, generator: ArduinoGenerator): string`

**Description:** *Aucune documentation*

---

### board_serial_printfor

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 199)

**Signature:** `export function board_serial_printfor(block: Block, generator: ArduinoGenerator): string`

**Description:** *Aucune documentation*

---

### board_serial_println

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 194)

**Signature:** `export function board_serial_println(block: Block, generator: ArduinoGenerator): string`

**Description:** *Aucune documentation*

---

### board_serial_read

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 209)

**Signature:** `export function board_serial_read(_block: Block, _generator: ArduinoGenerator): [string, Order]`

**Description:** *Aucune documentation*

---

### board_serial_readString

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 226)

**Signature:** `export function board_serial_readString(_block: Block, _generator: ArduinoGenerator): [string, Order]`

**Description:** *Aucune documentation*

---

### board_serial_readStringUntil

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 230)

**Signature:** `export function board_serial_readStringUntil(block: Block, generator: ArduinoGenerator): [string, Order]`

**Description:** *Aucune documentation*

---

### board_serial_write

**Fichier:** `generators\arduino\blocks\board.ts` (ligne 217)

**Signature:** `export function board_serial_write(block: Block, generator: ArduinoGenerator): string`

**Description:** *Aucune documentation*

---


## generators\arduino\blocks\colour.ts

### color_picker_custom

**Fichier:** `generators\arduino\blocks\colour.ts` (ligne 77)

**Signature:** `export function color_picker_custom(block: Block): [string, Order]`

**Description:**

Generates Arduino code for the custom colour picker value.
@param block - Blockly block instance.
@returns Code string with order.

---

### color_picker_hsv

**Fichier:** `generators\arduino\blocks\colour.ts` (ligne 90)

**Signature:** `export function color_picker_hsv(block: Block): [string, Order]`

**Description:**

Generates Arduino code for the HSV picker value.
@param block - Blockly block instance.
@returns Code string with order.

---

### colour_blend

**Fichier:** `generators\arduino\blocks\colour.ts` (ligne 156)

**Signature:** `export function colour_blend(`

**Description:**

Generates Arduino code for blending two colours.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### colour_picker

**Fichier:** `generators\arduino\blocks\colour.ts` (ligne 67)

**Signature:** `export function colour_picker(block: Block): [string, Order]`

**Description:**

Generates Arduino code for a colour picker value.
@param block - Blockly block instance.
@returns Code string with order.

---

### colour_random

**Fichier:** `generators\arduino\blocks\colour.ts` (ligne 100)

**Signature:** `export function colour_random(`

**Description:**

Generates Arduino code for a random colour.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### colour_rgb

**Fichier:** `generators\arduino\blocks\colour.ts` (ligne 127)

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

**Fichier:** `generators\arduino\blocks\logic.ts` (ligne 68)

**Signature:** `export function controls_if(block: Block, generator: ArduinoGenerator)`

**Description:**

Generates Arduino code for if/else control blocks.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Generated code string.

---

### controls_switch

**Fichier:** `generators\arduino\blocks\logic.ts` (ligne 219)

**Signature:** `export function controls_switch(`

**Description:**

Generates Arduino code for switch/case blocks.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Generated code string.

---

### logic_boolean

**Fichier:** `generators\arduino\blocks\logic.ts` (ligne 196)

**Signature:** `export function logic_boolean(`

**Description:**

Generates Arduino code for boolean literals.
@param block - Blockly block instance.
@returns Generated code tuple.

---

### logic_compare

**Fichier:** `generators\arduino\blocks\logic.ts` (ligne 118)

**Signature:** `export function logic_compare(`

**Description:**

Generates Arduino code for comparison operations.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Generated code tuple.

---

### logic_negate

**Fichier:** `generators\arduino\blocks\logic.ts` (ligne 180)

**Signature:** `export function logic_negate(`

**Description:**

Generates Arduino code for boolean negation.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Generated code tuple.

---

### logic_null

**Fichier:** `generators\arduino\blocks\logic.ts` (ligne 208)

**Signature:** `export function logic_null(): [string, Order]`

**Description:**

Generates Arduino code for null literal.
@returns Generated code tuple.

---

### logic_operation

**Fichier:** `generators\arduino\blocks\logic.ts` (ligne 147)

**Signature:** `export function logic_operation(`

**Description:**

Generates Arduino code for boolean operations.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Generated code tuple.

---

### logic_ternary

**Fichier:** `generators\arduino\blocks\logic.ts` (ligne 264)

**Signature:** `export function logic_ternary(`

**Description:**

Generates Arduino code for ternary expressions.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Generated code tuple.

---


## generators\arduino\blocks\loops.ts

### controls_flow_statements

**Fichier:** `generators\arduino\blocks\loops.ts` (ligne 341)

**Signature:** `export function controls_flow_statements(`

**Description:**

Generates Arduino code for flow statements (break/continue).
@param block - Blockly block instance.
@returns Generated code string.

---

### controls_for

**Fichier:** `generators\arduino\blocks\loops.ts` (ligne 182)

**Signature:** `export function controls_for(`

**Description:**

Generates Arduino code for numeric for-loops.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Generated code string.

---

### controls_forEach

**Fichier:** `generators\arduino\blocks\loops.ts` (ligne 299)

**Signature:** `export function controls_forEach(`

**Description:**

Generates Arduino code for foreach loops.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Generated code string.

---

### controls_repeat_ext

**Fichier:** `generators\arduino\blocks\loops.ts` (ligne 122)

**Signature:** `export function controls_repeat_ext(`

**Description:**

Generates Arduino code for repeat loops with a count.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Generated code string.

---

### controls_whileUntil

**Fichier:** `generators\arduino\blocks\loops.ts` (ligne 158)

**Signature:** `export function controls_whileUntil(`

**Description:**

Generates Arduino code for while/until loops.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Generated code string.

---


## generators\arduino\blocks\math_helpers.ts

### addListHelpers

**Fichier:** `generators\arduino\blocks\math_helpers.ts` (ligne 116)

**Signature:** `export function addListHelpers(generator: ArduinoGenerator): void`

**Description:**

Injects list helper functions into the generator.
@param generator - Arduino generator instance.

---

### addMathInclude

**Fichier:** `generators\arduino\blocks\math_helpers.ts` (ligne 65)

**Signature:** `export function addMathInclude(generator: ArduinoGenerator): void`

**Description:**

Adds math include headers to the generator.
Only needed for libm symbols (sin, sqrt, pow, …) not provided by Arduino.h alone.
@param generator - Arduino generator instance.

---

### addPrimeHelper

**Fichier:** `generators\arduino\blocks\math_helpers.ts` (ligne 95)

**Signature:** `export function addPrimeHelper(generator: ArduinoGenerator): void`

**Description:**

Injects a prime-check helper into the generator.
@param generator - Arduino generator instance.

---

### addSqrtHelper

**Fichier:** `generators\arduino\blocks\math_helpers.ts` (ligne 73)

**Signature:** `export function addSqrtHelper(generator: ArduinoGenerator): void`

**Description:**

Injects an integer square-root helper (avoids &lt;math.h&gt; for list statistics).
@param generator - Arduino generator instance.

---


## generators\arduino\blocks\math.ts

### inout_angle_maths

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 130)

**Signature:** `export function inout_angle_maths(block: Block): [string, Order]`

**Description:**

Generates Arduino code for an angle literal.
@param block - Blockly block instance.
@returns Code string with order.

---

### math_arithmetic

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 141)

**Signature:** `export function math_arithmetic(`

**Description:**

Generates Arduino code for arithmetic expressions.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### math_atan2

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 509)

**Signature:** `export function math_atan2(`

**Description:**

Generates Arduino code for atan2.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### math_change

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 100)

**Signature:** `export function math_change(`

**Description:**

Generates Arduino code for a change-by statement.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Statement code string.

---

### math_constant

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 299)

**Signature:** `export function math_constant(block: Block): [string, Order]`

**Description:**

Generates Arduino code for math constants.
@param block - Blockly block instance.
@returns Code string with order.

---

### math_constrain

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 467)

**Signature:** `export function math_constrain(`

**Description:**

Generates Arduino code for constrain(min, max).
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### math_interval

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 233)

**Signature:** `export function math_interval(`

**Description:**

Generates Arduino code for interval comparisons.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### math_modulo

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 448)

**Signature:** `export function math_modulo(`

**Description:**

Generates Arduino code for modulo operation.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### math_number

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 77)

**Signature:** `export function math_number(block: Block): [string, Order]`

**Description:**

Generates Arduino code for a numeric literal.
@param block - Blockly block instance.
@returns Code string with order.

---

### math_number_property

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 323)

**Signature:** `export function math_number_property(`

**Description:**

Generates Arduino code for numeric property checks.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### math_on_list

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 409)

**Signature:** `export function math_on_list(`

**Description:**

Generates Arduino code for list math operations.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### math_percent

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 88)

**Signature:** `export function math_percent(block: Block): [string, Order]`

**Description:**

Generates Arduino code for a percentage literal (0-100 mapped to 0-1).
@param block - Blockly block instance.
@returns Code string with order.

---

### math_random_float

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 498)

**Signature:** `export function math_random_float(): [string, Order]`

**Description:**

Generates Arduino code for a random float between 0 and 1.
@returns Code string with order.

---

### math_random_int

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 484)

**Signature:** `export function math_random_int(`

**Description:**

Generates Arduino code for a random integer in a range.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### math_round

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 383)

**Signature:** `export function math_round(`

**Description:**

Generates Arduino code for rounding operations.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### math_single

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 172)

**Signature:** `export function math_single(`

**Description:**

Generates Arduino code for single-operand math operations.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### math_trig

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 274)

**Signature:** `export function math_trig(`

**Description:**

Generates Arduino code for trigonometric functions.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---


## generators\arduino\blocks\procedures.ts

### procedures_callnoreturn

**Fichier:** `generators\arduino\blocks\procedures.ts` (ligne 329)

**Signature:** `export function procedures_callnoreturn(`

**Description:**

Generates Arduino code for calling a procedure without return value.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Statement code string.

---

### procedures_callreturn

**Fichier:** `generators\arduino\blocks\procedures.ts` (ligne 307)

**Signature:** `export function procedures_callreturn(`

**Description:**

Generates Arduino code for calling a procedure with return value.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### procedures_defnoreturn

**Fichier:** `generators\arduino\blocks\procedures.ts` (ligne 279)

**Signature:** `export const procedures_defnoreturn = function (`

**Description:**

Generates Arduino code for a procedure without return value.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Function definition code.

---

### procedures_defreturn

**Fichier:** `generators\arduino\blocks\procedures.ts` (ligne 234)

**Signature:** `export function procedures_defreturn(`

**Description:**

Generates Arduino code for a procedure with return value.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Function definition code.

---

### procedures_ifreturn

**Fichier:** `generators\arduino\blocks\procedures.ts` (ligne 350)

**Signature:** `export function procedures_ifreturn(`

**Description:**

Generates Arduino code for if-return blocks.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Statement code string.

---


## generators\arduino\blocks\text_helpers.ts

### addTextHelpers

**Fichier:** `generators\arduino\blocks\text_helpers.ts` (ligne 147)

**Signature:** `export function addTextHelpers(generator: ArduinoGenerator): void`

**Description:**

Adds helper functions for text list operations (count, replace, reverse).
@param generator - Arduino generator instance.

---

### addTitleCaseHelper

**Fichier:** `generators\arduino\blocks\text_helpers.ts` (ligne 81)

**Signature:** `export function addTitleCaseHelper(generator: ArduinoGenerator): void`

**Description:**

Title-case helper without ctype (ASCII letter checks only).
@param generator - Arduino generator instance.

---

### addTrimHelper

**Fichier:** `generators\arduino\blocks\text_helpers.ts` (ligne 136)

**Signature:** `export function addTrimHelper(`

**Description:**

Injects only the trim helper required for the selected mode.
@param generator - Arduino generator instance.
@param mode - BOTH, LEFT, or RIGHT.

---

### addUpperLowerHelper

**Fichier:** `generators\arduino\blocks\text_helpers.ts` (ligne 64)

**Signature:** `export function addUpperLowerHelper(generator: ArduinoGenerator): void`

**Description:**

Legacy rduino-style upper/lower case helper (Arduino String methods, no ctype).
@param generator - Arduino generator instance.

---


## generators\arduino\blocks\text.ts

### text

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 107)

**Signature:** `export function text(block: Block): [string, Order]`

**Description:**

Generates Arduino code for a quoted text literal.
@param block - Blockly block instance.
@returns Code string with order.

---

### text_append

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 192)

**Signature:** `export function text_append(`

**Description:**

Generates Arduino code to append text to a variable.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Statement code string.

---

### text_changeCase

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 344)

**Signature:** `export function text_changeCase(`

**Description:**

Generates Arduino code for text case changes.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### text_char

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 151)

**Signature:** `export function text_char(block: Block): [string, Order]`

**Description:**

Generates Arduino code for a single character literal.
@param block - Blockly block instance.
@returns Code string with order.

---

### text_charAt

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 257)

**Signature:** `export function text_charAt(`

**Description:**

Generates Arduino code to access a character at position.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### text_count

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 393)

**Signature:** `export function text_count(`

**Description:**

Generates Arduino code for counting substrings.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### text_date

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 140)

**Signature:** `export function text_date(block: Block): [string, Order]`

**Description:**

Generates Arduino code for a date literal.
@param block - Blockly block instance.
@returns Code string with order.

---

### text_getSubstring

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 300)

**Signature:** `export function text_getSubstring(`

**Description:**

Generates Arduino code for substring extraction.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### text_indexOf

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 239)

**Signature:** `export function text_indexOf(`

**Description:**

Generates Arduino code for substring index lookup.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### text_isEmpty

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 224)

**Signature:** `export function text_isEmpty(`

**Description:**

Generates Arduino code for is-empty checks.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### text_join

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 163)

**Signature:** `export function text_join(`

**Description:**

Generates Arduino code to concatenate text parts.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### text_length

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 209)

**Signature:** `export function text_length(`

**Description:**

Generates Arduino code for text length.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### text_multiline

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 129)

**Signature:** `export function text_multiline(block: Block): [string, Order]`

**Description:**

Generates Arduino code for a multiline quoted text literal.
@param block - Blockly block instance.
@returns Code string with order.

---

### text_no_quote

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 118)

**Signature:** `export function text_no_quote(block: Block): [string, Order]`

**Description:**

Generates Arduino code for a raw text literal without quotes.
@param block - Blockly block instance.
@returns Code string with order.

---

### text_print

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 445)

**Signature:** `export function text_print(`

**Description:**

Generates Arduino code for printing text.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Statement code string.

---

### text_prompt_ext

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 461)

**Signature:** `export function text_prompt_ext(`

**Description:**

Generates Arduino code for prompt text (input).
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### text_replace

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 410)

**Signature:** `export function text_replace(`

**Description:**

Generates Arduino code for replacing substrings.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### text_reverse

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 429)

**Signature:** `export function text_reverse(`

**Description:**

Generates Arduino code for reversing text.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### text_trim

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 368)

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


## generators\arduino\configure_logic_blocks.ts

### configureLogicCompareAndTernaryBlocks

**Fichier:** `generators\arduino\configure_logic_blocks.ts` (ligne 43)

**Signature:** `export function configureLogicCompareAndTernaryBlocks(): void`

**Description:**

Configures logic_compare and logic_ternary for the typed connection system.

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

Flyout: Arduino setup()/loop() blocks, then a separator, then Blockly procedures.

---

### registerProceduresCategory

**Fichier:** `generators\arduino\procedures_flyout.ts` (ligne 72)

**Signature:** `export function registerProceduresCategory(`

**Description:**

Enregistre le callback de la catégorie PROCEDURE dans la toolbox.

---


## generators\arduino\strict_connection_checker.ts

### registerStrictConnectionChecker

**Fichier:** `generators\arduino\strict_connection_checker.ts` (ligne 918)

**Signature:** `export function registerStrictConnectionChecker(workspace: Blockly.Workspace): void`

**Description:**

Installs the strict connection checker on an existing workspace.
Use registerStrictConnectionCheckerInRegistry() BEFORE Blockly.inject() instead for best results.
@param workspace - Target workspace.

---

### registerStrictConnectionCheckerInRegistry

**Fichier:** `generators\arduino\strict_connection_checker.ts` (ligne 901)

**Signature:** `export function registerStrictConnectionCheckerInRegistry(): void`

**Description:**

Registers the StrictConnectionChecker in Blockly's registry as the default checker.
MUST be called BEFORE Blockly.inject() so the workspace uses our checker from the start.

---

### StrictConnectionChecker

**Fichier:** `generators\arduino\strict_connection_checker.ts` (ligne 64)

**Signature:** `export class StrictConnectionChecker extends Blockly.ConnectionChecker`

**Description:**

Custom ConnectionChecker that extends Blockly's default ConnectionChecker
to use getBlockType() for source blocks, providing stricter type checking.

---


## generators\arduino\strict_connection_type_utils.ts

### checkSwitchCaseIntConnection

**Fichier:** `generators\arduino\strict_connection_type_utils.ts` (ligne 140)

**Signature:** `export function checkSwitchCaseIntConnection(`

**Description:**

Switch case inputs require int values. Blockly's default checker compares
output checks (e.g. math_number → "Number") against setCheck(["int"]) and
rejects before getBlockType() runs — handle that case explicitly.
@param helpers - Provides resolveOutputInputPair to identify OUTPUT_VALUE vs INPUT_VALUE.

---

### checkTypeCompatibility

**Fichier:** `generators\arduino\strict_connection_type_utils.ts` (ligne 169)

**Signature:** `export function checkTypeCompatibility(`

**Description:**

Checks if two types are compatible (exact match, null/undefined equality,
or registry rules).

---

### getInputNameForConnection

**Fichier:** `generators\arduino\strict_connection_type_utils.ts` (ligne 50)

**Signature:** `export function getInputNameForConnection(`

**Description:**

Returns the input name for a connection on a block, or null if not found.

---

### isSwitchCaseInput

**Fichier:** `generators\arduino\strict_connection_type_utils.ts` (ligne 65)

**Signature:** `export function isSwitchCaseInput(inputConnection: Blockly.Connection): boolean`

**Description:**

True when the input connection is a `controls_switch` CASE* value input.

---

### resolveSourceBlockType

**Fichier:** `generators\arduino\strict_connection_type_utils.ts` (ligne 78)

**Signature:** `export function resolveSourceBlockType(`

**Description:**

Resolves the semantic type of a source (output) block via getBlockType()
or the output connection check.

---

### resolveSwitchCaseSourceType

**Fichier:** `generators\arduino\strict_connection_type_utils.ts` (ligne 108)

**Signature:** `export function resolveSwitchCaseSourceType(`

**Description:**

Resolves semantic type for a block connecting to a switch case input.

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

List value connected to a set block (literal or local wrapping a literal).

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

List literal blocks (value plugged into variables_set or Array_declare).

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

### claimVariableDeclaration

**Fichier:** `generators\arduino\variable_utils.ts` (ligne 268)

**Signature:** `export function claimVariableDeclaration(`

**Description:**

Claims exclusive declaration ownership, mirroring const `__ucbConstBlockId`.
@returns `owned_by_other` when another living block already declared this variable.

---

### clearVariableType

**Fichier:** `generators\arduino\variable_utils.ts` (ligne 201)

**Signature:** `export function clearVariableType(`

**Description:**

Clears a variable's type metadata (back to scalar kind).
@param variable - Variable model to update.

---

### getOrCreateKindedVariable

**Fichier:** `generators\arduino\variable_utils.ts` (ligne 309)

**Signature:** `export function getOrCreateKindedVariable(`

**Description:**

Gets or creates a variable of the given kind/name via Blockly's package helper
(name reuse follows VariableMap / `patchVariableMapCreateVariable`).

---

### isInstanceVariable

**Fichier:** `generators\arduino\variable_utils.ts` (ligne 142)

**Signature:** `export function isInstanceVariable(`

**Description:** *Aucune documentation*

---

### isInstanceVariableType

**Fichier:** `generators\arduino\variable_utils.ts` (ligne 126)

**Signature:** `export function isInstanceVariableType(`

**Description:**

Owner block id for the exclusive declaration of a kinded variable
(list today, instance later). Same conflict pattern as `__ucbConstBlockId`.

---

### isListDeclareBlockType

**Fichier:** `generators\arduino\variable_utils.ts` (ligne 81)

**Signature:** `export function isListDeclareBlockType(`

**Description:**

True when the block type is a list declaration block.

---

### isListVariable

**Fichier:** `generators\arduino\variable_utils.ts` (ligne 136)

**Signature:** `export function isListVariable(`

**Description:** *Aucune documentation*

---

### isListVariableType

**Fichier:** `generators\arduino\variable_utils.ts` (ligne 122)

**Signature:** `export function isListVariableType(type: string | null | undefined): boolean`

**Description:**

Owner block id for the exclusive declaration of a kinded variable
(list today, instance later). Same conflict pattern as `__ucbConstBlockId`.

---

### isScalarVariableType

**Fichier:** `generators\arduino\variable_utils.ts` (ligne 132)

**Signature:** `export function isScalarVariableType(type: string | null | undefined): boolean`

**Description:** *Aucune documentation*

---

### isVariableDeclarationOwner

**Fichier:** `generators\arduino\variable_utils.ts` (ligne 246)

**Signature:** `export function isVariableDeclarationOwner(`

**Description:**

True when `blockId` owns (or may claim) the exclusive declaration slot.
Unowned variables and stale owners (deleted blocks) are claimable.

---

### isVariablesDefineBlock

**Fichier:** `generators\arduino\variable_utils.ts` (ligne 100)

**Signature:** `export function isVariablesDefineBlock(`

**Description:**

Indique si le type de bloc correspond à une déclaration globale typée.

---

### normalizeVariableType

**Fichier:** `generators\arduino\variable_utils.ts` (ligne 233)

**Signature:** `export function normalizeVariableType(`

**Description:**

Normalizes null/"null" types to empty string.
@param variable - Variable model to normalize.

---

### releaseVariableDeclaration

**Fichier:** `generators\arduino\variable_utils.ts` (ligne 292)

**Signature:** `export function releaseVariableDeclaration(`

**Description:**

Releases declaration ownership when the owner block is deleted or retargeted.

---

### setVariableType

**Fichier:** `generators\arduino\variable_utils.ts` (ligne 153)

**Signature:** `export function setVariableType(`

**Description:**

Sets a variable's type metadata and updates the model.
@param variable - Variable model to update.
@param type - New type string.

---

### tagVariableAsInstance

**Fichier:** `generators\arduino\variable_utils.ts` (ligne 191)

**Signature:** `export function tagVariableAsInstance(`

**Description:**

Tags a workspace variable as an instance variable (`instance`).

---

### tagVariableAsList

**Fichier:** `generators\arduino\variable_utils.ts` (ligne 182)

**Signature:** `export function tagVariableAsList(`

**Description:**

Tags a workspace variable as a list/array variable (`list`).

---


## index.ts

### registerContinuousToolboxComponents

**Fichier:** `index.ts` (ligne 495)

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

**Fichier:** `index.ts` (ligne 572)

**Signature:** `export const unregisterContinuousToolboxComponents = (): void =>`

**Description:**

Unregisters continuous toolbox components and restores defaults.
@public
@remarks
Removes custom CSS styles, restores standard Blockly categories
and flyout inflaters, and unregisters the continuous toolbox components.

---


## language.ts

### applyBoardCategoryDisplayName

**Fichier:** `language.ts` (ligne 323)

**Signature:** `export function applyBoardCategoryDisplayName(`

**Description:**

Updates the top-level board category label from the current #boardMenu selection.

---

### changeLanguageToolbox

**Fichier:** `language.ts` (ligne 311)

**Signature:** `export const changeLanguageToolbox = (`

**Description:**

Returns a toolbox configuration with translated category labels.
Also sets the board category to « Carte : Arduino Uno » / « Carte : aucune ».
@param newLang - Target language code.
@param toolbox - Source toolbox configuration.
@return Translated toolbox configuration.

---

### getLangParamFromDropdown

**Fichier:** `language.ts` (ligne 195)

**Signature:** `export const getLangParamFromDropdown = (): string =>`

**Description:**

Gets the selected language from the dropdown and syncs the URL.
@return Selected language code.

---

### getLangParamFromUrl

**Fichier:** `language.ts` (ligne 185)

**Signature:** `export const getLangParamFromUrl = (): string =>`

**Description:**

Gets the language code from the URL query string.
@return Language code, defaulting to "en".

---

### HTML_changeLanguage

**Fichier:** `language.ts` (ligne 206)

**Signature:** `export const HTML_changeLanguage = (newLang: string, rtl?: boolean): void =>`

**Description:**

Applies translations to DOM elements with language keys.
@param newLang - Target language code.

---

### HTML_populateLanguages

**Fichier:** `language.ts` (ligne 269)

**Signature:** `export const HTML_populateLanguages = (blocklyObject: BlocklyApplicationType): void =>`

**Description:**

Populates the language dropdown from the application language map.
@param blocklyObject - Blockly application instance with language metadata.

---


## languages\array_messages.ts

### mergeArrayMessages

**Fichier:** `languages\array_messages.ts` (ligne 196)

**Signature:** `export function mergeArrayMessages(lang: string): void`

**Description:**

Merge ARRAY_* messages into Blockly.Msg for the given language.

---


## languages\blockly_a11y_messages.ts

### mergeBlocklyA11yMessages

**Fichier:** `languages\blockly_a11y_messages.ts` (ligne 300)

**Signature:** `export function mergeBlocklyA11yMessages(lang: string): void`

**Description:**

Fusionne les messages accessibilité Blockly 13 dans `Blockly.Msg`.

---


## languages\board_messages.ts

### mergeBoardMessages

**Fichier:** `languages\board_messages.ts` (ligne 395)

**Signature:** `export function mergeBoardMessages(lang: string): void`

**Description:**

Merge ARDUINO_* / SERIAL_* (s4e) messages into Blockly.Msg for the given language.

---


## program_structure_enforcer.ts

### clearProgramStructureDisabledState

**Fichier:** `program_structure_enforcer.ts` (ligne 125)

**Signature:** `export function clearProgramStructureDisabledState(`

**Description:**

Retire la raison « hors programme » sans désinstaller l’écouteur.

---

### installProgramStructureEnforcer

**Fichier:** `program_structure_enforcer.ts` (ligne 168)

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

### syncProgramStructureAfterLoad

**Fichier:** `program_structure_enforcer.ts` (ligne 138)

**Signature:** `export function syncProgramStructureAfterLoad(`

**Description:**

Réapplique ou efface l’état après un load (remount, autosave, fichier).

---

### uninstallProgramStructureEnforcer

**Fichier:** `program_structure_enforcer.ts` (ligne 152)

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


## shell_a11y.ts

### announceShellMessage

**Fichier:** `shell_a11y.ts` (ligne 240)

**Signature:** `export const announceShellMessage = (message: string, timeoutMs = 3000): void =>`

**Description:**

Annonce un message bref aux lecteurs d'écran (région live dédiée).

---

### applyDocumentLanguage

**Fichier:** `shell_a11y.ts` (ligne 228)

**Signature:** `export const applyDocumentLanguage = (lang: string, rtl: boolean): void =>`

**Description:**

Met à jour `lang`, `xml:lang` et `dir` sur `<html>` lors d'un changement de langue.

---

### applyShellLandmarks

**Fichier:** `shell_a11y.ts` (ligne 191)

**Signature:** `export const applyShellLandmarks = (): void =>`

**Description:**

Applique les repères ARIA et tabindex sur la coque (hors workspace Blockly).

---

### applyToolbarA11y

**Fichier:** `shell_a11y.ts` (ligne 256)

**Signature:** `export const applyToolbarA11y = (): void =>`

**Description:**

Applique aria-label, aria-keyshortcuts et infobulles sur la barre d'outils.

---

### registerShellAreaNavigation

**Fichier:** `shell_a11y.ts` (ligne 337)

**Signature:** `export const registerShellAreaNavigation = (): void =>`

**Description:**

Enregistre le lien d'évitement et le menu de zones (Ctrl+B / Cmd+B puis 1–5).

---


## shell_about.ts

### openAboutDialog

**Fichier:** `shell_about.ts` (ligne 121)

**Signature:** `export function openAboutDialog(): void`

**Description:**

Ouvre la modale à propos.

---

### refreshAboutDialog

**Fichier:** `shell_about.ts` (ligne 130)

**Signature:** `export function refreshAboutDialog(): void`

**Description:**

Met à jour les libellés si la modale est ouverte (changement de langue).

---

### registerAboutDialog

**Fichier:** `shell_about.ts` (ligne 143)

**Signature:** `export function registerAboutDialog(): void`

**Description:**

Enregistre le bouton « à propos » et la modale.

---


## shell_keyboard_tutorial.ts

### openKeyboardTutorial

**Fichier:** `shell_keyboard_tutorial.ts` (ligne 232)

**Signature:** `export const openKeyboardTutorial = (step = 0): void =>`

**Description:**

Ouvre le tutoriel clavier à l'étape demandée (0 par défaut).

---

### refreshKeyboardTutorial

**Fichier:** `shell_keyboard_tutorial.ts` (ligne 281)

**Signature:** `export const refreshKeyboardTutorial = (): void =>`

**Description:**

Met à jour les libellés du bouton (et du contenu si la modale est ouverte).

---

### registerKeyboardTutorial

**Fichier:** `shell_keyboard_tutorial.ts` (ligne 268)

**Signature:** `export const registerKeyboardTutorial = (options?:`

**Description:**

Enregistre le bouton barre d'outils et le tutoriel automatique au premier chargement.
@param options - autoOpen: if false, do not open the tutorial on startup (embedded hosts).

---


## shell_messages.ts

### getBoardFamilyMessageKey

**Fichier:** `shell_messages.ts` (ligne 75)

**Signature:** `export const getBoardFamilyMessageKey = (boardId: string): ShellMessageKey =>`

**Description:**

Maps a board profile id to a translated optgroup family label key.

---

### getShellMessage

**Fichier:** `shell_messages.ts` (ligne 67)

**Signature:** `export const getShellMessage = (key: ShellMessageKey, language?: string): string =>`

**Description:**

Returns a localized shell/UI string for the given language (defaults from URL / menu).

---


## shell_shortcuts_help.ts

### openShortcutsHelp

**Fichier:** `shell_shortcuts_help.ts` (ligne 594)

**Signature:** `export const openShortcutsHelp = (): void =>`

**Description:**

Ouvre la modale d'aide des raccourcis.

---

### refreshShortcutsHelp

**Fichier:** `shell_shortcuts_help.ts` (ligne 607)

**Signature:** `export const refreshShortcutsHelp = (): void =>`

**Description:**

Met à jour les libellés du bouton et du contenu si la modale est ouverte.

---

### registerShortcutsHelp

**Fichier:** `shell_shortcuts_help.ts` (ligne 644)

**Signature:** `export const registerShortcutsHelp = (): void =>`

**Description:**

Enregistre le bouton barre d'outils, la modale et les raccourcis F1 / ?.

---


## shell_shortcuts.ts

### getModifierKeyLabel

**Fichier:** `shell_shortcuts.ts` (ligne 73)

**Signature:** `export const getModifierKeyLabel = (): string =>`

**Description:**

Libellé affiché du modificateur (Ctrl ou Cmd).

---

### getModifierKeyToken

**Fichier:** `shell_shortcuts.ts` (ligne 69)

**Signature:** `export const getModifierKeyToken = (): "Control" | "Meta" =>`

**Description:**

Jeton WAI-ARIA pour la touche modificateur (Control ou Meta).

---

### isTextEntryTarget

**Fichier:** `shell_shortcuts.ts` (ligne 45)

**Signature:** `export const isTextEntryTarget = (target: EventTarget | null): boolean =>`

**Description:**

Whether the target is a text input field (including Monaco).
File shortcuts must not intercept Ctrl+S / Ctrl+O in these areas.

---

### registerShellFileShortcuts

**Fichier:** `shell_shortcuts.ts` (ligne 85)

**Signature:** `export const registerShellFileShortcuts = (`

**Description:**

Enregistre Ctrl+S / Cmd+S (enregistrer) et Ctrl+O / Cmd+O (ouvrir),
sauf dans les champs de saisie texte.

---


## shortcut_preferences.ts

### applyShortcutPreferences

**Fichier:** `shortcut_preferences.ts` (ligne 350)

**Signature:** `export const applyShortcutPreferences = (): void =>`

**Description:**

Apply persisted overrides onto the live ShortcutRegistry.
Safe to call multiple times (e.g. after cross-tab copy/paste replaces C/X/V).

---

### findRebindConflicts

**Fichier:** `shortcut_preferences.ts` (ligne 285)

**Signature:** `export const findRebindConflicts = (`

**Description:**

Returns conflicting shortcut names for the proposed key codes (excluding `name`).

---

### formatSerializedKey

**Fichier:** `shortcut_preferences.ts` (ligne 157)

**Signature:** `export const formatSerializedKey = (serialized: string): string =>`

**Description:**

Human-readable label for a Blockly serialized key code (e.g. Control+67 → Ctrl+C).

---

### formatSerializedKeys

**Fichier:** `shortcut_preferences.ts` (ligne 190)

**Signature:** `export const formatSerializedKeys = (codes: string[]): string =>`

**Description:** *Aucune documentation*

---

### getDefaultKeyCodes

**Fichier:** `shortcut_preferences.ts` (ligne 341)

**Signature:** `export const getDefaultKeyCodes = (name: string): string[] =>`

**Description:**

Current effective key codes for a shortcut (registry live state).

---

### getEffectiveKeyCodes

**Fichier:** `shortcut_preferences.ts` (ligne 336)

**Signature:** `export const getEffectiveKeyCodes = (name: string): string[] =>`

**Description:**

Current effective key codes for a shortcut (registry live state).

---

### hasCustomShortcutBindings

**Fichier:** `shortcut_preferences.ts` (ligne 432)

**Signature:** `export const hasCustomShortcutBindings = (): boolean =>`

**Description:** *Aucune documentation*

---

### rebindShortcut

**Fichier:** `shortcut_preferences.ts` (ligne 305)

**Signature:** `export const rebindShortcut = (`

**Description:**

Rebind a registered shortcut to new serialized key codes.

---

### resetAllShortcutBindings

**Fichier:** `shortcut_preferences.ts` (ligne 421)

**Signature:** `export const resetAllShortcutBindings = (): void =>`

**Description:**

Restore all editable shortcuts to factory defaults.

---

### resetShortcutBinding

**Fichier:** `shortcut_preferences.ts` (ligne 406)

**Signature:** `export const resetShortcutBinding = (name: string): void =>`

**Description:**

Restore one shortcut to its factory binding.

---

### serializedKeyFromEvent

**Fichier:** `shortcut_preferences.ts` (ligne 204)

**Signature:** `export const serializedKeyFromEvent = (event: KeyboardEvent): string | null =>`

**Description:**

Build a Blockly serialized key from a KeyboardEvent.
Returns null for modifier-only presses.

---

### setShortcutBinding

**Fichier:** `shortcut_preferences.ts` (ligne 382)

**Signature:** `export const setShortcutBinding = (`

**Description:**

Persist and apply a new binding for one shortcut.

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

**Fichier:** `toolbox.ts` (ligne 59)

**Signature:** `export function applyToolboxBlockLevels(`

**Description:**

Ajoute la propriété levels à chaque entrée kind:"block" (récursif).

---

### getToolboxForCurrentBoard

**Fichier:** `toolbox.ts` (ligne 1004)

**Signature:** `export function getToolboxForCurrentBoard(toolbox: ToolboxConfiguration): ToolboxConfiguration`

**Description:**

Returns the toolbox to use for the workspace: board category emptied if
no board is selected, otherwise a clone of the full toolbox.
Read the current selection from the board menu in the DOM.

---

### getToolboxWithoutBoardCategory

**Fichier:** `toolbox.ts` (ligne 987)

**Signature:** `export function getToolboxWithoutBoardCategory(toolbox: ToolboxConfiguration): ToolboxConfiguration`

**Description:**

Returns a deep clone of the toolbox with the board category emptied
(category kept so the label can show « Carte : aucune »).
Used when no board is selected.

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


## ui_palette_theme.ts

### resolveUiThemeMode

**Fichier:** `ui_palette_theme.ts` (ligne 130)

**Signature:** `export const resolveUiThemeMode = (`

**Description:**

Résout le mode coque (clair / sombre / contraste élevé) à partir du thème Blockly.

---

### syncUiPaletteTheme

**Fichier:** `ui_palette_theme.ts` (ligne 147)

**Signature:** `export const syncUiPaletteTheme = (themeKey?: string): void =>`

**Description:**

Dérive les variables CSS de la coque et le thème Monaco depuis le thème Blockly actif.
@param themeKey - Clé du thème ; par défaut la valeur du menu `#themeMenu`.

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
Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
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

