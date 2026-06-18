/**
 * @packageDocumentation
 * @module BlocklyCategories.Shared
 * @description Shared helpers for Blockly category blocks.
 * @remarks
 * Utilities used by logic, math, text, and variables blocks.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2024 ASTUCE (Sébastien Canet microcompany)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Blockly from "blockly";
import { debugLog } from "../../generators/arduino/debug";
import { resolveLocalVariableScope, usesLocalVariableDeclaration, isArrayAssignmentValueBlock } from "../../generators/arduino/variable_scope";
import {
  checkTypeCompatibility,
  getCompatibleTypesForCheck,
  identifyMathNumberType,
} from "../../generators/arduino/block_types_registry";
import {
  ARDUINO_TYPE_KEYS,
  getInternalTypeForArduinoType,
  isArduinoScalarType,
  normalizeBlocklyCheckToInternalType,
  resolveArduinoScalarVariableType,
} from "../../generators/arduino/block_types";
import {
  clearVariableType,
  LIST_VARIABLE_TYPE,
  setVariableType,
  tagVariableAsList,
} from "../../generators/arduino/variable_utils";

export type VariableWithMutableType = Blockly.VariableModel & {
  setType?: (type: string) => void;
  type_?: string;
  __ucbManualType?: boolean;
  __ucbConst?: boolean;
  __ucbConstBlockId?: string;
};

/**
 * Retrieves a Blockly message by key.
 * @param key - Message key to look up.
 * @returns The localized message or the key if missing.
 */
export const getBlocklyMsg = (key: string): string => {
  const msg = (Blockly.Msg as Record<string, string> | undefined)?.[key];
  return msg || key;
};

/**
 * Retrieves a Blockly message or returns a fallback.
 * @param key - Message key to look up.
 * @param fallback - Fallback text when the key is missing.
 * @returns The localized message or the fallback value.
 */
export const getBlocklyMsgOr = (key: string, fallback: string): string => {
  const msg = getBlocklyMsg(key);
  return msg === key ? fallback : msg;
};

/**
 * Normalizes a string to a single character.
 * @param value - Input string value.
 * @returns First character or empty string for falsy input.
 */
export const validateSingleChar = (value: string): string => {
  if (!value) {
    return "";
  }
  return value.charAt(0);
};

/**
 * Returns the warning text for untyped variables.
 */
export const getUntypedWarningText = (): string => getBlocklyMsg("TYPED_VAR_UNTYPED_WARNING");

/**
 * Warning when a list block has no connected element values yet.
 */
export const getArrayListUntypedWarningText = (): string =>
  getBlocklyMsgOr(
    "ARRAY_LIST_UNTYPED_WARNING",
    "Untyped list. Connect values to determine the type.",
  );

/**
 * Builds the warning text for type mismatches.
 * @param varType - Variable's declared type.
 * @param connectedType - Type inferred from the connected block.
 * @returns Localized mismatch warning message.
 */
export const getTypeMismatchWarningText = (varType: string, connectedType: string): string =>
  getBlocklyMsg("TYPED_VAR_TYPE_MISMATCH")
    .replace("%1", varType)
    .replace("%2", connectedType);

/**
 * Returns the warning text for const assignments.
 */
export const getConstWarningText = (): string =>
  getBlocklyMsgOr("VARIABLES_CONST_WARNING", "const: cannot assign");

/**
 * Sets a variable's type and marks it as manually chosen (e.g. via dropdown).
 * @param variable - Variable model to update.
 * @param type - New type string.
 */
export const setVariableTypeAndMarkManual = (
  variable: Blockly.IVariableModel<Blockly.IVariableState>,
  type: string,
): void => {
  setVariableType(variable, type);
  const typed = variable as VariableWithMutableType;
  typed.__ucbManualType = true;
};

/**
 * Aligns a numeric variable with the type required by loops and change-by blocks.
 * Promotes int ↔ float according to aggregated usage; never overrides manual types.
 */
export const syncNumericVariableType = (
  variable: Blockly.IVariableModel<Blockly.IVariableState>,
  requiredType: "int" | "float" | null,
): void => {
  const typedVariable = variable as VariableWithMutableType;
  if (typedVariable.__ucbManualType || !requiredType) {
    return;
  }
  const varType = variable.getType();
  if (!varType || varType === "__NO_TYPE__") {
    setVariableType(variable, requiredType);
    return;
  }
  if (varType === requiredType) {
    return;
  }
  if (
    (varType === "int" && requiredType === "float") ||
    (varType === "float" && requiredType === "int")
  ) {
    setVariableType(variable, requiredType);
  }
};

/**
 * Converts a variable type into Blockly connection checks.
 * @param type - Variable or inferred type.
 * @param strict - When true, int does not accept Number (so float blocks are rejected); for list "define" downward type checking.
 * @returns Array of compatible checks or null when not applicable.
 * @remarks
 * Built on {@link getCompatibleTypesForCheck} from `block_types_registry`.
 * See `docs/TYPES_ET_COMPATIBILITES.md` for the mapping table (bool→Boolean, int→Number, etc.).
 */
export const getBlocklyCompatibleChecks = (
  type: string | null | undefined,
  strict?: boolean,
): string[] | null => {
  const compatibleTypes = getCompatibleTypesForCheck(type);
  if (!compatibleTypes) {
    return null;
  }
  const checks = new Set(compatibleTypes);
  if (checks.has("bool")) {
    checks.add("Boolean");
  }
  if (!strict) {
    if (checks.has("int") || checks.has("float") || checks.has("long")) {
      checks.add("Number");
    }
  } else {
    if (checks.has("float")) {
      checks.add("Number");
    }
  }
  if (checks.has("string")) {
    checks.add("String");
    checks.add("Colour");
  }
  if (checks.has("array")) {
    checks.add("Array");
  }
  return Array.from(checks);
};

/**
 * Checks Blockly pour les entrées des blocs Array_with / Array_declare / Array_create.
 * Pas de compatibilité char ↔ string.
 */
