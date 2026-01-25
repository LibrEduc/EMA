/**
 * @packageDocumentation
 * @module Arduino.Generators.Variables
 * @description Variable block generators for Arduino.
 * @remarks
 * Implements generator functions for variable blocks.
 * @license GPL-3.0-or-later
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright 2023 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Blockly from "blockly";
import { ArduinoGenerator, Order } from "../arduino_generator";

/**
 * Generator for variables_set block.
 * @param block - The block to generate code for.
 * @param generator - The Arduino generator instance.
 * @returns Generated Arduino code.
 */
/**
 * Generates Arduino code for variables_set.
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Generated code string.
 */
export const variables_set = function (
  block: Blockly.Block,
  generator: ArduinoGenerator,
): string | [string, number] {
  // Variable setter.
  const argument0 = generator.valueToCode(block, 'VALUE', Order.ASSIGNMENT) || '0';
  const varName = generator.getVariableName(block.getFieldValue('VAR'));
  return varName + ' = ' + argument0 + ';\n';
};

/**
 * Generator for variables_get block.
 * @param block - The block to generate code for.
 * @param generator - The Arduino generator instance.
 * @returns Generated Arduino code.
 */
/**
 * Generates Arduino code for variables_get.
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Generated code tuple.
 */
export const variables_get = function (
  block: Blockly.Block,
  generator: ArduinoGenerator,
): string | [string, number] {
  // Variable getter.
  const varName = generator.getVariableName(block.getFieldValue('VAR'));
  return [varName, Order.ATOMIC];
};
