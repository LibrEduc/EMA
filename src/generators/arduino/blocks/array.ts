/**
 * @packageDocumentation
 * @module Arduino.Generators.Array
 * @description Arduino code generators for S4e-style array blocks.
 * @remarks
 * Ported from s4e array.arduino - generates C/Arduino code for arrays.
 * @license GPL-3.0-or-later
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2024 ASTUCE (Sébastien Canet microcompany)
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

import * as Blockly from "blockly";
import { ArduinoGenerator, Order } from "../arduino_generator";
import { getCppTypeName, getInternalTypeForArduinoType } from "../block_types";
import { getArduinoType } from "../arduino_types";
import {
  hasArrayListConnectedElements,
  inferArrayElementTypeFromBlock,
  inferArrayElementTypeFromInputs,
} from "../block_types_registry";

function buildArrayListLiteralCode(
  block: Blockly.Block,
  generator: ArduinoGenerator,
): string {
  const typedBlock = block as Blockly.Block & { itemCount_?: number };
  let itemCount = typedBlock.itemCount_ ?? 0;

  if (itemCount <= 0) {
    let i = 0;
    while (block.getInput("ADD" + i)) i++;
    itemCount = i;
  }

  const parts: string[] = [];
  for (let i = 0; i < itemCount; i++) {
    if (!block.getInputTargetBlock("ADD" + i)) {
      continue;
    }
    const value = generator.valueToCode(block, "ADD" + i, Order.ATOMIC);
    if (!value) {
      continue;
    }
    parts.push(value);
  }
  return "{" + parts.join(", ") + "}";
}

/**
 * Valeur « contient » : littéral `{...}` ou scalaire enveloppé `{123}`.
 */
function formatArrayInitializer(
  generator: ArduinoGenerator,
  block: Blockly.Block,
  inputName: string,
): string {
  const valueBlock = block.getInputTargetBlock(inputName);
  const code = generator.valueToCode(block, inputName, Order.ASSIGNMENT);
  if (!code) {
    return "{}";
  }
  const trimmed = code.trim();
  if (trimmed.startsWith("{")) {
    return trimmed;
  }
  if (
    valueBlock?.type === "Array_list_literal" ||
    valueBlock?.type === "Array_list_3"
  ) {
    return trimmed;
  }
  return "{" + trimmed + "}";
}

