/**
 * @packageDocumentation
 * @module BlocklyCategories.VariableHandlers
 * @description onchange / revalidate handlers for typed variable blocks.
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Blockly from "blockly";
import { debugLog } from "../../generators/arduino/debug";
import { checkTypeCompatibility } from "../../generators/arduino/block_types_registry";
import {
  isArrayAssignmentValueBlock,
  usesLocalVariableDeclaration,
} from "../../generators/arduino/variable_scope";
import {
  clearVariableType,
  LIST_VARIABLE_TYPE,
  setVariableType,
  tagVariableAsList,
} from "../../generators/arduino/variable_utils";
import {
  getConstWarningText,
  getTypeMismatchWarningText,
  getUntypedWarningText,
} from "./blockly_i18n";
import { getBlocklyCompatibleChecks } from "./shared_blockly_checks";
import { inferRequiredNumericTypeForVariable } from "./shared_numeric";
import { getProcedureParameterDeclaredType } from "./shared_procedures";
import { inferConnectedValueType } from "./shared_type_inference";
import {
  inferLocalAssignmentValueType,
  resolveVariableTypeForBlock,
  shouldIncludeUseForVariableTyping,
} from "./shared_variable_resolve";
import {
  syncNumericVariableType,
  type VariableWithMutableType,
} from "./shared_variable_model";
import {
  isVariableProcedureParameter,
  isVariableUseOutsideProcedureBody,
  isVariableUsedOutsideProcedureBodies,
} from "./shared_var_scope";

/** Re-runs onchange on variable get/set blocks referencing a variable. */
export const revalidateVariableBlocksForId = (
  workspace: Blockly.Workspace,
  variableId: string,
): void => {
  const uses = Blockly.Variables.getVariableUsesById(workspace, variableId);
  for (const block of uses) {
    if (
      block.type !== "variables_get" &&
      block.type !== "variables_get_dynamic" &&
      block.type !== "variables_set" &&
      block.type !== "variables_set_dynamic"
    ) {
      continue;
    }
    const onchange = Blockly.Blocks[block.type]?.onchange;
    if (typeof onchange === "function") {
      onchange.call(block, {
        type: Blockly.Events.BLOCK_MOVE,
        isUiEvent: false,
      } as Blockly.Events.Abstract);
    }
  }
};

/**
 * Determines whether a variable change event should be ignored.
 */
export const shouldSkipVariableChange = (
  block: Blockly.Block,
  event: Blockly.Events.Abstract,
): boolean => {
  if (event.isUiEvent) {
    return true;
  }
  const workspace = block.workspace as Blockly.WorkspaceSvg | null;
  if (workspace?.isDragging && workspace.isDragging()) {
    return true;
  }
  if (workspace?.isFlyout) {
    return true;
  }
  if (block.isInsertionMarker?.()) {
    return true;
  }
  return false;
};

/**
 * Checks whether a variable has any connected assignment blocks.
 * Uses getVariableUsesById to avoid iterating all blocks.
 */
