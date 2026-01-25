# Liste des fonctions exportées

Total: 144 fonctions

---


## blockly_application_type.ts

### BlocklyApplication

**Fichier:** `blockly_application_type.ts` (ligne 99)

**Signature:** `export class BlocklyApplication implements BlocklyApplicationType`

**Description:** *Aucune documentation*

---


## blockly_patches.ts

### patchFieldVariableValidation

**Fichier:** `blockly_patches.ts` (ligne 63)

**Signature:** `export function patchFieldVariableValidation(): void`

**Description:**

Patches FieldVariable validation to handle normalized types safely.

---

### patchVariableMapCreateVariable

**Fichier:** `blockly_patches.ts` (ligne 25)

**Signature:** `export function patchVariableMapCreateVariable(`

**Description:**

Patches VariableMap.createVariable to normalize types and avoid duplicates.
@param workspace - Workspace whose variable map will be patched.

---

### patchWorkspaceRemoveTopBlock

**Fichier:** `blockly_patches.ts` (ligne 131)

**Signature:** `export function patchWorkspaceRemoveTopBlock(): void`

**Description:**

Patches WorkspaceSvg.removeTopBlock to tolerate missing blocks.

---


## categories\blockly\colour.ts

### defineColourBlocks

**Fichier:** `categories\blockly\colour.ts` (ligne 52)

**Signature:** `export const defineColourBlocks = (): void =>`

**Description:**

Registers colour blocks and custom color picker fields.

---


## categories\blockly\field_colour_picker.ts

### FieldColorPicker

**Fichier:** `categories\blockly\field_colour_picker.ts` (ligne 114)

**Signature:** `export class FieldColorPicker extends Blockly.FieldTextInput`

**Description:**

Custom Blockly field that renders an iro.js color picker.

---


## categories\blockly\index.ts

### defineAllTypedVariableBlocks

**Fichier:** `categories\blockly\index.ts` (ligne 45)

**Signature:** `export const defineAllTypedVariableBlocks = (): void =>`

**Description:**

Registers all typed variable blocks and extensions.

---

### defineBlocklyArduinoCompatBlocks

**Fichier:** `categories\blockly\index.ts` (ligne 33)

**Signature:** `export const defineBlocklyArduinoCompatBlocks = (): void =>`

**Description:**

Registers BlocklyArduino compatibility blocks.

---


## categories\blockly\logic.ts

### defineControlsSwitchBlocks

**Fichier:** `categories\blockly\logic.ts` (ligne 191)

**Signature:** `export const defineControlsSwitchBlocks = (): void =>`

**Description:**

Registers the controls_switch block definitions and typing.

---


## categories\blockly\math.ts

### defineMathCompatBlocks

**Fichier:** `categories\blockly\math.ts` (ligne 21)

**Signature:** `export const defineMathCompatBlocks = (): void =>`

**Description:**

Registers math compatibility blocks for µcBlockly.

---


## categories\blockly\shared.ts

### configureTypedVariableField

**Fichier:** `categories\blockly\shared.ts` (ligne 111)

**Signature:** `export const configureTypedVariableField = (field: Blockly.FieldVariable): void =>`

**Description:**

Configures a FieldVariable to accept any type.
@param field - FieldVariable instance to configure.

---

### getBlocklyCompatibleChecks

**Fichier:** `categories\blockly\shared.ts` (ligne 86)

**Signature:** `export const getBlocklyCompatibleChecks = (`

**Description:**

Converts a variable type into Blockly connection checks.
@param type - Variable or inferred type.
@returns Array of compatible checks or null when not applicable.

---

### getBlocklyMsg

**Fichier:** `categories\blockly\shared.ts` (ligne 31)

**Signature:** `export const getBlocklyMsg = (key: string): string =>`

**Description:**

Retrieves a Blockly message by key.
@param key - Message key to look up.
@returns The localized message or the key if missing.

---

### getBlocklyMsgOr

**Fichier:** `categories\blockly\shared.ts` (ligne 42)

**Signature:** `export const getBlocklyMsgOr = (key: string, fallback: string): string =>`

**Description:**

Retrieves a Blockly message or returns a fallback.
@param key - Message key to look up.
@param fallback - Fallback text when the key is missing.
@returns The localized message or the fallback value.

---

### getConstWarningText

**Fichier:** `categories\blockly\shared.ts` (ligne 78)

