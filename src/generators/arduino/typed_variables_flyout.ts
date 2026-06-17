/**
 * @packageDocumentation
 * @module Arduino.TypedVariablesFlyout
 * @description Typed variables flyout category and creation button.
 * @remarks
 * Builds the toolbox flyout UI for typed variables.
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
import { getBlocklyMsg } from "../../categories/blockly/shared";
import { isArduinoScalarType } from "./block_types";
import { isListVariable, VARIABLES_DEFINE_BLOCK_TYPE } from "./variable_utils";

export const TYPED_VARIABLES_CATEGORY_ID = "TYPED_VARIABLES";
const TYPED_VARIABLES_BUTTON_ID = "CREATE_TYPED_VARIABLE";

/**
 * Builds the typed variables flyout contents.
 * @param workspace - Workspace used to resolve variables.
 * @returns Array of flyout items.
 */
export function createTypedVariablesFlyout(
  workspace: Blockly.WorkspaceSvg,
): Element[] {
  const xmlList: Element[] = [];
  const button = document.createElement("button");
  const buttonText = getBlocklyMsg("NEW_VARIABLE");
  button.setAttribute("text", buttonText);
  button.setAttribute("callbackKey", TYPED_VARIABLES_BUTTON_ID);
  xmlList.push(button);

  const variables = workspace.getVariableMap().getAllVariables();
  const safeVariables = variables.filter(
    (variable): variable is Blockly.VariableModel =>
      Boolean(variable) && !isListVariable(variable),
  );
  if (safeVariables.length === 0) {
    return xmlList;
  }
  const defaultVariable = safeVariables[0];
  const rawDefaultType = defaultVariable.getType() ?? "";
  const defaultType = isArduinoScalarType(rawDefaultType) ? rawDefaultType : "";

  const setBlock = document.createElement("block");
  setBlock.setAttribute("type", "variables_set_dynamic");
  const setField = document.createElement("field");
  setField.setAttribute("name", "VAR");
  setField.setAttribute("id", defaultVariable.getId());
  if (defaultType) {
    setField.setAttribute("variabletype", defaultType);
  }
  setField.textContent = defaultVariable.getName();
  setBlock.appendChild(setField);
  xmlList.push(setBlock);

  const localBlock = document.createElement("block");
  localBlock.setAttribute("type", "variables_local");
  xmlList.push(localBlock);

  const getBlock = document.createElement("block");
  getBlock.setAttribute("type", "variables_get_dynamic");
  const getField = document.createElement("field");
  getField.setAttribute("name", "VAR");
  getField.setAttribute("id", defaultVariable.getId());
  if (defaultType) {
    getField.setAttribute("variabletype", defaultType);
  }
  getField.textContent = defaultVariable.getName();
  getBlock.appendChild(getField);
  xmlList.push(getBlock);

  const castBlock = document.createElement("block");
  castBlock.setAttribute("type", "variables_cast");
  const castTypeField = document.createElement("field");
  castTypeField.setAttribute("name", "CAST_TYPE");
  castTypeField.textContent = "byte";
  castBlock.appendChild(castTypeField);
  xmlList.push(castBlock);

  const typeBlock = document.createElement("block");
  typeBlock.setAttribute("type", "variables_set_type");
  const typeVarField = document.createElement("field");
  typeVarField.setAttribute("name", "VAR");
  typeVarField.setAttribute("id", defaultVariable.getId());
  if (defaultType) {
    typeVarField.setAttribute("variabletype", defaultType);
  }
  typeVarField.textContent = defaultVariable.getName();
  typeBlock.appendChild(typeVarField);
  if (defaultType) {
    const typeField = document.createElement("field");
    typeField.setAttribute("name", "TYPE");
    typeField.textContent = defaultType;
    typeBlock.appendChild(typeField);
  }
  xmlList.push(typeBlock);

  const constBlock = document.createElement("block");
  constBlock.setAttribute("type", "variables_const");
  const constVarField = document.createElement("field");
  constVarField.setAttribute("name", "VAR");
  constVarField.setAttribute("id", defaultVariable.getId());
  if (defaultType) {
    constVarField.setAttribute("variabletype", defaultType);
  }
  constVarField.textContent = defaultVariable.getName();
  constBlock.appendChild(constVarField);
  xmlList.push(constBlock);

  const initBlock = document.createElement("block");
  initBlock.setAttribute("type", "variables_set_init");
  const initVarField = document.createElement("field");
  initVarField.setAttribute("name", "VAR");
  initVarField.setAttribute("id", defaultVariable.getId());
  if (defaultType) {
    initVarField.setAttribute("variabletype", defaultType);
  }
  initVarField.textContent = defaultVariable.getName();
  initBlock.appendChild(initVarField);
  const typeInitField = document.createElement("field");
  typeInitField.setAttribute("name", "VARIABLE_SETTYPE_TYPE");
  typeInitField.textContent = defaultType || "int";
  initBlock.appendChild(typeInitField);
  xmlList.push(initBlock);

  const defineBlock = document.createElement("block");
  defineBlock.setAttribute("type", VARIABLES_DEFINE_BLOCK_TYPE);
  const defineVarField = document.createElement("field");
  defineVarField.setAttribute("name", "VAR");
  defineVarField.setAttribute("id", defaultVariable.getId());
  if (defaultType) {
    defineVarField.setAttribute("variabletype", defaultType);
  }
  defineVarField.textContent = defaultVariable.getName();
  defineBlock.appendChild(defineVarField);
  xmlList.push(defineBlock);

  return xmlList;
}

/**
 * Registers the typed variables toolbox category callback.
 * @param workspace - Workspace whose toolbox is being configured.
 */
export function registerTypedVariablesCategory(
  workspace: Blockly.WorkspaceSvg,
): void {
  workspace.registerToolboxCategoryCallback(
    TYPED_VARIABLES_CATEGORY_ID,
    createTypedVariablesFlyout,
  );

  workspace.registerButtonCallback(
    TYPED_VARIABLES_BUTTON_ID,
    (button: Blockly.FlyoutButton) => {
      const targetWorkspace = button.getTargetWorkspace();
      const variablesWithHandler = Blockly.Variables as typeof Blockly.Variables & {
        createVariableButtonHandler?: (workspace: Blockly.Workspace) => void;
      };
      if (
        variablesWithHandler &&
        typeof variablesWithHandler.createVariableButtonHandler === "function"
      ) {
        variablesWithHandler.createVariableButtonHandler(targetWorkspace);
        return;
      }
      targetWorkspace.getVariableMap().createVariable("");
    },
  );
}
