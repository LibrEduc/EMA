/**
 * @packageDocumentation
 * @module Arduino.Generators.Loops
 * @description Arduino code generators for loop blocks.
 * @remarks
 * Implements generator functions for the loops category. Generates Arduino code for loop blocks.
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

import * as Blockly from "blockly";
import type { Block } from "blockly/core/block";
import type { ArduinoGenerator } from "../arduino_generator";
import { Order } from "../arduino_generator";

function getDistinctName(
  generator: ArduinoGenerator,
  baseName: string,
): string {
  return generator.nameDB_
    ? generator.nameDB_.getDistinctName(
      baseName,
      Blockly.Names.NameType.DEVELOPER_VARIABLE,
    )
    : baseName;
}

function isNumericLiteral(value: string): boolean {
  if (!value) {
    return false;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }
  return !Number.isNaN(Number(trimmed));
}

function isFloatLiteral(value: string): boolean {
  if (!isNumericLiteral(value)) {
    return false;
  }
  const trimmed = value.trim();
  if (trimmed.includes(".") || trimmed.includes("e") || trimmed.includes("E")) {
    return true;
  }
  const num = Number(trimmed);
  return Number.isFinite(num) && !Number.isInteger(num);
}

function trySetCounterType(
  block: Block,
  variableId: string,
  type: "int" | "float",
): void {
  const variableMap = block.workspace?.getVariableMap?.();
  if (!variableMap) {
    return;
  }
  const variable = variableMap.getVariableById(variableId);
  if (!variable) {
    return;
  }
  if (variable.getType() !== type) {
    variable.setType(type);
  }
}

/**
 * Generates Arduino code for repeat loops with a count.
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Generated code string.
 */
export function controls_repeat_ext(
  block: Block,
  generator: ArduinoGenerator,
): string {
  // Repeat n times (controls_repeat_ext: value input; controls_repeat: field).
  const repeats = block.getField("TIMES")
    ? String(Number(block.getFieldValue("TIMES")))
    : generator.valueToCode(block, "TIMES", Order.NONE) || "0";
  const branch = generator.addLoopTrap(
    generator.statementToCode(block, "DO"),
    block,
  );
  const loopVar = getDistinctName(generator, "count");
  const code =
    "for (int " +
    loopVar +
    " = 0; " +
    loopVar +
    " < " +
    repeats +
    "; " +
    loopVar +
    "++) {\n" +
    branch +
    "}\n";
  return code;
}

export const controls_repeat = controls_repeat_ext;

/**
 * Generates Arduino code for while/until loops.
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Generated code string.
 */
export function controls_whileUntil(
  block: Block,
  generator: ArduinoGenerator,
): string {
  // While/until loop.
  const until = block.getFieldValue("MODE") === "UNTIL";
  const condition =
    generator.valueToCode(block, "BOOL", Order.NONE) || "false";
  const branch = generator.addLoopTrap(
    generator.statementToCode(block, "DO"),
    block,
  );
  if (until) {
    return "do {\n" + branch + "} while (!(" + condition + "));\n";
  }
  return "while (" + condition + ") {\n" + branch + "}\n";
}

/**
 * Generates Arduino code for numeric for-loops.
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Generated code string.
 */
