/**
 * @packageDocumentation
 * @module Arduino.Generators.Array.List
 * @description Arduino generators for list literal, with, index, modify, and set.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import * as Blockly from "blockly";
import { ArduinoGenerator, Order } from "../arduino_generator";
import { getArduinoType } from "../arduino_types";
import {
  hasArrayListConnectedElements,
  inferArrayElementTypeFromBlock,
  isPrimaryListDeclarationBlock,
} from "../block_types_registry";
import {
  buildArrayListLiteralCode,
  buildBitmapCopyIntoList,
  buildTextInitializerCopyIntoList,
  emitGlobalDeclarationError,
  isTextInitializerBlock,
} from "./array_helpers";

/**
 * Array_list_literal - list literal value for Array_declare / Array_create.
 */
export const Array_list_literal = function (
  block: Blockly.Block,
  generator: ArduinoGenerator,
): [string, number] {
  if (!hasArrayListConnectedElements(block)) {
    return ["{}", Order.ATOMIC];
  }
  const code = buildArrayListLiteralCode(block, generator);
  return [code === "{}" ? "{}" : code, Order.ATOMIC];
};

/**
 * Legacy alias for saved workspaces using Array_list_3.
 */
export const Array_list_3 = Array_list_literal;

/**
 * Array_with - define [variable] as global list (declaration before setup()).
 */
export const Array_with = function (
  block: Blockly.Block,
  generator: ArduinoGenerator,
): string {
  if (!isPrimaryListDeclarationBlock(block)) {
    return "";
  }
  const varName = generator.getVariableName(block.getFieldValue("VAR"));
  if (!varName || varName === "variable") {
    return emitGlobalDeclarationError(generator, "// Error: Invalid variable name");
  }
  if (!hasArrayListConnectedElements(block)) {
    return emitGlobalDeclarationError(
      generator,
      "// Error: connect values to determine list type",
    );
  }
  const listCode = buildArrayListLiteralCode(block, generator);
  if (listCode === "{}") {
    return emitGlobalDeclarationError(
      generator,
      "// Error: connect values to determine list type",
    );
  }
  const elementType = inferArrayElementTypeFromBlock(block);
  if (!elementType || elementType === "__NO_TYPE__") {
    return emitGlobalDeclarationError(
      generator,
      "// Error: connect values to determine list type",
    );
  }
  const arduinoTypeKey = elementType === "bool" ? "boolean" : elementType;
  const cppType = getArduinoType(arduinoTypeKey)?.cppName ?? elementType;
  const declaration = `${cppType} ${varName}[] = ${listCode};`;
  generator.addArrayDeclaration(declaration);
  generator.addVariable(varName, declaration);
  return "";
};

/**
 * Array_getIndex_in_list - list[index] (index 0-based, comme en C/Arduino)
 */
export const Array_getIndex_in_list = function (
  block: Blockly.Block,
  generator: ArduinoGenerator,
): [string, number] {
  const at = generator.valueToCode(block, "AT", Order.UNARY_NEGATION) || "0";
  const list = generator.getVariableName(block.getFieldValue("VAR"));
  const code = list + "[" + at + "]";
  return [code, Order.MEMBER];
};

/**
 * Array_modify - listVar[indice] = value;
 */
export const Array_modify = function (
  block: Blockly.Block,
  generator: ArduinoGenerator,
): string {
  const indice = generator.valueToCode(block, "indice", Order.ATOMIC) || "0";
  const name = generator.getVariableName(block.getFieldValue("VAR"));
  const value = generator.valueToCode(block, "value", Order.ATOMIC) || "0";
  return name + "[" + indice + "] = " + value + ";\n";
};

/**
 * Array_set - whole-list assignment: set list to [bitmap | list literal | text init].
 */
export const Array_set = function (
  block: Blockly.Block,
  generator: ArduinoGenerator,
): string {
  const name = generator.getVariableName(block.getFieldValue("VAR"));
  if (!name || name === "variable") {
    return "// Error: Invalid variable name\n";
  }
  const valueBlock = block.getInputTargetBlock("VALUE");
  if (valueBlock?.type === "Array_bitmap_get") {
    return buildBitmapCopyIntoList(name, valueBlock, generator);
  }
  if (
    valueBlock?.type === "Array_list_literal" ||
    valueBlock?.type === "Array_list_3"
  ) {
    const typedBlock = valueBlock as Blockly.Block & { itemCount_?: number };
    let itemCount = typedBlock.itemCount_ ?? 0;
    if (itemCount <= 0) {
      let i = 0;
      while (valueBlock.getInput("ADD" + i)) i++;
      itemCount = i;
    }
    const lines: string[] = [];
    for (let i = 0; i < itemCount; i++) {
      if (!valueBlock.getInputTargetBlock("ADD" + i)) {
        continue;
      }
      const value =
        generator.valueToCode(valueBlock, "ADD" + i, Order.ASSIGNMENT) || "0";
      lines.push(name + "[" + i + "] = " + value + ";\n");
    }
    if (lines.length === 0) {
      return "// Error: empty list literal\n";
    }
    return lines.join("");
  }
  if (isTextInitializerBlock(valueBlock)) {
    const raw = String(valueBlock!.getFieldValue("TEXT") || "").trim();
    return buildTextInitializerCopyIntoList(name, raw);
  }
  return (
    "// Error: plug a bitmap, list literal, or text initializer into set " +
    name +
    "\n"
  );
};
