/**
 * @packageDocumentation
 * @module Arduino.Generator.InitVars
 * @description Workspace variable collection and global declaration building for ArduinoGenerator.init().
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
import {
  isMathChangeCompatibleVariableType,
  isVariableProcedureParameter,
  isVariableUseOutsideProcedureBody,
  resolveGlobalVariableType,
  resolveMathChangeVariableId,
  shouldOmitGlobalVariableDeclaration,
} from "../../categories/blockly/shared";
import { getArduinoType } from "./arduino_types";
import { Order } from "./order";
import {
  getCppTypeName,
  isArduinoScalarType,
  normalizeBlocklyCheckToInternalType,
} from "./block_types";
import { inferArrayElementTypeFromBlock } from "./block_types_registry";
import {
  unwrapValueBlock,
  usesLocalVariableDeclaration,
} from "./variable_scope";
import { isVariablesDefineBlock, LIST_VARIABLE_TYPE } from "./variable_utils";

/**
 * Host hooks required while building global variable declarations during init.
 */
export type InitVarsHost = {
  nameDB: Blockly.Names;
  valueToCode(
    block: Blockly.Block,
    name: string,
    order: number,
  ): string;
  addArrayDeclaration(declaration: string): void;
  setVariablesDefinition(code: string): void;
};

type ProcedureDefBlock = Blockly.Block & {
  argumentVarModels_?: Blockly.VariableModel[];
  argData_?: { model: Blockly.VariableModel; argId: string }[];
  getProcedureModel?: () =>
    | (Blockly.Procedures.IProcedureModel & {
        getParameters?: () => {
          getId?: () => string;
          getName?: () => string;
        }[];
      })
    | null;
  getVars?: () => string[] | null;
};

/**
 * Collects declared / inferred variable types and writes global declarations
 * into the generator host (array declarations + definitions_["variables"]).
 * @param workspace - Workspace being generated.
 * @param host - Name DB and declaration sinks from ArduinoGenerator.
 */