**Signature:** `export const getConstWarningText = (): string =>`

**Description:**

Returns the warning text for const assignments.

---

### getTypeMismatchWarningText

**Fichier:** `categories\blockly\shared.ts` (ligne 70)

**Signature:** `export const getTypeMismatchWarningText = (varType: string, connectedType: string): string =>`

**Description:**

Builds the warning text for type mismatches.
@param varType - Variable's declared type.
@param connectedType - Type inferred from the connected block.
@returns Localized mismatch warning message.

---

### getUntypedWarningText

**Fichier:** `categories\blockly\shared.ts` (ligne 62)

**Signature:** `export const getUntypedWarningText = (): string => getBlocklyMsg("TYPED_VAR_UNTYPED_WARNING");`

**Description:**

Returns the warning text for untyped variables.

---

### handleVariablesSetChange

**Fichier:** `categories\blockly\shared.ts` (ligne 275)

**Signature:** `export const handleVariablesSetChange = (`

**Description:**

Handles variable assignment changes to enforce typing rules.
@param block - Variable set block.
@param event - Blockly change event.
@param label - Block label for warnings.

---

### inferConnectedValueType

**Fichier:** `categories\blockly\shared.ts` (ligne 212)

**Signature:** `export const inferConnectedValueType = (block: Blockly.Block | null): string | null =>`

**Description:**

Infers a block's output type from its definition or connection.
@param block - Connected block or null.
@returns Normalized type or null when unknown.

---

### normalizeBlocklyTypeToVariableType

**Fichier:** `categories\blockly\shared.ts` (ligne 125)

**Signature:** `export const normalizeBlocklyTypeToVariableType = (type: string): string =>`

**Description:**

Normalizes Blockly check types to µcBlockly variable types.
@param type - Blockly check type string.
@returns Normalized µcBlockly variable type.

---

### shouldSkipVariableChange

**Fichier:** `categories\blockly\shared.ts` (ligne 139)

**Signature:** `export const shouldSkipVariableChange = (`

**Description:**

Determines whether a variable change event should be ignored.
@param block - Block receiving the event.
@param event - Blockly change event.
@returns True when the event should be skipped.

---

### validateSingleChar

**Fichier:** `categories\blockly\shared.ts` (ligne 52)

**Signature:** `export const validateSingleChar = (value: string): string =>`

**Description:**

Normalizes a string to a single character.
@param value - Input string value.
@returns First character or empty string for falsy input.

---


## categories\blockly\text.ts

### defineTextCompatBlocks

**Fichier:** `categories\blockly\text.ts` (ligne 21)

**Signature:** `export const defineTextCompatBlocks = (): void =>`

**Description:**

Registers text compatibility blocks for µcBlockly.

---


## categories\blockly\variables.ts

### defineVariablesConstBlock

**Fichier:** `categories\blockly\variables.ts` (ligne 324)

**Signature:** `export const defineVariablesConstBlock = (): void =>`

**Description:**

Registers the const declaration block.

---

### defineVariablesDefineBlock

**Fichier:** `categories\blockly\variables.ts` (ligne 511)

**Signature:** `export const defineVariablesDefineBlock = (): void =>`

**Description:**

Registers the variable definition block used by s4e compatibility.

---

### defineVariablesGetDynamicBlock

**Fichier:** `categories\blockly\variables.ts` (ligne 45)

**Signature:** `export const defineVariablesGetDynamicBlock = (): void =>`

**Description:**

Registers the dynamic variables_get block with typing support.

---

### defineVariablesLocalBlock

**Fichier:** `categories\blockly\variables.ts` (ligne 172)

**Signature:** `export const defineVariablesLocalBlock = (): void =>`

**Description:**

Registers the "local" wrapper block for scoped variables.

---

### defineVariablesSetDynamicBlock

**Fichier:** `categories\blockly\variables.ts` (ligne 128)

**Signature:** `export const defineVariablesSetDynamicBlock = (): void =>`

**Description:**

Registers the dynamic variables_set block with typing support.

---

### defineVariablesSetInitBlock

**Fichier:** `categories\blockly\variables.ts` (ligne 430)

**Signature:** `export const defineVariablesSetInitBlock = (): void =>`

**Description:**

Registers the typed variable initialization block.

---

### defineVariablesSetTypeBlock

