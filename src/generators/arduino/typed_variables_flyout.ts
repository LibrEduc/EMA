import * as Blockly from "blockly";

export const TYPED_VARIABLES_CATEGORY_ID = "TYPED_VARIABLES";
const TYPED_VARIABLES_BUTTON_ID = "CREATE_TYPED_VARIABLE";

const getBlocklyMsg = (key: string): string => {
  const msg = (Blockly.Msg as Record<string, string> | undefined)?.[key];
  return msg || key;
};

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
      targetWorkspace.createVariable("");
    },
  );
}
