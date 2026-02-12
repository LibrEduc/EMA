/**
 * @packageDocumentation
 * @module Arduino.Generators.Array
 * @description Arduino code generators for S4e-style array blocks.
 * @remarks
 * Ported from s4e array.arduino - génère du code C/Arduino pour tableaux.
 * @license GPL-3.0-or-later
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

import * as Blockly from "blockly";
import { ArduinoGenerator, Order } from "../arduino_generator";
import { getArduinoType } from "../arduino_types";

/**
 * Array_with - value block with mutator, outputs {v0, v1, ...} (null when empty).
 */
export const Array_with = function (
  block: Blockly.Block,
  generator: ArduinoGenerator,
): [string, number] {
  const typedBlock = block as Blockly.Block & { itemCount_?: number };
  let itemCount = typedBlock.itemCount_ ?? 0;

  // Fallback for legacy/partial states: detect ADD inputs dynamically.
  if (itemCount <= 0) {
    let i = 0;
    while (block.getInput("ADD" + i)) i++;
    itemCount = i;
  }

  const parts: string[] = [];
  for (let i = 0; i < itemCount; i++) {
    const value = generator.valueToCode(block, "ADD" + i, Order.ATOMIC) || "null";
    parts.push(value);
  }
  return ["{" + parts.join(", ") + "}", Order.ATOMIC];
};

/**
 * Legacy alias for saved workspaces using Array_list_3.
 */
export const Array_list_3 = Array_with;

/**
 * Array_getIndex_in_list - list[index] (1-based in s4e → 0-based)
 */
export const Array_getIndex_in_list = function (
  block: Blockly.Block,
  generator: ArduinoGenerator,
): [string, number] {
  let at = generator.valueToCode(block, "AT", Order.UNARY_NEGATION) || "1";
  const list = generator.valueToCode(block, "VAR", Order.MEMBER) || "{}";
  if (at && !Number.isNaN(parseFloat(at)) && Number.isFinite(parseFloat(at))) {
    at = String(parseFloat(at) - 1);
  }
  const code = list + "[" + at + "]";
  return [code, Order.MEMBER];
};

/**
 * Array_modify - name[indice] = value;
 */
export const Array_modify = function (
  block: Blockly.Block,
  generator: ArduinoGenerator,
): string {
  const indice = generator.valueToCode(block, "indice", Order.ATOMIC) || "0";
  const name = generator.valueToCode(block, "name", Order.ATOMIC) || "{}";
  const value = generator.valueToCode(block, "value", Order.ATOMIC) || "0";
  return name + "[" + indice + "] = " + value + ";\n";
};

/**
 * Array_declare - int arr[size]; or int arr[] = {...};
 */
export const Array_declare = function (
  block: Blockly.Block,
  generator: ArduinoGenerator,
): string {
  const argument0 = generator.valueToCode(block, "contenu", Order.ASSIGNMENT) || "0";
  const varName = generator.getVariableName(block.getFieldValue("VAR"));
  const typeField = block.getFieldValue("type") || "int";
  const typeInfo = getArduinoType(typeField);
  const typeBlock = typeInfo?.cppName ?? typeField;
  const choice = block.getFieldValue("choix");
  const dimension = block.getFieldValue("dim");

  let declaration = "";
  switch (choice) {
    case "c1":
      if (dimension === "d2") {
        declaration = typeBlock + " " + varName + "[" + argument0 + "][" + argument0 + "];";
      } else {
        declaration = typeBlock + " " + varName + "[" + argument0 + "];";
      }
      break;
    case "c2":
      if (dimension === "d2") {
        const parts = argument0.split("{");
        const nb1 = parts.length - 2;
        const arg = (parts[2] || "").split(",");
        const nb2 = arg.length - 1;
        declaration = typeBlock + " " + varName + "[" + nb1 + "][" + nb2 + "] = " + argument0 + ";";
      } else {
        declaration = typeBlock + " " + varName + "[] = " + argument0 + ";";
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
 * Array_create - int arr[size]; or int arr[] = {...}; (1D-5D with FieldVariable)
 */
export const Array_create = function (
  block: Blockly.Block,
  generator: ArduinoGenerator,
): string {
  const varName = generator.getVariableName(block.getFieldValue("VAR"));
  const typeField = block.getFieldValue("type") || "int";
  const typeInfo = getArduinoType(typeField);
  const typeBlock = typeInfo?.cppName ?? typeField;
  const menu = block.getFieldValue("choix");
  const dimension = block.getFieldValue("dim");

  let declaration = "";
  let k = "";
  let l = "";

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
        const j = generator.valueToCode(block, "D0", Order.ASSIGNMENT);
        declaration = typeBlock + " " + varName + "[] = " + (j || "{}") + ";";
      } else {
        k = "{";
        for (let i = 0; i < parseInt(dimension, 10); i++) {
          const j = generator.valueToCode(block, "D" + i, Order.ASSIGNMENT) || "";
          const nb = j.split(",");
          k += j + ",";
          l += "[" + nb.length + "]";
        }
        k = k.substring(0, k.length - 1) + "}";
        declaration = typeBlock + " " + varName + l + " = " + k + ";";
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
