/**
 * @packageDocumentation
 * @module Arduino.Generators.Math.Literals
 * @description Arduino generators for numeric literals, percent, angle, and constants.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { Block } from "blockly/core";
import { Order } from "../arduino_generator";


/**
 * Generates Arduino code for a numeric literal.
 * @param block - Blockly block instance.
 * @returns Code string with order.
 */
export function math_number(block: Block): [string, Order] {
  // Numeric literal.
  const code = block.getFieldValue("NUM") || "0";
  return [code, Order.ATOMIC];
}

/**
 * Generates Arduino code for a percentage literal (0-100 mapped to 0-1).
 * @param block - Blockly block instance.
 * @returns Code string with order.
 */
export function math_percent(block: Block): [string, Order] {
  const rawValue = Number(block.getFieldValue("PERCENT") || 0);
  const code = (rawValue / 100).toString();
  return [code, Order.ATOMIC];
}

/**
 * Generates Arduino code for an angle literal.
 * @param block - Blockly block instance.
 * @returns Code string with order.
 */
export function inout_angle_maths(block: Block): [string, Order] {
  const angle = block.getFieldValue("ANGLE") || "0";
  return [angle, Order.ATOMIC];
}

/**
 * Generates Arduino code for math constants.
 * @param block - Blockly block instance.
 * @returns Code string with order.
 */
export function math_constant(block: Block): [string, Order] {
  const constant = block.getFieldValue("CONSTANT");
  switch (constant) {
    case "PI":
      return ["PI", Order.ATOMIC];
    case "E":
      return ["2.718281828459045", Order.ATOMIC];
    case "GOLDEN_RATIO":
      return ["1.618033988749895", Order.ATOMIC];
    case "SQRT2":
      return ["1.4142135623730951", Order.ATOMIC];
    case "SQRT1_2":
      return ["0.7071067811865476", Order.ATOMIC];
    default:
      return ["0", Order.ATOMIC];
  }
}
