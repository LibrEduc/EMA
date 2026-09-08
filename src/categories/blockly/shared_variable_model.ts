/**
 * @packageDocumentation
 * @module BlocklyCategories.VariableModel
 * @description Mutable variable flags and numeric type sync helpers.
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Blockly from "blockly";
import { setVariableType } from "../../generators/arduino/variable_utils";

export type VariableWithMutableType = Blockly.VariableModel & {
  setType?: (type: string) => void;
  type_?: string;
  __ucbManualType?: boolean;
  __ucbConst?: boolean;
  __ucbConstBlockId?: string;
  /** Exclusive declaration owner (list / instance), same idea as const. */
  __ucbDeclareBlockId?: string;
};

/**
 * Sets a variable's type and marks it as manually chosen (e.g. via dropdown).
 * @param variable - Variable model to update.
 * @param type - New type string.
 */
export const setVariableTypeAndMarkManual = (
  variable: Blockly.IVariableModel<Blockly.IVariableState>,
  type: string,
): void => {
  setVariableType(variable, type);
  const typed = variable as VariableWithMutableType;
  typed.__ucbManualType = true;
};

/**
 * Aligns a numeric variable with the type required by loops and change-by blocks. Promotes int ↔ float according to aggregated usage; never overrides manual types.
 * @param variable - Variable model.
 * @param requiredType - The `requiredType` argument.
 */
export const syncNumericVariableType = (
  variable: Blockly.IVariableModel<Blockly.IVariableState>,
  requiredType: "int" | "float" | null,
): void => {
  const typedVariable = variable as VariableWithMutableType;
  if (typedVariable.__ucbManualType || !requiredType) {
    return;
  }
  const varType = variable.getType();
  if (!varType || varType === "__NO_TYPE__") {
    setVariableType(variable, requiredType);
    return;
  }
  if (varType === requiredType) {
    return;
  }
  if (
    (varType === "int" && requiredType === "float") ||
    (varType === "float" && requiredType === "int")
  ) {
    setVariableType(variable, requiredType);
  }
};
