/**
 * @packageDocumentation
 * @module Arduino.StrictConnectionTypeUtils
 * @description Type-resolution helpers for StrictConnectionChecker.
 * @remarks
 * Pure functions extracted from the connection checker: source-block type
 * resolution, switch-case input detection, and type-compatibility wrapping.
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
import { checkTypeCompatibility as sharedCheckTypeCompatibility } from "./block_types_registry";
import { resolveMathNumberBlockType } from "../../categories/blockly/shared";

/** Blockly connection type constants (INPUT_VALUE=1, OUTPUT_VALUE=2). */
const INPUT_VALUE_TYPE = 1;
const OUTPUT_VALUE_TYPE = 2;

/** Semantic type for a block connecting to a switch-case (or int-only) input. */
export type SwitchCaseSourceType = "int" | "float" | "invalid" | null;

/** Output/input pair used by switch-case connection checks. */
export type OutputInputPair = {
  out: Blockly.Connection;
  inp: Blockly.Connection;
};

/**
 * Identifies which connection is OUTPUT_VALUE vs INPUT_VALUE.
 * @param a - First connection.
 * @param b - Second connection.
 * @returns Pair or null when either role is missing.
 */
export function resolveOutputInputPair(
  a: Blockly.Connection,
  b: Blockly.Connection,
): OutputInputPair | null {
  const aType = (a as { type: number }).type;
  const bType = (b as { type: number }).type;
  const out = aType === OUTPUT_VALUE_TYPE ? a : bType === OUTPUT_VALUE_TYPE ? b : null;
  const inp = aType === INPUT_VALUE_TYPE ? a : bType === INPUT_VALUE_TYPE ? b : null;
  if (!out || !inp) {
    return null;
  }
  return { out, inp };
}

/**
 * Maps Blockly display types (Boolean, String, Colour) to Arduino declare keys.
 * @param sourceType - Raw type from getBlockType or connection check.
 * @returns Normalized type key for declare/list compatibility.
 */
export function normalizeDeclareSourceType(sourceType: string): string {
  if (sourceType === "Boolean") {
    return "bool";
  }
  if (sourceType === "String") {
    return "string";
  }
  if (sourceType === "Colour" || sourceType === "color" || sourceType === "colour") {
    return "string";
  }
  return sourceType;
}

/**
 * Returns the input name for a connection on a block, or null if not found.
 * @param block - Blockly block instance.
 * @param connection - The `connection` argument.
 * @returns Result string.
 */
export function getInputNameForConnection(
  block: Blockly.Block,
  connection: Blockly.Connection,
): string | null {
  for (const input of block.inputList) {
    if (input.connection === connection) {
      return input.name;
    }
  }
  return null;
}

/**
 * True when the input connection is a `controls_switch` CASE* value input.
 * @param inputConnection - The `inputConnection` argument.
 * @returns True when the condition holds.
 */
export function isSwitchCaseInput(inputConnection: Blockly.Connection): boolean {
  const targetBlock = inputConnection.getSourceBlock();
  if (!targetBlock || targetBlock.type !== "controls_switch") {
    return false;
  }
  const inputName = getInputNameForConnection(targetBlock, inputConnection);
  return !!inputName && inputName.startsWith("CASE");
}

/**
 * Resolves the semantic type of a source (output) block via getBlockType() or the output connection check.
 * @param sourceBlock - The `sourceBlock` argument.
 * @returns Result string.
 */
export function resolveSourceBlockType(
  sourceBlock: Blockly.Block | null,
): string | null {
  if (!sourceBlock) {
    return null;
  }
  const typedBlock = sourceBlock as Blockly.Block & {
    getBlockType?: () => string | null;
  };
  if (typeof typedBlock.getBlockType === "function") {
    const blockType = typedBlock.getBlockType();
    if (blockType !== null && blockType !== undefined) {
      return blockType;
    }
  }
  const sourceCheck = sourceBlock.outputConnection?.getCheck();
  if (sourceCheck) {
    if (Array.isArray(sourceCheck) && sourceCheck.length > 0) {
      return sourceCheck[0] as string;
    }
    if (typeof sourceCheck === "string") {
      return sourceCheck;
    }
  }
  return null;
}

/**
 * Resolves semantic type for a block connecting to a switch case input.
 * @param sourceBlock - The `sourceBlock` argument.
 * @returns Operation result.
 */
export function resolveSwitchCaseSourceType(
  sourceBlock: Blockly.Block | null,
): SwitchCaseSourceType {
  if (!sourceBlock) {
    return null;
  }
  if (sourceBlock.type === "math_number") {
    return resolveMathNumberBlockType(sourceBlock);
  }
  const sourceType = resolveSourceBlockType(sourceBlock);
  if (sourceType === "int") {
    return "int";
  }
  if (sourceType === "float") {
    return "float";
  }
  if (sourceType === "__NO_TYPE__" || sourceType === "undefined") {
    return "invalid";
  }
  if (sourceType === "Number" || sourceType === "number") {
    return "int";
  }
  return null;
}

/**
 * Switch case inputs require int values. Blockly's default checker compares
 * output checks (e.g. math_number → "Number") against setCheck(["int"]) and
 * rejects before getBlockType() runs — handle that case explicitly.
 *
 * @param helpers - Provides resolveOutputInputPair to identify OUTPUT_VALUE vs INPUT_VALUE.
 */
export function checkSwitchCaseIntConnection(
  a: Blockly.Connection,
  b: Blockly.Connection,
  helpers: {
    resolveOutputInputPair: (
      a: Blockly.Connection,
      b: Blockly.Connection,
    ) => OutputInputPair | null;
  },
): boolean | null {
  const pair = helpers.resolveOutputInputPair(a, b);
  if (!pair || !isSwitchCaseInput(pair.inp)) {
    return null;
  }

  const semanticType = resolveSwitchCaseSourceType(pair.out.getSourceBlock());
  if (semanticType === "int") {
    return true;
  }
  if (semanticType === "float" || semanticType === "invalid") {
    return false;
  }
  return false;
}

/**
 * Checks if two types are compatible (exact match, null/undefined equality, or registry rules).
 * @param sourceType - The `sourceType` argument.
 * @param targetType - The `targetType` argument.
 * @returns True when the condition holds.
 */
export function checkTypeCompatibility(
  sourceType: string,
  targetType: string,
): boolean {
  if (sourceType === targetType) {
    return true;
  }
  if (
    sourceType === "null" ||
    sourceType === "undefined" ||
    targetType === "null" ||
    targetType === "undefined"
  ) {
    return sourceType === targetType;
  }
  return sharedCheckTypeCompatibility(sourceType, targetType);
}
