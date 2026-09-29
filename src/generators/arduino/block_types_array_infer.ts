/**
 * @packageDocumentation
 * @module Arduino.BlockTypesArrayInfer
 * @description Number and array/list type inference helpers for Arduino blocks.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type * as Blockly from "blockly";
import { getInternalTypeForArduinoType, normalizeBlocklyCheckToInternalType } from "./block_types";
import { LIST_DECLARE_BLOCK_TYPES, isVariableDeclarationOwner } from "./variable_utils";

/**
 * Identify number type (int or float) from a string
 * @param numString - The number as a string
 * @returns 'int' or 'float'
 */
export function identifyNumber(numString: string | number | null | undefined): string {
  if (numString === null || numString === undefined) return 'int';
  const text = String(numString);
  const trimmed = text.trim().toLowerCase();

  // Handle explicit casts like int( ... ) or float( ... )
  if (trimmed.startsWith('int(')) {
    return 'int';
  }
  if (trimmed.startsWith('float(')) {
    return 'float';
  }

  // Check if it contains a decimal point or scientific notation
  if (text.includes('.') || text.includes(',') || text.includes('e') || text.includes('E')) {
    return 'float';
  }

  // Try to parse as number to check range
  const num = Number.parseFloat(text);
  if (!Number.isNaN(num)) {
    // Integers are int, decimals are float
    if (num % 1 === 0) {
      return 'int';
    }
    return 'float';
  }

  return 'int';
}

/**
 * Infers int/float from a math_number field value.
 * @param numString - The `numString` argument.
 * @returns Operation result.
 */
export function identifyMathNumberType(
  numString: string | number | null | undefined,
): "int" | "float" {
  const identified = identifyNumber(numString);
  return identified === "float" ? "float" : "int";
}

/**
 * Normalizes a Blockly check / getBlockType value to an internal type string.
 * @param blocklyType - Raw Blockly type or check array.
 * @returns Normalized type or null.
 */
export function normalizeBlocklyType(blocklyType: string | string[] | null): string | null {
  if (!blocklyType) {
    return null;
  }
  if (Array.isArray(blocklyType)) {
    return blocklyType.length > 0 ? normalizeBlocklyType(blocklyType[0]) : null;
  }
  return normalizeBlocklyCheckToInternalType(blocklyType);
}

const inferArrayInputBlockType = (b: Blockly.Block | null): string | null => {
  if (!b) {
    return null;
  }
  const typed = b as Blockly.Block & { getBlockType?: () => string | null };
  const raw = typed.getBlockType?.() ?? null;
  const norm = normalizeBlocklyType(raw);
  if (norm && norm !== "__NO_TYPE__") {
    return norm;
  }
  const check = b.outputConnection?.getCheck() ?? null;
  const checkNorm = normalizeBlocklyType(
    Array.isArray(check) ? (check[0] ?? null) : check,
  );
  return checkNorm && checkNorm !== "__NO_TYPE__" ? checkNorm : null;
};

/**
 * Infers element type from named value inputs (e.g. Array_declare contenu/contenu2). Numeric types unify (int + float → float); float literals promote to float.
 * @param block - Blockly block instance.
 * @param inputNames - The `inputNames` argument.
 * @returns Result string.
 */
export function inferArrayElementTypeFromInputs(
  block: Blockly.Block,
  inputNames: string[],
): string {
  const types: Array<string | null> = [];
  let hasFloatLiteral = false;
  for (const inputName of inputNames) {
    const target = block.getInputTargetBlock(inputName);
    if (!target) {
      continue;
    }
    if (target.type === "math_number") {
      if (identifyMathNumberType(target.getFieldValue("NUM")) === "float") {
        hasFloatLiteral = true;
      }
    }
    if (
      target.type === "Array_list_literal" ||
      target.type === "Array_list_3" ||
      target.type === "Array_with"
    ) {
      const listType = inferArrayElementTypeFromBlock(target);
      types.push(listType !== "__NO_TYPE__" ? listType : null);
      continue;
    }
    types.push(inferArrayInputBlockType(target));
  }

  const presentTypes = types.filter(
    (t): t is string => Boolean(t) && t !== "__NO_TYPE__",
  );
  if (presentTypes.length === 0) {
    return "__NO_TYPE__";
  }

  const allNumeric = presentTypes.every((t) => t === "int" || t === "float");
  if (allNumeric) {
    const hasFloat =
      hasFloatLiteral || presentTypes.some((t) => t === "float");
    return hasFloat ? "float" : "int";
  }

  const first = presentTypes[0];
  if (presentTypes.every((t) => t === first)) {
    return first;
  }
  return first;
}

/**
 * Infers the element type of an Array_with block from all connected inputs. Numeric types unify (int + float → float); float literals promote to float.
 * @param block - Blockly block instance.
 * @returns Result string.
 */