export const hasConnectedAssignmentForVariable = (
  workspace: Blockly.Workspace,
  variableId: string,
  contextBlock?: Blockly.Block,
): boolean => {
  const uses = Blockly.Variables.getVariableUsesById(workspace, variableId);
  for (const block of uses) {
    if (
      block.type === "variables_set_dynamic" ||
      block.type === "variables_set"
    ) {
      if (
        contextBlock &&
        !shouldIncludeUseForVariableTyping(contextBlock, block)
      ) {
        continue;
      }
      if (contextBlock) {
        const contextIsLocal = usesLocalVariableDeclaration(
          contextBlock.getInputTargetBlock("VALUE"),
        );
        const blockIsLocal = usesLocalVariableDeclaration(
          block.getInputTargetBlock("VALUE"),
        );
        if (contextIsLocal !== blockIsLocal) {
          continue;
        }
      }
      const valueInput = block.getInput("VALUE");
      if (valueInput?.connection?.targetBlock()) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Re-runs onchange on `variables_local` wrappers so their output type tracks inner values.
 */
export const revalidateLocalWrapperBlocks = (
  workspace: Blockly.Workspace,
  event: Blockly.Events.Abstract,
): void => {
  for (const block of workspace.getAllBlocks(false)) {
    if (block.type !== "variables_local") {
      continue;
    }
    const onchange = Blockly.Blocks.variables_local?.onchange;
    if (typeof onchange === "function") {
      onchange.call(block, event);
    }
  }
};

/**
 * Re-runs onchange handlers for blocks whose variable typing depends on child values
 * (e.g. math_change when a math_number field is edited).
 */
export const revalidateTypedNumericBlocks = (
  workspace: Blockly.Workspace,
  event: Blockly.Events.Abstract,
): void => {
  for (const blockType of ["math_change", "controls_for"] as const) {
    for (const block of workspace.getAllBlocks(false)) {
      if (block.type !== blockType) {
        continue;
      }
      const onchange = Blockly.Blocks[blockType]?.onchange;
      if (typeof onchange === "function") {
        onchange.call(block, event);
      }
    }
  }
};

/**
 * Handles variable assignment changes to enforce typing rules.
 * @param block - Variable set block.
 * @param event - Blockly change event.
 * @param label - Block label for warnings.
 */
export const handleVariablesSetChange = (
  block: Blockly.Block,
  event: Blockly.Events.Abstract,
  label: string,
): void => {
  if (
    event.type !== Blockly.Events.BLOCK_CHANGE &&
    event.type !== Blockly.Events.BLOCK_CREATE &&
    event.type !== Blockly.Events.BLOCK_MOVE &&
    event.type !== Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE &&
    event.type !== Blockly.Events.VAR_DELETE &&
    event.type !== "var_type_change"
  ) {
    return;
  }
  if (shouldSkipVariableChange(block, event)) {
    return;
  }
  const blockEvent = event as Blockly.Events.Abstract & { blockId?: string };
  if (
    event.type === Blockly.Events.BLOCK_CREATE &&
    blockEvent.blockId != null &&
    blockEvent.blockId !== block.id
  ) {
    return;
  }
  try {
    const variableId = block.getFieldValue("VAR");
    if (!variableId || !block.workspace) {
      return;
    }
    const variable = block.workspace.getVariableMap().getVariableById(variableId);
    if (!variable) {
      return;
    }
    const typedVariable = variable as VariableWithMutableType;
    const valueInput = block.getInput("VALUE");
    const connectedBlock = valueInput?.connection?.targetBlock() || null;

    if (usesLocalVariableDeclaration(connectedBlock)) {
      const innerType = inferLocalAssignmentValueType(connectedBlock);
      if (valueInput?.connection) {
        valueInput.connection.setCheck(null);
      }
      block.setWarningText(innerType ? null : getUntypedWarningText());
      return;
    }

    if (isArrayAssignmentValueBlock(connectedBlock)) {
      tagVariableAsList(variable);
      typedVariable.__ucbManualType = false;
      if (valueInput?.connection) {
        valueInput.connection.setCheck(["Array"]);
      }
      block.setWarningText(null);
      revalidateVariableBlocksForId(block.workspace, variableId);
      return;
    }

    const declaredParamType = getProcedureParameterDeclaredType(
      block.workspace,
      variableId,
      block,
    );
    if (declaredParamType) {
      const usedGlobally = isVariableUsedOutsideProcedureBodies(
        block.workspace,
        variableId,
      );
      if (!usedGlobally) {
        typedVariable.__ucbManualType = true;
        if (variable.getType() !== declaredParamType) {
          setVariableType(variable, declaredParamType);
        }
      }
      const connectedType = inferConnectedValueType(
        valueInput?.connection?.targetBlock() || null,
      );
      if (connectedType) {
        if (!checkTypeCompatibility(connectedType, declaredParamType)) {
          block.setWarningText(
            getTypeMismatchWarningText(declaredParamType, connectedType),
          );
          if (valueInput?.connection?.targetBlock()) {
            valueInput.connection.disconnect();
          }
          return;
        }
        block.setWarningText(null);
      } else {
        block.setWarningText(null);
      }
      if (valueInput?.connection) {
        valueInput.connection.setCheck(
          getBlocklyCompatibleChecks(declaredParamType),
        );
      }
      return;
    }

    if (typedVariable.__ucbConst) {
      block.setWarningText(getConstWarningText());
      if (valueInput?.connection?.targetBlock()) {
        valueInput.connection.disconnect();
      }
      return;
    }

    let varType = resolveVariableTypeForBlock(block, variableId);
    let isNoType = !varType || varType === "__NO_TYPE__";
    const connectedType = inferConnectedValueType(connectedBlock);
    const requiredNumericType = inferRequiredNumericTypeForVariable(
      block.workspace,
      variableId,
      block,
    );

    if (varType === LIST_VARIABLE_TYPE) {
      if (connectedType) {
        block.setWarningText(
          getTypeMismatchWarningText(LIST_VARIABLE_TYPE, connectedType),
        );
        if (valueInput?.connection?.targetBlock()) {
          valueInput.connection.disconnect();
        }
        return;
      }
      if (valueInput?.connection) {
        valueInput.connection.setCheck(null);
      }
      block.setWarningText(null);
      return;
    }

    if (connectedType) {
      const canAutoRetype =
        !typedVariable.__ucbManualType &&
        !requiredNumericType &&
        varType !== LIST_VARIABLE_TYPE;
      if (requiredNumericType) {
        syncNumericVariableType(variable, requiredNumericType);
        varType = variable.getType();
        isNoType = !varType || varType === "__NO_TYPE__";
      } else if (isNoType || (canAutoRetype && varType !== connectedType)) {
        if (
          !isVariableProcedureParameter(block.workspace, variableId) ||
          isVariableUseOutsideProcedureBody(block)
        ) {
          setVariableType(variable, connectedType);
          typedVariable.__ucbManualType = false;
          varType = connectedType;
          isNoType = false;
        }
      }

      const typeForCheck = requiredNumericType ?? connectedType ?? varType;
      if (
        typeForCheck &&
        !checkTypeCompatibility(connectedType, typeForCheck)
      ) {
        block.setWarningText(
          getTypeMismatchWarningText(typeForCheck, connectedType),
        );
        if (valueInput?.connection?.targetBlock()) {
          valueInput.connection.disconnect();
        }
        return;
      }
      if (valueInput?.connection) {
        valueInput.connection.setCheck(
          getBlocklyCompatibleChecks(varType ?? variable.getType()),
        );
      }
    } else if (valueInput?.connection) {
      valueInput.connection.setCheck(getBlocklyCompatibleChecks(varType));
    }

    if (!connectedType) {
      if (
        !typedVariable.__ucbManualType &&
        varType &&
        event.type !== Blockly.Events.BLOCK_CREATE &&
        event.type !== "var_type_change"
      ) {
        const hasAssignments = hasConnectedAssignmentForVariable(
          block.workspace,
          variableId,
          block,
        );
        if (!hasAssignments && varType !== LIST_VARIABLE_TYPE) {
          clearVariableType(variable);
        }
      }
    }
    if (isNoType) {
      block.setWarningText(getUntypedWarningText());
    } else {
      block.setWarningText(null);
    }
  } catch (error) {
    debugLog(`Error in ${label} onchange:`, error);
    block.setWarningText(null);
  }
};
