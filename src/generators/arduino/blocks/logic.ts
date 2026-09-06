/**
 * @packageDocumentation
 * @module Arduino.Generators.Logic
 * @description Arduino code generators for logic blocks.
 * @remarks
 * Original Blockly generator portions are under Apache-2.0. µcBlockly modifications under GPL-3.0-or-later.
 * Implements generator functions for the logic category. Generates Arduino code for logic blocks.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
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

 *
 * Hacker Mode block/category palette (Apache-2.0, Google LLC 2023):
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

/**
 * Generates Arduino code for if/else control blocks.
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Generated code string.
 */
export function controls_if(block: Block, generator: ArduinoGenerator) {
  // If/elseif/else condition.
  let n = 0;
  let code = "";
  if (generator.STATEMENT_PREFIX) {
    // Automatic prefix insertion is switched off for this block.  Add manually.
    code += generator.injectId(generator.STATEMENT_PREFIX, block);
  }
  do {
    const conditionCode =
      generator.valueToCode(block, "IF" + n, Order.NONE) || "false";
    let branchCode = generator.statementToCode(block, "DO" + n);
    if (generator.STATEMENT_SUFFIX) {
      branchCode =
        generator.prefixLines(
          generator.injectId(generator.STATEMENT_SUFFIX, block),
          generator.INDENT,
        ) + branchCode;
    }
    code +=
      (n > 0 ? " else " : "") +
      "if (" +
      conditionCode +
      ") {\n" +
      branchCode +
      "}";
    n++;
  } while (block.getInput("IF" + n));
  if (block.getInput("ELSE") || generator.STATEMENT_SUFFIX) {
    let branchCode = generator.statementToCode(block, "ELSE");
    if (generator.STATEMENT_SUFFIX) {
      branchCode =
        generator.prefixLines(
          generator.injectId(generator.STATEMENT_SUFFIX, block),
          generator.INDENT,
        ) + branchCode;
    }
    code += " else {\n" + branchCode + "}";
  }
  return code + "\n";
}

export const controls_ifelse = controls_if;

/**
 * Generates Arduino code for comparison operations.
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Generated code tuple.
 */
export function logic_compare(
  block: Block,
  generator: ArduinoGenerator,
): [string, Order] {
  // Comparison operator.
  const OPERATORS = {
    EQ: "==",
    NEQ: "!=",
    LT: "<",
    LTE: "<=",
    GT: ">",
    GTE: ">=",
  };
  type OperatorOption = keyof typeof OPERATORS;
  const operator = OPERATORS[block.getFieldValue("OP") as OperatorOption];
  const order =
    operator === "==" || operator === "!=" ? Order.EQUALITY : Order.RELATIONAL;
  const argument0 = generator.valueToCode(block, "A", order) || "0";
  const argument1 = generator.valueToCode(block, "B", order) || "0";
  const code = argument0 + " " + operator + " " + argument1;
  return [code, order];
}

/**
 * Generates Arduino code for boolean operations.
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Generated code tuple.
 */
export function logic_operation(
  block: Block,
  generator: ArduinoGenerator,
): [string, Order] {
  // Operations 'and', 'or'.
  const operator = block.getFieldValue("OP") === "AND" ? "&&" : "||";
  const order = operator === "&&" ? Order.LOGICAL_AND : Order.LOGICAL_OR;
  let argument0 = generator.valueToCode(block, "A", order);
  let argument1 = generator.valueToCode(block, "B", order);
  if (!argument0 && !argument1) {
    // If there are no arguments, then the return value is false.
    argument0 = "false";
    argument1 = "false";
  } else {
    // Single missing arguments have no effect on the return value.
    const defaultArgument = operator === "&&" ? "true" : "false";
    if (!argument0) {
      argument0 = defaultArgument;
    }
    if (!argument1) {
      argument1 = defaultArgument;
    }
  }
  const code = argument0 + " " + operator + " " + argument1;
  return [code, order];
}

/**
 * Generates Arduino code for boolean negation.
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Generated code tuple.
 */
export function logic_negate(
  block: Block,
  generator: ArduinoGenerator,
): [string, Order] {
  // Negation.
  const order = Order.LOGICAL_NOT;
  const argument0 = generator.valueToCode(block, "BOOL", order) || "true";
  const code = "!" + argument0;
  return [code, order];
}

/**
 * Generates Arduino code for boolean literals.
 * @param block - Blockly block instance.
 * @returns Generated code tuple.
 */
export function logic_boolean(
  block: Block
): [string, Order] {
  // Boolean values true and false.
  const code = block.getFieldValue("BOOL") === "TRUE" ? "true" : "false";
  return [code, Order.ATOMIC];
}

/**
 * Generates Arduino code for null literal.
 * @returns Result string.
 */
export function logic_null(): [string, Order] {
  // Null data type.
  return ["NULL", Order.ATOMIC];
}

/**
 * Generates Arduino code for switch/case blocks.
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Generated code string.
 */
export function controls_switch(
  block: Block,
  generator: ArduinoGenerator,
): string {
  const switchVar = generator.getVariableName(block.getFieldValue("SWVAR"));
  const caseZero =
    generator.valueToCode(block, "CASE0", Order.NONE) || "false";
  const branchZero = generator.statementToCode(block, "DO0");
  let code =
    "switch (" +
    switchVar +
    ") {\n" +
    "case " +
    caseZero +
    ":\n" +
    branchZero +
    "  break;\n";

  const switchBlock = block as Block & {
    casebreakCount_?: number;
  };
  const caseCount = switchBlock.casebreakCount_ ?? 0;

  for (let n = 1; n <= caseCount; n += 1) {
    const argument =
      generator.valueToCode(block, "CASE" + n, Order.NONE) || "false";
    const branch = generator.statementToCode(block, "DO" + n);
    code += "case " + argument + ":\n" + branch + "  break;\n";
  }
  const defaultBranch = generator.statementToCode(block, "DEFAULT");
  const hasDefaultBranch =
    !!block.getInputTargetBlock?.("DEFAULT") || defaultBranch.trim().length > 0;
  if (hasDefaultBranch) {
    code += "default:\n" + defaultBranch + "  break;\n";
  }
  code += "}\n";
  return code;
}

/**
 * Generates Arduino code for ternary expressions.
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Generated code tuple.
 */
export function logic_ternary(
  block: Block,
  generator: ArduinoGenerator,
): [string, Order] {
  // Ternary operator.
  const value_if =
    generator.valueToCode(block, "IF", Order.CONDITIONAL) || "false";
  const value_then =
    generator.valueToCode(block, "THEN", Order.CONDITIONAL) || "null";
  const value_else =
    generator.valueToCode(block, "ELSE", Order.CONDITIONAL) || "null";
  const code = value_if + " ? " + value_then + " : " + value_else;
  return [code, Order.CONDITIONAL];
}

