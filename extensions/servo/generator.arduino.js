/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * Runtime ESM — générateurs Arduino servo (instances Blockly@rduino).
 * Contrat : export function registerArduinoGenerators({ arduinoGenerator, Order })
 */

/** Identifiant C++ sûr à partir du nom d’instance. */
function servoCppName(raw) {
  const cleaned = String(raw || "SERVO").replace(/[^\w]/g, "_");
  return /^[A-Za-z_]/.test(cleaned) ? cleaned : `_${cleaned}`;
}

export function registerArduinoGenerators({ arduinoGenerator, Order }) {
  arduinoGenerator.forBlock["servo_attach"] = function (block) {
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

  arduinoGenerator.forBlock["servo_move"] = function (block) {
    const degree =
      arduinoGenerator.valueToCode(block, "DEGREE", Order.ATOMIC) || "0";
    const name = servoCppName(block.getFieldValue("SERVO_NAME"));
    return `${name}.write(${degree});\n`;
  };

  arduinoGenerator.forBlock["servo_read_degrees"] = function (block) {
    const name = servoCppName(block.getFieldValue("SERVO_NAME"));
    return [`${name}.read()`, Order.ATOMIC];
  };

  arduinoGenerator.forBlock["servo_detach"] = function (block) {
    const name = servoCppName(block.getFieldValue("SERVO_NAME"));
    return `${name}.detach();\n`;
  };

  arduinoGenerator.forBlock["servo_attached"] = function (block) {
    const name = servoCppName(block.getFieldValue("SERVO_NAME"));
    return [`${name}.attached()`, Order.ATOMIC];
  };
}