function buildArrayElementBlocklyChecks(
  internalType: string,
  options?: { includeArray?: boolean },
): string[] {
  const normalized =
    normalizeBlocklyCheckToInternalType(internalType) ?? internalType;
  let checks: string[];
  if (normalized === "char") {
    checks = ["char"];
  } else if (normalized === "string") {
    checks = ["string", "String", "Colour"];
  } else {
    const base = getBlocklyCompatibleChecks(normalized, true) ?? [normalized];
    checks = base.filter((check) => check !== "char");
    if (
      (normalized === "int" || normalized === "float" || normalized === "long") &&
      !checks.includes("Number")
    ) {
      checks.push("Number");
    }
  }
  if (options?.includeArray && !checks.includes("Array")) {
    checks.push("Array");
  }
  return checks;
}

/**
 * Checks Blockly pour l'entrée contenu d'Array_declare (size ou contains).
 * Le filtrage sémantique int/float/etc. est complété par StrictConnectionChecker.
 */
export const getDeclareContenuBlocklyChecks = (
  choix: string,
  arduinoTypeField: string,
): string[] => {
  if (choix === "c1") {
    return ["int", "Number"];
  }
  const internal = getInternalTypeForArduinoType(arduinoTypeField);
  return buildArrayElementBlocklyChecks(internal, { includeArray: true });
};

/**
 * Checks Blockly pour les éléments d'un littéral de liste ou de Array_with.
 */
export const getDeclareElementBlocklyChecks = (internalType: string): string[] => {
  return buildArrayElementBlocklyChecks(internalType);
};

/** Checks Blockly pour les entrées d'index de tableau (entiers uniquement). */
export const getArrayIndexBlocklyChecks = (): string[] => ["int", "Number"];

/**
 * Configures a FieldVariable for scalar variables (excludes list/array variables).
 * @param field - FieldVariable instance to configure.
 */
export const configureScalarVariableField = (field: Blockly.FieldVariable): void => {
  const fieldWithTypes = field as unknown as {
    variableTypes?: string[] | null;
    defaultType?: string;
  };
  fieldWithTypes.variableTypes = ["", ...ARDUINO_TYPE_KEYS];
  fieldWithTypes.defaultType = "";
};

/**
 * Configures a FieldVariable for list/array variables only.
 */
export const configureListVariableField = (field: Blockly.FieldVariable): void => {
  const fieldWithTypes = field as unknown as {
    variableTypes?: string[] | null;
    defaultType?: string;
  };
  fieldWithTypes.variableTypes = [LIST_VARIABLE_TYPE];
  fieldWithTypes.defaultType = LIST_VARIABLE_TYPE;
};

/**
 * @deprecated Alias of {@link configureScalarVariableField}.
 */
export const configureTypedVariableField = configureScalarVariableField;

/**
 * Ensures the variable selected on a list-category block has Blockly type `list`.
 */
export const syncListVariableFromField = (
  block: Blockly.Block,
  fieldName: string,
): void => {
  const variableId = block.getFieldValue(fieldName);
  if (!variableId || !block.workspace) {
    return;
  }
  const variable = block.workspace.getVariableMap().getVariableById(variableId);
  if (variable && variable.getType() !== LIST_VARIABLE_TYPE) {
    tagVariableAsList(variable);
  }
};

/**
 * @deprecated Use {@link syncListVariableFromField} with `"VAR"`.
 */
export const syncListVariableFromBlock = (block: Blockly.Block): void => {
  syncListVariableFromField(block, "VAR");
};

/**
 * Output check for variables_get when VAR is Blockly-only (`list`), not an Arduino type.
 */
export const getListVariableOutputCheck = (): string => "__NO_TYPE__";

/**
 * Normalizes Blockly check types to µcBlockly variable types.
 * @param type - Blockly check type string.
 * @returns Normalized µcBlockly variable type.
 */
export const normalizeBlocklyTypeToVariableType = (type: string): string => {
  const normalized = normalizeBlocklyCheckToInternalType(type);
  if (normalized) {
    return normalized;
  }
  if (type === "Array") {
    return "array";
  }
  return type;
};

type ProcedureDefBlock = Blockly.Block & {
  argumentVarModels_?: Blockly.VariableModel[];
  argData_?: { argId: string; model: Blockly.VariableModel }[];
  getVarModels?: () => Blockly.VariableModel[];
};

/** True when `block` is nested inside `ancestor` (statement stack). */
const isBlockDescendantOf = (
  block: Blockly.Block,
  ancestor: Blockly.Block,
): boolean => {
  let current: Blockly.Block | null = block;
  while (current) {
    if (current.id === ancestor.id) {
      return true;
    }
    current = current.getParent();
  }
  return false;
};

/**
 * Returns the type declared on a procedure parameter (menu on procedures_def*), if any.
 * @param contextBlock - When set, only matches if this block lies inside that procedure.
 */
export const getProcedureParameterDeclaredType = (
  workspace: Blockly.Workspace,
  variableId: string,
  contextBlock?: Blockly.Block,
): string | null => {
  for (const block of workspace.getAllBlocks(false)) {
    if (
      block.type !== "procedures_defreturn" &&
      block.type !== "procedures_defnoreturn"
    ) {
      continue;
    }
    const proc = block as ProcedureDefBlock;
    const models = proc.getVarModels?.() || proc.argumentVarModels_ || [];
    const argData = proc.argData_ || [];
    for (let i = 0; i < models.length; i++) {
      if (models[i]?.getId() !== variableId) {
        continue;
      }
      if (contextBlock && !isBlockDescendantOf(contextBlock, block)) {
        return null;
      }
      const argId = argData[i]?.argId;
      if (argId) {
        const fromField = block.getFieldValue(`${argId}_TYPE`);
        if (fromField && isArduinoScalarType(fromField)) {
          return fromField;
        }
      }
      if (!isVariableUsedOutsideProcedureBodies(workspace, variableId)) {
        const fromModel = models[i]?.getType?.();
        if (fromModel && isArduinoScalarType(fromModel)) {
          return fromModel;
        }
      }
      return "int";
    }
  }
  return null;
};

