/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Arduino code for math blocks.
 */

import type { Block } from "blockly/core/block";
import type { ArduinoGenerator } from "../arduino_generator";
import { Order } from "../arduino_generator";

export function math_number(
  block: Block,
  _generator: ArduinoGenerator,
): [string, Order] {
  // Numeric literal.
  const code = block.getFieldValue("NUM") || "0";
  return [code, Order.ATOMIC];
}
