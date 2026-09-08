/**
 * @packageDocumentation
 * @module Arduino.ConfigureProcedureTypes
 * @description Shared types and output-type helpers for typed procedure blocks.
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

/** Blockly procedure block definition with typed-config flags. */
export type ProcedureBlockDef = Blockly.Block & {
  onchange?: (this: Blockly.Block, event: Blockly.Events.Abstract) => void;
  getBlockType?: (this: Blockly.Block) => string | null;
  updateShape_?: (this: Blockly.Block) => void;
  __typedConfigured?: boolean;
};

/** Procedure def/call block with argument models and plus-minus hooks. */
export type ProcedureBlockWithArgs = ProcedureBlockDef & {
  __typedPatched?: boolean;
  __typedPlusMinus?: boolean;
  argumentVarModels_?: Blockly.VariableModel[];
  arguments_?: string[];
  updateParams_?: () => void;
  getProcedureCall?: () => string;
  getProcedureModel?: () => Blockly.Procedures.IProcedureModel | null;
  argData_?: { model: Blockly.VariableModel; argId: string }[];
  addVarInput_?: (name: string, argId: string) => void;
};

/** Minimal procedure model surface used for return-type inference. */
export type ProcedureModel = {
  getReturnTypes?: () => string[] | null;
  setReturnTypes?: (types: string[] | null) => unknown;
};

/** Block that can expose a procedure model. */
export type ProcedureBlock = Blockly.Block & {
  getProcedureModel?: () => ProcedureModel | null;
};

/**
 * Maps Blockly / Arduino raw type labels to the internal scalar type string.
 * @param rawType Connection check or variable type from Blockly.
 * @returns Normalized internal type, or null when untyped.
 */
export function toInternalType(
  rawType: string | string[] | null | undefined,
): string | null {
  if (!rawType) return null;
  if (Array.isArray(rawType)) {
    return rawType.length > 0 ? toInternalType(rawType[0]) : null;
  }
  if (rawType === "__NO_TYPE__" || rawType === "null" || rawType === "undefined") {
    return null;
  }
  if (rawType === "Boolean") return "bool";
  if (rawType === "Number") return "int";
  if (rawType === "String") return "string";
  if (rawType === "char") return "char";
  return rawType;
}

/**
 * Infers the internal output type of a connected value block.
 * @param block Block whose output type is needed.
 * @returns Internal type string, or null when unknown.
 */
export function getBlockOutputType(block: Blockly.Block | null): string | null {
  if (!block) return null;
  if (block.type === "logic_boolean") {
    return "bool";
  }
  if (block.type === "variables_get_dynamic" || block.type === "variables_get") {
    const variableId = block.getFieldValue?.("VAR");
    if (variableId && block.workspace) {
      const variable = block.workspace.getVariableMap().getVariableById(variableId);
      const varType = variable?.getType();
      if (varType) {
        return toInternalType(varType) || varType;
      }
    }
  }
  const blockDef = block as Blockly.Block & { getBlockType?: () => string | null };
  if (blockDef.getBlockType) {
    return toInternalType(blockDef.getBlockType());
  }
  const outputCheck = block.outputConnection?.getCheck();
  return toInternalType(outputCheck as string | string[] | null | undefined);
}

/**
 * Resolves the procedure model for a def or call block.
 * @param block Procedure definition or call block.
 * @returns Procedure model, or null when unavailable.
 */
export function getProcedureModel(block: Blockly.Block): ProcedureModel | null {
  const procBlock = block as ProcedureBlock;
  const model = procBlock.getProcedureModel?.();
  if (model) return model;
  const name = block.getFieldValue?.("NAME");
  if (!name || !block.workspace) return null;
  const defBlock = Blockly.Procedures.getDefinition(
    name,
    block.workspace,
  ) as ProcedureBlock | null;
  return defBlock?.getProcedureModel?.() || null;
}
