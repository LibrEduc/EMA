/**
 * @packageDocumentation
 * @module BlocklyCategories.Shared
 * @description Shared helpers for Blockly category blocks (facade).
 * @remarks
 * Re-exports split modules so existing `from "./shared"` imports keep working.
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
import { ARDUINO_TYPE_KEYS } from "../../generators/arduino/block_types";
import {
  INSTANCE_VARIABLE_TYPE,
  LIST_VARIABLE_TYPE,
  tagVariableAsList,
} from "../../generators/arduino/variable_utils";

export {
  getArrayListUntypedWarningText,
  getBlocklyMsg,
  getBlocklyMsgOr,
  getConstWarningText,
  getDuplicateListDeclarationWarningText,
  getTypeMismatchWarningText,
  getUntypedWarningText,
  validateSingleChar,
} from "./blockly_i18n";

export {
  getArrayIndexBlocklyChecks,
  getBlocklyCompatibleChecks,
  getDeclareContenuBlocklyChecks,
  getDeclareElementBlocklyChecks,
} from "./shared_blockly_checks";

export {
  enforceIntOnlyValueInputs,
  handleBoardIntInputBlockChange,
  revalidateBoardIntInputBlocks,
} from "./shared_board_int";

export {
  hasRealGlobalVariableUse,
  isProcedureParameterBindingUse,
  isVariableProcedureParameter,
  isVariableUseOutsideProcedureBody,
  isVariableUsedOutsideProcedureBodies,
  shouldOmitGlobalVariableDeclaration,
  type ProcedureDefBlock,
} from "./shared_var_scope";

export {
  bindInferConnectedValueType,
  getProcedureDefArgumentType,
  getProcedureParameterDeclaredType,
  inferProcedureCallArgSourceType,
  revalidateProcedureCallBlocks,
  syncProcedureCallArgInputChecks,
} from "./shared_procedures";

export {
  areLoopBoundTypesCompatible,
  inferChangeByRequiredType,
  inferChangeByRequiredTypeFromBlock,
  inferLoopCounterType,
  inferLoopCounterTypeFromForBlock,
  inferNumericInputType,
  inferRequiredNumericTypeForVariable,
  isBlockOnMainWorkspace,
  isLoopCounterVariableCompatible,
  isMathChangeCompatibleVariableType,
  isNumericScalarVariableType,
  isUnresolvedVariableType,
  resolveMathChangeVariableId,
  resolveMathNumberBlockType,
  unifyLoopBoundTypes,
} from "./shared_numeric";

export {
  setVariableTypeAndMarkManual,
  syncNumericVariableType,
  type VariableWithMutableType,
} from "./shared_variable_model";

export {
  inferConnectedValueType,
  normalizeBlocklyTypeToVariableType,
} from "./shared_type_inference";

export {
  inferLocalAssignmentValueType,
  isGlobalVariableAssignment,
  resolveGlobalVariableType,
  resolveVariableTypeForBlock,
} from "./shared_variable_resolve";

export {
  handleVariablesSetChange,
  hasConnectedAssignmentForVariable,
  revalidateLocalWrapperBlocks,
  revalidateTypedNumericBlocks,
  revalidateVariableBlocksForId,
  shouldSkipVariableChange,
} from "./shared_variable_handlers";

/**
 * Configures a FieldVariable for scalar variables (excludes list/array variables).
 * @param field - FieldVariable instance to configure.
 */
export const configureScalarVariableField = (
  field: Blockly.FieldVariable,
): void => {
  const fieldWithTypes = field as unknown as {
    variableTypes?: string[] | null;
    defaultType?: string;
  };
  fieldWithTypes.variableTypes = ["", ...ARDUINO_TYPE_KEYS];
  fieldWithTypes.defaultType = "";
};

/**
 * Configures a FieldVariable for list/array variables only.
 */
export const configureListVariableField = (
  field: Blockly.FieldVariable,
): void => {
  const fieldWithTypes = field as unknown as {
    variableTypes?: string[] | null;
    defaultType?: string;
  };
  fieldWithTypes.variableTypes = [LIST_VARIABLE_TYPE];
  fieldWithTypes.defaultType = LIST_VARIABLE_TYPE;
};

/**
 * Configures a FieldVariable for instance variables only
 * (FieldVariable type `instance` — distinct from {@link FieldInstance} dropdowns).
 */
export const configureInstanceVariableField = (
  field: Blockly.FieldVariable,
): void => {
  const fieldWithTypes = field as unknown as {
    variableTypes?: string[] | null;
    defaultType?: string;
  };
  fieldWithTypes.variableTypes = [INSTANCE_VARIABLE_TYPE];
  fieldWithTypes.defaultType = INSTANCE_VARIABLE_TYPE;
};

/**
 * Ensures the variable selected on a list-category block has Blockly type `list`.
 */
export const syncListVariableFromField = (
  block: Blockly.Block,
  fieldName: string,
): void => {
  const variableId = block.getFieldValue(fieldName);
  if (!variableId || !block.workspace) {
    return;
  }
  const variable = block.workspace.getVariableMap().getVariableById(variableId);
  if (variable && variable.getType() !== LIST_VARIABLE_TYPE) {
    tagVariableAsList(variable);
  }
};

/**
 * Output check for variables_get when VAR is Blockly-only (`list`), not an Arduino type.
 */
export const getListVariableOutputCheck = (): string => "__NO_TYPE__";
