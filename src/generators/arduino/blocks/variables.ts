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
  const valueBlock = block.getInputTargetBlock?.("VALUE");
  if (
    valueBlock?.type === "Array_list_literal" ||
    valueBlock?.type === "Array_list_3"
  ) {
    return "";
  }
  const argument0 = generator.valueToCode(block, "VALUE", Order.ASSIGNMENT) || "0";
  const varName = generator.getVariableName(block.getFieldValue("VAR"));
  return varName + " = " + argument0 + ";\n";
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
