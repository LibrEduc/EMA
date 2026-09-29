/**
 * @packageDocumentation
 * @module Arduino.Generators.Text.Io
 * @description Arduino generators for text print and serial prompt.
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