export function controls_for(
  block: Block,
  generator: ArduinoGenerator,
): string {
  // For loop.
  const variable0 = generator.getVariableName(block.getFieldValue("VAR"));
  const start = generator.valueToCode(block, "FROM", Order.ASSIGNMENT) || "0";
  const end = generator.valueToCode(block, "TO", Order.RELATIONAL) || "0";
  const step = generator.valueToCode(block, "BY", Order.ADDITION) || "1";
  const branch = generator.addLoopTrap(
    generator.statementToCode(block, "DO"),
    block,
  );

  const startIsNum = isNumericLiteral(start);
  const endIsNum = isNumericLiteral(end);
  const stepIsNum = isNumericLiteral(step);

  if (startIsNum && endIsNum && stepIsNum) {
    const varId = block.getFieldValue("VAR");
    const hasFloat =
      isFloatLiteral(start) || isFloatLiteral(end) || isFloatLiteral(step);
    trySetCounterType(block, varId, hasFloat ? "float" : "int");

    const startValue = Number(start);
    const endValue = Number(end);
    let stepValue = Number(step);
    if (stepValue === 0) {
      stepValue = 1;
    }
    const shouldDecrease = startValue > endValue;
    if (shouldDecrease && stepValue > 0) {
      stepValue = -stepValue;
    } else if (!shouldDecrease && stepValue < 0) {
      stepValue = Math.abs(stepValue);
    }
    const comparison = stepValue >= 0 ? "<=" : ">=";
    const increment =
      stepValue === 1
        ? "++"
        : stepValue === -1
          ? "--"
          : (stepValue > 0 ? "+= " : "-= ") + String(Math.abs(stepValue));
    return (
      "for (" +
      variable0 +
      " = " +
      start +
      "; " +
      variable0 +
      " " +
      comparison +
      " " +
      end +
      "; " +
      variable0 +
      " " +
      increment +
      ") {\n" +
      branch +
      "}\n"
    );
  }

  const startVar = getDistinctName(generator, "start");
  const endVar = getDistinctName(generator, "end");
  const stepVar = getDistinctName(generator, "step");
  const branchIndented = generator.prefixLines(branch, generator.INDENT);
  let code = "{\n";
  code += "int " + startVar + " = " + start + ";\n";
  code += "int " + endVar + " = " + end + ";\n";
  code += "int " + stepVar + " = " + step + ";\n";
  code += "if (" + stepVar + " >= 0) {\n";
  code +=
    "  for (" +
    variable0 +
    " = " +
    startVar +
    "; " +
    variable0 +
    " <= " +
    endVar +
    "; " +
    variable0 +
    " += " +
    stepVar +
    ") {\n" +
    branchIndented +
    "  }\n";
  code += "} else {\n";
  code +=
    "  for (" +
    variable0 +
    " = " +
    startVar +
    "; " +
    variable0 +
    " >= " +
    endVar +
    "; " +
    variable0 +
    " += " +
    stepVar +
    ") {\n" +
    branchIndented +
    "  }\n";
  code += "}\n";
  code += "}\n";
  return code;
}

/**
 * Generates Arduino code for foreach loops.
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Generated code string.
 */
export function controls_forEach(
  block: Block,
  generator: ArduinoGenerator,
): string {
  // For each loop.
  const variable0 = generator.getVariableName(block.getFieldValue("VAR"));
  const list =
    generator.valueToCode(block, "LIST", Order.NONE) || "[]";
  const branch = generator.addLoopTrap(
    generator.statementToCode(block, "DO"),
    block,
  );

  const indexVar = getDistinctName(generator, "index");
  const listVar = getDistinctName(generator, "list");
  let code = "{\n";
  code += "auto " + listVar + " = " + list + ";\n";
  code +=
    "for (int " +
    indexVar +
    " = 0; " +
    indexVar +
    " < (int)(sizeof(" +
    listVar +
    ") / sizeof(" +
    listVar +
    "[0])); " +
    indexVar +
    "++) {\n";
  code += "  " + variable0 + " = " + listVar + "[" + indexVar + "];\n";
  code += branch;
  code += "}\n";
  code += "}\n";
  return code;
}

/**
 * Generates Arduino code for flow statements (break/continue).
 * @param block - Blockly block instance.
 * @returns Generated code string.
 */
export function controls_flow_statements(
  block: Block,
  _generator: ArduinoGenerator,
): string {
  // Flow statements (break/continue).
  void _generator;
  const flow = block.getFieldValue("FLOW");
  if (flow === "BREAK") {
    return "break;\n";
  }
  if (flow === "CONTINUE") {
    return "continue;\n";
  }
  return "";
}
