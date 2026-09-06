/**
 * @packageDocumentation
 * @module Arduino.StrictConnectionTypeUtils
 * @description Type-resolution helpers for StrictConnectionChecker.
 * @remarks
 * Pure functions extracted from the connection checker: source-block type
 * resolution, switch-case input detection, and type-compatibility wrapping.
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
import { checkTypeCompatibility as sharedCheckTypeCompatibility } from "./block_types_registry";
import { resolveMathNumberBlockType } from "../../categories/blockly/shared";

/** Semantic type for a block connecting to a switch-case (or int-only) input. */
export type SwitchCaseSourceType = "int" | "float" | "invalid" | null;

/** Output/input pair used by switch-case connection checks. */
export type OutputInputPair = {
  out: Blockly.Connection;
  inp: Blockly.Connection;
};

/**
 * Returns the input name for a connection on a block, or null if not found.
 * @param block - Blockly block instance.
 * @param connection - `connection` value.
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
 * @param inputConnection - `inputConnection` value.
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
 * @param sourceBlock - `sourceBlock` value.
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
 * @param sourceBlock - `sourceBlock` value.
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
 * @param sourceType - `sourceType` value.
 * @param targetType - `targetType` value.
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
