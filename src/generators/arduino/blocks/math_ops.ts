/**
 * @packageDocumentation
 * @module Arduino.Generators.Math.Ops
 * @description Arduino generators for arithmetic, unary, trig, round, modulo, constrain, atan2, and change.
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

import { addMathInclude } from "./math_helpers";
import {
  isMathChangeCompatibleVariableType,
  resolveMathChangeVariableId,
} from "../../../categories/blockly/shared_numeric";

/**
 * Generates Arduino code for a change-by statement.
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Statement code string.
 */
export function math_change(
  block: Block,
  generator: ArduinoGenerator,
): string {
  const getValueIfInputExists = (inputName: string): string => {
    if (!block.getInput(inputName)) {
      return "";
    }
    return generator.valueToCode(block, inputName, Order.NONE) || "";
  };
  const variableId = resolveMathChangeVariableId(block);
  if (variableId && block.workspace) {
    const variable = block.workspace.getVariableMap().getVariableById(variableId);
    const varType = variable?.getType?.() ?? null;
    if (varType && !isMathChangeCompatibleVariableType(varType)) {
      // Do not emit String/bool += delta (would concatenate or be invalid).
      return "";
    }
  }
  const target =
    getValueIfInputExists("VAR") || getValueIfInputExists("NAME") || "0";
  const delta = generator.valueToCode(block, "DELTA", Order.ADDITION) || "0";
  return target + " += " + delta + ";\n";
}

/**
 * Generates Arduino code for arithmetic expressions.
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Code string with order.
 */
export function math_arithmetic(
  block: Block,
  generator: ArduinoGenerator,
): [string, Order] {
  const OPERATORS: Record<string, { op: string; order: Order }> = {
    ADD: { op: "+", order: Order.ADDITION },
    MINUS: { op: "-", order: Order.SUBTRACTION },
    MULTIPLY: { op: "*", order: Order.MULTIPLICATION },
    DIVIDE: { op: "/", order: Order.DIVISION },
  };
  const operator = block.getFieldValue("OP");
  const argument0 = generator.valueToCode(block, "A", Order.NONE) || "0";
  const argument1 = generator.valueToCode(block, "B", Order.NONE) || "0";

  if (operator === "POWER") {
    addMathInclude(generator);
    const code = "pow(" + argument0 + ", " + argument1 + ")";
    return [code, Order.FUNCTION_CALL];
  }

  const mapped = OPERATORS[operator] || OPERATORS.ADD;
  const code = argument0 + " " + mapped.op + " " + argument1;
  return [code, mapped.order];
}

/**
 * Generates Arduino code for single-operand math operations.
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Code string with order.
 */
export function math_single(
  block: Block,
  generator: ArduinoGenerator,
): [string, Order] {
  const operator = block.getFieldValue("OP");
  const arg = generator.valueToCode(block, "NUM", Order.NONE) || "0";

  switch (operator) {
    case "ABS":
      return [
        "((" + arg + ") < 0 ? -(" + arg + ") : (" + arg + "))",
        Order.CONDITIONAL,
      ];
    case "NEG":
      return ["-" + arg, Order.UNARY_NEGATION];
    default:
      break;
  }

  addMathInclude(generator);

  switch (operator) {
    case "ROOT":
      return ["sqrt(" + arg + ")", Order.FUNCTION_CALL];
    case "LN":
      return ["log(" + arg + ")", Order.FUNCTION_CALL];
    case "LOG10":
      return ["log10(" + arg + ")", Order.FUNCTION_CALL];
    case "EXP":
      return ["exp(" + arg + ")", Order.FUNCTION_CALL];
    case "POW10":
      return ["pow(10, " + arg + ")", Order.FUNCTION_CALL];
    case "ROUND":
      return ["round(" + arg + ")", Order.FUNCTION_CALL];
    case "ROUNDUP":
      return ["ceil(" + arg + ")", Order.FUNCTION_CALL];
    case "ROUNDDOWN":
      return ["floor(" + arg + ")", Order.FUNCTION_CALL];
    case "SIN":
      return ["sin(" + arg + " * PI / 180)", Order.FUNCTION_CALL];
    case "COS":
      return ["cos(" + arg + " * PI / 180)", Order.FUNCTION_CALL];
    case "TAN":
      return ["tan(" + arg + " * PI / 180)", Order.FUNCTION_CALL];
    case "ASIN":
      return ["asin(" + arg + ") * 180 / PI", Order.MULTIPLICATION];
    case "ACOS":
      return ["acos(" + arg + ") * 180 / PI", Order.MULTIPLICATION];
    case "ATAN":
      return ["atan(" + arg + ") * 180 / PI", Order.MULTIPLICATION];
    default:
      return ["0", Order.ATOMIC];
  }
}