export function inferArrayElementTypeFromBlock(block: Blockly.Block): string {
  const inputNames: string[] = [];
  let i = 0;
  for (;;) {
    if (!block.getInput("ADD" + i)) {
      break;
    }
    inputNames.push("ADD" + i);
    i++;
  }
  return inferArrayElementTypeFromInputs(block, inputNames);
}

/**
 * True when at least one ADD input has a connected value block.
 * @param block - Blockly block instance.
 * @returns True when the condition holds.
 */
export function hasArrayListConnectedElements(block: Blockly.Block): boolean {
  let i = 0;
  while (block.getInput("ADD" + i)) {
    if (block.getInputTargetBlock("ADD" + i)) {
      return true;
    }
    i++;
  }
  return false;
}

/**
 * All list declaration blocks that reference a given variable id (workspace order).
 * @param workspace - Blockly workspace.
 * @param variableId - Identifier.
 * @returns Result array.
 */
export function findAllListDeclarationBlocks(
  workspace: Blockly.Workspace,
  variableId: string,
): Blockly.Block[] {
  const found: Blockly.Block[] = [];
  for (const block of workspace.getAllBlocks(false)) {
    if (!(LIST_DECLARE_BLOCK_TYPES as readonly string[]).includes(block.type)) {
      continue;
    }
    if (block.getFieldValue("VAR") === variableId) {
      found.push(block);
    }
  }
  return found;
}

/**
 * Finds the list declaration block for a workspace variable id. Prefers the ownership claim (`__ucbDeclareBlockId`); otherwise first block.
 * @param workspace - Blockly workspace.
 * @param variableId - Identifier.
 * @returns Operation result.
 */
export function findListDeclarationBlock(
  workspace: Blockly.Workspace,
  variableId: string,
): Blockly.Block | null {
  const all = findAllListDeclarationBlocks(workspace, variableId);
  if (all.length === 0) {
    return null;
  }
  const variable = workspace.getVariableMap().getVariableById(variableId);
  const ownerId = (variable as { __ucbDeclareBlockId?: string } | null)
    ?.__ucbDeclareBlockId;
  if (ownerId) {
    const owned = all.find((block) => block.id === ownerId);
    if (owned) {
      return owned;
    }
  }
  return all[0] ?? null;
}

/**
 * True when this block owns the exclusive list declaration (const-like). Falls back to workspace order when ownership is not yet claimed.
 * @param block - Blockly block instance.
 * @returns True when the condition holds.
 */
export function isPrimaryListDeclarationBlock(block: Blockly.Block): boolean {
  const variableId = block.getFieldValue("VAR");
  if (!variableId || !block.workspace) {
    return true;
  }
  const variable = block.workspace.getVariableMap().getVariableById(variableId);
  if (variable) {
    if (!isVariableDeclarationOwner(variable, block.id)) {
      return false;
    }
    const ownerId = (variable as { __ucbDeclareBlockId?: string })
      .__ucbDeclareBlockId;
    if (ownerId) {
      return ownerId === block.id;
    }
  }
  const primary = findListDeclarationBlock(block.workspace, variableId);
  return !primary || primary.id === block.id;
}

/**
 * True when another list declaration block already owns the same variable.
 * @param block - Blockly block instance.
 * @returns True when the condition holds.
 */
export function hasDuplicateListDeclaration(block: Blockly.Block): boolean {
  const variableId = block.getFieldValue("VAR");
  if (!variableId || !block.workspace) {
    return false;
  }
  return findAllListDeclarationBlocks(block.workspace, variableId).length > 1;
}

/**
 * Element type (int, char, …) of a list variable from its declaration block.
 * @param workspace - Blockly workspace.
 * @param variableId - Identifier.
 * @returns Result string.
 */
export function inferListVariableElementType(
  workspace: Blockly.Workspace | null,
  variableId: string | null | undefined,
): string {
  if (!workspace || !variableId) {
    return "__NO_TYPE__";
  }
  const declareBlock = findListDeclarationBlock(workspace, variableId);
  if (!declareBlock) {
    return "__NO_TYPE__";
  }
  if (declareBlock.type === "Array_with") {
    if (!hasArrayListConnectedElements(declareBlock)) {
      return "__NO_TYPE__";
    }
    return inferArrayElementTypeFromBlock(declareBlock);
  }
  if (declareBlock.type === "Array_bitmap") {
    return getInternalTypeForArduinoType("byte");
  }
  const typeField = declareBlock.getFieldValue("type") || "int";
  return getInternalTypeForArduinoType(typeField);
}

/**
 * Infer Array Get Index Element Type.
 * @param block - Blockly block instance.
 * @returns Result string.
 */
export function inferArrayGetIndexElementType(block: Blockly.Block): string {
  const variableId = block.getFieldValue("VAR");
  const elementType = inferListVariableElementType(block.workspace, variableId);
  return elementType !== "__NO_TYPE__" ? elementType : "int";
}
