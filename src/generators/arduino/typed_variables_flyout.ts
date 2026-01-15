import * as Blockly from "blockly";

export const TYPED_VARIABLES_CATEGORY_ID = "TYPED_VARIABLES";
const TYPED_VARIABLES_BUTTON_ID = "CREATE_TYPED_VARIABLE";

export function createTypedVariablesFlyout(
  workspace: Blockly.WorkspaceSvg,
): Element[] {
  const xmlList: Element[] = [];
  const button = document.createElement("button");
  const buttonText =
    (Blockly.Msg as Record<string, string> | undefined)?.NEW_VARIABLE ??
    "Create variable";
  button.setAttribute("text", buttonText);
  button.setAttribute("callbackKey", TYPED_VARIABLES_BUTTON_ID);
  xmlList.push(button);

  const variables = workspace.getVariableMap().getAllVariables();
  if (variables.length === 0) {
    return xmlList;
  }
  const defaultVariable = variables[0];
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

  return xmlList;
}

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
      if (
        Blockly.Variables &&
        typeof (Blockly.Variables as any).createVariableButtonHandler ===
          "function"
      ) {
        (Blockly.Variables as any).createVariableButtonHandler(targetWorkspace);
        return;
      }
      targetWorkspace.createVariable("");
    },
  );
}
