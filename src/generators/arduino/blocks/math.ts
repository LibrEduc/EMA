/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Arduino code for math blocks.
 */

import type { Block } from "blockly/core/block";
import type { ArduinoGenerator } from "../arduino_generator";
import { Order } from "../arduino_generator";
import {
  addListHelpers,
  addMathInclude,
  addPrimeHelper,
} from "./math_helpers";

export function math_number(block: Block): [string, Order] {
  // Numeric literal.
  const code = block.getFieldValue("NUM") || "0";
  return [code, Order.ATOMIC];
}

export function inout_angle_maths(block: Block): [string, Order] {
  const angle = block.getFieldValue("ANGLE") || "0";
  return [angle, Order.ATOMIC];
}

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

export function math_single(
  block: Block,
  generator: ArduinoGenerator,
): [string, Order] {
  const operator = block.getFieldValue("OP");
  const arg = generator.valueToCode(block, "NUM", Order.NONE) || "0";
  addMathInclude(generator);

  switch (operator) {
    case "ABS":
      return ["abs(" + arg + ")", Order.FUNCTION_CALL];
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
    case "NEG":
      return ["-" + arg, Order.UNARY_NEGATION];
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

export function math_interval(
  block: Block,
  generator: ArduinoGenerator,
): [string, Order] {
  const OPERATORS: Record<string, string> = {
    LT: "<",
    LTE: "<=",
    GT: ">",
    GTE: ">=",
  };
  const valueInf =
    generator.valueToCode(block, "inf", Order.RELATIONAL) || "0";
  const compInf = OPERATORS[block.getFieldValue("comp_inf")] || "<";
  const valueVal =
    generator.valueToCode(block, "valeur", Order.RELATIONAL) || "0";
  const compSup = OPERATORS[block.getFieldValue("comp_sup")] || "<";
  const valueSup =
    generator.valueToCode(block, "sup", Order.RELATIONAL) || "0";
  const code =
    "((" +
    valueInf +
    " " +
    compInf +
    " " +
    valueVal +
    ") && (" +
    valueVal +
    " " +
    compSup +
    " " +
    valueSup +
    "))";
  return [code, Order.LOGICAL_AND];
}

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

export function math_constant(
  block: Block,
  generator: ArduinoGenerator,
): [string, Order] {
  const constant = block.getFieldValue("CONSTANT");
  addMathInclude(generator);
  switch (constant) {
    case "PI":
      return ["PI", Order.ATOMIC];
    case "E":
      return ["2.718281828459045", Order.ATOMIC];
    case "GOLDEN_RATIO":
      return ["1.618033988749895", Order.ATOMIC];
    case "SQRT2":
      return ["1.4142135623730951", Order.ATOMIC];
    case "SQRT1_2":
      return ["0.7071067811865476", Order.ATOMIC];
    case "INFINITY":
      return ["INFINITY", Order.ATOMIC];
    default:
      return ["0", Order.ATOMIC];
  }
}

export function math_number_property(
  block: Block,
  generator: ArduinoGenerator,
): [string, Order] {
  const numberToCheck =
    generator.valueToCode(block, "NUMBER_TO_CHECK", Order.NONE) || "0";
  const property = block.getFieldValue("PROPERTY");
  let code = "";

  switch (property) {
    case "EVEN":
      code = "((long)(" + numberToCheck + ") % 2 == 0)";
      break;
    case "ODD":
      code = "((long)(" + numberToCheck + ") % 2 != 0)";
      break;
    case "PRIME":
      addPrimeHelper(generator);
      code = "math_isPrime((long)(" + numberToCheck + "))";
      break;
    case "WHOLE":
      code =
        "(" +
        numberToCheck +
        " == (long)(" +
        numberToCheck +
        "))";
      break;
    case "POSITIVE":
      code = "(" + numberToCheck + " > 0)";
      break;
    case "NEGATIVE":
      code = "(" + numberToCheck + " < 0)";
      break;
    case "DIVISIBLE_BY": {
      const divisor =
        generator.valueToCode(block, "DIVISOR", Order.NONE) || "0";
      code =
        "(" +
        divisor +
        " != 0 && ((long)(" +
        numberToCheck +
        ") % (long)(" +
        divisor +
        ") == 0))";
      break;
    }
    default:
      code = "false";
  }

  return [code, Order.LOGICAL_AND];
}

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

export function math_on_list(
  block: Block,
  generator: ArduinoGenerator,
): [string, Order] {
  const list = generator.valueToCode(block, "LIST", Order.NONE) || "{}";
  const operator = block.getFieldValue("OP");
  addListHelpers(generator);

  switch (operator) {
    case "SUM":
      return ["math_sum(" + list + ")", Order.FUNCTION_CALL];
    case "MIN":
      return ["math_min(" + list + ")", Order.FUNCTION_CALL];
    case "MAX":
      return ["math_max(" + list + ")", Order.FUNCTION_CALL];
    case "AVERAGE":
      return ["math_mean(" + list + ")", Order.FUNCTION_CALL];
    case "MEDIAN":
      return ["math_median(" + list + ")", Order.FUNCTION_CALL];
    case "MODE":
      return ["math_mode(" + list + ")", Order.FUNCTION_CALL];
    case "STD_DEV":
      return ["math_standard_deviation(" + list + ")", Order.FUNCTION_CALL];
    case "RANDOM":
      return ["math_random_list(" + list + ")", Order.FUNCTION_CALL];
    default:
      return ["0", Order.ATOMIC];
  }
}

export function math_modulo(
  block: Block,
  generator: ArduinoGenerator,
): [string, Order] {
  const dividend =
    generator.valueToCode(block, "DIVIDEND", Order.NONE) || "0";
  const divisor =
    generator.valueToCode(block, "DIVISOR", Order.NONE) || "1";
  addMathInclude(generator);
  const code = "fmod(" + dividend + ", " + divisor + ")";
  return [code, Order.FUNCTION_CALL];
}

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

export function math_random_int(
  block: Block,
  generator: ArduinoGenerator,
): [string, Order] {
  const from = generator.valueToCode(block, "FROM", Order.NONE) || "0";
  const to = generator.valueToCode(block, "TO", Order.NONE) || "0";
  const code = "random(" + from + ", (" + to + ") + 1)";
  return [code, Order.FUNCTION_CALL];
}

export function math_random_float(): [string, Order] {
  const code = "((double)random(0, 1000) / 1000.0)";
  return [code, Order.DIVISION];
}

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
