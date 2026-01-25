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

import { debugLog } from "../../generators/arduino/debug";
import { defineControlsSwitchBlocks } from "./logic";
import { defineMathCompatBlocks } from "./math";
import { defineTextCompatBlocks } from "./text";
import { defineColourBlocks } from "./colour";
import {
  defineVariablesConstBlock,
  defineVariablesGetDynamicBlock,
  defineVariablesLocalBlock,
  defineVariablesSetDynamicBlock,
  defineVariablesSetInitBlock,
  defineVariablesSetTypeBlock,
  defineVariablesDefineBlock,
  extendStandardVariablesGetBlock,
  extendStandardVariablesSetBlock,
} from "./variables";

/**
 * Registers BlocklyArduino compatibility blocks.
 */
export const defineBlocklyArduinoCompatBlocks = (): void => {
  defineMathCompatBlocks();
  defineTextCompatBlocks();
  defineColourBlocks();
};

/**
 * Define all typed variable blocks
 */
/**
 * Registers all typed variable blocks and extensions.
 */
export const defineAllTypedVariableBlocks = (): void => {
  defineVariablesGetDynamicBlock();
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

  debugLog("Blocs de variables typées définis avec succès");
};

export {
  defineControlsSwitchBlocks,
  defineColourBlocks,
  defineVariablesConstBlock,
  defineVariablesGetDynamicBlock,
  defineVariablesLocalBlock,
  defineVariablesSetDynamicBlock,
  defineVariablesSetInitBlock,
  defineVariablesSetTypeBlock,
  defineVariablesDefineBlock,
};
