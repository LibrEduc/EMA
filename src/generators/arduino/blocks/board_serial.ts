/**
 * @packageDocumentation
 * @module Arduino.Generators.Board.Serial
 * @description Arduino generators for Serial.* blocks.
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


/**
 * Board serial begin.
 * @param block - Blockly block instance.
 * @param generator - Code generator instance.
 * @returns Result string.
 */
export function board_serial_begin(block: Block, generator: ArduinoGenerator): string {
  const baud = block.getFieldValue("BAUD");
  generator.addSetup("serial_begin", `Serial.begin(${baud});`);
  return "";
}

/**
 * Board serial print.
 * @param block - Blockly block instance.
 * @param generator - Code generator instance.
 * @returns Result string.
 */
export function board_serial_print(block: Block, generator: ArduinoGenerator): string {
  const text = generator.valueToCode(block, "TEXT", Order.NONE) || '""';
  return `Serial.print(${text});\n`;
}

/**
 * Board serial println.
 * @param block - Blockly block instance.
 * @param generator - Code generator instance.
 * @returns Result string.
 */
export function board_serial_println(block: Block, generator: ArduinoGenerator): string {
  const text = generator.valueToCode(block, "TEXT", Order.NONE) || '""';
  return `Serial.println(${text});\n`;
}

/**
 * Board serial printfor.
 * @param block - Blockly block instance.
 * @param generator - Code generator instance.
 * @returns Result string.
 */
export function board_serial_printfor(block: Block, generator: ArduinoGenerator): string {
  const content = generator.valueToCode(block, "CONTENT", Order.NONE) || "0";
  const format = block.getFieldValue("TYPE") || "DEC";
  return `Serial.print(${content}, ${format});\n`;
}

/**
 * Board serial flush.
 * @param _block - Blockly block instance.
 * @param _generator - Code generator instance.
 * @returns Result string.
 */
export function board_serial_flush(_block: Block, _generator: ArduinoGenerator): string {
  return "Serial.flush();\n";
}

/**
 * Board serial read.
 * @param _block - Blockly block instance.
 * @param _generator - Code generator instance.
 * @returns Result string.
 */
export function board_serial_read(_block: Block, _generator: ArduinoGenerator): [string, Order] {
  return ["Serial.read()", Order.ATOMIC];
}

/**
 * Board serial available.
 * @param _block - Blockly block instance.
 * @param _generator - Code generator instance.
 * @returns Result string.
 */
export function board_serial_available(_block: Block, _generator: ArduinoGenerator): [string, Order] {
  return ["Serial.available()", Order.ATOMIC];
}

/**
 * Board serial write.
 * @param block - Blockly block instance.
 * @param generator - Code generator instance.
 * @returns Result string.
 */
export function board_serial_write(block: Block, generator: ArduinoGenerator): string {
  const data = generator.valueToCode(block, "DATA", Order.NONE) || "0";
  return `Serial.write(${data});\n`;
}

/**
 * Board serial peek.
 * @param _block - Blockly block instance.
 * @param _generator - Code generator instance.
 * @returns Result string.
 */
export function board_serial_peek(_block: Block, _generator: ArduinoGenerator): [string, Order] {
  return ["Serial.peek()", Order.ATOMIC];
}

/**
 * Board serial read String.
 * @param _block - Blockly block instance.
 * @param _generator - Code generator instance.
 * @returns Result string.
 */
export function board_serial_readString(_block: Block, _generator: ArduinoGenerator): [string, Order] {
  return ["Serial.readString()", Order.ATOMIC];
}

/**
 * Board serial read String Until.
 * @param block - Blockly block instance.
 * @param generator - Code generator instance.
 * @returns Result string.
 */
export function board_serial_readStringUntil(block: Block, generator: ArduinoGenerator): [string, Order] {
  const term = generator.valueToCode(block, "TERMINATOR", Order.NONE) || "'\\n'";
  return [`Serial.readStringUntil(${term}.charAt(0))`, Order.ATOMIC];
}

/**
 * Board serial parse Int.
 * @param _block - Blockly block instance.
 * @param _generator - Code generator instance.
 * @returns Result string.
 */
export function board_serial_parseInt(_block: Block, _generator: ArduinoGenerator): [string, Order] {
  return ["Serial.parseInt()", Order.ATOMIC];
}

/**
 * Board serial parse Float.
 * @param _block - Blockly block instance.
 * @param _generator - Code generator instance.
 * @returns Result string.
 */
export function board_serial_parseFloat(_block: Block, _generator: ArduinoGenerator): [string, Order] {
  return ["Serial.parseFloat()", Order.ATOMIC];
}