type ProcedureCallBlock = Blockly.Block & {
  getProcedureCall?: () => string;
};

/**
 * Declared type of a procedure definition argument (reads `${argId}_TYPE` on procedures_def*).
 */
export const getProcedureDefArgumentType = (
  defBlock: Blockly.Block,
  argIndex: number,
): string => {
  const proc = defBlock as ProcedureDefBlock;
  const argModels = proc.getVarModels?.() || proc.argumentVarModels_ || [];
  let argType = argModels[argIndex]?.getType?.() || "int";
  const argDatum = proc.argData_?.[argIndex];
  if (argDatum?.argId) {
    const fromField = defBlock.getFieldValue(`${argDatum.argId}_TYPE`);
    if (fromField && isArduinoScalarType(fromField)) {
      argType = fromField;
    }
  }
  if (!argType || argType === "__NO_TYPE__") {
    return "int";
  }
  return argType;
};

/**
 * Infers the source type of a value plugged into a procedure call argument.
 */
export const inferProcedureCallArgSourceType = (
  sourceBlock: Blockly.Block | null,
): string | null => {
  if (!sourceBlock) {
    return null;
  }
  if (sourceBlock.type === "math_number") {
    return resolveMathNumberBlockType(sourceBlock);
  }
  return inferConnectedValueType(sourceBlock);
};

/**
 * Applies setCheck on each ARG input from the procedure definition parameter types.
 */
export const syncProcedureCallArgInputChecks = (callBlock: Blockly.Block): void => {
  if (
    callBlock.type !== "procedures_callreturn" &&
    callBlock.type !== "procedures_callnoreturn"
  ) {
    return;
  }
  if (!callBlock.workspace) {
    return;
  }
  const callLike = callBlock as ProcedureCallBlock & {
    getProcedureModel?: () => Blockly.Procedures.IProcedureModel | null;
    isProcedureDef?: () => boolean;
  };
  let defBlock: Blockly.Block | null = null;
  const callModel = callLike.getProcedureModel?.();
  if (callModel) {
    for (const block of callBlock.workspace.getAllBlocks(false)) {
      const candidate = block as Blockly.Block & {
        isProcedureDef?: () => boolean;
        getProcedureModel?: () => Blockly.Procedures.IProcedureModel | null;
      };
      if (
        candidate.isProcedureDef?.() &&
        candidate.getProcedureModel?.()?.getId() === callModel.getId()
      ) {
        defBlock = block;
        break;
      }
    }
  }
  const defName =
    callLike.getProcedureCall?.() || callBlock.getFieldValue?.("NAME");
  if (!defBlock && defName) {
    defBlock = Blockly.Procedures.getDefinition(defName, callBlock.workspace);
  }
  if (!defBlock) {
    return;
  }
  const proc = defBlock as ProcedureDefBlock;
  const argModels = proc.getVarModels?.() || proc.argumentVarModels_ || [];
  for (let i = 0; i < argModels.length; i++) {
    const input = callBlock.getInput(`ARG${i}`);
    if (!input?.connection) {
      continue;
    }
    const argType = getProcedureDefArgumentType(defBlock, i);
    // Non-strict : autorise math_number (Number) ; le rejet float→int reste dans revalidateProcedureCallBlocks.
    input.connection.setCheck(getBlocklyCompatibleChecks(argType));
  }
};

/**
 * Disconnects incompatible values on procedure call blocks and refreshes ARG input checks.
 */
export const revalidateProcedureCallBlocks = (
  workspace: Blockly.Workspace,
): void => {
  for (const block of workspace.getAllBlocks(false)) {
    if (
      block.type !== "procedures_callreturn" &&
      block.type !== "procedures_callnoreturn"
    ) {
      continue;
    }
    syncProcedureCallArgInputChecks(block);
    const defName =
      (block as ProcedureCallBlock).getProcedureCall?.() ||
      block.getFieldValue?.("NAME");
    if (!defName || !block.workspace) {
      continue;
    }
    const defBlock = Blockly.Procedures.getDefinition(defName, block.workspace);
    if (!defBlock) {
      continue;
    }
    const proc = defBlock as ProcedureDefBlock;
    const argModels = proc.getVarModels?.() || proc.argumentVarModels_ || [];
    let warning: string | null = null;
    for (let i = 0; i < argModels.length; i++) {
      const input = block.getInput(`ARG${i}`);
      const connected = input?.connection?.targetBlock() || null;
      if (!connected) {
        continue;
      }
      const declaredType = getProcedureDefArgumentType(defBlock, i);
      const sourceType = inferProcedureCallArgSourceType(connected);
      if (sourceType && !checkTypeCompatibility(sourceType, declaredType)) {
        warning = getTypeMismatchWarningText(declaredType, sourceType);
        input?.connection?.disconnect();
      }
    }
    block.setWarningText(warning);
  }
};

/** Value inputs on board blocks that accept integers only. */
const BOARD_INT_ONLY_VALUE_INPUTS: Readonly<Record<string, readonly string[]>> = {
  board_base_inout_analog_write: ["PWM"],
  board_base_inout_digital_read_pin: ["PIN"],
  board_base_inout_map: ["NUM", "DMAX"],
  board_base_inout_tone: ["NUM"],
};

const isBoardIntInputChangeEvent = (event: Blockly.Events.Abstract): boolean =>
  event.type === Blockly.Events.BLOCK_CHANGE ||
  event.type === Blockly.Events.BLOCK_CREATE ||
  event.type === Blockly.Events.BLOCK_MOVE ||
  event.type === Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE;

/**
 * Enforces integer-only values on board block inputs (PWM, map, tone frequency).
 */
