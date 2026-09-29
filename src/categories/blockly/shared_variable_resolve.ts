/**
 * @packageDocumentation
 * @module BlocklyCategories.VariableResolve
 * @description Scope-aware resolution of variable types for blocks.
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import * as Blockly from "blockly";
import { registerVariableTypeForBlockResolver } from "../../generators/arduino/block_types_registry";
import { resolveArduinoScalarVariableType } from "../../generators/arduino/block_types";
import { usesLocalVariableDeclaration } from "../../generators/arduino/variable_scope";
import { getProcedureParameterDeclaredType } from "./shared_procedures";
import { inferConnectedValueType } from "./shared_type_inference";
import {
  isVariableProcedureParameter,
  isVariableUseOutsideProcedureBody,
} from "./shared_var_scope";

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

/**
 * True when a set block assigns a global variable (no `local` wrapper).
 * @param block - Blockly block instance.
 * @returns True when the condition holds.
 */
export const isGlobalVariableAssignment = (block: Blockly.Block): boolean => {
  if (!isVariableSetBlock(block)) {
    return false;
  }
  return !usesLocalVariableDeclaration(block.getInputTargetBlock("VALUE"));
};

/**
 * Infers the value type inside a `variables_local` wrapper (or null).
 * @param valueBlock - The `valueBlock` argument.
 * @returns Result string.
 */
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
 * @param block - Blockly block instance.
 * @param variableId - Identifier.
 * @returns Result string.
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

// Wire registry `variableLookup` without importing shared from the registry.
registerVariableTypeForBlockResolver(resolveVariableTypeForBlock);

/**
 * Resolves global variable type from global assignments only (ignores `local` wrappers).
 * @param workspace - Blockly workspace.
 * @param variableId - Identifier.
 * @returns Result string.
 */
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

export { shouldIncludeUseForVariableTyping };
