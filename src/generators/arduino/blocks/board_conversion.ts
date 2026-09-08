/**
 * @packageDocumentation
 * @module Arduino.Generators.Board.Conversion
 * @description Arduino generators for type conversion blocks.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { Block } from "blockly/core";
import type { ArduinoGenerator } from "../arduino_generator";
import { Order } from "../arduino_generator";


/**
 * Board conversion toint.
 * @param block - Blockly block instance.
 * @param generator - Code generator instance.
 * @returns Result string.
 */
export function board_conversion_toint(block: Block, generator: ArduinoGenerator): [string, Order] {
  const value = generator.valueToCode(block, "VALUE", Order.UNARY_NEGATION) || "0";
  return [`(int)(${value})`, Order.UNARY_NEGATION];
}

/**
 * Board conversion tofloat.
 * @param block - Blockly block instance.
 * @param generator - Code generator instance.
 * @returns Result string.
 */
export function board_conversion_tofloat(block: Block, generator: ArduinoGenerator): [string, Order] {
  const value = generator.valueToCode(block, "VALUE", Order.UNARY_NEGATION) || "0";
  return [`(float)(${value})`, Order.UNARY_NEGATION];
}

/**
 * Board conversion tochar.
 * @param block - Blockly block instance.
 * @param generator - Code generator instance.
 * @returns Result string.
 */
export function board_conversion_tochar(block: Block, generator: ArduinoGenerator): [string, Order] {
  const value = generator.valueToCode(block, "VALUE", Order.UNARY_NEGATION) || "0";
  return [`(char)(${value})`, Order.UNARY_NEGATION];
}

/**
 * Board conversion tobyte.
 * @param block - Blockly block instance.
 * @param generator - Code generator instance.
 * @returns Result string.
 */
export function board_conversion_tobyte(block: Block, generator: ArduinoGenerator): [string, Order] {
  const value = generator.valueToCode(block, "VALUE", Order.UNARY_NEGATION) || "0";
  return [`(byte)(${value})`, Order.UNARY_NEGATION];
}

/**
 * Board conversion to String.
 * @param block - Blockly block instance.
 * @param generator - Code generator instance.
 * @returns Result string.
 */
export function board_conversion_toString(block: Block, generator: ArduinoGenerator): [string, Order] {
  const value = generator.valueToCode(block, "VALUE", Order.NONE) || "0";
  return [`String(${value})`, Order.FUNCTION_CALL];
}

/**
 * Board conversion constrain.
 * @param block - Blockly block instance.
 * @param generator - Code generator instance.
 * @returns Result string.
 */
export function board_conversion_constrain(block: Block, generator: ArduinoGenerator): [string, Order] {
  const value = generator.valueToCode(block, "VALUE", Order.NONE) || "0";
  const low = generator.valueToCode(block, "LOW", Order.NONE) || "0";
  const high = generator.valueToCode(block, "HIGH", Order.NONE) || "255";
  return [`constrain(${value}, ${low}, ${high})`, Order.FUNCTION_CALL];
}

