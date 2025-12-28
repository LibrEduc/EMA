/**
 * @packageDocumentation Typed variable block generators for Arduino
 * @author scanet\@libreduc.cc (Sébastien Canet)
 */

/**
 * @license
 * Copyright 2023 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Blockly from "blockly";
import {ArduinoGenerator, Order} from './arduino_generator';

/**
 * Generator for variables_set_dynamic block.
 * This block sets the value of a typed variable.
 * @param block - The block to generate code for.
 * @param generator - The Arduino generator instance.
 * @returns Generated Arduino code.
 */
export const variables_set_dynamic = function(
  block: Blockly.Block,
  generator: ArduinoGenerator,
): string | [string, number] {
  // Typed variable setter - the variable name is in the VAR input
  const varName = generator.valueToCode(block, 'VAR', Order.ATOMIC) || 'variable';
  const value = generator.valueToCode(block, 'VALUE', Order.ASSIGNMENT) || '0';
  
  // Ensure we have a valid variable name
  if (!varName || varName === 'variable') {
    console.warn('variables_set_dynamic: Invalid variable name');
    return '// Error: Invalid variable name\n';
  }
  
  return varName + ' = ' + value + ';\n';
};

/**
 * Generator for variables_get_dynamic block.
 * This block gets the value of a typed variable.
 * @param block - The block to generate code for.
 * @param generator - The Arduino generator instance.
 * @returns Generated Arduino code.
 */
export const variables_get_dynamic = function(
  block: Blockly.Block,
  generator: ArduinoGenerator,
): string | [string, number] {
  // Typed variable getter - the variable name is in the VAR input
  const varName = generator.valueToCode(block, 'VAR', Order.ATOMIC) || 'variable';
  
  // Ensure we have a valid variable name
  if (!varName || varName === 'variable') {
    console.warn('variables_get_dynamic: Invalid variable name');
    return ['0', Order.ATOMIC];
  }
  
  return [varName, Order.ATOMIC];
};
