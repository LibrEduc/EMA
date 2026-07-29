/**
 * @packageDocumentation
 * @module Arduino.BlockTypesRegistry
 * @description Block types registry - centralized type definitions for all blocks.
 * @remarks
 * Loads block type definitions and applies them to Blockly blocks.
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
import { resolveVariableTypeForBlock } from "../../categories/blockly/shared";
import { BLOCK_TYPES } from "./block_types/index";
import { getCompatibleTypes, getInternalTypeForArduinoType, isTypeCompatible, normalizeBlocklyCheckToInternalType } from "./block_types";
import { LIST_DECLARE_BLOCK_TYPES, LIST_VARIABLE_TYPE, isVariableDeclarationOwner } from "./variable_utils";
import { debugLog } from "./debug";

/**
 * Type mapping from Blockly check types to µcBlockly internal types.
 */
export type BlockTypeFunction = (block: Blockly.Block) => string;
export type BlockTypeDefinition = string | BlockTypeFunction;

/**
 * Registry of block types loaded from `block_types/`.
 */
export const BLOCK_TYPE_REGISTRY: Record<string, BlockTypeDefinition> = {};

/**
 * Identify number type (int or float) from a string
 * @param numString - The number as a string
 * @returns 'int' or 'float'
 */
function identifyNumber(numString: string | number | null | undefined): string {
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

/** Infers int/float from a math_number field value. */
export function identifyMathNumberType(
  numString: string | number | null | undefined,
): "int" | "float" {
  const identified = identifyNumber(numString);
  return identified === "float" ? "float" : "int";
}

const normalizeBlocklyType = (blocklyType: string | string[] | null): string | null => {
  if (!blocklyType) {
    return null;
  }
  if (Array.isArray(blocklyType)) {
    return blocklyType.length > 0 ? normalizeBlocklyType(blocklyType[0]) : null;
  }
  return normalizeBlocklyCheckToInternalType(blocklyType);
};

/**
 * Dynamic type functions map
 */
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
 * Infers element type from named value inputs (e.g. Array_declare contenu/contenu2).
 * Numeric types unify (int + float → float); float literals promote to float.
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
 * Infers the element type of an Array_with block from all connected inputs.
 * Numeric types unify (int + float → float); float literals promote to float.
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

/** True when at least one ADD input has a connected value block. */
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
 * Finds the list declaration block for a workspace variable id.
 * Prefers the ownership claim (`__ucbDeclareBlockId`); otherwise first block.
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
 * True when this block owns the exclusive list declaration (const-like).
 * Falls back to workspace order when ownership is not yet claimed.
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

export function inferArrayGetIndexElementType(block: Blockly.Block): string {
  const variableId = block.getFieldValue("VAR");
  const elementType = inferListVariableElementType(block.workspace, variableId);
  return elementType !== "__NO_TYPE__" ? elementType : "int";
}

const DYNAMIC_TYPE_FUNCTIONS: Record<string, BlockTypeFunction> = {
  'mathOnListType': (block: Blockly.Block): string => {
    const op = block.getFieldValue('OP');
    if (op === 'STD_DEV' || op === 'AVERAGE') {
      return 'float';
    }
    return 'int';
  },
  'localWrapper': (block: Blockly.Block): string => {
    const typed = block as Blockly.Block & { getBlockType?: () => string | null };
    const rawType = typed.getBlockType?.();
    if (rawType && rawType !== '__NO_TYPE__') {
      return rawType;
    }
    const connected = block.getInputTargetBlock('VALUE');
    if (!connected) {
      return '__NO_TYPE__';
    }
    const connectedTyped = connected as Blockly.Block & { getBlockType?: () => string | null };
    return connectedTyped.getBlockType?.() || '__NO_TYPE__';
  },
  'ternary': (block: Blockly.Block): string => {
    // Infer from both branches without forcing input checks.
    const thenBlock = block.getInputTargetBlock('THEN');
    const elseBlock = block.getInputTargetBlock('ELSE');

    const inferBranchType = (candidate: Blockly.Block | null): string | null => {
      if (!candidate) {
        return null;
      }
      const typedCandidate = candidate as Blockly.Block & {
        getBlockType?: () => string | null;
      };
      const rawType = typedCandidate.getBlockType?.() || null;
      const normalized = normalizeBlocklyType(rawType);
      if (normalized && normalized !== "__NO_TYPE__") {
        return normalized;
      }
      const outputCheck = candidate.outputConnection?.getCheck() || null;
      const normalizedCheck = normalizeBlocklyType(outputCheck);
      if (normalizedCheck && normalizedCheck !== "__NO_TYPE__") {
        return normalizedCheck;
      }
      return null;
    };

    const thenType = inferBranchType(thenBlock);
    const elseType = inferBranchType(elseBlock);
    // If only one branch is connected, keep that branch type.
    // This avoids requiring both branches to clip into typed contexts.
    if (thenType && !elseType) {
      return thenType;
    }
    if (!thenType && elseType) {
      return elseType;
    }
    if (!thenType || !elseType) {
      return "__NO_TYPE__";
    }
    if (thenType === elseType) {
      return thenType;
    }
    // Numeric convergence rules:
    // - int/float => float
    // - bool/int => int (C/Arduino promotion)
    // - bool/float => float
    const toNumericKind = (value: string): "bool" | "int" | "float" | null => {
      if (value === "float") return "float";
      if (value === "int" || value === "Number" || value === "number") return "int";
      if (value === "bool" || value === "Boolean") return "bool";
      return null;
    };
    const leftNumeric = toNumericKind(thenType);
    const rightNumeric = toNumericKind(elseType);
    if (leftNumeric && rightNumeric) {
      if (leftNumeric === "float" || rightNumeric === "float") {
        return "float";
      }
      return "int";
    }
    // Char and string can converge to string.
    const stringLike = new Set(["string", "String", "char"]);
    if (stringLike.has(thenType) && stringLike.has(elseType)) {
      return "string";
    }
    return "__NO_TYPE__";
  },
  'identifyNumber': (block: Blockly.Block): string => {
    const numString = block.getFieldValue('NUM');
    return identifyNumber(numString);
  },
  'mathRoundType': (block: Blockly.Block): string => {
    const op = block.getFieldValue('OP');
    if (op === 'ROUNDUP' || op === 'ROUNDDOWN') return 'int';
    return 'float'; // ROUND or default
  },
  'variableLookup': (block: Blockly.Block): string => {
    const variableId = block.getFieldValue('VAR');
    if (!variableId) {
      return '__NO_TYPE__';
    }
    try {
      const varType = resolveVariableTypeForBlock(block, variableId);
      if (!varType) {
        return '__NO_TYPE__';
      }
      if (varType === LIST_VARIABLE_TYPE) {
        return '__NO_TYPE__';
      }
      return getInternalTypeForArduinoType(varType);
    } catch (error) {
      debugLog('Variable not found:', variableId, error);
    }
    return '__NO_TYPE__';
  },
  /** List block: unified type of all connected elements. */
  'arrayFromInputs': (block: Blockly.Block): string =>
    inferArrayElementTypeFromBlock(block),
  /** Element type read from a declared list variable (Array_declare / create / with). */
  'arrayGetIndexElement': (block: Blockly.Block): string =>
    inferArrayGetIndexElementType(block),
  'procedureReturn': (block: Blockly.Block): string => {
    if (block.type !== "procedures_callreturn" || !block.workspace) {
      return 'int';
    }
    const name = block.getFieldValue?.("NAME");
    if (!name) {
      return 'int';
    }
    const defBlock = Blockly.Procedures.getDefinition(name, block.workspace);
    const returnBlock = defBlock?.getInputTargetBlock?.("RETURN");
    if (!returnBlock) {
      return 'int';
    }
    const typedReturn = returnBlock as Blockly.Block & { getBlockType?: () => string | null };
    const rawType = typedReturn.getBlockType ? typedReturn.getBlockType() : null;
    const normalized = normalizeBlocklyType(rawType);
    if (normalized) {
      return normalized;
    }
    if (returnBlock.outputConnection) {
      const check = normalizeBlocklyType(returnBlock.outputConnection.getCheck());
      return check || 'int';
    }
    return 'int';
  },
  'textPromptType': (block: Blockly.Block): string => {
    const type = block.getFieldValue("TYPE");
    return type === "NUMBER" ? "int" : "string";
  },
  'castType': (block: Blockly.Block): string =>
    getInternalTypeForArduinoType(block.getFieldValue("CAST_TYPE") || "int"),
};

/**
 * Initialize the block type registry from block_types.ts
 */
function initializeBlockTypeRegistry(): void {
  if (!BLOCK_TYPES || Object.keys(BLOCK_TYPES).length === 0) {
    console.warn('⚠️ Aucune définition de type trouvée dans block_types.ts');
    return;
  }

  for (const [blockType, typeDef] of Object.entries(BLOCK_TYPES)) {
    // Check if it's a dynamic type (starts with __DYNAMIC__)
    if (typeof typeDef === 'string' && typeDef.startsWith('__DYNAMIC__')) {
      const dynamicTypeName = typeDef.replace('__DYNAMIC__', '');
      const dynamicFunction = DYNAMIC_TYPE_FUNCTIONS[dynamicTypeName];
      if (dynamicFunction) {
        BLOCK_TYPE_REGISTRY[blockType] = dynamicFunction;
      } else {
        console.warn(`⚠️ Type dynamique '${dynamicTypeName}' non trouvé pour le bloc '${blockType}'`);
        // Fallback to 'int'
        BLOCK_TYPE_REGISTRY[blockType] = 'int';
      }
    } else {
      // Static type (simple string)
      BLOCK_TYPE_REGISTRY[blockType] = typeDef as string;
    }
  }

  debugLog(`✅ Type registry initialized with ${Object.keys(BLOCK_TYPE_REGISTRY).length} blocks from block_types.ts`);
}

/**
 * Get compatible types for a given type (for use with setCheck)
 * @param type - The target type
 * @returns Array of compatible types (including the type itself)
 */
/**
 * Returns Blockly check types compatible with a given µcBlockly type.
 * @param type - Normalized type string.
 * @returns Array of checks or null when unavailable.
 */
export function getCompatibleTypesForCheck(type: string | null | undefined): string[] | null {
  if (!type) {
    return null; // No type restriction
  }

  const compatibleTypes = getCompatibleTypes(type);

  // If only one type (itself), return it as a string for Blockly
  // If multiple types, return as array
  if (compatibleTypes.length === 1) {
    return [compatibleTypes[0]];
  }

  return compatibleTypes;
}

/**
 * Check if a source type is compatible with a target type
 * @param sourceType - The source type (block output)
 * @param targetType - The target type (input expected)
 * @returns true if compatible
 */
/**
 * Checks whether two types are compatible for connection.
 * @param sourceType - Source type from the connected block.
 * @param targetType - Target expected type.
 * @returns True when compatible.
 */
export function checkTypeCompatibility(
  sourceType: string | null | undefined,
  targetType: string | null | undefined,
): boolean {
  if (!sourceType || !targetType) {
    return false;
  }

  if (
    (sourceType === "Boolean" || sourceType === "bool") &&
    (targetType === "Boolean" || targetType === "bool")
  ) {
    return true;
  }

  if (
    (sourceType === "String" || sourceType === "string") &&
    (targetType === "String" || targetType === "string")
  ) {
    return true;
  }
  // Colour blocks: allow Colour to connect to Colour or String
  if (
    (sourceType === "Colour" || sourceType === "color" || sourceType === "colour") &&
    (targetType === "Colour" || targetType === "color" || targetType === "colour" ||
     targetType === "String" || targetType === "string")
  ) {
    return true;
  }
  if (
    (sourceType === "String" || sourceType === "string") &&
    (targetType === "Colour" || targetType === "color" || targetType === "colour")
  ) {
    return true;
  }
  if (
    sourceType === "char" &&
    (targetType === "String" || targetType === "string")
  ) {
    return true;
  }

  if (
    (sourceType === "Number" || sourceType === "number") &&
    (targetType === "int" || targetType === "float" || targetType === "long")
  ) {
    return true;
  }

  if (
    (sourceType === "int" || sourceType === "float" || sourceType === "long") &&
    (targetType === "Number" || targetType === "number")
  ) {
    return true;
  }

  if (
    (sourceType === "Array" || sourceType === "array") &&
    (targetType === "Array" || targetType === "array")
  ) {
    return true;
  }

  return isTypeCompatible(sourceType, targetType);
}

/**
 * Apply type definitions to all blocks in the registry
 * This function should be called after Blockly is loaded
 */
/**
 * Applies registered block type metadata to Blockly blocks.
 */
export function applyBlockTypesFromRegistry(): void {
  // Initialize registry if not already done
  if (Object.keys(BLOCK_TYPE_REGISTRY).length === 0) {
    initializeBlockTypeRegistry();
  }

  let appliedCount = 0;

  for (const [blockType, typeDef] of Object.entries(BLOCK_TYPE_REGISTRY)) {
    const blockDef = Blockly.Blocks[blockType];
    if (blockDef !== undefined) {
      const blockDefinition = blockDef as Blockly.Block & { getBlockType?: BlockTypeFunction };

      if (typeof typeDef === 'string') {
        // Simple type (string)
        blockDefinition.getBlockType = function (this: Blockly.Block): string {
          return typeDef;
        };
        appliedCount++;
      } else if (typeof typeDef === 'function') {
        // Dynamic type (function) - bind to the block instance.
        blockDefinition.getBlockType = function (this: Blockly.Block): string {
          return typeDef(this);
        };
        appliedCount++;
      }
    }
  }

  debugLog(`✅ Types applied to ${appliedCount} blocks from registry`);
}

// Initialize the registry when the module is loaded
initializeBlockTypeRegistry();
