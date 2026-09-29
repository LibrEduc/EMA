/**
 * @packageDocumentation
 * @module Arduino.Generators.Array.Helpers
 * @description Shared helpers for Arduino array block code generators.
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
import { getCppTypeName, getInternalTypeForArduinoType } from "../block_types";
import { inferArrayElementTypeFromInputs } from "../block_types_registry";

export function buildArrayListLiteralCode(
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
export function emitGlobalDeclarationError(
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
export function formatArrayInitializer(
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
export function stripArrayBraces(code: string): string {
  const trimmed = code.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

export function resolveDeclareCppType(
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

const TEXT_INITIALIZER_BLOCK_TYPES = new Set([
  "text",
  "text_multiline",
  "text_no_quote",
]);

export function isTextInitializerBlock(
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

export function buildTextInitializerCopyIntoList(
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

export function readBitmapGrid(
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

export function buildBitmapCopyIntoList(
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
