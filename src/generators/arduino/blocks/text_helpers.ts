/**
 * @packageDocumentation
 * @module Arduino.Generators.TextHelpers
 * @description Helper functions for text block generators.
 * @remarks
 * Shared helpers for the text generator implementation.
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

import type { ArduinoGenerator } from "../arduino_generator";

/**
 * Blockly@rduino-style upper/lower case helper (Arduino String methods, no ctype).
 * @param generator - Arduino generator instance.
 */
export function addUpperLowerHelper(generator: ArduinoGenerator): void {
  generator.addCodeFunction(
    "upper_lower_string",
    [
      "String UpperLowerString(String Source, bool ToUpper) {",
      "  if (ToUpper == true) Source.toUpperCase();",
      "  else Source.toLowerCase();",
      "  return Source;",
      "}",
    ].join("\n"),
  );
}

/**
 * Title-case helper without ctype (ASCII letter checks only).
 * @param generator - Arduino generator instance.
 */
export function addTitleCaseHelper(generator: ArduinoGenerator): void {
  generator.addCodeFunction(
    "text_toTitleCase",
    [
      "String text_toTitleCase(String text) {",
      "  bool newWord = true;",
      "  for (unsigned int i = 0; i < text.length(); i++) {",
      "    char c = text.charAt(i);",
      "    if ((c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z')) {",
      "      if (newWord) {",
      "        if (c >= 'a' && c <= 'z') text.setCharAt(i, c - 32);",
      "        newWord = false;",
      "      } else if (c >= 'A' && c <= 'Z') {",
      "        text.setCharAt(i, c + 32);",
      "      }",
      "    } else {",
      "      newWord = true;",
      "    }",
      "  }",
      "  return text;",
      "}",
    ].join("\n"),
  );
}

export type TextTrimMode = "BOTH" | "LEFT" | "RIGHT";

const TRIM_HELPER_BODIES: Record<TextTrimMode, string> = {
  BOTH: [
    "String TrimString(String Source) {",
    "  Source.trim();",
    "  return Source;",
    "}",
  ].join("\n"),
  LEFT: [
    "String TrimStringLeft(String Source) {",
    "  int start = 0;",
    "  while (start < (int)Source.length() && Source.charAt(start) <= ' ') start++;",
    "  return Source.substring(start);",
    "}",
  ].join("\n"),
  RIGHT: [
    "String TrimStringRight(String Source) {",
    "  int end = Source.length();",
    "  while (end > 0 && Source.charAt(end - 1) <= ' ') end--;",
    "  return Source.substring(0, end);",
    "}",
  ].join("\n"),
};

/**
 * Injects only the trim helper required for the selected mode.
 * @param generator - Arduino generator instance.
 * @param mode - BOTH, LEFT, or RIGHT.
 */
export function addTrimHelper(
  generator: ArduinoGenerator,
  mode: TextTrimMode,
): void {
  generator.addCodeFunction(`trim_string_${mode.toLowerCase()}`, TRIM_HELPER_BODIES[mode]);
}

/**
 * Adds helper functions for text list operations (count, replace, reverse).
 * @param generator - Arduino generator instance.
 */
export function addTextHelpers(generator: ArduinoGenerator): void {
  generator.addCodeFunction(
    "text_helpers",
    [
      "long text_count(String text, String sub) {",
      "  if (sub.length() == 0) return 0;",
      "  long count = 0;",
      "  int idx = 0;",
      "  while (true) {",
      "    idx = text.indexOf(sub, idx);",
      "    if (idx == -1) break;",
      "    count++;",
      "    idx += sub.length();",
      "  }",
      "  return count;",
      "}",
      "",
      "String text_replace(String text, String from, String to) {",
      "  text.replace(from, to);",
      "  return text;",
      "}",
      "",
      "String text_reverse(String text) {",
      "  String result = \"\";",
      "  for (int i = text.length() - 1; i >= 0; i--) {",
      "    result += text.charAt(i);",
      "  }",
      "  return result;",
      "}",
    ].join("\n"),
  );
}
