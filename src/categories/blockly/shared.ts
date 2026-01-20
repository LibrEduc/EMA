import * as Blockly from "blockly";
import { debugLog } from "../../generators/arduino/debug";
import { getCompatibleTypesForCheck, checkTypeCompatibility } from "../../generators/arduino/block_types_registry";
import { clearVariableType, setVariableType } from "../../generators/arduino/variable_utils";

export type VariableWithMutableType = Blockly.VariableModel & {
  setType?: (type: string) => void;
  type_?: string;
  __ucbManualType?: boolean;
  __ucbConst?: boolean;
};

export const getBlocklyMsg = (key: string): string => {
  const msg = (Blockly.Msg as Record<string, string> | undefined)?.[key];
  return msg || key;
};

export const getBlocklyMsgOr = (key: string, fallback: string): string => {
  const msg = getBlocklyMsg(key);
  return msg === key ? fallback : msg;
};

export const validateSingleChar = (value: string): string => {
  if (!value) {
    return "";
  }
  return value.charAt(0);
};

export const getUntypedWarningText = (): string => getBlocklyMsg("TYPED_VAR_UNTYPED_WARNING");

export const getTypeMismatchWarningText = (varType: string, connectedType: string): string =>
  getBlocklyMsg("TYPED_VAR_TYPE_MISMATCH")
    .replace("%1", varType)
    .replace("%2", connectedType);

export const getConstWarningText = (): string =>
  getBlocklyMsgOr("VARIABLES_CONST_WARNING", "const: cannot assign");

export const getBlocklyCompatibleChecks = (
  type: string | null | undefined,
): string[] | null => {
  const compatibleTypes = getCompatibleTypesForCheck(type);
  if (!compatibleTypes) {
    return null;
  }
  const checks = new Set(compatibleTypes);
  if (checks.has("bool")) {
    checks.add("Boolean");
  }
  if (checks.has("int") || checks.has("float")) {
    checks.add("Number");
  }
  if (checks.has("string")) {
    checks.add("String");
  }
  return Array.from(checks);
};

export const configureTypedVariableField = (field: Blockly.FieldVariable): void => {
  const fieldWithTypes = field as unknown as {
    variableTypes?: string[] | null;
    defaultType?: string;
  };
  fieldWithTypes.variableTypes = null;
  fieldWithTypes.defaultType = "";
};

export const normalizeBlocklyTypeToVariableType = (type: string): string => {
  if (type === "Boolean") return "bool";
  if (type === "Number") return "int";
  if (type === "String") return "string";
  return type;
};

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

const getFirstCheckType = (
  check: string | string[] | null,
): string | null => {
  if (!check) {
    return null;
  }
  if (Array.isArray(check)) {
    return check.length > 0 ? check[0] : null;
  }
  return check;
};

const inferProcedureCallReturnType = (block: Blockly.Block): string | null => {
  if (block.type !== "procedures_callreturn" || !block.workspace) {
    return null;
  }
  const name = block.getFieldValue?.("NAME");
  if (!name) {
    return null;
  }
  const defBlock = Blockly.Procedures.getDefinition(name, block.workspace);
  const returnBlock = defBlock?.getInputTargetBlock?.("RETURN");
  if (!returnBlock) {
    return "int";
  }
  const typedReturn = returnBlock as Blockly.Block & { getBlockType?: () => string | null };
  const rawType = typedReturn.getBlockType ? typedReturn.getBlockType() : null;
  const normalized = rawType ? normalizeBlocklyTypeToVariableType(rawType) : null;
  if (normalized) {
    return normalized;
  }
  if (returnBlock.outputConnection) {
    const check = getFirstCheckType(returnBlock.outputConnection.getCheck());
    return check ? normalizeBlocklyTypeToVariableType(check) : null;
  }
  return "int";
};

export const inferConnectedValueType = (block: Blockly.Block | null): string | null => {
  if (!block) {
    return null;
  }
  const typedBlock = block as Blockly.Block & { getBlockType?: () => string | null };
  const rawType = typedBlock.getBlockType ? typedBlock.getBlockType() : null;
  const normalized = rawType ? normalizeBlocklyTypeToVariableType(rawType) : null;
  if (
    normalized &&
    normalized !== "__NO_TYPE__" &&
    normalized !== "null" &&
    normalized !== "undefined"
  ) {
    return normalized;
  }
  const procType = inferProcedureCallReturnType(block);
  if (procType) {
    return procType;
  }
  if (block.outputConnection) {
    const check = getFirstCheckType(block.outputConnection.getCheck());
    if (check) {
      return normalizeBlocklyTypeToVariableType(check);
    }
  }
  return null;
};

const hasConnectedAssignmentForVariable = (
  workspace: Blockly.Workspace,
  variableId: string,
): boolean => {
  const blocks = workspace.getAllBlocks(false);
  for (const block of blocks) {
    if (
      block.type === "variables_set_dynamic" ||
      block.type === "variables_set"
    ) {
      const blockVarId = block.getFieldValue("VAR");
      if (blockVarId !== variableId) {
        continue;
      }
      const valueInput = block.getInput("VALUE");
      if (valueInput?.connection?.targetBlock()) {
        return true;
      }
    }
  }
  return false;
};

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
    if (typedVariable.__ucbConst) {
      block.setWarningText(getConstWarningText());
      return;
    }

    const varType = variable.getType();
    const isNoType = !varType || varType === "__NO_TYPE__";
    const valueInput = block.getInput("VALUE");
    const connectedBlock = valueInput?.connection?.targetBlock() || null;
    const connectedType = inferConnectedValueType(connectedBlock);

    if (connectedType) {
      if (!varType || varType === "__NO_TYPE__") {
        setVariableType(variable, connectedType);
        typedVariable.__ucbManualType = false;
      }
      if (valueInput?.connection) {
        valueInput.connection.setCheck(getBlocklyCompatibleChecks(variable.getType()));
      }
    } else if (valueInput?.connection) {
      valueInput.connection.setCheck(getBlocklyCompatibleChecks(varType));
    }

    if (varType && connectedType && !checkTypeCompatibility(connectedType, varType)) {
      block.setWarningText(getTypeMismatchWarningText(varType, connectedType));
      if (valueInput?.connection && valueInput.connection.targetBlock()) {
        valueInput.connection.disconnect();
      }
      return;
    }

    if (!connectedType) {
      if (!typedVariable.__ucbManualType && varType) {
        const hasAssignments = hasConnectedAssignmentForVariable(
          block.workspace,
          variableId,
        );
        if (!hasAssignments) {
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
