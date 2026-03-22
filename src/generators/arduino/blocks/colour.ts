/**
 * @packageDocumentation
 * @module Arduino.Generators.Colour
 * @description Arduino code generators for colour blocks.
 * @remarks
 * Implements generator functions for the colour category. Generates Arduino code for colour blocks.
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

import type { Block } from "blockly/core/block";
import type { ArduinoGenerator } from "../arduino_generator";
import { Order } from "../arduino_generator";

/**
 * Generates Arduino code for a colour picker value.
 * @param block - Blockly block instance.
 * @returns Code string with order.
 */
export function colour_picker(block: Block): [string, Order] {
  const code = '"' + (block.getFieldValue("COLOUR") || "#000000") + '"';
  return [code, Order.ATOMIC];
}

/**
 * Generates Arduino code for the custom colour picker value.
 * @param block - Blockly block instance.
 * @returns Code string with order.
 */
export function color_picker_custom(block: Block): [string, Order] {
  const code =
    '"' +
    (block.getFieldValue("COLOR") || block.getFieldValue("COLOUR") || "#000000") +
    '"';
  return [code, Order.ATOMIC];
}

/**
 * Generates Arduino code for the HSV picker value.
 * @param block - Blockly block instance.
 * @returns Code string with order.
 */
export function color_picker_hsv(block: Block): [string, Order] {
  const code = '"' + (block.getFieldValue("COLOUR") || "#000000") + '"';
  return [code, Order.ATOMIC];
}

/**
 * Generates Arduino code for a random colour.
 * @param generator - Arduino generator instance.
 * @returns Code string with order.
 */
export function colour_random(
  _block: Block,
  generator: ArduinoGenerator,
): [string, Order] {
  const functionName = "colourRandom";
  generator.addCodeFunction(
    functionName,
    [
      "String colourRandom() {",
      '  String colorRand = "";',
      "  for (int i = 0; i < 6; i++) {",
      "    int randNum = random(0, 16);",
      "    colorRand += String(randNum, HEX);",
      "  }",
      '  return ("#" + colorRand);',
      "}",
    ].join("\n"),
  );
  return [functionName + "()", Order.FUNCTION_CALL];
}

/**
 * Generates Arduino code for RGB colour composition.
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Code string with order.
 */
export function colour_rgb(
  block: Block,
  generator: ArduinoGenerator,
): [string, Order] {
  const red = block.getFieldValue("RED") || 0;
  const green = block.getFieldValue("GREEN") || 0;
  const blue = block.getFieldValue("BLUE") || 0;
  const functionName = "colourRgb";
  generator.addCodeFunction(
    functionName,
    [
      "String colourRgb(int r, int g, int b) {",
      "  r = max(min(r * 2.55, 255), 0);",
      "  g = max(min(g * 2.55, 255), 0);",
      "  b = max(min(b * 2.55, 255), 0);",
      '  return ("#" + String(r, HEX) + String(g, HEX) + String(b, HEX));',
      "}",
    ].join("\n"),
  );
  const code = `${functionName}(${red}, ${green}, ${blue})`;
  return [code, Order.FUNCTION_CALL];
}

/**
 * Generates Arduino code for blending two colours.
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Code string with order.
 */
export function colour_blend(
  block: Block,
  generator: ArduinoGenerator,
): [string, Order] {
  const colour1 =
    generator.valueToCode(block, "COLOUR1", Order.NONE) || '"#000000"';
  const colour2 =
    generator.valueToCode(block, "COLOUR2", Order.NONE) || '"#000000"';
  const ratio = generator.valueToCode(block, "RATIO", Order.NONE) || "0.5";
  const functionName = "colourBlend";
  generator.addCodeFunction(
    functionName,
    [
      "String colourBlend(String c1, String c2, float ratio) {",
      "  ratio = max(min(ratio, 1), 0);",
      "  int r1 = (c1.substring(1, 3)).toInt();",
      "  int g1 = (c1.substring(3, 5)).toInt();",
      "  int b1 = (c1.substring(5, 7)).toInt();",
      "  int r2 = (c2.substring(1, 3)).toInt();",
      "  int g2 = (c2.substring(3, 5)).toInt();",
      "  int b2 = (c2.substring(5, 7)).toInt();",
      "  int r = round(r1 * (1 - ratio) + r2 * ratio);",
      "  int g = round(g1 * (1 - ratio) + g2 * ratio);",
      "  int b = round(b1 * (1 - ratio) + b2 * ratio);",
      '  return ("#" + String(r) + String(g) + String(b));',
      "}",
    ].join("\n"),
  );
  const code = `${functionName}(${colour1}, ${colour2}, ${ratio})`;
  return [code, Order.FUNCTION_CALL];
}
