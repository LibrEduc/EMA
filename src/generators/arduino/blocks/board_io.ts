/**
 * @packageDocumentation
 * @module Arduino.Generators.Board.Io
 * @description Arduino generators for digital/analog I/O, pulseIn, map, and tone.
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
 * Board base inout buildin led.
 * @param block - Blockly block instance.
 * @param generator - Code generator instance.
 * @returns Result string.
 */
export function board_base_inout_buildin_led(block: Block, generator: ArduinoGenerator): string {
  const stat = block.getFieldValue("STAT");
  generator.addSetup("setup_output_13", "pinMode(LED_BUILTIN, OUTPUT);");
  return `digitalWrite(LED_BUILTIN, ${stat});\n`;
}

/**
 * Board base inout digital write.
 * @param block - Blockly block instance.
 * @param generator - Code generator instance.
 * @returns Result string.
 */
export function board_base_inout_digital_write(block: Block, generator: ArduinoGenerator): string {
  const pin = block.getFieldValue("PIN");
  const stat = block.getFieldValue("STAT");
  generator.addSetup(`setup_output_${pin}`, `pinMode(${pin}, OUTPUT);`);
  return `digitalWrite(${pin}, ${stat});\n`;
}

/**
 * Board base inout digital read.
 * @param block - Blockly block instance.
 * @param generator - Code generator instance.
 * @returns Result string.
 */
export function board_base_inout_digital_read(block: Block, generator: ArduinoGenerator): [string, Order] {
  const pin = block.getFieldValue("PIN");
  generator.addSetup(`setup_input_${pin}`, `pinMode(${pin}, INPUT);`);
  return [`digitalRead(${pin})`, Order.ATOMIC];
}

/**
 * Board base inout digital read pin.
 * @param block - Blockly block instance.
 * @param generator - Code generator instance.
 * @returns Result string.
 */
export function board_base_inout_digital_read_pin(
  block: Block,
  generator: ArduinoGenerator,
): [string, Order] {
  const pin = generator.valueToCode(block, "PIN", Order.ATOMIC) || "0";
  generator.addSetup(`setup_input_${block.id}`, `pinMode(${pin}, INPUT);`);
  return [`digitalRead(${pin})`, Order.ATOMIC];
}

/**
 * Board base inout digital read grid.
 * @param block - Blockly block instance.
 * @param generator - Code generator instance.
 * @returns Result string.
 */
export function board_base_inout_digital_read_grid(
  block: Block,
  generator: ArduinoGenerator,
): [string, Order] {
  return board_base_inout_digital_read(block, generator);
}

/**
 * Board base inout digital read board.
 * @param block - Blockly block instance.
 * @param generator - Code generator instance.
 * @returns Result string.
 */
export function board_base_inout_digital_read_board(
  block: Block,
  generator: ArduinoGenerator,
): string {
  const pin = block.getFieldValue("PIN");
  generator.addSetup(`setup_input_${pin}`, `pinMode(${pin}, INPUT);`);
  return `(void)digitalRead(${pin});\n`;
}

/**
 * Board base inout highlow.
 * @param block - Blockly block instance.
 * @param _generator - Code generator instance.
 * @returns Result string.
 */
export function board_base_inout_highlow(block: Block, _generator: ArduinoGenerator): [string, Order] {
  const code = block.getFieldValue("BOOL") === "HIGH" ? "HIGH" : "LOW";
  return [code, Order.ATOMIC];
}

/**
 * Board base inout analog write.
 * @param block - Blockly block instance.
 * @param generator - Code generator instance.
 * @returns Result string.
 */
export function board_base_inout_analog_write(block: Block, generator: ArduinoGenerator): string {
  const pin = block.getFieldValue("PIN");
  const value = generator.valueToCode(block, "PWM", Order.ATOMIC) || "0";
  return `analogWrite(${pin}, ${value});\n`;
}

/**
 * Board base inout analog write slider.
 * @param block - Blockly block instance.
 * @param _generator - Code generator instance.
 * @returns Result string.
 */
export function board_base_inout_analog_write_slider(block: Block, _generator: ArduinoGenerator): string {
  const pin = block.getFieldValue("PIN");
  const value = block.getFieldValue("PWM");
  return `analogWrite(${pin}, ${value});\n`;
}

/**
 * Board base inout analog read.
 * @param block - Blockly block instance.
 * @param _generator - Code generator instance.
 * @returns Result string.
 */
export function board_base_inout_analog_read(block: Block, _generator: ArduinoGenerator): [string, Order] {
  const pin = block.getFieldValue("PIN");
  return [`analogRead(${pin})`, Order.ATOMIC];
}

/**
 * Board base inout pulsein.
 * @param block - Blockly block instance.
 * @param _generator - Code generator instance.
 * @returns Result string.
 */
export function board_base_inout_pulsein(block: Block, _generator: ArduinoGenerator): [string, Order] {
  const pin = block.getFieldValue("PIN");
  const stat = block.getFieldValue("STAT");
  return [`pulseIn(${pin}, ${stat})`, Order.ATOMIC];
}

/**
 * Board base inout pulsein timeout.
 * @param block - Blockly block instance.
 * @param generator - Code generator instance.
 * @returns Result string.
 */
export function board_base_inout_pulsein_timeout(block: Block, generator: ArduinoGenerator): [string, Order] {
  const pin = block.getFieldValue("PIN");
  const stat = block.getFieldValue("STAT");
  const timeout = generator.valueToCode(block, "TIMEOUT", Order.ATOMIC) || "1000000";
  return [`pulseIn(${pin}, ${stat}, ${timeout})`, Order.ATOMIC];
}

/**
 * Board base inout pin mode.
 * @param block - Blockly block instance.
 * @param _generator - Code generator instance.
 * @returns Result string.
 */
export function board_base_inout_pin_mode(block: Block, _generator: ArduinoGenerator): string {
  const pin = block.getFieldValue("PIN");
  const mode = block.getFieldValue("MODE");
  return `pinMode(${pin}, ${mode});\n`;
}

/**
 * Board base inout map.
 * @param block - Blockly block instance.
 * @param generator - Code generator instance.
 * @returns Result string.
 */
export function board_base_inout_map(block: Block, generator: ArduinoGenerator): [string, Order] {
  const valueNum = generator.valueToCode(block, "NUM", Order.NONE);
  const valueDmax = generator.valueToCode(block, "DMAX", Order.ATOMIC);
  const code = `map(${valueNum}, 0, 1024, 0, ${valueDmax})`;
  return [code, Order.NONE];
}

/**
 * Board base inout tone.
 * @param block - Blockly block instance.
 * @param generator - Code generator instance.
 * @returns Result string.
 */
export function board_base_inout_tone(block: Block, generator: ArduinoGenerator): string {
  const pin = block.getFieldValue("PIN");
  const valueNum = generator.valueToCode(block, "NUM", Order.ATOMIC);
  generator.addSetup(`setup_output_${pin}`, `pinMode(${pin}, OUTPUT);`);
  return `tone(${pin}, ${valueNum});\n`;
}

/**
 * Board base inout notone.
 * @param block - Blockly block instance.
 * @param generator - Code generator instance.
 * @returns Result string.
 */
export function board_base_inout_notone(block: Block, generator: ArduinoGenerator): string {
  const pin = block.getFieldValue("PIN");
  generator.addSetup(`setup_output_${pin}`, `pinMode(${pin}, OUTPUT);`);
  return `noTone(${pin});\n`;
}
