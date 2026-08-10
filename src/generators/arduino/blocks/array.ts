/**
 * @packageDocumentation
 * @module Arduino.Generators.Array
 * @description Arduino code generators for S4e-style array blocks.
 * @remarks
 * Ported from s4e array.arduino - generates C/Arduino code for arrays.
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
 */

import * as Blockly from "blockly";
import { ArduinoGenerator, Order } from "../arduino_generator";
import { getCppTypeName, getInternalTypeForArduinoType } from "../block_types";
import { getArduinoType } from "../arduino_types";
import {
  hasArrayListConnectedElements,
  inferArrayElementTypeFromBlock,
  inferArrayElementTypeFromInputs,
  isPrimaryListDeclarationBlock,
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
 * Places a declaration-block error in the global variables section
 * (not in an artificial `loop()` from top-level return code).
 */
function emitGlobalDeclarationError(
  generator: ArduinoGenerator,
  message: string,
): string {
  const comment = message.replace(/\n+$/, "");
  generator.addArrayDeclaration(comment);
  return "";
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

const TEXT_INITIALIZER_BLOCK_TYPES = new Set([
  "text",
  "text_multiline",
  "text_no_quote",
]);

function isTextInitializerBlock(
  block: Blockly.Block | null,
): block is Blockly.Block {
  return Boolean(block && TEXT_INITIALIZER_BLOCK_TYPES.has(block.type));
}

/** Top-level comma-separated items inside an outermost `{...}`. */
function splitTopLevelBraceItems(init: string): string[] {
  const s = init.trim();
  if (!s.startsWith("{") || !s.endsWith("}")) {
    return [];
  }
  const inner = s.slice(1, -1);
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (ch === "{") {
      depth++;
    } else if (ch === "}") {
      depth--;
    } else if (ch === "," && depth === 0) {
      const part = inner.slice(start, i).trim();
      if (part) {
        parts.push(part);
      }
      start = i + 1;
    }
  }
  const last = inner.slice(start).trim();
  if (last) {
    parts.push(last);
  }
  return parts;
}

function resolveTextArrayInitializer(rawText: string): {
  init: string;
  dims: { rows: number; cols: number; rank: 1 | 2 };
} | null {
  let init = rawText.trim();
  if (!init.startsWith("{") || !init.endsWith("}")) {
    return null;
  }
  // Unwrap one 3D layer: {{{r0},{r1}},{...}} → first 2D frame
  for (let guard = 0; guard < 3; guard++) {
    const items = splitTopLevelBraceItems(init);
    if (items.length === 0) {
      return null;
    }
    if (!items[0].startsWith("{")) {
      break;
    }
    const nested = splitTopLevelBraceItems(items[0]);
    if (nested[0]?.startsWith("{")) {
      init = items[0].trim();
      continue;
    }
    break;
  }
  const dims = inferInitializerDims(init);
  if (!dims) {
    return null;
  }
  return { init, dims };
}

function inferInitializerDims(
  init: string,
): { rows: number; cols: number; rank: 1 | 2 } | null {
  const items = splitTopLevelBraceItems(init);
  if (items.length === 0) {
    return null;
  }
  if (items[0].startsWith("{")) {
    const cols = splitTopLevelBraceItems(items[0]).length;
    if (cols === 0) {
      return null;
    }
    return { rows: items.length, cols, rank: 2 };
  }
  return { rows: 1, cols: items.length, rank: 1 };
}

function buildTextInitializerCopyIntoList(
  varName: string,
  rawText: string,
): string {
  const resolved = resolveTextArrayInitializer(rawText);
  if (!resolved) {
    return (
      "// Error: text for set " +
      varName +
      " must be a C initializer like {1, 2} or {{0,1},{1,0}}\n"
    );
  }
  const { init, dims } = resolved;
  if (dims.rank === 1) {
    return (
      "{\n" +
      "  const byte _ucb_src[" +
      dims.cols +
      "] = " +
      init +
      ";\n" +
      "  for (int _ucb_i = 0; _ucb_i < " +
      dims.cols +
      "; _ucb_i++) {\n" +
      "    " +
      varName +
      "[_ucb_i] = _ucb_src[_ucb_i];\n" +
      "  }\n" +
      "}\n"
    );
  }
  return (
    "{\n" +
    "  const byte _ucb_src[" +
    dims.rows +
    "][" +
    dims.cols +
    "] = " +
    init +
    ";\n" +
    "  for (int _ucb_r = 0; _ucb_r < " +
    dims.rows +
    "; _ucb_r++) {\n" +
    "    for (int _ucb_c = 0; _ucb_c < " +
    dims.cols +
    "; _ucb_c++) {\n" +
    "      " +
    varName +
    "[_ucb_r][_ucb_c] = _ucb_src[_ucb_r][_ucb_c];\n" +
    "    }\n" +
    "  }\n" +
    "}\n"
  );
}

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

function readBitmapGrid(
  block: Blockly.Block,
  generator: ArduinoGenerator,
): { cols: number; rows: number; rowsCode: string } {
  const colsRaw = generator.valueToCode(block, "COLS", Order.ATOMIC);
  const rowsRaw = generator.valueToCode(block, "ROWS", Order.ATOMIC);
  const cols = Math.max(1, Math.min(32, Number(colsRaw) || 8));
  const rows = Math.max(1, Math.min(32, Number(rowsRaw) || 8));
  const raw = block.getFieldValue("BITMAP") as number[][] | null;
  const grid: number[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: number[] = [];
    for (let c = 0; c < cols; c++) {
      row.push(raw?.[r]?.[c] ? 1 : 0);
    }
    grid.push(row);
  }
  const rowsCode = grid
    .map((row) => "{ " + row.join(", ") + " }")
    .join(",\n  ");
  return { cols, rows, rowsCode };
}

function buildBitmapCopyIntoList(
  varName: string,
  bitmapBlock: Blockly.Block,
  generator: ArduinoGenerator,
): string {
  const { cols, rows, rowsCode } = readBitmapGrid(bitmapBlock, generator);
  return (
    "{\n" +
    "  const byte _ucb_bmp[" +
    rows +
    "][" +
    cols +
    "] = {\n  " +
    rowsCode +
    "\n  };\n" +
    "  for (int _ucb_r = 0; _ucb_r < " +
    rows +
    "; _ucb_r++) {\n" +
    "    for (int _ucb_c = 0; _ucb_c < " +
    cols +
    "; _ucb_c++) {\n" +
    "      " +
    varName +
    "[_ucb_r][_ucb_c] = _ucb_bmp[_ucb_r][_ucb_c];\n" +
    "    }\n" +
    "  }\n" +
    "}\n"
  );
}

/**
 * Array_bitmap - global 2D byte array from FieldBitmap (rows x cols of 0/1).
 */
export const Array_bitmap = function (
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
  const { cols, rows, rowsCode } = readBitmapGrid(block, generator);
  const declaration =
    "byte " +
    varName +
    "[" +
    rows +
    "][" +
    cols +
    "] = {\n  " +
    rowsCode +
    "\n};";
  generator.addArrayDeclaration(declaration);
  generator.addVariable(varName, declaration);
  return "";
};

/**
 * Array_bitmap_get - value: 2D 0/1 initializer from FieldBitmap.
 */
export const Array_bitmap_get = function (
  block: Blockly.Block,
  generator: ArduinoGenerator,
): [string, number] {
  const { rowsCode } = readBitmapGrid(block, generator);
  return ["{\n  " + rowsCode + "\n}", Order.ATOMIC];
};
