/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Authoring source — Arduino generators for the servo pack.
 * Edit this file, then run: npm run build:extensions
 */

import type {
  ExtensionArduinoContext,
  ExtensionBlock,
} from "../runtime_ctx";

/** Safe C++ identifier from instance name. */
function servoCppName(raw: string): string {
  const cleaned = String(raw || "SERVO").replace(/[^\w]/g, "_");
  return /^[A-Za-z_]/.test(cleaned) ? cleaned : `_${cleaned}`;
}

/**
 * Registers Arduino generators. Loader injects `arduinoGenerator` + `Order`.
 * @param ctx - Injected generator context.
 */
export function registerArduinoGenerators({
  arduinoGenerator,
  Order,
}: ExtensionArduinoContext): void {
  arduinoGenerator.forBlock["servo_attach"] = function (block: ExtensionBlock) {
    const pin =
      arduinoGenerator.valueToCode(block, "PIN", Order.ATOMIC) || "9";
    const name = servoCppName(block.getFieldValue("SERVO_NAME"));
    arduinoGenerator.addInclude("define_servo", "#include <Servo.h>");
    arduinoGenerator.addDefinition(`var_servo_${name}`, `Servo ${name};`);
    arduinoGenerator.addSetup(
      `setup_servo_${name}`,
      `${name}.attach(${pin});`,
    );
    return "";
  };

  arduinoGenerator.forBlock["servo_move"] = function (block: ExtensionBlock) {
    const degree =
      arduinoGenerator.valueToCode(block, "DEGREE", Order.ATOMIC) || "0";
    const name = servoCppName(block.getFieldValue("SERVO_NAME"));
    return `${name}.write(${degree});\n`;
  };

  arduinoGenerator.forBlock["servo_read_degrees"] = function (
    block: ExtensionBlock,
  ) {
    const name = servoCppName(block.getFieldValue("SERVO_NAME"));
    return [`${name}.read()`, Order.ATOMIC];
  };

  arduinoGenerator.forBlock["servo_detach"] = function (block: ExtensionBlock) {
    const name = servoCppName(block.getFieldValue("SERVO_NAME"));
    return `${name}.detach();\n`;
  };

  arduinoGenerator.forBlock["servo_attached"] = function (
    block: ExtensionBlock,
  ) {
    const name = servoCppName(block.getFieldValue("SERVO_NAME"));
    return [`${name}.attached()`, Order.ATOMIC];
  };
}
