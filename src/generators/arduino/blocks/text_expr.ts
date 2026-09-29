/**
 * @packageDocumentation
 * @module Arduino.Generators.Text.Expr
 * @description Quote and text-expression helpers for Arduino text generators.
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

export function quoteString(value: string): string {
  const escaped = value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n");
  return '"' + escaped + '"';
}

export function toTextExpression(
  generator: ArduinoGenerator,
  block: Block,
  inputName: string,
): string {
  const value = generator.valueToCode(block, inputName, Order.NONE) || '""';
  return "String(" + value + ")";
}

/** Text input for String member calls (legacy rduino style, no String() wrap). */
export function textExpression(
  generator: ArduinoGenerator,
  block: Block,
  inputName: string,
): string {
  if (!block.getInput(inputName)) {
    return '""';
  }
  return generator.valueToCode(block, inputName, Order.NONE) || '""';
}

export function quoteChar(value: string): string {
  const escaped = value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  return "'" + escaped + "'";
}
