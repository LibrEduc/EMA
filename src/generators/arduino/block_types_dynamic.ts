/**
 * @packageDocumentation
 * @module Arduino.BlockTypesDynamic
 * @description Dynamic block type functions and variable-type resolver wiring.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Blockly from "blockly";
import { getInternalTypeForArduinoType } from "./block_types";
import {
  identifyNumber,
  inferArrayElementTypeFromBlock,
  inferArrayGetIndexElementType,
  normalizeBlocklyType,
} from "./block_types_array_infer";
import { LIST_VARIABLE_TYPE } from "./variable_utils";
import { debugLog } from "./debug";

/**
 * Dynamic type function signature used by the block type registry.
 */
export type BlockTypeFunction = (block: Blockly.Block) => string;

/**
 * Scope-aware variable type lookup used by `variableLookup`.
 * Injected at load time by category shared helpers so this registry does not
 * import the categories layer (avoids a circular dependency).
 */
export type VariableTypeForBlockResolver = (
  block: Blockly.Block,
  variableId: string,
) => string | null;

let resolveVariableTypeForBlockFn: VariableTypeForBlockResolver | null = null;

/**
 * Wires the variable type resolver once category shared helpers have loaded. Safe to call multiple times (last registration wins).
 * @param fn - The `fn` argument.
 */
export function registerVariableTypeForBlockResolver(
  fn: VariableTypeForBlockResolver,
): void {
  resolveVariableTypeForBlockFn = fn;
}

/**
 * Dynamic type functions map keyed by `__DYNAMIC__` suffix from `block_types/`.
 */
export const DYNAMIC_TYPE_FUNCTIONS: Record<string, BlockTypeFunction> = {
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
      const varType = resolveVariableTypeForBlockFn?.(block, variableId) ?? null;
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