**Fichier:** `categories\blockly\variables.ts` (ligne 221)

**Signature:** `export const defineVariablesSetTypeBlock = (): void =>`

**Description:**

Registers the block that forces a variable type.

---

### extendStandardVariablesGetBlock

**Fichier:** `categories\blockly\variables.ts` (ligne 546)

**Signature:** `export const extendStandardVariablesGetBlock = (): void =>`

**Description:**

Extends the standard variables_get block with typed behavior.

---

### extendStandardVariablesSetBlock

**Fichier:** `categories\blockly\variables.ts` (ligne 606)

**Signature:** `export const extendStandardVariablesSetBlock = (): void =>`

**Description:**

Extends the standard variables_set block with typed behavior.

---


## categories\field_colour_hsv_sliders.ts

### LocalizedFieldColourHsvSliders

**Fichier:** `categories\field_colour_hsv_sliders.ts` (ligne 71)

**Signature:** `export class LocalizedFieldColourHsvSliders extends FieldColourHsvSliders`

**Description:**

HSV sliders field with localized labels.

---


## generators\arduino\arduino_generator.ts

### ArduinoGenerator

**Fichier:** `generators\arduino\arduino_generator.ts` (ligne 63)

**Signature:** `export class ArduinoGenerator extends Blockly.CodeGenerator`

**Description:**

Arduino code generator class.
Extends Blockly.CodeGenerator to provide Arduino-specific code generation.

---


## generators\arduino\arduino_types.ts

### getArduinoType

**Fichier:** `generators\arduino\arduino_types.ts` (ligne 165)

**Signature:** `export function getArduinoType(typeName: string): ArduinoType | undefined`

**Description:**

Looks up an Arduino type definition by name.
@param typeName - Type name to resolve.
@returns Type definition or undefined.

---

### getArduinoTypeNames

**Fichier:** `generators\arduino\arduino_types.ts` (ligne 176)

**Signature:** `export function getArduinoTypeNames(): string[]`

**Description:**

Returns the list of available Arduino type names.

---

### getDefaultValueForType

**Fichier:** `generators\arduino\arduino_types.ts` (ligne 213)

**Signature:** `export function getDefaultValueForType(typeName: string): string`

**Description:**

Returns a default literal for a given Arduino type.
@param typeName - Target Arduino type name.
@returns Default literal string.

---

### isValueValidForType

**Fichier:** `generators\arduino\arduino_types.ts` (ligne 192)

**Signature:** `export function isValueValidForType(typeName: string, value: number): boolean`

**Description:**

Checks whether a numeric value fits the given Arduino type.
@param typeName - Target Arduino type name.
@param value - Numeric value to validate.
@returns True when the value is within range.

---


## generators\arduino\block_types_registry.ts

### applyBlockTypesFromRegistry

**Fichier:** `generators\arduino\block_types_registry.ts` (ligne 278)

**Signature:** `export function applyBlockTypesFromRegistry(): void`

**Description:**

Applies registered block type metadata to Blockly blocks.

---

### checkTypeCompatibility

**Fichier:** `generators\arduino\block_types_registry.ts` (ligne 228)

**Signature:** `export function checkTypeCompatibility(`

**Description:**

Checks whether two types are compatible for connection.
@param sourceType - Source type from the connected block.
@param targetType - Target expected type.
@returns True when compatible.

---

### getCompatibleTypesForCheck

**Fichier:** `generators\arduino\block_types_registry.ts` (ligne 200)

**Signature:** `export function getCompatibleTypesForCheck(type: string | null | undefined): string[] | null`

**Description:**

Returns Blockly check types compatible with a given µcBlockly type.
@param type - Normalized type string.
@returns Array of checks or null when unavailable.

---


## generators\arduino\block_types.ts

### getCompatibleTypes

**Fichier:** `generators\arduino\block_types.ts` (ligne 79)

**Signature:** `export function getCompatibleTypes(targetType: string | null | undefined): string[]`

**Description:**

Returns compatible types for a target type.
@param targetType - Target type to match.
@returns List of compatible types (includes the target type).

---

### getVariableTypeOptions

**Fichier:** `generators\arduino\block_types.ts` (ligne 65)

**Signature:** `export function getVariableTypeOptions(): string[]`

**Description:**

Returns the list of variable types available in dropdowns.

---

### isTypeCompatible

