/**
 * @packageDocumentation
 * @module Arduino.Generators.Math.ListRandom
 * @description Arduino generators for list math aggregations and random values.
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
import type { ArduinoGenerator } from "../arduino_generator";
import { Order } from "../arduino_generator";

import { addListHelpers, addSqrtHelper } from "./math_helpers";

/**
 * Generates Arduino code for list math operations.
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Code string with order.
 */
export function math_on_list(
  block: Block,
  generator: ArduinoGenerator,
): [string, Order] {
  const list = generator.valueToCode(block, "LIST", Order.NONE) || "{}";
  const operator = block.getFieldValue("OP");
  if (operator === "STD_DEV") {
    addSqrtHelper(generator);
  }
  addListHelpers(generator);

  switch (operator) {
    case "SUM":
      return ["math_sum(" + list + ")", Order.FUNCTION_CALL];
    case "MIN":
      return ["math_min(" + list + ")", Order.FUNCTION_CALL];
    case "MAX":
      return ["math_max(" + list + ")", Order.FUNCTION_CALL];
    case "AVERAGE":
      return ["math_mean(" + list + ")", Order.FUNCTION_CALL];
    case "MEDIAN":
      return ["math_median(" + list + ")", Order.FUNCTION_CALL];
    case "MODE":
      return ["math_mode(" + list + ")", Order.FUNCTION_CALL];
    case "STD_DEV":
      return ["math_standard_deviation(" + list + ")", Order.FUNCTION_CALL];
    case "RANDOM":
      return ["math_random_list(" + list + ")", Order.FUNCTION_CALL];
    default:
      return ["0", Order.ATOMIC];
  }
}

/**
 * Generates Arduino code for a random integer in a range.
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Code string with order.
 */
export function math_random_int(
  block: Block,
  generator: ArduinoGenerator,
): [string, Order] {
  const from = generator.valueToCode(block, "FROM", Order.NONE) || "0";
  const to = generator.valueToCode(block, "TO", Order.NONE) || "0";
  const code = "random(" + from + ", (" + to + ") + 1)";
  return [code, Order.FUNCTION_CALL];
}

/**
 * Generates Arduino code for a random float between 0 and 1.
 * @returns Result string.
 */
export function math_random_float(): [string, Order] {
  const code = "((double)random(0, 1000) / 1000.0)";
  return [code, Order.DIVISION];
}
