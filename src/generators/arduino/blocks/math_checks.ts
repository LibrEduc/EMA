/**
 * @packageDocumentation
 * @module Arduino.Generators.Math.Checks
 * @description Arduino generators for interval comparisons and number property checks.
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

import { addPrimeHelper } from "./math_helpers";

/**
 * Generates Arduino code for interval comparisons.
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Code string with order.
 */
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

/**
 * Generates Arduino code for numeric property checks.
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Code string with order.
 */
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
