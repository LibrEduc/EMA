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

export const defineBlocklyArduinoCompatBlocks = (): void => {
  defineMathCompatBlocks();
  defineTextCompatBlocks();
  defineColourBlocks();
};

/**
 * Define all typed variable blocks
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