export const handleBoardIntInputBlockChange = (
  block: Blockly.Block,
  event: Blockly.Events.Abstract,
): void => {
  const inputNames = BOARD_INT_ONLY_VALUE_INPUTS[block.type];
  if (!inputNames || !isBoardIntInputChangeEvent(event)) {
    return;
  }
  const blockEvent = event as Blockly.Events.Abstract & { blockId?: string };
  if (
    event.type === Blockly.Events.BLOCK_CREATE &&
    blockEvent.blockId != null &&
    blockEvent.blockId !== block.id
  ) {
    return;
  }
  let warning: string | null = null;
  for (const inputName of inputNames) {
    const input = block.getInput(inputName);
    if (input?.connection) {
      input.connection.setCheck(getBlocklyCompatibleChecks("int"));
    }
    const connected = input?.connection?.targetBlock() || null;
    if (!connected) {
      continue;
    }
    const sourceType = inferProcedureCallArgSourceType(connected);
    if (sourceType && !checkTypeCompatibility(sourceType, "int")) {
      warning = getTypeMismatchWarningText("int", sourceType);
      input?.connection?.disconnect();
    }
  }
  block.setWarningText(warning);
};

/** Revalidates integer-only inputs on board blocks after workspace changes. */
export const revalidateBoardIntInputBlocks = (
  workspace: Blockly.Workspace,
  event: Blockly.Events.Abstract,
): void => {
  for (const block of workspace.getAllBlocks(false)) {
    if (BOARD_INT_ONLY_VALUE_INPUTS[block.type]) {
      handleBoardIntInputBlockChange(block, event);
    }
  }
};

/** True when the block is in setup/loop/global scope (not inside a procedure body). */
export const isVariableUseOutsideProcedureBody = (block: Blockly.Block): boolean => {
  return resolveLocalVariableScope(block).kind !== "procedure";
};

/** True when the variable appears in setup, loop, or global scope (not only as a procedure parameter). */
export const isVariableUsedOutsideProcedureBodies = (
  workspace: Blockly.Workspace,
  variableId: string,
): boolean => hasRealGlobalVariableUse(workspace, variableId);

/** True when the variable is declared as a parameter on any procedure definition. */
export const isVariableProcedureParameter = (
  workspace: Blockly.Workspace,
  variableId: string,
): boolean => {
  for (const block of workspace.getAllBlocks(false)) {
    if (
      block.type !== "procedures_defreturn" &&
      block.type !== "procedures_defnoreturn"
    ) {
      continue;
    }
    const proc = block as ProcedureDefBlock;
    const models = proc.getVarModels?.() || proc.argumentVarModels_ || [];
    if (models.some((model) => model?.getId() === variableId)) {
      return true;
    }
    const argData = proc.argData_ || [];
    if (argData.some((datum) => datum.model?.getId() === variableId)) {
      return true;
    }
  }
  return false;
};

/**
 * Procedure def header / call shell: binds a parameter name without a global read/write.
 */
export const isProcedureParameterBindingUse = (
  block: Blockly.Block,
  variableId: string,
): boolean => {
  if (
    block.type === "procedures_callreturn" ||
    block.type === "procedures_callnoreturn"
  ) {
    return true;
  }
  if (
    block.type === "procedures_defreturn" ||
    block.type === "procedures_defnoreturn"
  ) {
    const proc = block as ProcedureDefBlock;
    const models = proc.getVarModels?.() || proc.argumentVarModels_ || [];
    if (models.some((model) => model?.getId() === variableId)) {
      return true;
    }
    const argData = proc.argData_ || [];
    return argData.some((datum) => datum.model?.getId() === variableId);
  }
  return false;
};

/** True when the variable is genuinely read/written in setup, loop, or global scope. */
export const hasRealGlobalVariableUse = (
  workspace: Blockly.Workspace,
  variableId: string,
): boolean => {
  const uses = Blockly.Variables.getVariableUsesById(workspace, variableId);
  for (const block of uses) {
    if (isProcedureParameterBindingUse(block, variableId)) {
      continue;
    }
    if (!isVariableUseOutsideProcedureBody(block)) {
      continue;
    }
    return true;
  }
  return false;
};

/**
 * Returns true when a workspace variable must not receive a global declaration.
 * Procedure parameters are omitted unless they are also used as real globals.
 */
export const shouldOmitGlobalVariableDeclaration = (
  workspace: Blockly.Workspace,
  variableId: string,
  varName: string,
  procedureArgIds: Set<string>,
  normalizedProcedureArgNames: Set<string>,
): boolean => {
  const isParameter =
    procedureArgIds.has(variableId) ||
    isVariableProcedureParameter(workspace, variableId) ||
    normalizedProcedureArgNames.has(varName);
  if (!isParameter) {
    return false;
  }
  return !hasRealGlobalVariableUse(workspace, variableId);
};

const shouldIncludeUseForVariableTyping = (
  contextBlock: Blockly.Block,
  useBlock: Blockly.Block,
): boolean => {
  return (
    isVariableUseOutsideProcedureBody(contextBlock) ===
    isVariableUseOutsideProcedureBody(useBlock)
  );
};

const isVariableSetBlock = (block: Blockly.Block): boolean =>
  block.type === "variables_set_dynamic" || block.type === "variables_set";

/** True when a set block assigns a global variable (no `local` wrapper). */
export const isGlobalVariableAssignment = (block: Blockly.Block): boolean => {
  if (!isVariableSetBlock(block)) {
    return false;
  }
  return !usesLocalVariableDeclaration(block.getInputTargetBlock("VALUE"));
};

/** Infers the value type inside a `variables_local` wrapper (or null). */
export const inferLocalAssignmentValueType = (
  valueBlock: Blockly.Block | null,
): string | null => {
  if (!valueBlock) {
    return null;
  }
  if (valueBlock.type === "variables_local") {
    return inferConnectedValueType(valueBlock.getInputTargetBlock("VALUE"));
  }
  return inferConnectedValueType(valueBlock);
};

