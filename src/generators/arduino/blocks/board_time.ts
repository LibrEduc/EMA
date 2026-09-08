/**
 * @packageDocumentation
 * @module Arduino.Generators.Board.Time
 * @description Arduino generators for delay and millis.
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
 * Board base time delay.
 * @param block - Blockly block instance.
 * @param generator - Code generator instance.
 * @returns Result string.
 */
export function board_base_time_delay(block: Block, generator: ArduinoGenerator): string {
  const delayTime = generator.valueToCode(block, "DELAY_TIME", Order.ATOMIC) || "1000";
  return `delay(${delayTime});\n`;
}

/**
 * Board base time millis.
 * @param _block - Blockly block instance.
 * @param _generator - Code generator instance.
 * @returns Result string.
 */
export function board_base_time_millis(_block: Block, _generator: ArduinoGenerator): [string, Order] {
  return ["millis()", Order.ATOMIC];
}

/**
 * Board base time delay sec.
 * @param block - Blockly block instance.
 * @param generator - Code generator instance.
 * @returns Result string.
 */
export function board_base_time_delay_sec(block: Block, generator: ArduinoGenerator): string {
  const delaySec = generator.valueToCode(block, "DELAY_TIME", Order.ATOMIC) || "1";
  return `delay(${delaySec} * 1000);\n`;
}
