/**
 * @packageDocumentation
 * @module BlocklyCategories.SharedNumeric
 * @description Numeric and loop-bound typing helpers for Blockly category blocks.
 * @remarks
 * Extracted from shared helpers to keep loop/math typing utilities focused.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
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
import {
  checkTypeCompatibility,
  identifyMathNumberType,
} from "../../generators/arduino/block_types_registry";
import { normalizeBlocklyCheckToInternalType } from "../../generators/arduino/block_types";
import { resolveLocalVariableScope } from "../../generators/arduino/variable_scope";

/**
 * Normalizes Blockly check types to µcBlockly variable types.
 * Local copy to avoid a circular import with shared helpers.
 */
const normalizeBlocklyTypeToVariableType = (type: string): string => {
  const normalized = normalizeBlocklyCheckToInternalType(type);
  if (normalized) {
    return normalized;
  }
  if (type === "Array") {
    return "array";
  }
  return type;
};

/** True when the block is in setup/loop/global scope (not inside a procedure body). */
const isVariableUseOutsideProcedureBody = (block: Blockly.Block): boolean => {
  return resolveLocalVariableScope(block).kind !== "procedure";
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

const isNumericVariableType = (type: string | null | undefined): type is "int" | "float" =>
  type === "int" || type === "float" || type === "number";

/**
 * Returns true when the block lives on the main workspace (not flyout/toolbox).
 * @param block - Blockly block instance.
 * @returns True when the condition holds.
 */
export const isBlockOnMainWorkspace = (block: Blockly.Block): boolean => {
  const workspace = block.workspace as Blockly.WorkspaceSvg | null;
  if (!workspace) {
    return false;
  }
  return !workspace.isFlyout;
};

/**
 * Resolves math_number typing: int by default until on main workspace, then int/float from the NUM field via identifyMathNumberType.
 * @param block - Blockly block instance.
 * @returns Operation result.
 */
export const resolveMathNumberBlockType = (block: Blockly.Block): "int" | "float" => {
  if (!isBlockOnMainWorkspace(block)) {
    return "int";
  }
  return identifyMathNumberType(block.getFieldValue("NUM"));
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

/**
 * Returns true when two loop bound types can coexist (int/float may mix).
 * @param a - First operand.
 * @param b - Second operand.
 * @returns True when the condition holds.
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
 * @param types - `types` value.
 * @returns Operation result.
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
 * @param variableType - `variableType` value.
 * @param counterType - `counterType` value.
 * @returns True when the condition holds.
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
 * True when a variable type is missing / not yet resolved (allowed on math_change VAR).
 * @param type - Type identifier.
 * @returns True when the condition holds.
 */
export const isUnresolvedVariableType = (
  type: string | null | undefined,
): boolean =>
  !type ||
  type === "__NO_TYPE__" ||
  type === "null" ||
  type === "undefined";

/**
 * True when a type is a numeric scalar usable by math_change (int/float/long).
 * @param type - Type identifier.
 * @returns True when the condition holds.
 */
export const isNumericScalarVariableType = (
  type: string | null | undefined,
): boolean => {
  const normalized = normalizeBlocklyCheckToInternalType(type) ?? type;
  return (
    normalized === "int" ||
    normalized === "float" ||
    normalized === "long" ||
    normalized === "Number" ||
    normalized === "number"
  );
};

/**
 * Types accepted on math_change VAR: untyped or numeric scalars (not String/bool/…).
 * @param type - Type identifier.
 * @returns True when the condition holds.
 */
export const isMathChangeCompatibleVariableType = (
  type: string | null | undefined,
): boolean =>
  isUnresolvedVariableType(type) || isNumericScalarVariableType(type);

/**
 * Resolves the variable ID targeted by a math_change block (field or connected getter).
 * @param block - Blockly block instance.
 * @returns Result string.
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
 * @param changeBlock - `changeBlock` value.
 * @returns Operation result.
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
 * @param workspace - Blockly workspace.
 * @param variableId - Identifier.
 * @param contextBlock - `contextBlock` value.
 * @returns Operation result.
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
 * @param workspace - Blockly workspace.
 * @param variableId - Identifier.
 * @param contextBlock - `contextBlock` value.
 * @returns Operation result.
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
