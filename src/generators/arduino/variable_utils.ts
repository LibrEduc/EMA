/**
 * @packageDocumentation
 * @module Arduino.VariableUtils
 * @description Utilities for typed variable tracking and updates.
 * @remarks
 * Helpers to read, persist, and update variable type metadata.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2024 ASTUCE (Sébastien Canet microcompany)
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

/** Type Blockly des variables déclarées par les blocs Listes (tableaux). */
export const LIST_VARIABLE_TYPE = "list";

/** Type canonique du bloc « définir une variable globale typée ». */
export const VARIABLES_DEFINE_BLOCK_TYPE = "variables_define";

/**
 * Alias historique (singulier) conservé pour les projets sauvegardés avant l'unification.
 * @see VARIABLES_DEFINE_BLOCK_TYPE
 */
export const VARIABLES_DEFINE_LEGACY_BLOCK_TYPE = "variable_define";

/** Indique si le type de bloc correspond à une déclaration globale typée. */
export function isVariablesDefineBlock(
  blockType: string | null | undefined,
): boolean {
  return (
    blockType === VARIABLES_DEFINE_BLOCK_TYPE ||
    blockType === VARIABLES_DEFINE_LEGACY_BLOCK_TYPE
  );
}

export type MutableVariableModel = Blockly.IVariableModel<Blockly.IVariableState> & {
  setType?: (type: string) => void;
  type_?: string | null;
};

export function isListVariableType(type: string | null | undefined): boolean {
  return type === LIST_VARIABLE_TYPE;
}

export function isListVariable(
  variable: Blockly.IVariableModel<Blockly.IVariableState> | null | undefined,
): boolean {
  return isListVariableType(variable?.getType?.() ?? null);
}

/**
 * Sets a variable's type metadata and updates the model.
 * @param variable - Variable model to update.
 * @param type - New type string.
 */
export function setVariableType(
  variable: Blockly.IVariableModel<Blockly.IVariableState>,
  type: string,
): boolean {
  try {
    const workspace = variable.getWorkspace?.();
    const variableMap = workspace?.getVariableMap?.();
    if (variableMap && typeof variableMap.changeVariableType === "function") {
      variableMap.changeVariableType(variable, type);
      return true;
    }
  } catch {
    // Fall through to legacy mutation.
  }
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

/**
 * Tags a workspace variable as a list/array variable (`list`).
 */
export function tagVariableAsList(
  variable: Blockly.IVariableModel<Blockly.IVariableState>,
): boolean {
  return setVariableType(variable, LIST_VARIABLE_TYPE);
}

/**
 * Clears a variable's type metadata.
 * @param variable - Variable model to update.
 */
export function clearVariableType(
  variable: Blockly.IVariableModel<Blockly.IVariableState>,
): boolean {
  try {
    const workspace = variable.getWorkspace?.();
    const variableMap = workspace?.getVariableMap?.();
    if (variableMap && typeof variableMap.changeVariableType === "function") {
      variableMap.changeVariableType(variable, "");
      return true;
    }
  } catch {
    // Fall through to legacy mutation.
  }
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

/**
 * Normalizes null/"null" types to empty string.
 * @param variable - Variable model to normalize.
 */
export function normalizeVariableType(
  variable: Blockly.IVariableModel<Blockly.IVariableState>,
): void {
  const currentType = variable.getType();
  if (currentType === null || currentType === "null") {
    clearVariableType(variable);
  }
}
