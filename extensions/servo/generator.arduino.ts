/**
 * Générateurs Arduino pour le pack servo (instances Blockly@rduino).
 */

import type { Block } from "blockly/core";
import type { ArduinoGenerator } from "../../../src/generators/arduino/arduino_generator";
import { Order } from "../../../src/generators/arduino/arduino_generator";

function servoCppName(raw: string): string {
  const cleaned = String(raw || "SERVO").replace(/[^\w]/g, "_");
  return /^[A-Za-z_]/.test(cleaned) ? cleaned : `_${cleaned}`;
}

export function servo_attach(block: Block, generator: ArduinoGenerator): string {
  const pin = generator.valueToCode(block, "PIN", Order.ATOMIC) || "9";
  const name = servoCppName(block.getFieldValue("SERVO_NAME") as string);
  generator.addInclude("define_servo", "#include <Servo.h>");
  generator.addDefinition(`var_servo_${name}`, `Servo ${name};`);
  generator.addSetup(`setup_servo_${name}`, `${name}.attach(${pin});`);
  return "";
}

export function servo_move(block: Block, generator: ArduinoGenerator): string {
  const degree = generator.valueToCode(block, "DEGREE", Order.ATOMIC) || "0";
  const name = servoCppName(block.getFieldValue("SERVO_NAME") as string);
  return `${name}.write(${degree});\n`;
}

export function servo_read_degrees(
  block: Block,
  generator: ArduinoGenerator,
): [string, Order] {
  const name = servoCppName(block.getFieldValue("SERVO_NAME") as string);
  return [`${name}.read()`, Order.ATOMIC];
}

export function servo_detach(block: Block, _generator: ArduinoGenerator): string {
  const name = servoCppName(block.getFieldValue("SERVO_NAME") as string);
  return `${name}.detach();\n`;
}

export function servo_attached(
  block: Block,
  _generator: ArduinoGenerator,
): [string, Order] {
  const name = servoCppName(block.getFieldValue("SERVO_NAME") as string);
  return [`${name}.attached()`, Order.ATOMIC];
}
