/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Arduino code for text blocks.
 */

import type { Block } from "blockly/core/block";
import type { ArduinoGenerator } from "../arduino_generator";
import { Order } from "../arduino_generator";
import { addTextHelpers } from "./text_helpers";

function quoteString(value: string): string {
  const escaped = value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n");
  return '"' + escaped + '"';
}

function toTextExpression(
  generator: ArduinoGenerator,
  block: Block,
  inputName: string,
): string {
  const value = generator.valueToCode(block, inputName, Order.NONE) || '""';
  return "String(" + value + ")";
}

export function text(block: Block): [string, Order] {
  const textValue = block.getFieldValue("TEXT") || "";
  const code = quoteString(textValue);
  return [code, Order.ATOMIC];
}

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

export function text_length(
  block: Block,
  generator: ArduinoGenerator,
): [string, Order] {
  const value = toTextExpression(generator, block, "VALUE");
  const code = value + ".length()";
  return [code, Order.MEMBER];
}

export function text_isEmpty(
  block: Block,
  generator: ArduinoGenerator,
): [string, Order] {
  const value = toTextExpression(generator, block, "VALUE");
  const code = value + ".length() == 0";
  return [code, Order.EQUALITY];
}

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

export function text_charAt(
  block: Block,
  generator: ArduinoGenerator,
): [string, Order] {
  addTextHelpers(generator);
  const value = toTextExpression(generator, block, "VALUE");
  const where = block.getFieldValue("WHERE");
  const at = generator.valueToCode(block, "AT", Order.NONE) || "1";
  const length = value + ".length()";
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

  const code = "String(text_charAt(" + value + ", " + index + "))";
  return [code, Order.FUNCTION_CALL];
}

export function text_getSubstring(
  block: Block,
  generator: ArduinoGenerator,
): [string, Order] {
  addTextHelpers(generator);
  const value = toTextExpression(generator, block, "STRING");
  const where1 = block.getFieldValue("WHERE1");
  const where2 = block.getFieldValue("WHERE2");
  const at1 = generator.valueToCode(block, "AT1", Order.NONE) || "1";
  const at2 = generator.valueToCode(block, "AT2", Order.NONE) || "1";
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
  const code =
    "text_substring(" + value + ", " + start + ", (" + end + " + 1))";
  return [code, Order.FUNCTION_CALL];
}

export function text_changeCase(
  block: Block,
  generator: ArduinoGenerator,
): [string, Order] {
  addTextHelpers(generator);
  const value = toTextExpression(generator, block, "TEXT");
  const mode = block.getFieldValue("CASE");
  if (mode === "UPPERCASE") {
    return ["text_toUpper(" + value + ")", Order.FUNCTION_CALL];
  }
  if (mode === "LOWERCASE") {
    return ["text_toLower(" + value + ")", Order.FUNCTION_CALL];
  }
  return ["text_toTitleCase(" + value + ")", Order.FUNCTION_CALL];
}

export function text_trim(
  block: Block,
  generator: ArduinoGenerator,
): [string, Order] {
  addTextHelpers(generator);
  const value = toTextExpression(generator, block, "TEXT");
  const code = "text_trim(" + value + ")";
  return [code, Order.FUNCTION_CALL];
}

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

export function text_reverse(
  block: Block,
  generator: ArduinoGenerator,
): [string, Order] {
  addTextHelpers(generator);
  const textValue = toTextExpression(generator, block, "TEXT");
  const code = "text_reverse(" + textValue + ")";
  return [code, Order.FUNCTION_CALL];
}
