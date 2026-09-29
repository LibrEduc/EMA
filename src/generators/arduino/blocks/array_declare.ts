/**
 * @packageDocumentation
 * @module Arduino.Generators.Array.Declare
 * @description Arduino generators for Array_declare, create, fill, and getIndex.
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
import { getCppTypeName } from "../block_types";
import {
  inferArrayElementTypeFromInputs,
  isPrimaryListDeclarationBlock,
} from "../block_types_registry";
import {
  emitGlobalDeclarationError,
  formatArrayInitializer,
  resolveDeclareCppType,
  stripArrayBraces,
} from "./array_helpers";

/**
 * Array_declare - int arr[size]; or int arr[] = \{...\};
 */
export const Array_declare = function (
  block: Blockly.Block,
  generator: ArduinoGenerator,
): string {
  if (!isPrimaryListDeclarationBlock(block)) {
    return "";
  }
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
        return emitGlobalDeclarationError(
          generator,
          "// Error: connect values to determine list type",
        );
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
  if (!isPrimaryListDeclarationBlock(block)) {
    return "";
  }
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
          return emitGlobalDeclarationError(
            generator,
            "// Error: connect values to determine list type",
          );
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
