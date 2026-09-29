/**
 * @packageDocumentation
 * @module Arduino.StrictConnectionArray
 * @description Array/list connection checks for StrictConnectionChecker.
 * @remarks
 * Extracted from the connection checker: Array_declare/create/modify/fix,
 * list-literal ADD inputs, and index (D*) inputs.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import * as Blockly from "blockly";
import {
  inferArrayElementTypeFromBlock,
  inferListVariableElementType,
} from "./block_types_registry";
import { isDeclareContainsTypeCompatible } from "./block_types";
import { resolveMathNumberBlockType } from "../../categories/blockly/shared";
import {
  getInputNameForConnection,
  normalizeDeclareSourceType,
  resolveOutputInputPair,
  resolveSourceBlockType,
  resolveSwitchCaseSourceType,
} from "./strict_connection_type_utils";

/**
 * Resolves choix/typeField for Array_declare contenu* or Array_create D* inputs.
 * @param inputConnection - Target input connection.
 * @returns Declare context or null when not an array-define value input.
 */
export function resolveArrayDefineInputContext(
  inputConnection: Blockly.Connection,
): { choix: string; typeField: string } | null {
  const targetBlock = inputConnection.getSourceBlock();
  if (!targetBlock) {
    return null;
  }
  const inputName = getInputNameForConnection(targetBlock, inputConnection);
  if (!inputName) {
    return null;
  }

  if (targetBlock.type === "Array_declare") {
    if (inputName !== "contenu" && inputName !== "contenu2") {
      return null;
    }
    return {
      choix: targetBlock.getFieldValue("choix"),
      typeField: targetBlock.getFieldValue("type") || "int",
    };
  }

  if (targetBlock.type === "Array_create") {
    const match = /^D(\d+)$/.exec(inputName);
    if (!match) {
      return null;
    }
    const index = parseInt(match[1], 10);
    const dim = parseInt(targetBlock.getFieldValue("dim") || "1", 10);
    if (index >= dim) {
      return null;
    }
    return {
      choix: targetBlock.getFieldValue("choix"),
      typeField: targetBlock.getFieldValue("type") || "int",
    };
  }

  return null;
}

/**
 * Value inputs of Array_modify / Array_fix: type imposed by the array VAR.
 * @param a - First connection.
 * @param b - Second connection.
 * @returns True/false when applicable, null when not this kind of input.
 */
export function checkArrayListAssignValueInputConnection(
  a: Blockly.Connection,
  b: Blockly.Connection,
): boolean | null {
  const pair = resolveOutputInputPair(a, b);
  if (!pair) {
    return null;
  }

  const targetBlock = pair.inp.getSourceBlock();
  if (
    !targetBlock ||
    (targetBlock.type !== "Array_modify" && targetBlock.type !== "Array_fix")
  ) {
    return null;
  }
  const inputName = getInputNameForConnection(targetBlock, pair.inp);
  if (inputName !== "value") {
    return null;
  }

  const varId = targetBlock.getFieldValue("VAR");
  const elementType = inferListVariableElementType(targetBlock.workspace, varId);
  if (!elementType || elementType === "__NO_TYPE__") {
    return null;
  }

  const sourceBlock = pair.out.getSourceBlock();
  if (!sourceBlock) {
    return false;
  }

  if (sourceBlock.type === "math_number") {
    const numType = resolveMathNumberBlockType(sourceBlock);
    return isDeclareContainsTypeCompatible(numType, elementType);
  }

  const rawSourceType = resolveSourceBlockType(sourceBlock);
  if (!rawSourceType || rawSourceType === "__NO_TYPE__" || rawSourceType === "undefined") {
    return false;
  }
  const sourceType = normalizeDeclareSourceType(rawSourceType);
  return isDeclareContainsTypeCompatible(sourceType, elementType);
}

/**
 * True when the input is a D* index on Array_fix / Array_getIndex_in_array.
 * @param inputConnection - Target input connection.
 * @returns True when the condition holds.
 */
export function isArrayIndexInput(inputConnection: Blockly.Connection): boolean {
  const targetBlock = inputConnection.getSourceBlock();
  if (!targetBlock) {
    return false;
  }
  if (
    targetBlock.type !== "Array_fix" &&
    targetBlock.type !== "Array_getIndex_in_array"
  ) {
    return false;
  }
  const inputName = getInputNameForConnection(targetBlock, inputConnection);
  return inputName !== null && /^D\d+$/.test(inputName);
}

/**
 * Index inputs require int values only.
 * @param a - First connection.
 * @param b - Second connection.
 * @returns True/false when applicable, null otherwise.
 */
export function checkArrayIndexInputConnection(
  a: Blockly.Connection,
  b: Blockly.Connection,
): boolean | null {
  const pair = resolveOutputInputPair(a, b);
  if (!pair || !isArrayIndexInput(pair.inp)) {
    return null;
  }
  const semanticType = resolveSwitchCaseSourceType(pair.out.getSourceBlock());
  return semanticType === "int";
}

