/**
 * @packageDocumentation
 * @module BlocklyCategories.TypeInference
 * @description Infer µcBlockly types from connected Blockly blocks.
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import * as Blockly from "blockly";
import { normalizeBlocklyCheckToInternalType } from "../../generators/arduino/block_types";
import { isArrayAssignmentValueBlock } from "../../generators/arduino/variable_scope";
import { LIST_VARIABLE_TYPE } from "../../generators/arduino/variable_utils";
import { bindInferConnectedValueType } from "./shared_procedures";

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
  const typedReturn = returnBlock as Blockly.Block & {
    getBlockType?: () => string | null;
  };
  const rawType = typedReturn.getBlockType ? typedReturn.getBlockType() : null;
  const normalized = rawType
    ? normalizeBlocklyTypeToVariableType(rawType)
    : null;
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
export const inferConnectedValueType = (
  block: Blockly.Block | null,
): string | null => {
  if (!block) {
    return null;
  }
  if (isArrayAssignmentValueBlock(block)) {
    return LIST_VARIABLE_TYPE;
  }
  const typedBlock = block as Blockly.Block & {
    getBlockType?: () => string | null;
  };
  const rawType = typedBlock.getBlockType ? typedBlock.getBlockType() : null;
  const normalized = rawType
    ? normalizeBlocklyTypeToVariableType(rawType)
    : null;
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

bindInferConnectedValueType(inferConnectedValueType);