**Fichier:** `generators\arduino\block_types.ts` (ligne 100)

**Signature:** `export function isTypeCompatible(sourceType: string | null | undefined, targetType: string | null | undefined): boolean`

**Description:**

Checks if a source type can connect to a target type.
@param sourceType - Source type from a connected block.
@param targetType - Target expected type.
@returns True when compatible.

---


## generators\arduino\blocks\colour.ts

### color_picker_custom

**Fichier:** `generators\arduino\blocks\colour.ts` (ligne 42)

**Signature:** `export function color_picker_custom(block: Block): [string, Order]`

**Description:**

Generates Arduino code for the custom colour picker value.
@param block - Blockly block instance.
@returns Code string with order.

---

### color_picker_hsv

**Fichier:** `generators\arduino\blocks\colour.ts` (ligne 55)

**Signature:** `export function color_picker_hsv(block: Block): [string, Order]`

**Description:**

Generates Arduino code for the HSV picker value.
@param block - Blockly block instance.
@returns Code string with order.

---

### colour_blend

**Fichier:** `generators\arduino\blocks\colour.ts` (ligne 121)

**Signature:** `export function colour_blend(`

**Description:**

Generates Arduino code for blending two colours.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### colour_picker

**Fichier:** `generators\arduino\blocks\colour.ts` (ligne 32)

**Signature:** `export function colour_picker(block: Block): [string, Order]`

**Description:**

Generates Arduino code for a colour picker value.
@param block - Blockly block instance.
@returns Code string with order.

---

### colour_random

**Fichier:** `generators\arduino\blocks\colour.ts` (ligne 65)

**Signature:** `export function colour_random(`

**Description:**

Generates Arduino code for a random colour.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### colour_rgb

**Fichier:** `generators\arduino\blocks\colour.ts` (ligne 92)

**Signature:** `export function colour_rgb(`

**Description:**

Generates Arduino code for RGB colour composition.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---


## generators\arduino\blocks\logic.ts

### controls_if

**Fichier:** `generators\arduino\blocks\logic.ts` (ligne 35)

**Signature:** `export function controls_if(block: Block, generator: ArduinoGenerator)`

**Description:**

Generates Arduino code for if/else control blocks.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Generated code string.

---

### controls_switch

**Fichier:** `generators\arduino\blocks\logic.ts` (ligne 186)

**Signature:** `export function controls_switch(`

**Description:**

Generates Arduino code for switch/case blocks.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Generated code string.

---

### logic_boolean

**Fichier:** `generators\arduino\blocks\logic.ts` (ligne 163)

**Signature:** `export function logic_boolean(`

**Description:**

Generates Arduino code for boolean literals.
@param block - Blockly block instance.
@returns Generated code tuple.

---

### logic_compare

**Fichier:** `generators\arduino\blocks\logic.ts` (ligne 85)

**Signature:** `export function logic_compare(`

**Description:**

Generates Arduino code for comparison operations.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Generated code tuple.

---

### logic_negate

**Fichier:** `generators\arduino\blocks\logic.ts` (ligne 147)

**Signature:** `export function logic_negate(`

**Description:**

Generates Arduino code for boolean negation.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Generated code tuple.

---

### logic_null

**Fichier:** `generators\arduino\blocks\logic.ts` (ligne 175)

**Signature:** `export function logic_null(): [string, Order]`

**Description:**

Generates Arduino code for null literal.
@returns Generated code tuple.

---

### logic_operation

**Fichier:** `generators\arduino\blocks\logic.ts` (ligne 114)

**Signature:** `export function logic_operation(`

**Description:**

Generates Arduino code for boolean operations.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Generated code tuple.

---

### logic_ternary

**Fichier:** `generators\arduino\blocks\logic.ts` (ligne 231)

**Signature:** `export function logic_ternary(`

**Description:**

Generates Arduino code for ternary expressions.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Generated code tuple.

---


## generators\arduino\blocks\loops.ts

### controls_flow_statements

**Fichier:** `generators\arduino\blocks\loops.ts` (ligne 304)

**Signature:** `export function controls_flow_statements(`

**Description:**

Generates Arduino code for flow statements (break/continue).
@param block - Blockly block instance.
@returns Generated code string.

---

### controls_for

**Fichier:** `generators\arduino\blocks\loops.ts` (ligne 146)

**Signature:** `export function controls_for(`

