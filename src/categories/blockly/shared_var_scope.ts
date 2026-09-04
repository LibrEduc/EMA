/**
 * @packageDocumentation
 * @module BlocklyCategories.VarScope
 * @description Procedure vs global scope helpers for typed variables.
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Blockly from "blockly";
import { resolveLocalVariableScope } from "../../generators/arduino/variable_scope";

/** Procedure definition block surface used by scope / procedure helpers. */
export type ProcedureDefBlock = Blockly.Block & {
  argumentVarModels_?: Blockly.VariableModel[];
  argData_?: { argId: string; model: Blockly.VariableModel }[];
  getVarModels?: () => Blockly.VariableModel[];
};

/** True when the block is in setup/loop/global scope (not inside a procedure body). */
export const isVariableUseOutsideProcedureBody = (
  block: Blockly.Block,
): boolean => {
  return resolveLocalVariableScope(block).kind !== "procedure";
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
