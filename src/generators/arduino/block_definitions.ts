/**
 * @packageDocumentation
 * @module Arduino.BlockDefinitions
 * @description Re-exports and registers Arduino block definition helpers.
 * @remarks
 * Provides a single import surface for block definitions.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 * @version 1.0.0
 * @since 1.0.0
 */

export {
  defineAllTypedVariableBlocks,
  defineBlocklyArduinoCompatBlocks,
  defineControlsSwitchBlocks,
  defineVariablesConstBlock,
  defineVariablesGetDynamicBlock,
  defineVariablesLocalBlock,
  defineVariablesSetDynamicBlock,
  defineVariablesSetInitBlock,
  defineVariablesSetTypeBlock,
} from "../../categories/blockly";
