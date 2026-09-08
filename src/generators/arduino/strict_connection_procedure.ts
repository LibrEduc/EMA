/**
 * @packageDocumentation
 * @module Arduino.StrictConnectionProcedure
 * @description Procedure-call argument connection checks for StrictConnectionChecker.
 * @remarks
 * ARG* inputs on procedures_callreturn / procedures_callnoreturn must match
 * the definition argument types (int strict; float accepts int+float via isTypeCompatible).
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Blockly from "blockly";
import { isTypeCompatible } from "./block_types";
import { resolveMathNumberBlockType } from "../../categories/blockly/shared";
import {
  getInputNameForConnection,
  normalizeDeclareSourceType,
  resolveOutputInputPair,
} from "./strict_connection_type_utils";

/**
 * True when the input is ARG* on a procedure call block.
 * @param inputConnection - Target input connection.
 * @returns True when the condition holds.
 */
export function isProcedureCallArgInput(
  inputConnection: Blockly.Connection,
): boolean {
  const targetBlock = inputConnection.getSourceBlock();
  if (
    !targetBlock ||
    (targetBlock.type !== "procedures_callreturn" &&
      targetBlock.type !== "procedures_callnoreturn")
  ) {
    return false;
  }
  const inputName = getInputNameForConnection(targetBlock, inputConnection);
  return inputName !== null && /^ARG\d+$/.test(inputName);
}

/**
 * Resolves the semantic type of a value plugged into a procedure ARG input.
 * @param sourceBlock - Output block being connected.
 * @returns Normalized type or null when unresolved.
 */
export function resolveProcedureCallArgSourceType(
  sourceBlock: Blockly.Block | null,
): string | null {
  if (!sourceBlock) {
    return null;
  }
  if (sourceBlock.type === "math_number") {
    return resolveMathNumberBlockType(sourceBlock);
  }
  const typed = sourceBlock as Blockly.Block & { getBlockType?: () => string | null };
  const rawType = typed.getBlockType?.() ?? null;
  const normalized = normalizeDeclareSourceType(rawType || "");
  if (normalized && normalized !== "__NO_TYPE__") {
    return normalized;
  }
  const check = sourceBlock.outputConnection?.getCheck();
  const checkNorm = normalizeDeclareSourceType(
    Array.isArray(check) ? (check[0] ?? "") : (check ?? ""),
  );
  return checkNorm && checkNorm !== "__NO_TYPE__" ? checkNorm : null;
}

/**
 * Procedure call ARG* inputs: int accepts only int; float accepts int+float.
 * @param a - First connection.
 * @param b - Second connection.
 * @returns True/false when applicable, null otherwise.
 */
export function checkProcedureCallArgConnection(
  a: Blockly.Connection,
  b: Blockly.Connection,
): boolean | null {
  const pair = resolveOutputInputPair(a, b);
  if (!pair || !isProcedureCallArgInput(pair.inp)) {
    return null;
  }

  const callBlock = pair.inp.getSourceBlock();
  if (!callBlock?.workspace) {
    return null;
  }

  const inputName = getInputNameForConnection(callBlock, pair.inp);
  const argIndex = inputName ? parseInt(inputName.replace("ARG", ""), 10) : -1;
  if (argIndex < 0 || Number.isNaN(argIndex)) {
    return null;
  }

  type CallBlock = Blockly.Block & {
    getProcedureCall?: () => string;
    getVarModels?: () => Blockly.VariableModel[];
    argumentVarModels_?: Blockly.VariableModel[];
    argData_?: { argId: string; model: Blockly.VariableModel }[];
  };
  const typedCall = callBlock as CallBlock;
  const defName = typedCall.getProcedureCall?.();
  if (!defName) {
    return null;
  }

  const defBlock = Blockly.Procedures.getDefinition(
    defName,
    callBlock.workspace,
  ) as CallBlock | null;
  if (!defBlock) {
    return null;
  }

  const argModels =
    defBlock.getVarModels?.() || defBlock.argumentVarModels_ || [];
  const argDatum = defBlock.argData_?.[argIndex];
  let argType = argModels[argIndex]?.getType?.() || "int";
  if (argDatum?.argId) {
    const fromField = defBlock.getFieldValue(`${argDatum.argId}_TYPE`);
    if (fromField) {
      argType = fromField;
    }
  }

  const sourceType = resolveProcedureCallArgSourceType(pair.out.getSourceBlock());
  if (!sourceType || sourceType === "__NO_TYPE__") {
    return false;
  }

  return isTypeCompatible(sourceType, argType);
}