/** Retire les accolades externes d'un littéral `{a, b}`. */
function stripArrayBraces(code: string): string {
  const trimmed = code.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function resolveDeclareCppType(
  typeField: string,
  choice: string,
  block: Blockly.Block,
): string {
  if (choice !== "c2") {
    return getCppTypeName(typeField);
  }
  const inferred = inferArrayElementTypeFromInputs(block, ["contenu", "contenu2"]);
  if (!inferred || inferred === "__NO_TYPE__") {
    return getCppTypeName(typeField);
  }
  const baseInternal = getInternalTypeForArduinoType(typeField);
  if (inferred === "float" && baseInternal === "int") {
    return getCppTypeName("float");
  }
  if (inferred === baseInternal) {
    return getCppTypeName(typeField);
  }
  return getCppTypeName(inferred);
}

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
  const varName = generator.getVariableName(block.getFieldValue("VAR"));
  if (!varName || varName === "variable") {
    return "// Error: Invalid variable name\n";
  }
  if (!hasArrayListConnectedElements(block)) {
    return "// Error: connect values to determine list type\n";
  }
  const listCode = buildArrayListLiteralCode(block, generator);
  if (listCode === "{}") {
    return "// Error: connect values to determine list type\n";
  }
  const elementType = inferArrayElementTypeFromBlock(block);
  if (!elementType || elementType === "__NO_TYPE__") {
    return "// Error: connect values to determine list type\n";
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
 * Array_declare - int arr[size]; or int arr[] = \{...\};
 */
export const Array_declare = function (
  block: Blockly.Block,
  generator: ArduinoGenerator,
): string {
  const choice = block.getFieldValue("choix");
  const dimension = block.getFieldValue("dim");
  const varName = generator.getVariableName(block.getFieldValue("VAR"));
  const typeField = block.getFieldValue("type") || "int";
  const typeBlock = resolveDeclareCppType(typeField, choice, block);

  let declaration = "";
  switch (choice) {
    case "c1": {
      const size0 = generator.valueToCode(block, "contenu", Order.ASSIGNMENT) || "0";
      if (dimension === "d2") {
        const size1 = generator.valueToCode(block, "contenu2", Order.ASSIGNMENT) || "0";
        declaration = `${typeBlock} ${varName}[${size0}][${size1}];`;
      } else {
        declaration = `${typeBlock} ${varName}[${size0}];`;
      }
      break;
    }
    case "c2": {
      const values = formatArrayInitializer(generator, block, "contenu");
      const inferred = inferArrayElementTypeFromInputs(block, ["contenu", "contenu2"]);
      if (
        typeField === "__NO_TYPE__" ||
        !inferred ||
        inferred === "__NO_TYPE__" ||
        values === "{}"
      ) {
        return "// Error: connect values to determine list type\n";
      }
      if (dimension === "d2") {
        const row0 = formatArrayInitializer(generator, block, "contenu");
        const row1 = formatArrayInitializer(generator, block, "contenu2");
        const inner0 = stripArrayBraces(row0);
        const inner1 = stripArrayBraces(row1);
        const cols =
          inner0.length > 0
            ? inner0.split(",").filter((part) => part.trim()).length
            : 1;
        declaration =
          `${typeBlock} ${varName}[][${cols}] = { {${inner0}}, {${inner1}} };`;
      } else {
        const values = formatArrayInitializer(generator, block, "contenu");
        declaration = `${typeBlock} ${varName}[] = ${values};`;
      }
      break;
    }
    default:
      return "";
  }
  generator.addArrayDeclaration(declaration);
  generator.addVariable(varName, declaration);
  return "";
};

/**
 * Array_create - int arr[size]; or int arr[] = \{...\}; (1D-5D with FieldVariable)
 */
export const Array_create = function (
  block: Blockly.Block,
  generator: ArduinoGenerator,
): string {
  const varName = generator.getVariableName(block.getFieldValue("VAR"));
  const typeField = block.getFieldValue("type") || "int";
  const typeBlock = getCppTypeName(typeField);
  const menu = block.getFieldValue("choix");
  const dimension = block.getFieldValue("dim");

  let declaration = "";
  let k = "";

  switch (menu) {
    case "c1":
      for (let i = 0; i < parseInt(dimension, 10); i++) {
        const j = generator.valueToCode(block, "D" + i, Order.ASSIGNMENT);
        k += "[" + (j || "0") + "]";
      }
      declaration = typeBlock + " " + varName + k + ";";
      break;
    case "c2":
      if (dimension === "1") {
        const j = formatArrayInitializer(generator, block, "D0");
        const inferred = inferArrayElementTypeFromInputs(block, ["D0"]);
        if (
          typeField === "__NO_TYPE__" ||
          !inferred ||
          inferred === "__NO_TYPE__" ||
          j === "{}"
        ) {
          return "// Error: connect values to determine list type\n";
        }
        declaration = typeBlock + " " + varName + "[] = " + j + ";";
      } else {
        const dimCount = parseInt(dimension, 10);
        const initParts: string[] = [];
        let bracketSizes = "";
        for (let i = 0; i < dimCount; i++) {
          const j = generator.valueToCode(block, "D" + i, Order.ASSIGNMENT) || "";
          const nb = j.split(",").filter((part) => part.trim());
          initParts.push(j);
          if (i === 0) {
            bracketSizes += "[]";
          } else {
            bracketSizes += "[" + (nb.length > 0 ? nb.length : 1) + "]";
          }
        }
        k = "{" + initParts.join(",") + "}";
        declaration = typeBlock + " " + varName + bracketSizes + " = " + k + ";";
      }
      break;
    default:
      return "";
  }
  generator.addArrayDeclaration(declaration);
  generator.addVariable(varName, declaration);
  return "";
};

/**
 * Array_fix - arr[i] = value; or arr[i][j] = value;
 */
export const Array_fix = function (
  block: Blockly.Block,
  generator: ArduinoGenerator,
): string {
  const value = generator.valueToCode(block, "value", Order.ATOMIC) || "0";
  let code = generator.getVariableName(block.getFieldValue("VAR"));
  const dimension = block.getFieldValue("dim");
  for (let i = 0; i < parseInt(dimension, 10); i++) {
    const j = generator.valueToCode(block, "D" + i, Order.ASSIGNMENT);
    code += "[" + (j || "0") + "]";
  }
  code += " = " + value + ";\n";
  return code;
};

/**
 * Array_getIndex_in_array - arr[i] or arr[i][j]
 */
export const Array_getIndex_in_array = function (
  block: Blockly.Block,
  generator: ArduinoGenerator,
): [string, number] {
  let code = generator.getVariableName(block.getFieldValue("VAR"));
  const dimension = block.getFieldValue("dim");
  for (let i = 0; i < parseInt(dimension, 10); i++) {
    const j = generator.valueToCode(block, "D" + i, Order.ASSIGNMENT);
    code += "[" + (j || "0") + "]";
  }
  return [code, Order.ATOMIC];
};
