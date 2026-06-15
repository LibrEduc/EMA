/**
 * @packageDocumentation
 * @module Arduino.Generators.Board
 * @description Arduino code generators for board (s4e) blocks.
 * @remarks
 * Matches exemples/s4e/S4E/categories/board/board_base.arduino.
 * @license GPL-3.0-or-later
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

import type { Block } from "blockly/core";
import type { ArduinoGenerator } from "../arduino_generator";
import { Order } from "../arduino_generator";

export function board_base_setup(block: Block, generator: ArduinoGenerator): string {
  let code = generator.statementToCode(block, "SETUP") || "";
  code = generator.scrubArduino_(block, code);
  generator.addSetup("base_setup", code);
  return "";
}

export function board_base_setup_loop(block: Block, generator: ArduinoGenerator): string {
  let setupCode = generator.statementToCode(block, "SETUP") || "";
  setupCode = generator.scrubArduino_(block, setupCode, true);
  generator.addSetup("base_setup", setupCode);
  let loopCode = generator.statementToCode(block, "LOOP") || "";
  loopCode = generator.scrubArduino_(block, loopCode, true);
  return loopCode;
}

export function board_base_loop(block: Block, generator: ArduinoGenerator): string {
  let code = generator.statementToCode(block, "LOOP") || "";
  return generator.scrubArduino_(block, code);
}

export function board_base_inout_buildin_led(block: Block, generator: ArduinoGenerator): string {
  const stat = block.getFieldValue("STAT");
  generator.addSetup("setup_output_13", "pinMode(LED_BUILTIN, OUTPUT);");
  return `digitalWrite(LED_BUILTIN, ${stat});\n`;
}

export function board_base_inout_digital_write(block: Block, generator: ArduinoGenerator): string {
  const pin = block.getFieldValue("PIN");
  const stat = block.getFieldValue("STAT");
  generator.addSetup(`setup_output_${pin}`, `pinMode(${pin}, OUTPUT);`);
  return `digitalWrite(${pin}, ${stat});\n`;
}

export function board_base_inout_digital_read(block: Block, generator: ArduinoGenerator): [string, Order] {
  const pin = block.getFieldValue("PIN");
  generator.addSetup(`setup_input_${pin}`, `pinMode(${pin}, INPUT);`);
  return [`digitalRead(${pin})`, Order.ATOMIC];
}

export function board_base_inout_highlow(block: Block, _generator: ArduinoGenerator): [string, Order] {
  const code = block.getFieldValue("BOOL") === "HIGH" ? "HIGH" : "LOW";
  return [code, Order.ATOMIC];
}

export function board_base_inout_analog_write(block: Block, generator: ArduinoGenerator): string {
  const pin = block.getFieldValue("PIN");
  const value = generator.valueToCode(block, "PWM", Order.ATOMIC) || "0";
  return `analogWrite(${pin}, ${value});\n`;
}

export function board_base_inout_analog_write_slider(block: Block, _generator: ArduinoGenerator): string {
  const pin = block.getFieldValue("PIN");
  const value = block.getFieldValue("PWM");
  return `analogWrite(${pin}, ${value});\n`;
}

export function board_base_inout_analog_read(block: Block, _generator: ArduinoGenerator): [string, Order] {
  const pin = block.getFieldValue("PIN");
  return [`analogRead(${pin})`, Order.ATOMIC];
}

export function board_base_time_delay(block: Block, generator: ArduinoGenerator): string {
  const delayTime = generator.valueToCode(block, "DELAY_TIME", Order.ATOMIC) || "1000";
  return `delay(${delayTime});\n`;
}

export function board_base_time_millis(_block: Block, _generator: ArduinoGenerator): [string, Order] {
  return ["millis()", Order.ATOMIC];
}

export function board_base_time_delay_sec(block: Block, generator: ArduinoGenerator): string {
  const delaySec = generator.valueToCode(block, "DELAY_TIME", Order.ATOMIC) || "1";
  return `delay(${delaySec} * 1000);\n`;
}

export function board_base_inout_pulsein(block: Block, _generator: ArduinoGenerator): [string, Order] {
  const pin = block.getFieldValue("PIN");
  const stat = block.getFieldValue("STAT");
  return [`pulseIn(${pin}, ${stat})`, Order.ATOMIC];
}

export function board_base_inout_pulsein_timeout(block: Block, generator: ArduinoGenerator): [string, Order] {
  const pin = block.getFieldValue("PIN");
  const stat = block.getFieldValue("STAT");
  const timeout = generator.valueToCode(block, "TIMEOUT", Order.ATOMIC) || "1000000";
  return [`pulseIn(${pin}, ${stat}, ${timeout})`, Order.ATOMIC];
}

export function board_base_inout_pin_mode(block: Block, _generator: ArduinoGenerator): string {
  const pin = block.getFieldValue("PIN");
  const mode = block.getFieldValue("MODE");
  return `pinMode(${pin}, ${mode});\n`;
}

export function board_base_inout_map(block: Block, generator: ArduinoGenerator): [string, Order] {
  const valueNum = generator.valueToCode(block, "NUM", Order.NONE);
  const valueDmax = generator.valueToCode(block, "DMAX", Order.ATOMIC);
  const code = `map(${valueNum}, 0, 1024, 0, ${valueDmax})`;
  return [code, Order.NONE];
}

export function board_base_inout_angle(block: Block, _generator: ArduinoGenerator): [string, Order] {
  const angle = block.getFieldValue("ANGLE") || "90";
  return [angle, Order.ATOMIC];
}

export function board_base_inout_tone(block: Block, generator: ArduinoGenerator): string {
  const pin = block.getFieldValue("PIN");
  const valueNum = generator.valueToCode(block, "NUM", Order.ATOMIC);
  generator.addSetup(`setup_output_${pin}`, `pinMode(${pin}, OUTPUT);`);
  return `tone(${pin}, ${valueNum});\n`;
}

export function board_base_inout_notone(block: Block, generator: ArduinoGenerator): string {
  const pin = block.getFieldValue("PIN");
  generator.addSetup(`setup_output_${pin}`, `pinMode(${pin}, OUTPUT);`);
  return `noTone(${pin});\n`;
}

export function board_serial_begin(block: Block, generator: ArduinoGenerator): string {
  const baud = block.getFieldValue("BAUD");
  generator.addSetup("serial_begin", `Serial.begin(${baud});`);
  return "";
}

export function board_serial_print(block: Block, generator: ArduinoGenerator): string {
  const text = generator.valueToCode(block, "TEXT", Order.NONE) || '""';
  return `Serial.print(${text});\n`;
}

export function board_serial_println(block: Block, generator: ArduinoGenerator): string {
  const text = generator.valueToCode(block, "TEXT", Order.NONE) || '""';
  return `Serial.println(${text});\n`;
}

export function board_serial_printfor(block: Block, generator: ArduinoGenerator): string {
  const content = generator.valueToCode(block, "CONTENT", Order.NONE) || "0";
  const format = block.getFieldValue("TYPE") || "DEC";
  return `Serial.print(${content}, ${format});\n`;
}

export function board_serial_flush(_block: Block, _generator: ArduinoGenerator): string {
  return "Serial.flush();\n";
}

export function board_serial_read(_block: Block, _generator: ArduinoGenerator): [string, Order] {
  return ["Serial.read()", Order.ATOMIC];
}

export function board_serial_available(_block: Block, _generator: ArduinoGenerator): [string, Order] {
  return ["Serial.available()", Order.ATOMIC];
}

export function board_serial_write(block: Block, generator: ArduinoGenerator): string {
  const data = generator.valueToCode(block, "DATA", Order.NONE) || "0";
  return `Serial.write(${data});\n`;
}

export function board_serial_peek(_block: Block, _generator: ArduinoGenerator): [string, Order] {
  return ["Serial.peek()", Order.ATOMIC];
}

export function board_serial_readString(_block: Block, _generator: ArduinoGenerator): [string, Order] {
  return ["Serial.readString()", Order.ATOMIC];
}

export function board_serial_readStringUntil(block: Block, generator: ArduinoGenerator): [string, Order] {
  const term = generator.valueToCode(block, "TERMINATOR", Order.NONE) || "'\\n'";
  return [`Serial.readStringUntil(${term}.charAt(0))`, Order.ATOMIC];
}

export function board_serial_parseInt(_block: Block, _generator: ArduinoGenerator): [string, Order] {
  return ["Serial.parseInt()", Order.ATOMIC];
}

export function board_serial_parseFloat(_block: Block, _generator: ArduinoGenerator): [string, Order] {
  return ["Serial.parseFloat()", Order.ATOMIC];
}

// Conversion blocks
export function board_conversion_toint(block: Block, generator: ArduinoGenerator): [string, Order] {
  const value = generator.valueToCode(block, "VALUE", Order.UNARY_NEGATION) || "0";
  return [`(int)(${value})`, Order.UNARY_NEGATION];
}

export function board_conversion_tofloat(block: Block, generator: ArduinoGenerator): [string, Order] {
  const value = generator.valueToCode(block, "VALUE", Order.UNARY_NEGATION) || "0";
  return [`(float)(${value})`, Order.UNARY_NEGATION];
}

export function board_conversion_tochar(block: Block, generator: ArduinoGenerator): [string, Order] {
  const value = generator.valueToCode(block, "VALUE", Order.UNARY_NEGATION) || "0";
  return [`(char)(${value})`, Order.UNARY_NEGATION];
}

export function board_conversion_tobyte(block: Block, generator: ArduinoGenerator): [string, Order] {
  const value = generator.valueToCode(block, "VALUE", Order.UNARY_NEGATION) || "0";
  return [`(byte)(${value})`, Order.UNARY_NEGATION];
}

export function board_conversion_toString(block: Block, generator: ArduinoGenerator): [string, Order] {
  const value = generator.valueToCode(block, "VALUE", Order.NONE) || "0";
  return [`String(${value})`, Order.FUNCTION_CALL];
}

export function board_conversion_constrain(block: Block, generator: ArduinoGenerator): [string, Order] {
  const value = generator.valueToCode(block, "VALUE", Order.NONE) || "0";
  const low = generator.valueToCode(block, "LOW", Order.NONE) || "0";
  const high = generator.valueToCode(block, "HIGH", Order.NONE) || "255";
  return [`constrain(${value}, ${low}, ${high})`, Order.FUNCTION_CALL];
}
