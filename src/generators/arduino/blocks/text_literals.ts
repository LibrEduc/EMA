/**
 * @packageDocumentation
 * @module Arduino.Generators.Text.Literals
 * @description Arduino generators for text literals (quoted, raw, multiline, date, char).
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
import { Order } from "../arduino_generator";
import { quoteChar, quoteString } from "./text_expr";

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
