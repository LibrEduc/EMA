/**
 * @packageDocumentation
 * @module BlocklyCategories.BoardInt
 * @description Integer-only value-input enforcement for board (and extension) blocks.
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Blockly from "blockly";
import { checkTypeCompatibility } from "../../generators/arduino/block_types_registry";
import { normalizeBlocklyCheckToInternalType } from "../../generators/arduino/block_types";
import { getTypeMismatchWarningText } from "./blockly_i18n";
import { getBlocklyCompatibleChecks } from "./shared_blockly_checks";
import { resolveMathNumberBlockType } from "./shared_numeric";

/** Value inputs on board blocks that accept integers only. */
const BOARD_INT_ONLY_VALUE_INPUTS: Readonly<Record<string, readonly string[]>> = {
  board_base_inout_analog_write: ["PWM"],
  board_base_inout_digital_read_pin: ["PIN"],
  board_base_inout_map: ["NUM", "DMAX"],
  board_base_inout_tone: ["NUM"],
};

const isIntOnlyInputChangeEvent = (event: Blockly.Events.Abstract): boolean =>
  event.type === Blockly.Events.BLOCK_CHANGE ||
  event.type === Blockly.Events.BLOCK_CREATE ||
  event.type === Blockly.Events.BLOCK_MOVE ||
  event.type === Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE;

/**
 * Lightweight source-type sniff for int-only inputs (avoids importing shared.ts).
 */
function inferSourceTypeForIntInput(
  sourceBlock: Blockly.Block | null,
): string | null {
  if (!sourceBlock) {
    return null;
  }
  if (sourceBlock.type === "math_number") {
    return resolveMathNumberBlockType(sourceBlock);
  }
  const checks = sourceBlock.outputConnection?.getCheck?.() ?? null;
  if (!checks?.length) {
    return null;
  }
  if (checks.length === 1) {
    return normalizeBlocklyCheckToInternalType(checks[0]) ?? checks[0];
  }
  if (checks.includes("float") || checks.includes("Number")) {
    if (checks.includes("int") && !checks.includes("float")) {
      return "int";
    }
    if (checks.includes("float")) {
      return "float";
    }
  }
  if (checks.includes("int")) {
    return "int";
  }
  return normalizeBlocklyCheckToInternalType(checks[0]) ?? checks[0];
}

/**
 * Enforces integer-only values on the given value inputs (setCheck + disconnect). event does not require revalidation (caller must leave existing warnings alone).
 * @param block - Blockly block instance.
 * @param inputNames - `inputNames` value.
 * @param event - Blockly workspace event.
 * @returns Result string.
 */
export const enforceIntOnlyValueInputs = (
  block: Blockly.Block,
  inputNames: readonly string[],
  event: Blockly.Events.Abstract,
): string | null | undefined => {
  if (!inputNames.length || !isIntOnlyInputChangeEvent(event)) {
    return undefined;
  }
  const blockEvent = event as Blockly.Events.Abstract & { blockId?: string };
  if (
    event.type === Blockly.Events.BLOCK_CREATE &&
    blockEvent.blockId != null &&
    blockEvent.blockId !== block.id
  ) {
    return undefined;
  }
  let warning: string | null = null;
  for (const inputName of inputNames) {
    const input = block.getInput(inputName);
    if (input?.connection) {
      input.connection.setCheck(getBlocklyCompatibleChecks("int"));
    }
    const connected = input?.connection?.targetBlock() || null;
    if (!connected) {
      continue;
    }
    const sourceType = inferSourceTypeForIntInput(connected);
    if (sourceType && !checkTypeCompatibility(sourceType, "int")) {
      warning = getTypeMismatchWarningText("int", sourceType);
      input?.connection?.disconnect();
    }
  }
  return warning;
};

/**
 * Enforces integer-only values on board block inputs (PWM, map, tone frequency).
 * @param block - Blockly block instance.
 * @param event - Blockly workspace event.
 */
export const handleBoardIntInputBlockChange = (
  block: Blockly.Block,
  event: Blockly.Events.Abstract,
): void => {
  const inputNames = BOARD_INT_ONLY_VALUE_INPUTS[block.type];
  if (!inputNames) {
    return;
  }
  const warning = enforceIntOnlyValueInputs(block, inputNames, event);
  if (warning !== undefined) {
    block.setWarningText(warning);
  }
};

/**
 * Revalidates integer-only inputs on board blocks after workspace changes.
 * @param workspace - Blockly workspace.
 * @param event - Blockly workspace event.
 */
export const revalidateBoardIntInputBlocks = (
  workspace: Blockly.Workspace,
  event: Blockly.Events.Abstract,
): void => {
  for (const block of workspace.getAllBlocks(false)) {
    if (BOARD_INT_ONLY_VALUE_INPUTS[block.type]) {
      handleBoardIntInputBlockChange(block, event);
    }
  }
};