const inferTypeFromScopedAssignments = (
  workspace: Blockly.Workspace,
  variableId: string,
  contextBlock: Blockly.Block,
): string | null => {
  const contextIsLocal = usesLocalVariableDeclaration(
    contextBlock.getInputTargetBlock("VALUE"),
  );
  for (const block of workspace.getAllBlocks(false)) {
    if (!isVariableSetBlock(block)) {
      continue;
    }
    if (block.getFieldValue("VAR") !== variableId) {
      continue;
    }
    if (!shouldIncludeUseForVariableTyping(contextBlock, block)) {
      continue;
    }
    const valueBlock = block.getInputTargetBlock("VALUE");
    const blockIsLocal = usesLocalVariableDeclaration(valueBlock);
    if (blockIsLocal !== contextIsLocal) {
      continue;
    }
    const connectedType = blockIsLocal
      ? inferLocalAssignmentValueType(valueBlock)
      : inferConnectedValueType(valueBlock);
    if (connectedType) {
      return connectedType;
    }
  }
  return null;
};

/**
 * Resolves the effective type of a variable for a specific block (scope-aware).
 */
export const resolveVariableTypeForBlock = (
  block: Blockly.Block,
  variableId: string,
): string | null => {
  const paramType = getProcedureParameterDeclaredType(
    block.workspace,
    variableId,
    block,
  );
  if (paramType) {
    return resolveArduinoScalarVariableType(paramType);
  }
  if (usesLocalVariableDeclaration(block.getInputTargetBlock("VALUE"))) {
    return resolveArduinoScalarVariableType(
      inferLocalAssignmentValueType(block.getInputTargetBlock("VALUE")),
    );
  }
  const variable = block.workspace.getVariableMap().getVariableById(variableId);
  if (!variable) {
    return null;
  }
  const inferred = inferTypeFromScopedAssignments(
    block.workspace,
    variableId,
    block,
  );
  if (inferred) {
    return resolveArduinoScalarVariableType(inferred);
  }
  const modelType = variable.getType();
  if (!modelType || modelType === "__NO_TYPE__") {
    return null;
  }
  if (
    isVariableProcedureParameter(block.workspace, variableId) &&
    isVariableUseOutsideProcedureBody(block)
  ) {
    return null;
  }
  return resolveArduinoScalarVariableType(modelType);
};

/** Resolves global variable type from global assignments only (ignores `local` wrappers). */
export const resolveGlobalVariableType = (
  workspace: Blockly.Workspace,
  variableId: string,
): string | null => {
  let result: string | null = null;
  for (const block of workspace.getAllBlocks(false)) {
    if (!isGlobalVariableAssignment(block)) {
      continue;
    }
    if (block.getFieldValue("VAR") !== variableId) {
      continue;
    }
    if (!isVariableUseOutsideProcedureBody(block)) {
      continue;
    }
    const type = inferConnectedValueType(block.getInputTargetBlock("VALUE"));
    if (type) {
      result = resolveArduinoScalarVariableType(type);
    }
  }
  return result;
};

/** Re-runs onchange on variable get/set blocks referencing a variable. */
export const revalidateVariableBlocksForId = (
  workspace: Blockly.Workspace,
  variableId: string,
): void => {
  const uses = Blockly.Variables.getVariableUsesById(workspace, variableId);
  for (const block of uses) {
    if (
      block.type !== "variables_get" &&
      block.type !== "variables_get_dynamic" &&
      block.type !== "variables_set" &&
      block.type !== "variables_set_dynamic"
    ) {
      continue;
    }
    const onchange = Blockly.Blocks[block.type]?.onchange;
    if (typeof onchange === "function") {
      onchange.call(block, {
        type: Blockly.Events.BLOCK_MOVE,
        isUiEvent: false,
      } as Blockly.Events.Abstract);
    }
  }
};

/**
 * Determines whether a variable change event should be ignored.
 */
export const shouldSkipVariableChange = (
  block: Blockly.Block,
  event: Blockly.Events.Abstract,
): boolean => {
  if (event.isUiEvent) {
    return true;
  }
  const workspace = block.workspace as Blockly.WorkspaceSvg | null;
  if (workspace?.isDragging && workspace.isDragging()) {
    return true;
  }
  if (workspace?.isFlyout) {
    return true;
  }
  if (block.isInsertionMarker?.()) {
    return true;
  }
  return false;
};

/**
 * Returns true when the block lives on the main workspace (not flyout/toolbox).
 */
export const isBlockOnMainWorkspace = (block: Blockly.Block): boolean => {
  const workspace = block.workspace as Blockly.WorkspaceSvg | null;
  if (!workspace) {
    return false;
  }
  return !workspace.isFlyout;
};

/**
 * Resolves math_number typing: int by default until on main workspace,
 * then int/float from the NUM field via identifyMathNumberType.
 */
export const resolveMathNumberBlockType = (block: Blockly.Block): "int" | "float" => {
  if (!isBlockOnMainWorkspace(block)) {
    return "int";
  }
  return identifyMathNumberType(block.getFieldValue("NUM"));
};

/**
 * Retrieves the first check type from a check list.
 * @param check - Check string or list.
 * @returns First check type or null.
 */
const getFirstCheckType = (
  check: string | string[] | null,
): string | null => {
  if (!check) {
    return null;
  }
  if (Array.isArray(check)) {
    return check.length > 0 ? check[0] : null;
  }
  return check;
};

/**
 * Infers a procedure call return type from its definition.
 * @param block - Procedure call block.
 * @returns Normalized return type or null.
 */
