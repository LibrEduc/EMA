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

import * as Blockly from "blockly";

export const TYPED_VARIABLES_CATEGORY_ID = "TYPED_VARIABLES";
const TYPED_VARIABLES_BUTTON_ID = "CREATE_TYPED_VARIABLE";

const getBlocklyMsg = (key: string): string => {
  const msg = (Blockly.Msg as Record<string, string> | undefined)?.[key];
  return msg || key;
};

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
    (variable): variable is Blockly.VariableModel => Boolean(variable),
  );
  if (safeVariables.length === 0) {
    return xmlList;
  }
  const defaultVariable = safeVariables[0];
  const defaultType = defaultVariable.getType() ?? "";

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
  defineBlock.setAttribute("type", "variables_define");
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
