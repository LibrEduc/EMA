/**
 * @packageDocumentation
 * @module Arduino.Generators.Text.Transform
 * @description Arduino generators for case, trim, count, replace, and reverse.
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

import {
  addTextHelpers,
  addTitleCaseHelper,
  addTrimHelper,
  addUpperLowerHelper,
} from "./text_helpers";
import { textExpression, toTextExpression } from "./text_expr";

/**
 * Generates Arduino code for text case changes.
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Code string with order.
 */
export function text_changeCase(
  block: Block,
  generator: ArduinoGenerator,
): [string, Order] {
  const value = textExpression(generator, block, "TEXT");
  const mode = block.getFieldValue("CASE");
  if (mode === "UPPERCASE") {
    addUpperLowerHelper(generator);
    return ["UpperLowerString(" + value + ", true)", Order.FUNCTION_CALL];
  }
  if (mode === "LOWERCASE") {
    addUpperLowerHelper(generator);
    return ["UpperLowerString(" + value + ", false)", Order.FUNCTION_CALL];
  }
  addTitleCaseHelper(generator);
  return ["text_toTitleCase(" + value + ")", Order.FUNCTION_CALL];
}

/**
 * Generates Arduino code for trimming text.
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Code string with order.
 */
export function text_trim(
  block: Block,
  generator: ArduinoGenerator,
): [string, Order] {
  const value = textExpression(generator, block, "TEXT");
  const mode = (block.getFieldValue("MODE") || "BOTH") as
    | "BOTH"
    | "LEFT"
    | "RIGHT";
  addTrimHelper(generator, mode);
  if (mode === "LEFT") {
    return ["TrimStringLeft(" + value + ")", Order.FUNCTION_CALL];
  }
  if (mode === "RIGHT") {
    return ["TrimStringRight(" + value + ")", Order.FUNCTION_CALL];
  }
  return ["TrimString(" + value + ")", Order.FUNCTION_CALL];
}

/**
 * Generates Arduino code for counting substrings.
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Code string with order.
 */
export function text_count(
  block: Block,
  generator: ArduinoGenerator,
): [string, Order] {
  addTextHelpers(generator);
  const textValue = toTextExpression(generator, block, "TEXT");
  const subValue = toTextExpression(generator, block, "SUB");
  const code = "text_count(" + textValue + ", " + subValue + ")";
  return [code, Order.FUNCTION_CALL];
}

/**
 * Generates Arduino code for replacing substrings.
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Code string with order.
 */
export function text_replace(
  block: Block,
  generator: ArduinoGenerator,
): [string, Order] {
  addTextHelpers(generator);
  const textValue = toTextExpression(generator, block, "TEXT");
  const fromValue = toTextExpression(generator, block, "FROM");
  const toValue = toTextExpression(generator, block, "TO");
  const code =
    "text_replace(" + textValue + ", " + fromValue + ", " + toValue + ")";
  return [code, Order.FUNCTION_CALL];
}

/**
 * Generates Arduino code for reversing text.
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Code string with order.
 */
export function text_reverse(
  block: Block,
  generator: ArduinoGenerator,
): [string, Order] {
  addTextHelpers(generator);
  const textValue = toTextExpression(generator, block, "TEXT");
  const code = "text_reverse(" + textValue + ")";
  return [code, Order.FUNCTION_CALL];
}
