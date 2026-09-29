/**
 * @packageDocumentation
 * @module BlocklyCategories.Variables.Types
 * @description Arduino type labels and scalar type dropdown fields for variable blocks.
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
  getVariableTypeOptions,
  getInternalTypeForArduinoType,
  getArduinoTypeLabelKey,
  isArduinoScalarType,
} from "../../generators/arduino/block_types";
import {
  getBlocklyCompatibleChecks,
  getBlocklyMsgOr,
} from "./shared";

/**
 * Returns the display label for an Arduino type (Blockly.Msg `VAR_CAST_TYPE_*`).
 * @param type - Type identifier.
 * @returns Result string.
 */
export const getArduinoTypeLabel = (type: string): string =>
  getBlocklyMsgOr(getArduinoTypeLabelKey(type), type);

/**
 * Shared Blockly menu options for every Arduino type dropdown (variables_set_init, variables_set_type, variables_cast, procedures, lists).
 * @returns Result array.
 */
export const getArduinoTypeDropdownOptions = (): Blockly.MenuOption[] =>
  getVariableTypeOptions().map((type) => [
    getArduinoTypeLabel(type),
    type,
  ] as Blockly.MenuOption);

/** Resets a scalar type dropdown when its value is not a valid Arduino type (e.g. `list`). */
export const sanitizeArduinoTypeDropdown = (
  block: Blockly.Block,
  fieldName: string,
): void => {
  const field = block.getField(fieldName) as Blockly.FieldDropdown | null;
  if (!field) {
    return;
  }
  const value = field.getValue();
  if (isArduinoScalarType(value)) {
    return;
  }
  Blockly.Events.disable();
  try {
    field.setValue("int");
  } finally {
    Blockly.Events.enable();
  }
};

/**
 * Arduino scalar type dropdown; maps invalid values (e.g. `list`) to `int` on load.
 * @param fieldName - Field name on the block.
 * @returns Operation result.
 */
export const createArduinoScalarTypeField = (
  fieldName: string,
): Blockly.FieldDropdown => {
  const field = new Blockly.FieldDropdown(getArduinoTypeDropdownOptions);
  field.setValidator((value) =>
    isArduinoScalarType(String(value)) ? value : "int",
  );
  field.name = fieldName;
  return field;
};

export const applyCastOutputType = (block: Blockly.Block): void => {
  const castType = block.getFieldValue("CAST_TYPE") || "int";
  const checks = getBlocklyCompatibleChecks(getInternalTypeForArduinoType(castType));
  block.setOutput(true, checks);
};