const inferProcedureCallReturnType = (block: Blockly.Block): string | null => {
  if (block.type !== "procedures_callreturn" || !block.workspace) {
    return null;
  }
  const name = block.getFieldValue?.("NAME");
  if (!name) {
    return null;
  }
  const defBlock = Blockly.Procedures.getDefinition(name, block.workspace);
  const returnBlock = defBlock?.getInputTargetBlock?.("RETURN");
  if (!returnBlock) {
    return "int";
  }
  const typedReturn = returnBlock as Blockly.Block & { getBlockType?: () => string | null };
  const rawType = typedReturn.getBlockType ? typedReturn.getBlockType() : null;
  const normalized = rawType ? normalizeBlocklyTypeToVariableType(rawType) : null;
  if (normalized) {
    return normalized;
  }
  if (returnBlock.outputConnection) {
    const check = getFirstCheckType(returnBlock.outputConnection.getCheck());
    return check ? normalizeBlocklyTypeToVariableType(check) : null;
  }
  return "int";
};

/**
 * Infers the numeric type of a value block connected to a loop bound input.
 * @param block - Connected block or null.
 * @returns Normalized numeric type or null when unknown/non-numeric.
 */
export const inferNumericInputType = (block: Blockly.Block | null): string | null => {
  if (!block) {
    return null;
  }
  if (block.type === "variables_get" || block.type === "variables_get_dynamic") {
    const variableId = block.getFieldValue("VAR");
    const rawType = variableId
      ? block.workspace?.getVariableMap().getVariableById(variableId)?.getType() || null
      : null;
    return rawType ? normalizeBlocklyTypeToVariableType(rawType) : null;
  }
  if (block.type === "math_number") {
    const typed = block as Blockly.Block & { getBlockType?: () => string | null };
    const typedType = typed.getBlockType?.() || null;
    if (typedType === "int" || typedType === "float") {
      return typedType;
    }
    return resolveMathNumberBlockType(block);
  }
  const typed = block as Blockly.Block & { getBlockType?: () => string | null };
  const typedType = typed.getBlockType?.() || null;
  if (typedType) {
    return normalizeBlocklyTypeToVariableType(typedType);
  }
  const check = block.outputConnection?.getCheck() ?? null;
  const firstCheck = getFirstCheckType(check);
  return firstCheck ? normalizeBlocklyTypeToVariableType(firstCheck) : null;
};

const isNumericVariableType = (type: string | null | undefined): type is "int" | "float" =>
  type === "int" || type === "float" || type === "number";

/**
 * Returns true when two loop bound types can coexist (int/float may mix).
 */
export const areLoopBoundTypesCompatible = (
  a: string | null | undefined,
  b: string | null | undefined,
): boolean => {
  if (!a || !b) {
    return false;
  }
  const na = normalizeBlocklyTypeToVariableType(a);
  const nb = normalizeBlocklyTypeToVariableType(b);
  return isNumericVariableType(na) && isNumericVariableType(nb);
};

/**
 * Unifies loop bound types; any float bound promotes the counter to float.
 */
export const unifyLoopBoundTypes = (
  types: Array<string | null | undefined>,
): "int" | "float" | null => {
  let hasNumeric = false;
  let hasFloat = false;
  for (const raw of types) {
    if (!raw) {
      continue;
    }
    const normalized = normalizeBlocklyTypeToVariableType(raw);
    if (!isNumericVariableType(normalized)) {
      return null;
    }
    hasNumeric = true;
    if (normalized === "float") {
      hasFloat = true;
    }
  }
  if (!hasNumeric) {
    return null;
  }
  return hasFloat ? "float" : "int";
};

/**
 * Checks whether a variable type can serve as a loop counter of the given type.
 */
export const isLoopCounterVariableCompatible = (
  variableType: string | null | undefined,
  counterType: "int" | "float",
): boolean => checkTypeCompatibility(variableType, counterType);

/**
 * Infers int/float for the counter variable of a controls_for block from its bounds.
 * @param forBlock - controls_for block instance.
 * @returns Counter type or null when bounds are not fully numeric.
 */
export const inferLoopCounterTypeFromForBlock = (
  forBlock: Blockly.Block,
): "int" | "float" | null => {
  const inputNames = ["FROM", "TO", "BY"] as const;
  const boundTypes = inputNames.map((name) =>
    inferNumericInputType(forBlock.getInputTargetBlock(name)),
  );
  let hasFloatLiteral = false;
  for (const name of inputNames) {
    const inputBlock = forBlock.getInputTargetBlock(name);
    if (
      inputBlock?.type === "math_number" &&
      !Number.isInteger(Number(inputBlock.getFieldValue("NUM")))
    ) {
      hasFloatLiteral = true;
      break;
    }
  }
  const unified = unifyLoopBoundTypes(boundTypes);
  if (!unified) {
    return null;
  }
  return hasFloatLiteral || unified === "float" ? "float" : "int";
};

/**
 * Infers the loop-counter type implied by controls_for blocks using a variable.
 * @param workspace - Workspace containing the variable uses.
 * @param variableId - Target variable ID.
 * @returns int, float, or null when not used as a numeric loop counter.
 */
export const inferLoopCounterType = (
  workspace: Blockly.Workspace,
  variableId: string,
  contextBlock?: Blockly.Block,
): "int" | "float" | null => {
  const uses = Blockly.Variables.getVariableUsesById(workspace, variableId);
  let result: "int" | "float" | null = null;
  for (const block of uses) {
    if (block.type !== "controls_for" || block.getFieldValue("VAR") !== variableId) {
      continue;
    }
    if (contextBlock && !shouldIncludeUseForVariableTyping(contextBlock, block)) {
      continue;
    }
    const loopType = inferLoopCounterTypeFromForBlock(block);
    if (loopType === "float") {
      return "float";
    }
    if (loopType === "int") {
      result = "int";
    }
  }
  return result;
};

/**
 * Resolves the variable ID targeted by a math_change block (field or connected getter).
 */
export const resolveMathChangeVariableId = (block: Blockly.Block): string | null => {
  const targetBlock = block.getInputTargetBlock("VAR") ?? block.getInputTargetBlock("NAME");
  if (
    targetBlock &&
    (targetBlock.type === "variables_get" || targetBlock.type === "variables_get_dynamic")
  ) {
    return targetBlock.getFieldValue("VAR") || null;
  }
  if (block.getField("VAR")) {
    return block.getFieldValue("VAR") || null;
  }
  return null;
};

