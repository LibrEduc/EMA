/**
 * @packageDocumentation
 * @module Arduino.Generators.Text
 * @description Arduino code generators for text blocks.
 * @remarks
 * Original Blockly generator portions are under Apache-2.0. µcBlockly modifications under GPL-3.0-or-later.
 * Implements generator functions for the text category. Generates Arduino code for text blocks.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * Modifications copyright (C) 2023-2024 ASTUCE (Sébastien Canet microcompany)
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
import {
  addTextHelpers,
  addTitleCaseHelper,
  addTrimHelper,
  addUpperLowerHelper,
} from "./text_helpers";

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

/** Text input for String member calls (legacy rduino style, no String() wrap). */
function textExpression(
  generator: ArduinoGenerator,
  block: Block,
  inputName: string,
): string {
  if (!block.getInput(inputName)) {
    return '""';
  }
  return generator.valueToCode(block, inputName, Order.NONE) || '""';
}

function quoteChar(value: string): string {
  const escaped = value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  return "'" + escaped + "'";
}

/**
 * Generates Arduino code for a quoted text literal.
 * @param block - Blockly block instance.
 * @returns Code string with order.
 */
export function text(block: Block): [string, Order] {
  const textValue = block.getFieldValue("TEXT") || "";
  const code = quoteString(textValue);
  return [code, Order.ATOMIC];
}

/**
 * Generates Arduino code for a raw text literal without quotes.
 * @param block - Blockly block instance.
 * @returns Code string with order.
 */
export function text_no_quote(block: Block): [string, Order] {
  const textValue = block.getFieldValue("TEXT") || "";
  const code = textValue.trim() === "" ? '""' : textValue;
  return [code, Order.ATOMIC];
}

/**
 * Generates Arduino code for a multiline quoted text literal.
 * @param block - Blockly block instance.
 * @returns Code string with order.
 */
export function text_multiline(block: Block): [string, Order] {
  const textValue = block.getFieldValue("TEXT") || "";
  const code = quoteString(textValue);
  return [code, Order.ATOMIC];
}

/**
 * Generates Arduino code for a date literal.
 * @param block - Blockly block instance.
 * @returns Code string with order.
 */
export function text_date(block: Block): [string, Order] {
  const textValue = block.getFieldValue("DATE") || "";
  const code = quoteString(textValue);
  return [code, Order.ATOMIC];
}

/**
 * Generates Arduino code for a single character literal.
 * @param block - Blockly block instance.
 * @returns Code string with order.
 */
export function text_char(block: Block): [string, Order] {
  const value = block.getFieldValue("TEXT") || "";
  const code = quoteChar(value.charAt(0) || "");
  return [code, Order.ATOMIC];
}

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

/**
 * Generates Arduino code for printing text.
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Statement code string.
 */
export function text_print(
  block: Block,
  generator: ArduinoGenerator,
): string {
  generator.addSetup("serial_begin", "Serial.begin(9600);");
  const value = generator.valueToCode(block, "TEXT", Order.NONE) || '""';
  const code = "Serial.print(String(" + value + "));\n";
  return code;
}

/**
 * Generates Arduino code for prompt text (input).
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Code string with order.
 */
export function text_prompt_ext(
  block: Block,
  generator: ArduinoGenerator,
): [string, Order] {
  generator.addSetup("serial_begin", "Serial.begin(9600);");
  const returnType = block.getFieldValue("TYPE");
  const msg = generator.valueToCode(block, "TEXT", Order.NONE) || '""';
  if (returnType === "NUMBER") {
    const functionName = "text_prompt_number";
    generator.addCodeFunction(
      functionName,
      [
        "int " + functionName + "(String msg) {",
        "  Serial.println(msg);",
        "  while (!Serial.available()) {",
        "  }",
        "  int content = Serial.parseInt();",
        "  while (Serial.available()) { Serial.read(); }",
        "  return content;",
        "}",
      ].join("\n"),
    );
    return [functionName + "(String(" + msg + "))", Order.FUNCTION_CALL];
  }
  const functionName = "text_prompt_string";
  generator.addCodeFunction(
    functionName,
    [
      "String " + functionName + "(String msg) {",
      "  Serial.println(msg);",
      "  String content = \"\";",
      "  while (true) {",
      "    if (Serial.available()) {",
      "      char readChar = (char)Serial.read();",
      "      if (readChar == '\\n' || readChar == '\\r') {",
      "        break;",
      "      }",
      "      content += readChar;",
      "    }",
      "  }",
      "  while (Serial.available()) { Serial.read(); }",
      "  return content;",
      "}",
    ].join("\n"),
  );
  return [functionName + "(String(" + msg + "))", Order.FUNCTION_CALL];
}