**Description:**

Generates Arduino code for numeric for-loops.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Generated code string.

---

### controls_forEach

**Fichier:** `generators\arduino\blocks\loops.ts` (ligne 263)

**Signature:** `export function controls_forEach(`

**Description:**

Generates Arduino code for foreach loops.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Generated code string.

---

### controls_repeat_ext

**Fichier:** `generators\arduino\blocks\loops.ts` (ligne 87)

**Signature:** `export function controls_repeat_ext(`

**Description:**

Generates Arduino code for repeat loops with a count.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Generated code string.

---

### controls_whileUntil

**Fichier:** `generators\arduino\blocks\loops.ts` (ligne 122)

**Signature:** `export function controls_whileUntil(`

**Description:**

Generates Arduino code for while/until loops.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Generated code string.

---


## generators\arduino\blocks\math_helpers.ts

### addListHelpers

**Fichier:** `generators\arduino\blocks\math_helpers.ts` (ligne 54)

**Signature:** `export function addListHelpers(generator: ArduinoGenerator): void`

**Description:**

Injects list helper functions into the generator.
@param generator - Arduino generator instance.

---

### addMathInclude

**Fichier:** `generators\arduino\blocks\math_helpers.ts` (ligne 25)

**Signature:** `export function addMathInclude(generator: ArduinoGenerator): void`

**Description:**

Adds math include headers to the generator.
@param generator - Arduino generator instance.

---

### addPrimeHelper

**Fichier:** `generators\arduino\blocks\math_helpers.ts` (ligne 33)

**Signature:** `export function addPrimeHelper(generator: ArduinoGenerator): void`

**Description:**

Injects a prime-check helper into the generator.
@param generator - Arduino generator instance.

---


## generators\arduino\blocks\math.ts

### inout_angle_maths

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 81)

**Signature:** `export function inout_angle_maths(block: Block): [string, Order]`

**Description:**

Generates Arduino code for an angle literal.
@param block - Blockly block instance.
@returns Code string with order.

---

### math_arithmetic

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 92)

**Signature:** `export function math_arithmetic(`

**Description:**

Generates Arduino code for arithmetic expressions.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### math_atan2

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 454)

**Signature:** `export function math_atan2(`

**Description:**

Generates Arduino code for atan2.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### math_change

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 60)

**Signature:** `export function math_change(`

**Description:**

Generates Arduino code for a change-by statement.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Statement code string.

---

### math_constant

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 241)

**Signature:** `export function math_constant(`

**Description:**

Generates Arduino code for math constants.
@param block - Blockly block instance.
@returns Code string with order.

---

### math_constrain

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 412)

**Signature:** `export function math_constrain(`

**Description:**

Generates Arduino code for constrain(min, max).
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### math_interval

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 175)

**Signature:** `export function math_interval(`

**Description:**

Generates Arduino code for interval comparisons.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### math_modulo

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 393)

**Signature:** `export function math_modulo(`

**Description:**

Generates Arduino code for modulo operation.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### math_number

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 37)

**Signature:** `export function math_number(block: Block): [string, Order]`

**Description:**

Generates Arduino code for a numeric literal.
@param block - Blockly block instance.
@returns Code string with order.

---

### math_number_property

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 271)

**Signature:** `export function math_number_property(`

**Description:**

Generates Arduino code for numeric property checks.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### math_on_list

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 357)

**Signature:** `export function math_on_list(`

**Description:**

Generates Arduino code for list math operations.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### math_percent

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 48)

**Signature:** `export function math_percent(block: Block): [string, Order]`

**Description:**

Generates Arduino code for a percentage literal (0-100 mapped to 0-1).
@param block - Blockly block instance.
@returns Code string with order.

---

### math_random_float

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 443)

**Signature:** `export function math_random_float(): [string, Order]`

**Description:**

Generates Arduino code for a random float between 0 and 1.
@returns Code string with order.

---

### math_random_int

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 429)

**Signature:** `export function math_random_int(`

**Description:**

Generates Arduino code for a random integer in a range.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### math_round

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 331)

**Signature:** `export function math_round(`

**Description:**

Generates Arduino code for rounding operations.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### math_single

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 123)

**Signature:** `export function math_single(`

**Description:**

Generates Arduino code for single-operand math operations.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### math_trig

**Fichier:** `generators\arduino\blocks\math.ts` (ligne 216)

