/**
 * @packageDocumentation
 * @module BlocklyCategories
 * @description Registers and initializes Blockly category blocks.
 * @remarks
 * Entry point that wires up category block definitions.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { debugLog } from "../../generators/arduino/debug";
import { defineControlsSwitchBlocks } from "./logic";
import { defineLoopsBlocks } from "./loops";
import { defineMathCompatBlocks } from "./math";
import { defineTextCompatBlocks } from "./text";
import { defineArrayBlocks } from "./array";
import { defineArrayBitmapBlock } from "./array_bitmap";
import { defineLibreBlocks } from "./libre";
import { defineBoardBlocks, refreshBoardPinDropdowns } from "./board";
import { defineColourBlocks } from "./colour";
import {
  defineVariablesConstBlock,
  defineVariablesGetDynamicBlock,
  defineVariablesCastBlock,
  defineVariablesLocalBlock,
  defineVariablesSetDynamicBlock,
  defineVariablesSetInitBlock,
  defineVariablesSetTypeBlock,
  defineVariablesDefineBlock,
  extendStandardVariablesGetBlock,
  extendStandardVariablesSetBlock,
} from "./variables";

let typedVariableBlocksRegistered = false;

/**
 * Registers BlocklyArduino compatibility blocks.
 */
export const defineBlocklyArduinoCompatBlocks = (): void => {
  defineLoopsBlocks();
  defineMathCompatBlocks();
  defineTextCompatBlocks();
  defineArrayBlocks();
  defineArrayBitmapBlock();
  defineLibreBlocks();
  defineBoardBlocks();
  defineColourBlocks();
};

/**
 * Registers all typed variable blocks and extensions (get/set/define/local and standard block extensions).
 */
export const defineAllTypedVariableBlocks = (): void => {
  if (typedVariableBlocksRegistered) {
    return;
  }
  typedVariableBlocksRegistered = true;
  defineVariablesGetDynamicBlock();
  defineVariablesCastBlock();
  defineVariablesSetDynamicBlock();
  defineVariablesLocalBlock();
  defineVariablesSetTypeBlock();
  defineVariablesConstBlock();
  defineVariablesSetInitBlock();
  defineVariablesDefineBlock();
  defineControlsSwitchBlocks();
  defineBlocklyArduinoCompatBlocks();

  // Also extend the standard blocks to support type checking
  extendStandardVariablesGetBlock();
  extendStandardVariablesSetBlock();

  debugLog("Typed variable blocks registered successfully");
};

export {
  defineArrayBlocks,
  defineArrayBitmapBlock,
  defineLibreBlocks,
  defineBoardBlocks,
  defineLoopsBlocks,
  refreshBoardPinDropdowns,
  defineControlsSwitchBlocks,
  defineColourBlocks,
  defineVariablesConstBlock,
  defineVariablesGetDynamicBlock,
  defineVariablesCastBlock,
  defineVariablesLocalBlock,
  defineVariablesSetDynamicBlock,
  defineVariablesSetInitBlock,
  defineVariablesSetTypeBlock,
  defineVariablesDefineBlock,
};