/**
 * Infers int/float required by a math_change block from its DELTA input.
 */
export const inferChangeByRequiredTypeFromBlock = (
  changeBlock: Blockly.Block,
): "int" | "float" | null => {
  const deltaType = inferNumericInputType(changeBlock.getInputTargetBlock("DELTA"));
  if (!deltaType || (deltaType !== "int" && deltaType !== "float" && deltaType !== "number")) {
    return null;
  }
  return deltaType === "float" ? "float" : "int";
};

/**
 * Infers int/float required by all math_change blocks using a variable.
 */
export const inferChangeByRequiredType = (
  workspace: Blockly.Workspace,
  variableId: string,
  contextBlock?: Blockly.Block,
): "int" | "float" | null => {
  const uses = Blockly.Variables.getVariableUsesById(workspace, variableId);
  let result: "int" | "float" | null = null;
  for (const block of uses) {
    if (block.type !== "math_change") {
      continue;
    }
    if (contextBlock && !shouldIncludeUseForVariableTyping(contextBlock, block)) {
      continue;
    }
    const blockVarId = resolveMathChangeVariableId(block);
    if (blockVarId !== variableId) {
      continue;
    }
    const changeType = inferChangeByRequiredTypeFromBlock(block);
    if (changeType === "float") {
      return "float";
    }
    if (changeType === "int") {
      result = "int";
    }
  }
  return result;
};

/**
 * Aggregates int/float required by loop counters and change-by blocks for a variable.
 */
export const inferRequiredNumericTypeForVariable = (
  workspace: Blockly.Workspace,
  variableId: string,
  contextBlock?: Blockly.Block,
): "int" | "float" | null => {
  const loopType = inferLoopCounterType(workspace, variableId, contextBlock);
  if (loopType === "float") {
    return "float";
  }
  const changeType = inferChangeByRequiredType(workspace, variableId, contextBlock);
  if (changeType === "float") {
    return "float";
  }
  return loopType ?? changeType;
};

/**
 * Infers a block's output type from its definition or connection.
 * @param block - Connected block or null.
 * @returns Normalized type or null when unknown.
 */
export const inferConnectedValueType = (block: Blockly.Block | null): string | null => {
  if (!block) {
    return null;
  }
  if (isArrayAssignmentValueBlock(block)) {
    return LIST_VARIABLE_TYPE;
  }
  const typedBlock = block as Blockly.Block & { getBlockType?: () => string | null };
  const rawType = typedBlock.getBlockType ? typedBlock.getBlockType() : null;
  const normalized = rawType ? normalizeBlocklyTypeToVariableType(rawType) : null;
  if (
    normalized &&
    normalized !== "__NO_TYPE__" &&
    normalized !== "null" &&
    normalized !== "undefined"
  ) {
    return normalized;
  }
  const procType = inferProcedureCallReturnType(block);
  if (procType) {
    return procType;
  }
  if (block.outputConnection) {
    const check = getFirstCheckType(block.outputConnection.getCheck());
    if (check) {
      return normalizeBlocklyTypeToVariableType(check);
    }
  }
  return null;
};

/**
 * Checks whether a variable has any connected assignment blocks.
 * Uses getVariableUsesById to avoid iterating all blocks.
 * @param workspace - Workspace to search.
 * @param variableId - Target variable ID.
 * @returns True when at least one assignment has a connected value.
 */
