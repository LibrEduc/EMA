/**
 * @packageDocumentation
 * @module BlocklyCategories
 * @description Registers and initializes Blockly category blocks.
 * @remarks
 * Entry point that wires up category block definitions.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2024 ASTUCE (Sébastien Canet microcompany)
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

import { debugLog } from "../../generators/arduino/debug";
import { defineControlsSwitchBlocks } from "./logic";
import { defineLoopsBlocks } from "./loops";
import { defineMathCompatBlocks } from "./math";
import { defineTextCompatBlocks } from "./text";
import { defineArrayBlocks } from "./array";
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