**Signature:** `export function math_trig(`

**Description:**

Generates Arduino code for trigonometric functions.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---


## generators\arduino\blocks\procedures.ts

### procedures_callnoreturn

**Fichier:** `generators\arduino\blocks\procedures.ts` (ligne 279)

**Signature:** `export function procedures_callnoreturn(`

**Description:**

Generates Arduino code for calling a procedure without return value.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Statement code string.

---

### procedures_callreturn

**Fichier:** `generators\arduino\blocks\procedures.ts` (ligne 257)

**Signature:** `export function procedures_callreturn(`

**Description:**

Generates Arduino code for calling a procedure with return value.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### procedures_defnoreturn

**Fichier:** `generators\arduino\blocks\procedures.ts` (ligne 229)

**Signature:** `export const procedures_defnoreturn = function (`

**Description:**

Generates Arduino code for a procedure without return value.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Function definition code.

---

### procedures_defreturn

**Fichier:** `generators\arduino\blocks\procedures.ts` (ligne 184)

**Signature:** `export function procedures_defreturn(`

**Description:**

Generates Arduino code for a procedure with return value.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Function definition code.

---

### procedures_ifreturn

**Fichier:** `generators\arduino\blocks\procedures.ts` (ligne 300)

**Signature:** `export function procedures_ifreturn(`

**Description:**

Generates Arduino code for if-return blocks.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Statement code string.

---


## generators\arduino\blocks\text_helpers.ts

### addTextHelpers

**Fichier:** `generators\arduino\blocks\text_helpers.ts` (ligne 33)

**Signature:** `export function addTextHelpers(generator: ArduinoGenerator): void`

**Description:**

Adds helper functions for text operations to the generator.
@param generator - Arduino generator instance.

---

### addTextInclude

**Fichier:** `generators\arduino\blocks\text_helpers.ts` (ligne 25)

**Signature:** `export function addTextInclude(generator: ArduinoGenerator): void`

**Description:**

Adds text-related includes to the generator.
@param generator - Arduino generator instance.

---


## generators\arduino\blocks\text.ts

### text

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 55)

**Signature:** `export function text(block: Block): [string, Order]`

**Description:**

Generates Arduino code for a quoted text literal.
@param block - Blockly block instance.
@returns Code string with order.

---

### text_append

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 140)

**Signature:** `export function text_append(`

**Description:**

Generates Arduino code to append text to a variable.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Statement code string.

---

### text_changeCase

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 288)

**Signature:** `export function text_changeCase(`

**Description:**

Generates Arduino code for text case changes.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### text_char

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 99)

**Signature:** `export function text_char(block: Block): [string, Order]`

**Description:**

Generates Arduino code for a single character literal.
@param block - Blockly block instance.
@returns Code string with order.

---

### text_charAt

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 205)

**Signature:** `export function text_charAt(`

**Description:**

Generates Arduino code to access a character at position.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### text_count

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 326)

**Signature:** `export function text_count(`

**Description:**

Generates Arduino code for counting substrings.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### text_date

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 88)

**Signature:** `export function text_date(block: Block): [string, Order]`

**Description:**

Generates Arduino code for a date literal.
@param block - Blockly block instance.
@returns Code string with order.

---

### text_getSubstring

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 246)

**Signature:** `export function text_getSubstring(`

**Description:**

Generates Arduino code for substring extraction.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### text_indexOf

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 187)

**Signature:** `export function text_indexOf(`

**Description:**

Generates Arduino code for substring index lookup.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### text_isEmpty

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 172)

**Signature:** `export function text_isEmpty(`

**Description:**

Generates Arduino code for is-empty checks.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### text_join

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 111)

**Signature:** `export function text_join(`

**Description:**

Generates Arduino code to concatenate text parts.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### text_length

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 157)

**Signature:** `export function text_length(`

**Description:**

Generates Arduino code for text length.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### text_multiline

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 77)

**Signature:** `export function text_multiline(block: Block): [string, Order]`

**Description:**

Generates Arduino code for a multiline text literal.
@param block - Blockly block instance.
@returns Code string with order.

---

### text_no_quote

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 66)

**Signature:** `export function text_no_quote(block: Block): [string, Order]`

**Description:**

Generates Arduino code for a raw text literal without quotes.
@param block - Blockly block instance.
@returns Code string with order.

