/**
 * @packageDocumentation
 * @module BlocklyCategories.Procedures
 * @description Procedure call/def typing helpers (ARG checks, parameter types).
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Blockly from "blockly";
import { checkTypeCompatibility } from "../../generators/arduino/block_types_registry";
import { isArduinoScalarType } from "../../generators/arduino/block_types";
import { getTypeMismatchWarningText } from "./blockly_i18n";
import { getBlocklyCompatibleChecks } from "./shared_blockly_checks";
import { resolveMathNumberBlockType } from "./shared_numeric";
import {
  isVariableUsedOutsideProcedureBodies,
  type ProcedureDefBlock,
} from "./shared_var_scope";

type ProcedureCallBlock = Blockly.Block & {
  getProcedureCall?: () => string;
};

type InferConnectedValueTypeFn = (
  block: Blockly.Block | null,
) => string | null;

/** Bound from shared.ts after `inferConnectedValueType` exists (breaks import cycle). */
let inferConnectedValueTypeRef: InferConnectedValueTypeFn = () => null;

/**
 * Called once from shared.ts once type inference is defined.
 * @param fn - `fn` value.
 */
export function bindInferConnectedValueType(
  fn: InferConnectedValueTypeFn,
): void {
  inferConnectedValueTypeRef = fn;
}

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
 * @param workspace - Blockly workspace.
 * @param variableId - Identifier.
 * @param contextBlock - `contextBlock` value.
 * @returns Result string.
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

/**
 * Declared type of a procedure definition argument (reads `${argId}_TYPE` on procedures_def*).
 * @param defBlock - `defBlock` value.
 * @param argIndex - `argIndex` value.
 * @returns Result string.
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
 * @param sourceBlock - `sourceBlock` value.
 * @returns Result string.
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
  return inferConnectedValueTypeRef(sourceBlock);
};

/**
 * Applies setCheck on each ARG input from the procedure definition parameter types.
 * @param callBlock - `callBlock` value.
 */
export const syncProcedureCallArgInputChecks = (
  callBlock: Blockly.Block,
): void => {
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
    input.connection.setCheck(getBlocklyCompatibleChecks(argType));
  }
};

/**
 * Disconnects incompatible values on procedure call blocks and refreshes ARG input checks.
 * @param workspace - Blockly workspace.
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