/**
 * Generates Arduino code for trigonometric functions.
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Code string with order.
 */
export function math_trig(
  block: Block,
  generator: ArduinoGenerator,
): [string, Order] {
  const operator = block.getFieldValue("OP");
  const arg = generator.valueToCode(block, "NUM", Order.NONE) || "0";
  addMathInclude(generator);

  switch (operator) {
    case "SIN":
      return ["sin(" + arg + " * PI / 180)", Order.FUNCTION_CALL];
    case "COS":
      return ["cos(" + arg + " * PI / 180)", Order.FUNCTION_CALL];
    case "TAN":
      return ["tan(" + arg + " * PI / 180)", Order.FUNCTION_CALL];
    default:
      return ["0", Order.ATOMIC];
  }
}

/**
 * Generates Arduino code for rounding operations.
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Code string with order.
 */
export function math_round(
  block: Block,
  generator: ArduinoGenerator,
): [string, Order] {
  const operator = block.getFieldValue("OP");
  const arg = generator.valueToCode(block, "NUM", Order.NONE) || "0";
  addMathInclude(generator);

  switch (operator) {
    case "ROUND":
      return ["round(" + arg + ")", Order.FUNCTION_CALL];
    case "ROUNDUP":
      return ["ceil(" + arg + ")", Order.FUNCTION_CALL];
    case "ROUNDDOWN":
      return ["floor(" + arg + ")", Order.FUNCTION_CALL];
    default:
      return ["round(" + arg + ")", Order.FUNCTION_CALL];
  }
}

/**
 * Generates Arduino code for modulo operation.
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Code string with order.
 */
export function math_modulo(
  block: Block,
  generator: ArduinoGenerator,
): [string, Order] {
  const dividend =
    generator.valueToCode(block, "DIVIDEND", Order.NONE) || "0";
  const divisor =
    generator.valueToCode(block, "DIVISOR", Order.NONE) || "1";
  const code =
    "(" + divisor + " != 0 ? ((long)(" + dividend + ") % (long)(" + divisor + ")) : 0)";
  return [code, Order.MODULUS];
}

/**
 * Generates Arduino code for constrain(min, max).
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Code string with order.
 */
export function math_constrain(
  block: Block,
  generator: ArduinoGenerator,
): [string, Order] {
  const value = generator.valueToCode(block, "VALUE", Order.NONE) || "0";
  const low = generator.valueToCode(block, "LOW", Order.NONE) || "0";
  const high = generator.valueToCode(block, "HIGH", Order.NONE) || "0";
  const code = "constrain(" + value + ", " + low + ", " + high + ")";
  return [code, Order.FUNCTION_CALL];
}

/**
 * Generates Arduino code for atan2.
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Code string with order.
 */
export function math_atan2(
  block: Block,
  generator: ArduinoGenerator,
): [string, Order] {
  const x = generator.valueToCode(block, "X", Order.NONE) || "0";
  const y = generator.valueToCode(block, "Y", Order.NONE) || "0";
  addMathInclude(generator);
  const code = "atan2(" + y + ", " + x + ") * 180 / PI";
  return [code, Order.MULTIPLICATION];
}