---

### text_print

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 378)

**Signature:** `export function text_print(`

**Description:**

Generates Arduino code for printing text.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Statement code string.

---

### text_prompt_ext

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 394)

**Signature:** `export function text_prompt_ext(`

**Description:**

Generates Arduino code for prompt text (input).
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### text_replace

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 343)

**Signature:** `export function text_replace(`

**Description:**

Generates Arduino code for replacing substrings.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### text_reverse

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 362)

**Signature:** `export function text_reverse(`

**Description:**

Generates Arduino code for reversing text.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---

### text_trim

**Fichier:** `generators\arduino\blocks\text.ts` (ligne 310)

**Signature:** `export function text_trim(`

**Description:**

Generates Arduino code for trimming text.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Code string with order.

---


## generators\arduino\blocks\variables_typed.ts

### variables_const

**Fichier:** `generators\arduino\blocks\variables_typed.ts` (ligne 194)

**Signature:** `export const variables_const = function (`

**Description:**

Generates Arduino code for const variable declaration.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Generated code string.

---

### variables_define

**Fichier:** `generators\arduino\blocks\variables_typed.ts` (ligne 242)

**Signature:** `export const variables_define = function (`

**Description:**

Generates Arduino code for variable definition blocks.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Generated code string.

---

### variables_get_dynamic

**Fichier:** `generators\arduino\blocks\variables_typed.ts` (ligne 114)

**Signature:** `export const variables_get_dynamic = function (`

**Description:**

Generates Arduino code for variables_get_dynamic.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Generated code tuple.

---

### variables_local

**Fichier:** `generators\arduino\blocks\variables_typed.ts` (ligne 83)

**Signature:** `export const variables_local = function (`

**Description:**

Generates Arduino code for the local wrapper block.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Generated code tuple.

---

### variables_set_dynamic

**Fichier:** `generators\arduino\blocks\variables_typed.ts` (ligne 36)

**Signature:** `export const variables_set_dynamic = function (`

**Description:**

Generates Arduino code for variables_set_dynamic with typing.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Generated code string.

---

### variables_set_init

**Fichier:** `generators\arduino\blocks\variables_typed.ts` (ligne 221)

**Signature:** `export const variables_set_init = function (`

**Description:**

Generates Arduino code for typed variable initialization.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Generated code string.

---

### variables_set_type

**Fichier:** `generators\arduino\blocks\variables_typed.ts` (ligne 140)

**Signature:** `export const variables_set_type = function (`

**Description:**

Generates Arduino code for variable type assignment blocks.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Generated code string.

---


## generators\arduino\blocks\variables.ts

### variables_get

**Fichier:** `generators\arduino\blocks\variables.ts` (ligne 56)

**Signature:** `export const variables_get = function (`

**Description:**

Generates Arduino code for variables_get.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Generated code tuple.

---

### variables_set

**Fichier:** `generators\arduino\blocks\variables.ts` (ligne 34)

**Signature:** `export const variables_set = function (`

**Description:**

Generates Arduino code for variables_set.
@param block - Blockly block instance.
@param generator - Arduino generator instance.
@returns Generated code string.

---


## generators\arduino\configure_standard_blocks.ts

### configureStandardBlocks

**Fichier:** `generators\arduino\configure_standard_blocks.ts` (ligne 26)

**Signature:** `export function configureStandardBlocks(): void`

**Description:**

Applies typed variable behavior to standard Blockly blocks.

---


## generators\arduino\debug_variables_typed.ts

### debugTypedVariables

**Fichier:** `generators\arduino\debug_variables_typed.ts` (ligne 22)

**Signature:** `export function debugTypedVariables(): void`

**Description:**

Logs typed-variable related state for debugging.

---

### testGeneratorRegistration

**Fichier:** `generators\arduino\debug_variables_typed.ts` (ligne 58)

**Signature:** `export function testGeneratorRegistration(): void`

**Description:**

Validates that generator registrations are in place.

---


## generators\arduino\debug.ts

### debugLog

**Fichier:** `generators\arduino\debug.ts` (ligne 39)

**Signature:** `export function debugLog(...args: unknown[]): void`

**Description:**

Logs debug output when the debug flag is enabled.
@param args - Values to log.

---


## generators\arduino\diagnostic.ts

### diagnoseGeneratorIssues