export function collectAndDeclareInitVariables(
  workspace: Blockly.Workspace,
  host: InitVarsHost,
): void {
  const declaredVariableIds = new Set<string>();
  for (const block of workspace.getAllBlocks(false)) {
    if (
      block.type === "variables_const" ||
      block.type === "variables_set_init" ||
      isVariablesDefineBlock(block.type)
    ) {
      const varId = block.getFieldValue?.("VAR");
      if (varId) {
        declaredVariableIds.add(varId);
      }
    }
  }

  const procedureArgIds = new Set<string>();
  const procedureArgNames = new Set<string>();
  for (const block of workspace.getAllBlocks(false)) {
    if (
      block.type !== "procedures_defreturn" &&
      block.type !== "procedures_defnoreturn"
    ) {
      continue;
    }
    const procBlock = block as ProcedureDefBlock;
    const argModels = procBlock.argumentVarModels_;
    if (argModels && argModels.length > 0) {
      for (const model of argModels) {
        if (model?.getId) {
          procedureArgIds.add(model.getId());
        }
        const name = model?.getName?.();
        if (name) {
          procedureArgNames.add(name);
        }
      }
    }
    const argData = procBlock.argData_ || [];
    for (const datum of argData) {
      const id = datum.model?.getId?.();
      if (id) {
        procedureArgIds.add(id);
      }
      const name = datum.model?.getName?.();
      if (name) {
        procedureArgNames.add(name);
      }
    }
    const procModel = procBlock.getProcedureModel?.();
    const procParams = procModel?.getParameters?.() || [];
    for (const param of procParams) {
      const paramId = param?.getId?.();
      if (paramId) {
        procedureArgIds.add(paramId);
      }
      const paramName = param?.getName?.();
      if (paramName) {
        procedureArgNames.add(paramName);
      }
    }
  }
  const normalizedProcedureArgNames = new Set<string>();
  for (const name of procedureArgNames) {
    normalizedProcedureArgNames.add(
      host.nameDB.getName(name, Blockly.Names.NameType.VARIABLE),
    );
  }

  const variableNamesByType: Record<string, string[]> = {};

  const devVarList = Blockly.Variables.allDeveloperVariables(workspace);
  for (const devVar of devVarList) {
    const varName = host.nameDB.getName(
      devVar,
      Blockly.Names.NameType.DEVELOPER_VARIABLE,
    );
    const varType = "int";
    if (!variableNamesByType[varType]) {
      variableNamesByType[varType] = [];
    }
    variableNamesByType[varType].push(varName);
  }

  const localVariableIds = new Set<string>();
  const globalVariableIds = new Set<string>();
  for (const block of workspace.getAllBlocks(false)) {
    if (block.type !== "variables_set_dynamic") {
      continue;
    }
    const blockVarId = block.getFieldValue?.("VAR");
    if (!blockVarId) {
      continue;
    }
    const valueBlock = block.getInputTargetBlock?.("VALUE");
    if (usesLocalVariableDeclaration(valueBlock)) {
      localVariableIds.add(blockVarId);
    } else {
      globalVariableIds.add(blockVarId);
    }
  }

  const normalizeBlocklyType = (
    rawType: string | null | undefined,
  ): string | null => normalizeBlocklyCheckToInternalType(rawType);

  const getOutputBlockType = (
    valueBlock: Blockly.Block | null,
  ): string | null => {
    if (!valueBlock) return null;
    const typedBlock = valueBlock as Blockly.Block & {
      getBlockType?: () => string | null;
    };
    const rawType = typedBlock.getBlockType ? typedBlock.getBlockType() : null;
    const normalized = normalizeBlocklyType(rawType || "");
    if (normalized) return normalized;
    const check = valueBlock.outputConnection?.getCheck();
    if (Array.isArray(check)) {
      return normalizeBlocklyType(check[0]);
    }
    return normalizeBlocklyType(check || null);
  };

  const inferredTypesByVarId = new Map<string, string>();
  for (const block of workspace.getAllBlocks(false)) {
    if (
      block.type !== "variables_set_dynamic" &&
      block.type !== "variables_set"
    ) {
      continue;
    }
    const varId = block.getFieldValue?.("VAR");
    if (!varId) {
      continue;
    }
    if (!isVariableUseOutsideProcedureBody(block)) {
      continue;
    }
    const valueBlock = block.getInputTargetBlock?.("VALUE");
    if (usesLocalVariableDeclaration(valueBlock)) {
      continue;
    }
    const inferredType = getOutputBlockType(valueBlock);
    if (inferredType) {
      inferredTypesByVarId.set(varId, inferredType);
    }
  }

  const inferMathChangeDeltaType = (
    deltaBlock: Blockly.Block | null,
  ): string | null => {
    if (!deltaBlock) {
      return null;
    }
    if (deltaBlock.type === "math_number") {
      const num = Number(deltaBlock.getFieldValue("NUM"));
      if (!Number.isNaN(num)) {
        return Number.isInteger(num) ? "int" : "float";
      }
    }
    return getOutputBlockType(deltaBlock);
  };
  for (const block of workspace.getAllBlocks(false)) {
    if (block.type !== "math_change") {
      continue;
    }
    const varId = resolveMathChangeVariableId(block);
    if (!varId) {
      continue;
    }
    if (!isVariableUseOutsideProcedureBody(block)) {
      continue;
    }
    const existingInferred = inferredTypesByVarId.get(varId);
    if (
      existingInferred &&
      !isMathChangeCompatibleVariableType(existingInferred)
    ) {
      continue;
    }
    const variableModel = workspace.getVariableMap().getVariableById(varId);
    const modelType = variableModel?.getType?.() ?? null;
    if (modelType && !isMathChangeCompatibleVariableType(modelType)) {
      continue;
    }
    const deltaType = inferMathChangeDeltaType(
      block.getInputTargetBlock("DELTA"),
    );
    if (deltaType === "float") {
      inferredTypesByVarId.set(varId, "float");
    } else if (deltaType === "int") {
      const existing = inferredTypesByVarId.get(varId);
      if (existing !== "float") {
        inferredTypesByVarId.set(varId, "int");
      }
    }
  }

  const declaredAsArrayVariableIds = new Set<string>();
  for (const block of workspace.getAllBlocks(false)) {
    if (
      block.type !== "variables_set_dynamic" &&
      block.type !== "variables_set"
    ) {
      continue;
    }
    const valueBlock = block.getInputTargetBlock?.("VALUE");
    const innerValueBlock = unwrapValueBlock(valueBlock);
    if (
      innerValueBlock?.type !== "Array_list_literal" &&
      innerValueBlock?.type !== "Array_list_3"
    ) {
      continue;
    }
    if (usesLocalVariableDeclaration(valueBlock)) {
      continue;
    }
    const varId = block.getFieldValue?.("VAR");
    if (!varId || declaredAsArrayVariableIds.has(varId)) continue;
    const varName = host.nameDB.getName(
      varId,
      Blockly.Names.NameType.VARIABLE,
    );
    const listCode = host.valueToCode(block, "VALUE", Order.ASSIGNMENT);
    if (!listCode) continue;
    let elementType = inferArrayElementTypeFromBlock(innerValueBlock);
    if (!elementType || elementType === "__NO_TYPE__") elementType = "int";
    const arduinoTypeKey = elementType === "bool" ? "boolean" : elementType;
    const cppType = getArduinoType(arduinoTypeKey)?.cppName ?? elementType;
    host.addArrayDeclaration(cppType + " " + varName + "[] = " + listCode + ";");
    declaredAsArrayVariableIds.add(varId);
  }

  for (const block of workspace.getAllBlocks(false)) {
    if (
      block.type !== "Array_with" &&
      block.type !== "Array_bitmap" &&
      block.type !== "Array_declare" &&
      block.type !== "Array_create"
    ) {
      continue;
    }
    const varId = block.getFieldValue?.("VAR");
    if (varId) {
      declaredAsArrayVariableIds.add(varId);
    }
  }

  const getProcedureParamNames = (block: Blockly.Block): Set<string> => {
    const names = new Set<string>();
    const vars = (block as ProcedureDefBlock).getVars?.();
    if (Array.isArray(vars)) {
      for (const name of vars) {
        if (name) {
          names.add(name);
          names.add(
            host.nameDB.getName(name, Blockly.Names.NameType.VARIABLE),
          );
        }
      }
    }
    const model = (block as ProcedureDefBlock).getProcedureModel?.();
    const params = model?.getParameters?.() || [];
    for (const param of params) {
      const name = param?.getName?.();
      if (name) {
        names.add(name);
        names.add(
          host.nameDB.getName(name, Blockly.Names.NameType.VARIABLE),
        );
      }
    }
    return names;
  };

  const isUseWithinMatchingProcedure = (
    block: Blockly.Block,
    variableName: string,
  ): boolean => {
    if (
      block.type === "procedures_defreturn" ||
      block.type === "procedures_defnoreturn"
    ) {
      const paramNames = getProcedureParamNames(block);
      return paramNames.has(variableName);
    }
    let parent = block.getSurroundParent?.() || null;
    while (parent) {
      if (
        parent.type === "procedures_defreturn" ||
        parent.type === "procedures_defnoreturn"
      ) {
        const paramNames = getProcedureParamNames(parent);
        return paramNames.has(variableName);
      }
      parent = parent.getSurroundParent?.() || null;
    }
    return false;
  };

  const variables = Blockly.Variables.allUsedVarModels(workspace);
  for (const variable of variables) {
    if (!variable) {
      continue;
    }
    const variableUses = Blockly.Variables.getVariableUsesById(
      workspace,
      variable.getId(),
    );
    if (
      variableUses &&
      variableUses.length > 0 &&
      variableUses.every((use) =>
        isUseWithinMatchingProcedure(use, variable.getName()),
      )
    ) {
      continue;
    }
    if (declaredVariableIds.has(variable.getId())) {
      continue;
    }
    if (declaredAsArrayVariableIds.has(variable.getId())) {
      continue;
    }
    if (variable.getType() === LIST_VARIABLE_TYPE) {
      continue;
    }
    if (
      localVariableIds.has(variable.getId()) &&
      !globalVariableIds.has(variable.getId())
    ) {
      continue;
    }
    const varName = host.nameDB.getName(
      variable.getId(),
      Blockly.Names.NameType.VARIABLE,
    );
    if (
      shouldOmitGlobalVariableDeclaration(
        workspace,
        variable.getId(),
        varName,
        procedureArgIds,
        normalizedProcedureArgNames,
      )
    ) {
      continue;
    }

    const globalType = resolveGlobalVariableType(workspace, variable.getId());
    const inferredType = inferredTypesByVarId.get(variable.getId());
    const rawType = variable.getType();
    const sharedWithProcedureParam =
      isVariableProcedureParameter(workspace, variable.getId()) &&
      procedureArgIds.has(variable.getId());
    let typeKey =
      normalizeBlocklyType(globalType || "") ||
      normalizeBlocklyType(inferredType || "") ||
      (!sharedWithProcedureParam ? normalizeBlocklyType(rawType || "") : null) ||
      "__NO_TYPE__";
    if (inferredType === "float" && typeKey === "int") {
      typeKey = "float";
    } else if (inferredType === "int" && typeKey === "float") {
      typeKey = "int";
    }
    if (typeKey !== "__NO_TYPE__" && !isArduinoScalarType(typeKey)) {
      typeKey = "__NO_TYPE__";
    }
    if (!variableNamesByType[typeKey]) {
      variableNamesByType[typeKey] = [];
    }
    variableNamesByType[typeKey].push(varName);
  }

  if (Object.keys(variableNamesByType).length > 0) {
    const varDeclarations: string[] = [];
    for (const [varType, varNames] of Object.entries(variableNamesByType)) {
      if (varNames.length > 0) {
        const cppType =
          varType === "__NO_TYPE__" ? "int" : getCppTypeName(varType);
        varDeclarations.push(`${cppType} ${varNames.join(", ")};`);
      }
    }

    if (varDeclarations.length > 0) {
      host.setVariablesDefinition(varDeclarations.join("\n"));
    }
  }
}
