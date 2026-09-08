/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Générateurs MicroPython pour le pack servo (instances).
 */

type MpBlock = {
  getFieldValue(name: string): string;
};

type MpGenerator = {
  valueToCode(block: MpBlock, name: string, order: number): string;
  ensureMachinePin(): void;
  addGlobalAssignment(key: string, code: string): void;
  addSetup(key: string, code: string): void;
};

const ORDER_NONE = 99;
const ORDER_ATOMIC = 0;

function servoPyName(raw: string): string {
  const cleaned = String(raw || "SERVO").replace(/[^\w]/g, "_");
  return /^[A-Za-z_]/.test(cleaned) ? cleaned : `_${cleaned}`;
}

function angleToDuty(angleExpr: string): string {
  return `int(1638 + (${angleExpr}) * (8192 - 1638) / 180)`;
}

export function servo_attach(block: MpBlock, generator: MpGenerator): string {
  const pin = generator.valueToCode(block, "PIN", ORDER_NONE) || "9";
  const name = servoPyName(block.getFieldValue("SERVO_NAME"));
  generator.ensureMachinePin();
  generator.addGlobalAssignment("import_pwm", "from machine import PWM");
  generator.addSetup(
    `setup_servo_${name}`,
    `${name} = PWM(Pin(${pin}), freq=50)\n`,
  );
  return "";
}

export function servo_move(block: MpBlock, generator: MpGenerator): string {
  const degree = generator.valueToCode(block, "DEGREE", ORDER_NONE) || "0";
  const name = servoPyName(block.getFieldValue("SERVO_NAME"));
  return `${name}.duty_u16(${angleToDuty(degree)})\n`;
}

export function servo_read_degrees(
  _block: MpBlock,
  _generator: MpGenerator,
): [string, number] {
  return ["0", ORDER_ATOMIC];
}

export function servo_detach(block: MpBlock, _generator: MpGenerator): string {
  const name = servoPyName(block.getFieldValue("SERVO_NAME"));
  return `${name}.deinit()\n`;
}

export function servo_attached(
  _block: MpBlock,
  _generator: MpGenerator,
): [string, number] {
  return ["True", ORDER_ATOMIC];
}