**Fichier:** `generators\arduino\diagnostic.ts` (ligne 29)

**Signature:** `export function diagnoseGeneratorIssues(generator: ArduinoGenerator): void`

**Description:**

Runs diagnostics to validate generator wiring and block coverage.
@param generator - Arduino generator instance.

---

### resetAndReinitializeGenerator

**Fichier:** `generators\arduino\diagnostic.ts` (ligne 150)

**Signature:** `export function resetAndReinitializeGenerator(generator: ArduinoGenerator): void`

**Description:**

Resets generator state and reinitializes configuration.
@param generator - Arduino generator instance.

---

### testBasicGeneration

**Fichier:** `generators\arduino\diagnostic.ts` (ligne 101)

**Signature:** `export function testBasicGeneration(generator: ArduinoGenerator): void`

**Description:**

Runs a minimal generation pass to validate output.
@param generator - Arduino generator instance.

---


## generators\arduino\strict_connection_checker.ts

### registerStrictConnectionChecker

**Fichier:** `generators\arduino\strict_connection_checker.ts` (ligne 227)

**Signature:** `export function registerStrictConnectionChecker(workspace: Blockly.Workspace): void`

**Description:**

Installs the strict connection checker on a workspace.
@param workspace - Target workspace.

---

### StrictConnectionChecker

**Fichier:** `generators\arduino\strict_connection_checker.ts` (ligne 27)

**Signature:** `export class StrictConnectionChecker extends Blockly.ConnectionChecker`

**Description:**

Custom ConnectionChecker that extends Blockly's default ConnectionChecker
to use getBlockType() for source blocks, providing stricter type checking.

---


## generators\arduino\test_generator.ts

### testArduinoGenerator

**Fichier:** `generators\arduino\test_generator.ts` (ligne 28)

**Signature:** `export function testArduinoGenerator(): void`

**Description:**

Runs a quick sanity check against the Arduino generator.

---

### testCodeGeneration

**Fichier:** `generators\arduino\test_generator.ts` (ligne 79)

**Signature:** `export function testCodeGeneration(): void`

**Description:**

Runs a sample code generation path for diagnostics.

---


## generators\arduino\typed_variables_flyout.ts

### createTypedVariablesFlyout

**Fichier:** `generators\arduino\typed_variables_flyout.ts` (ligne 28)

**Signature:** `export function createTypedVariablesFlyout(`

**Description:**

Builds the typed variables flyout contents.
@param workspace - Workspace used to resolve variables.
@returns Array of flyout items.

---

### registerTypedVariablesCategory

**Fichier:** `generators\arduino\typed_variables_flyout.ts` (ligne 141)

**Signature:** `export function registerTypedVariablesCategory(`

**Description:**

Registers the typed variables toolbox category callback.
@param workspace - Workspace whose toolbox is being configured.

---


## generators\arduino\variable_utils.ts

### clearVariableType

**Fichier:** `generators\arduino\variable_utils.ts` (ligne 61)

**Signature:** `export function clearVariableType(`

**Description:**

Clears a variable's type metadata.
@param variable - Variable model to update.

---

### normalizeVariableType

**Fichier:** `generators\arduino\variable_utils.ts` (ligne 93)

**Signature:** `export function normalizeVariableType(`

**Description:**

Normalizes null/"null" types to empty string.
@param variable - Variable model to normalize.

---

### setVariableType

**Fichier:** `generators\arduino\variable_utils.ts` (ligne 31)

**Signature:** `export function setVariableType(`

**Description:**

Sets a variable's type metadata and updates the model.
@param variable - Variable model to update.
@param type - New type string.

---


## index.ts

### LazyMonacoEditor

**Fichier:** `index.ts` (ligne 198)

**Signature:** `export class LazyMonacoEditor`

**Description:**

Lazily initializes Monaco Editor to avoid heavy startup cost.

---

### registerContinuousToolboxComponents

**Fichier:** `index.ts` (ligne 515)

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

**Fichier:** `index.ts` (ligne 592)

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

### setPluginsInURL

**Fichier:** `tools.ts` (ligne 55)

**Signature:** `export const setPluginsInURL = (pluginName: string, pluginKey: string): void =>`

**Description:**

Updates plugin flags in the URL based on a checkbox state.
@param pluginName - DOM checkbox element id.
@param pluginKey - URL key representing the plugin.

---

