/**
 * @license
 * Copyright 2023 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Blockly from "blockly";

export type MutableVariableModel = Blockly.IVariableModel<Blockly.IVariableState> & {
  setType?: (type: string) => void;
  type_?: string | null;
};

export function setVariableType(
  variable: Blockly.IVariableModel<Blockly.IVariableState>,
  type: string,
): boolean {
  const mutable = variable as MutableVariableModel;
  if (typeof mutable.setType === "function") {
    mutable.setType(type);
    return true;
  }
  if ("type_" in mutable) {
    mutable.type_ = type;
    return true;
  }
  return false;
}

export function clearVariableType(
  variable: Blockly.IVariableModel<Blockly.IVariableState>,
): boolean {
  const mutable = variable as MutableVariableModel;
  if (typeof mutable.setType === "function") {
    mutable.setType("");
    return true;
  }
  if ("type_" in mutable) {
    mutable.type_ = null;
    if (mutable.type_ !== null) {
      delete mutable.type_;
    }
    return true;
  }
  return false;
}

export function normalizeVariableType(
  variable: Blockly.IVariableModel<Blockly.IVariableState>,
): void {
  const currentType = variable.getType();
  if (currentType === null || currentType === "null") {
    clearVariableType(variable);
  }
}