/**
 * Value inputs of Array_declare / Array_create: type from the dropdown.
 * @param a - First connection.
 * @param b - Second connection.
 * @returns True/false when applicable, null otherwise.
 */
export function checkArrayDefineInputConnection(
  a: Blockly.Connection,
  b: Blockly.Connection,
): boolean | null {
  const pair = resolveOutputInputPair(a, b);
  if (!pair) {
    return null;
  }

  const defineContext = resolveArrayDefineInputContext(pair.inp);
  if (!defineContext) {
    return null;
  }

  const { choix, typeField } = defineContext;
  const sourceBlock = pair.out.getSourceBlock();
  if (!sourceBlock) {
    return false;
  }

  if (choix === "c1") {
    if (sourceBlock.type === "math_number") {
      return resolveMathNumberBlockType(sourceBlock) === "int";
    }
    const sourceType = resolveSourceBlockType(sourceBlock);
    return sourceType === "int";
  }

  if (
    sourceBlock.type === "Array_list_literal" ||
    sourceBlock.type === "Array_list_3"
  ) {
    const inferred = inferArrayElementTypeFromBlock(sourceBlock);
    if (!inferred || inferred === "__NO_TYPE__") {
      return true;
    }
    return isDeclareContainsTypeCompatible(inferred, typeField);
  }

  if (sourceBlock.type === "math_number") {
    const numType = resolveMathNumberBlockType(sourceBlock);
    return isDeclareContainsTypeCompatible(numType, typeField);
  }

  const rawSourceType = resolveSourceBlockType(sourceBlock);
  if (!rawSourceType || rawSourceType === "__NO_TYPE__" || rawSourceType === "undefined") {
    return false;
  }
  const sourceType = normalizeDeclareSourceType(rawSourceType);
  return isDeclareContainsTypeCompatible(sourceType, typeField);
}

/**
 * True when the input is an ADD* element slot on Array_with / list literals.
 * @param inputConnection - Target input connection.
 * @returns True when the condition holds.
 */
export function isArrayListElementAddInput(
  inputConnection: Blockly.Connection,
): boolean {
  const targetBlock = inputConnection.getSourceBlock();
  if (!targetBlock) {
    return false;
  }
  const inputName = getInputNameForConnection(targetBlock, inputConnection);
  if (!inputName?.startsWith("ADD")) {
    return false;
  }
  return (
    targetBlock.type === "Array_with" ||
    targetBlock.type === "Array_list_literal" ||
    targetBlock.type === "Array_list_3"
  );
}

/**
 * Declared element type from a parent Array_declare/create when choix is c2.
 * @param listBlock - List literal or Array_list_3 block.
 * @returns Declared type or null.
 */
export function getArrayListLiteralParentDeclareType(
  listBlock: Blockly.Block,
): string | null {
  const parent = listBlock.outputConnection?.targetBlock?.() ?? null;
  if (!parent || parent.getFieldValue("choix") !== "c2") {
    return null;
  }
  if (parent.type !== "Array_declare" && parent.type !== "Array_create") {
    return null;
  }
  const declaredType = parent.getFieldValue("type");
  if (!declaredType || declaredType === "__NO_TYPE__") {
    return null;
  }
  return declaredType;
}

/**
 * Element type key for ADD checks: inferred (Array_with) or parent declare type.
 * @param listBlock - List/with block owning the ADD input.
 * @returns Type key or null when unconstrained.
 */
export function resolveArrayListElementTypeKey(
  listBlock: Blockly.Block,
): string | null {
  if (listBlock.type === "Array_with") {
    const inferred = inferArrayElementTypeFromBlock(listBlock);
    return inferred && inferred !== "__NO_TYPE__" ? inferred : null;
  }
  return getArrayListLiteralParentDeclareType(listBlock);
}

/**
 * ADD inputs of Array_with / list literals (imposed or inferred element type).
 * @param a - First connection.
 * @param b - Second connection.
 * @returns True/false when applicable, null otherwise.
 */
export function checkArrayListLiteralAddInputConnection(
  a: Blockly.Connection,
  b: Blockly.Connection,
): boolean | null {
  const pair = resolveOutputInputPair(a, b);
  if (!pair || !isArrayListElementAddInput(pair.inp)) {
    return null;
  }

  const listBlock = pair.inp.getSourceBlock()!;
  const typeKey = resolveArrayListElementTypeKey(listBlock);
  if (!typeKey) {
    return null;
  }

  const sourceBlock = pair.out.getSourceBlock();
  if (!sourceBlock) {
    return false;
  }

  if (sourceBlock.type === "math_number") {
    const numType = resolveMathNumberBlockType(sourceBlock);
    return isDeclareContainsTypeCompatible(numType, typeKey);
  }

  const rawSourceType = resolveSourceBlockType(sourceBlock);
  if (!rawSourceType || rawSourceType === "__NO_TYPE__" || rawSourceType === "undefined") {
    return false;
  }
  return isDeclareContainsTypeCompatible(
    normalizeDeclareSourceType(rawSourceType),
    typeKey,
  );
}
