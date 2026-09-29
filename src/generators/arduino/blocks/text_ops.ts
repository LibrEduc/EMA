/**
 * @packageDocumentation
 * @module Arduino.Generators.Text.Ops
 * @description Arduino generators for join, append, length, index, charAt, and substring.
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

import { textExpression, toTextExpression } from "./text_expr";

/**
 * Generates Arduino code to concatenate text parts.
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Code string with order.
 */
export function text_join(
  block: Block,
  generator: ArduinoGenerator,
): [string, Order] {
  const items: string[] = [];
  const blockWithItemCount = block as Block & { itemCount_?: number };
  const itemCount = blockWithItemCount.itemCount_ ?? block.inputList.length;
  for (let i = 0; i < itemCount; i++) {
    const value = generator.valueToCode(block, "ADD" + i, Order.NONE);
    if (value) {
      items.push("String(" + value + ")");
    }
  }

  if (items.length === 0) {
    return ['String("")', Order.ATOMIC];
  }
  if (items.length === 1) {
    return [items[0], Order.ATOMIC];
  }
  return [items.join(" + "), Order.ADDITION];
}

/**
 * Generates Arduino code to append text to a variable.
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Statement code string.
 */
export function text_append(
  block: Block,
  generator: ArduinoGenerator,
): string {
  const varName = generator.getVariableName(block.getFieldValue("VAR"));
  const value = generator.valueToCode(block, "TEXT", Order.NONE) || '""';
  const code =
    varName + " = String(" + varName + ") + String(" + value + ");\n";
  return code;
}

/**
 * Generates Arduino code for text length.
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Code string with order.
 */
export function text_length(
  block: Block,
  generator: ArduinoGenerator,
): [string, Order] {
  const value = toTextExpression(generator, block, "VALUE");
  const code = value + ".length()";
  return [code, Order.MEMBER];
}

/**
 * Generates Arduino code for is-empty checks.
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Code string with order.
 */
export function text_isEmpty(
  block: Block,
  generator: ArduinoGenerator,
): [string, Order] {
  const value = toTextExpression(generator, block, "VALUE");
  const code = value + ".length() == 0";
  return [code, Order.EQUALITY];
}

/**
 * Generates Arduino code for substring index lookup.
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Code string with order.
 */
export function text_indexOf(
  block: Block,
  generator: ArduinoGenerator,
): [string, Order] {
  const value = toTextExpression(generator, block, "VALUE");
  const find = toTextExpression(generator, block, "FIND");
  const end = block.getFieldValue("END");
  const method = end === "FIRST" ? "indexOf" : "lastIndexOf";
  const code = value + "." + method + "(" + find + ")";
  return [code, Order.FUNCTION_CALL];
}

/**
 * Generates Arduino code to access a character at position.
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Code string with order.
 */
export function text_charAt(
  block: Block,
  generator: ArduinoGenerator,
): [string, Order] {
  const value = textExpression(generator, block, "VALUE");
  const where = block.getFieldValue("WHERE");
  const length = value + ".length()";
  const atInput = block.getInput("AT");
  const at = atInput
    ? generator.valueToCode(block, "AT", Order.NONE) || "1"
    : "1";
  let index = "0";

  switch (where) {
    case "FIRST":
      index = "0";
      break;
    case "LAST":
      index = "(" + length + " - 1)";
      break;
    case "FROM_START":
      index = "(" + at + " - 1)";
      break;
    case "FROM_END":
      index = "(" + length + " - " + at + ")";
      break;
    case "RANDOM":
      index = "random(" + length + ")";
      break;
    default:
      index = "0";
  }

  const code = value + ".charAt(" + index + ")";
  return [code, Order.FUNCTION_CALL];
}

/**
 * Generates Arduino code for substring extraction.
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Code string with order.
 */
export function text_getSubstring(
  block: Block,
  generator: ArduinoGenerator,
): [string, Order] {
  const value = textExpression(generator, block, "STRING");
  const where1 = block.getFieldValue("WHERE1");
  const where2 = block.getFieldValue("WHERE2");
  const at1 = block.getInput("AT1")
    ? generator.valueToCode(block, "AT1", Order.NONE) || "1"
    : "1";
  const at2 = block.getInput("AT2")
    ? generator.valueToCode(block, "AT2", Order.NONE) || "1"
    : "1";
  const length = value + ".length()";

  const indexFrom = (where: string, at: string): string => {
    switch (where) {
      case "FIRST":
        return "0";
      case "LAST":
        return "(" + length + " - 1)";
      case "FROM_START":
        return "(" + at + " - 1)";
      case "FROM_END":
        return "(" + length + " - " + at + ")";
      case "RANDOM":
        return "random(" + length + ")";
      default:
        return "0";
    }
  };

  const start = indexFrom(where1, at1);
  const end = indexFrom(where2, at2);
  const code = value + ".substring(" + start + ", (" + end + " + 1))";
  return [code, Order.FUNCTION_CALL];
}