export const hasConnectedAssignmentForVariable = (
  workspace: Blockly.Workspace,
  variableId: string,
  contextBlock?: Blockly.Block,
): boolean => {
  const uses = Blockly.Variables.getVariableUsesById(workspace, variableId);
  for (const block of uses) {
    if (
      block.type === "variables_set_dynamic" ||
      block.type === "variables_set"
    ) {
      if (contextBlock && !shouldIncludeUseForVariableTyping(contextBlock, block)) {
        continue;
      }
      if (contextBlock) {
        const contextIsLocal = usesLocalVariableDeclaration(
          contextBlock.getInputTargetBlock("VALUE"),
        );
        const blockIsLocal = usesLocalVariableDeclaration(
          block.getInputTargetBlock("VALUE"),
        );
        if (contextIsLocal !== blockIsLocal) {
          continue;
        }
      }
      const valueInput = block.getInput("VALUE");
      if (valueInput?.connection?.targetBlock()) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Re-runs onchange on `variables_local` wrappers so their output type tracks inner values.
 */
export const revalidateLocalWrapperBlocks = (
  workspace: Blockly.Workspace,
  event: Blockly.Events.Abstract,
): void => {
  for (const block of workspace.getAllBlocks(false)) {
    if (block.type !== "variables_local") {
      continue;
    }
    const onchange = Blockly.Blocks.variables_local?.onchange;
    if (typeof onchange === "function") {
      onchange.call(block, event);
    }
  }
};

/**
 * Re-runs onchange handlers for blocks whose variable typing depends on child values
 * (e.g. math_change when a math_number field is edited).
 */
export const revalidateTypedNumericBlocks = (
  workspace: Blockly.Workspace,
  event: Blockly.Events.Abstract,
): void => {
  for (const blockType of ["math_change", "controls_for"] as const) {
    for (const block of workspace.getAllBlocks(false)) {
      if (block.type !== blockType) {
        continue;
      }
      const onchange = Blockly.Blocks[blockType]?.onchange;
      if (typeof onchange === "function") {
        onchange.call(block, event);
      }
    }
  }
};

/**
 * Handles variable assignment changes to enforce typing rules.
 * @param block - Variable set block.
 * @param event - Blockly change event.
 * @param label - Block label for warnings.
 */
export const handleVariablesSetChange = (
  block: Blockly.Block,
  event: Blockly.Events.Abstract,
  label: string,
): void => {
  if (
    event.type !== Blockly.Events.BLOCK_CHANGE &&
    event.type !== Blockly.Events.BLOCK_CREATE &&
    event.type !== Blockly.Events.BLOCK_MOVE &&
    event.type !== Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE &&
    event.type !== Blockly.Events.VAR_DELETE &&
    event.type !== "var_type_change"
  ) {
    return;
  }
  if (shouldSkipVariableChange(block, event)) {
    return;
  }
  const blockEvent = event as Blockly.Events.Abstract & { blockId?: string };
  if (
    event.type === Blockly.Events.BLOCK_CREATE &&
    blockEvent.blockId != null &&
    blockEvent.blockId !== block.id
  ) {
    return;
  }
  try {
    const variableId = block.getFieldValue("VAR");
    if (!variableId || !block.workspace) {
      return;
    }
    const variable = block.workspace.getVariableMap().getVariableById(variableId);
    if (!variable) {
      return;
    }
    const typedVariable = variable as VariableWithMutableType;
    const valueInput = block.getInput("VALUE");
    const connectedBlock = valueInput?.connection?.targetBlock() || null;

    if (usesLocalVariableDeclaration(connectedBlock)) {
      const innerType = inferLocalAssignmentValueType(connectedBlock);
      if (valueInput?.connection) {
        valueInput.connection.setCheck(null);
      }
      block.setWarningText(innerType ? null : getUntypedWarningText());
      return;
    }

    if (isArrayAssignmentValueBlock(connectedBlock)) {
      tagVariableAsList(variable);
      typedVariable.__ucbManualType = false;
      if (valueInput?.connection) {
        valueInput.connection.setCheck(["Array"]);
      }
      block.setWarningText(null);
      revalidateVariableBlocksForId(block.workspace, variableId);
      return;
    }

    const declaredParamType = getProcedureParameterDeclaredType(
      block.workspace,
      variableId,
      block,
    );
    if (declaredParamType) {
      const usedGlobally = isVariableUsedOutsideProcedureBodies(
        block.workspace,
        variableId,
      );
      if (!usedGlobally) {
        typedVariable.__ucbManualType = true;
        if (variable.getType() !== declaredParamType) {
          setVariableType(variable, declaredParamType);
        }
      }
      const connectedType = inferConnectedValueType(
        valueInput?.connection?.targetBlock() || null,
      );
      if (connectedType) {
        if (!checkTypeCompatibility(connectedType, declaredParamType)) {
          block.setWarningText(
            getTypeMismatchWarningText(declaredParamType, connectedType),
          );
          if (valueInput?.connection?.targetBlock()) {
            valueInput.connection.disconnect();
          }
          return;
        }
        block.setWarningText(null);
      } else {
        block.setWarningText(null);
      }
      if (valueInput?.connection) {
        // Non-strict : autorise math_number (Number) ; le rejet float→int reste dans onchange.
        valueInput.connection.setCheck(getBlocklyCompatibleChecks(declaredParamType));
      }
      return;
    }

    if (typedVariable.__ucbConst) {
      block.setWarningText(getConstWarningText());
      if (valueInput?.connection?.targetBlock()) {
        valueInput.connection.disconnect();
      }
      return;
    }

    let varType = resolveVariableTypeForBlock(block, variableId);
    let isNoType = !varType || varType === "__NO_TYPE__";
    const connectedType = inferConnectedValueType(connectedBlock);
    const requiredNumericType = inferRequiredNumericTypeForVariable(
      block.workspace,
      variableId,
      block,
    );

    if (varType === LIST_VARIABLE_TYPE) {
      if (connectedType) {
        block.setWarningText(
          getTypeMismatchWarningText(LIST_VARIABLE_TYPE, connectedType),
        );
        if (valueInput?.connection?.targetBlock()) {
          valueInput.connection.disconnect();
        }
        return;
      }
      if (valueInput?.connection) {
        valueInput.connection.setCheck(null);
      }
      block.setWarningText(null);
      return;
    }

    if (connectedType) {
      const canAutoRetype =
        !typedVariable.__ucbManualType &&
        !requiredNumericType &&
        varType !== LIST_VARIABLE_TYPE;
      if (requiredNumericType) {
        syncNumericVariableType(variable, requiredNumericType);
        varType = variable.getType();
        isNoType = !varType || varType === "__NO_TYPE__";
      } else if (isNoType || (canAutoRetype && varType !== connectedType)) {
        if (
          !isVariableProcedureParameter(block.workspace, variableId) ||
          isVariableUseOutsideProcedureBody(block)
        ) {
          setVariableType(variable, connectedType);
          typedVariable.__ucbManualType = false;
          varType = connectedType;
          isNoType = false;
        }
      }

      const typeForCheck = requiredNumericType ?? connectedType ?? varType;
      if (typeForCheck && !checkTypeCompatibility(connectedType, typeForCheck)) {
        block.setWarningText(getTypeMismatchWarningText(typeForCheck, connectedType));
        if (valueInput?.connection?.targetBlock()) {
          valueInput.connection.disconnect();
        }
        return;
      }
      if (valueInput?.connection) {
        valueInput.connection.setCheck(
          getBlocklyCompatibleChecks(varType ?? variable.getType()),
        );
      }
    } else if (valueInput?.connection) {
      valueInput.connection.setCheck(getBlocklyCompatibleChecks(varType));
    }

    if (!connectedType) {
      if (
        !typedVariable.__ucbManualType &&
        varType &&
        event.type !== Blockly.Events.BLOCK_CREATE &&
        event.type !== "var_type_change"
      ) {
        const hasAssignments = hasConnectedAssignmentForVariable(
          block.workspace,
          variableId,
          block,
        );
        if (!hasAssignments && varType !== LIST_VARIABLE_TYPE) {
          clearVariableType(variable);
        }
      }
    }
    if (isNoType) {
      block.setWarningText(getUntypedWarningText());
    } else {
      block.setWarningText(null);
    }
  } catch (error) {
    debugLog(`Error in ${label} onchange:`, error);
    block.setWarningText(null);
  }
};
