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
import { getCompatibleTypesForCheck, checkTypeCompatibility } from "../../generators/arduino/block_types_registry";
import { clearVariableType, setVariableType } from "../../generators/arduino/variable_utils";

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
 * Converts a variable type into Blockly connection checks.
 * @param type - Variable or inferred type.
 * @param strict - When true, int does not accept Number (so float blocks are rejected); for list "define" downward type checking.
 * @returns Array of compatible checks or null when not applicable.
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
    if (checks.has("int") || checks.has("float")) {
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
 * Configures a FieldVariable to accept any type.
 * @param field - FieldVariable instance to configure.
 */
export const configureTypedVariableField = (field: Blockly.FieldVariable): void => {
  const fieldWithTypes = field as unknown as {
    variableTypes?: string[] | null;
    defaultType?: string;
  };
  fieldWithTypes.variableTypes = null;
  fieldWithTypes.defaultType = "";
};

/**
 * Normalizes Blockly check types to µcBlockly variable types.
 * @param type - Blockly check type string.
 * @returns Normalized µcBlockly variable type.
 */
export const normalizeBlocklyTypeToVariableType = (type: string): string => {
  if (type === "Boolean") return "bool";
  if (type === "Number") return "int";
  if (type === "String") return "string";
  if (type === "Colour") return "string";
  if (type === "Array") return "array";
  return type;
};

/**
 * Determines whether a variable change event should be ignored.
 * @param block - Block receiving the event.
 * @param event - Blockly change event.
 * @returns True when the event should be skipped.
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
 * Infers a block's output type from its definition or connection.
 * @param block - Connected block or null.
 * @returns Normalized type or null when unknown.
 */
export const inferConnectedValueType = (block: Blockly.Block | null): string | null => {
  if (!block) {
    return null;
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
): boolean => {
  const uses = Blockly.Variables.getVariableUsesById(workspace, variableId);
  for (const block of uses) {
    if (
      block.type === "variables_set_dynamic" ||
      block.type === "variables_set"
    ) {
      const valueInput = block.getInput("VALUE");
      if (valueInput?.connection?.targetBlock()) {
        return true;
      }
    }
  }
  return false;
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
    if (typedVariable.__ucbConst) {
      block.setWarningText(getConstWarningText());
      if (valueInput?.connection?.targetBlock()) {
        valueInput.connection.disconnect();
      }
      return;
    }

    let varType = variable.getType();
    let isNoType = !varType || varType === "__NO_TYPE__";
    const connectedBlock = valueInput?.connection?.targetBlock() || null;
    const connectedType = inferConnectedValueType(connectedBlock);

    if (connectedType) {
      const canAutoRetype = !typedVariable.__ucbManualType;
      if (isNoType || (canAutoRetype && varType !== connectedType)) {
        setVariableType(variable, connectedType);
        typedVariable.__ucbManualType = false;
        varType = variable.getType();
        isNoType = !varType || varType === "__NO_TYPE__";
      }

      if (varType && !checkTypeCompatibility(connectedType, varType)) {
        block.setWarningText(getTypeMismatchWarningText(varType, connectedType));
        if (valueInput?.connection?.targetBlock()) {
          valueInput.connection.disconnect();
        }
        return;
      }
      if (valueInput?.connection) {
        valueInput.connection.setCheck(getBlocklyCompatibleChecks(variable.getType()));
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
        );
        if (!hasAssignments) {
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
