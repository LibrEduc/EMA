/**
 * @packageDocumentation Block definitions for typed variables
 * @author scanet\@libreduc.cc (Sébastien Canet)
 */

import * as Blockly from "blockly";
import { FieldAngle } from "@blockly/field-angle";
import { debugLog } from "./debug";
import { getCompatibleTypesForCheck, checkTypeCompatibility } from "./block_types_registry";
import { clearVariableType, setVariableType } from "./variable_utils";
import { getVariableTypeOptions } from "./block_types";

const getBlocklyMsg = (key: string): string => {
  const msg = (Blockly.Msg as Record<string, string> | undefined)?.[key];
  return msg || key;
};

const getBlocklyMsgOr = (key: string, fallback: string): string => {
  const msg = getBlocklyMsg(key);
  return msg === key ? fallback : msg;
};

const validateSingleChar = (value: string): string => {
  if (!value) {
    return "";
  }
  return value.charAt(0);
};

const getUntypedWarningText = (): string => getBlocklyMsg("TYPED_VAR_UNTYPED_WARNING");

const getTypeMismatchWarningText = (varType: string, connectedType: string): string =>
  getBlocklyMsg("TYPED_VAR_TYPE_MISMATCH")
    .replace("%1", varType)
    .replace("%2", connectedType);

const getConstWarningText = (): string =>
  getBlocklyMsgOr("VARIABLES_CONST_WARNING", "const: cannot assign");
const getBlocklyCompatibleChecks = (
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
const configureTypedVariableField = (field: Blockly.FieldVariable): void => {
  const fieldWithTypes = field as unknown as {
    variableTypes?: string[] | null;
    defaultType?: string;
  };
  fieldWithTypes.variableTypes = null;
  fieldWithTypes.defaultType = '';
};

const normalizeBlocklyTypeToVariableType = (type: string): string => {
  if (type === "Boolean") return "bool";
  if (type === "Number") return "int";
  if (type === "String") return "string";
  return type;
};

const shouldSkipVariableChange = (
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

const inferConnectedValueType = (block: Blockly.Block | null): string | null => {
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

const handleVariablesSetChange = (
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

  const variableId = block.getFieldValue('VAR');
  if (!variableId) {
    block.setWarningText(null);
    return;
  }

  try {
    const variable = block.workspace.getVariableMap().getVariableById(variableId);
    if (!variable) {
      block.setWarningText(null);
      return;
    }

    const varType = variable.getType();
    const isNoType = !varType || varType === '__NO_TYPE__';
    const typedVariable = variable as VariableWithMutableType;
    if (typedVariable.__ucbConst) {
      block.setWarningText(getConstWarningText());
      const valueInput = block.getInput('VALUE');
      if (valueInput?.connection?.targetBlock()) {
        valueInput.connection.disconnect();
      }
      return;
    }
    if (isNoType) {
      block.setWarningText(getUntypedWarningText());
    }

    const valueInput = block.getInput('VALUE');
    if (valueInput && valueInput.connection) {
      if (!varType || isNoType) {
        valueInput.connection.setCheck(null);
      } else {
        const compatibleTypes = getBlocklyCompatibleChecks(varType);
        valueInput.connection.setCheck(compatibleTypes);
      }

      const connectedBlock = block.getInputTargetBlock('VALUE');
      const connectedType = inferConnectedValueType(connectedBlock);
      if ((!varType || isNoType) && connectedType) {
        const typedVariable = variable as VariableWithMutableType;
        if (typedVariable.__ucbManualType) {
          return;
        }
        setVariableType(variable, connectedType);
        const compatibleTypes = getBlocklyCompatibleChecks(connectedType);
        valueInput.connection.setCheck(compatibleTypes);
        block.setWarningText(null);
        return;
      }
      if (varType && connectedType && !checkTypeCompatibility(connectedType, varType)) {
        block.setWarningText(getTypeMismatchWarningText(varType, connectedType));
        if (valueInput.connection && valueInput.connection.targetBlock()) {
          valueInput.connection.disconnect();
        }
        return;
      }
      if (!connectedType) {
        const typedVariable = variable as VariableWithMutableType;
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
    }
  } catch (error) {
    debugLog(`Error in ${label} onchange:`, error);
    block.setWarningText(null);
  }
};

type SwitchBlock = Blockly.Block & {
  casebreakCount_?: number;
  defaultCount_?: number;
};

type MutatorClauseBlock = Blockly.Block & {
  valueConnection_?: Blockly.Connection | null;
  statementConnection_?: Blockly.Connection | null;
};

type CaseConnection = {
  input: Blockly.Input;
  connection: Blockly.Connection;
  connectedType: string;
};

const numericCaseTypes = new Set(["int", "float"]);

const getSwitchCaseChecks = (varType: string): string[] | null => {
  const compatibleTypes = getCompatibleTypesForCheck(varType);
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
  return Array.from(checks);
};

const getCaseConnections = (block: SwitchBlock): CaseConnection[] => {
  const connections: CaseConnection[] = [];
  const caseCount = block.casebreakCount_ || 0;
  for (let i = 0; i <= caseCount; i += 1) {
    const input = block.getInput(`CASE${i}`);
    const connection = input?.connection;
    const targetBlock = input?.connection?.targetBlock() || null;
    const connectedType = inferConnectedValueType(targetBlock);
    if (input && connection && connectedType) {
      connections.push({ input, connection, connectedType });
    }
  }
  return connections;
};

const applyCaseInputChecks = (
  block: SwitchBlock,
  check: string[] | null,
): void => {
  const caseCount = block.casebreakCount_ || 0;
  for (let i = 0; i <= caseCount; i += 1) {
    const input = block.getInput(`CASE${i}`);
    if (input?.connection) {
      input.connection.setCheck(check);
    }
  }
};

const inferTypeFromCases = (caseConnections: CaseConnection[]): string | null => {
  if (caseConnections.length === 0) {
    return null;
  }
  const uniqueTypes = Array.from(
    new Set(caseConnections.map((item) => item.connectedType)),
  );
  if (uniqueTypes.length === 1) {
    return uniqueTypes[0];
  }
  const allNumeric = uniqueTypes.every((type) => numericCaseTypes.has(type));
  if (allNumeric) {
    return uniqueTypes.includes("float") ? "float" : "int";
  }
  return null;
};

const applySwitchCaseTyping = (block: SwitchBlock): void => {
  const variableId = block.getFieldValue("SWVAR");
  if (!variableId || !block.workspace) {
    applyCaseInputChecks(block, null);
    block.setWarningText(null);
    return;
  }

  const variable = block.workspace.getVariableMap().getVariableById(variableId);
  if (!variable) {
    applyCaseInputChecks(block, null);
    block.setWarningText(null);
    return;
  }

  const varType = variable.getType();
  const isNoType = !varType || varType === "__NO_TYPE__";
  const caseConnections = getCaseConnections(block);

  if (isNoType) {
    applyCaseInputChecks(block, null);
    const inferredType = inferTypeFromCases(caseConnections);
    if (inferredType) {
      const typedVariable = variable as VariableWithMutableType;
      if (!typedVariable.__ucbManualType) {
        setVariableType(variable, inferredType);
        applyCaseInputChecks(block, getSwitchCaseChecks(inferredType));
        block.setWarningText(null);
      }
    }
    return;
  }

  applyCaseInputChecks(block, getSwitchCaseChecks(varType));

  for (const caseItem of caseConnections) {
    if (!checkTypeCompatibility(caseItem.connectedType, varType)) {
      block.setWarningText(
        getTypeMismatchWarningText(varType, caseItem.connectedType),
      );
      if (caseItem.connection.targetBlock()) {
        caseItem.connection.disconnect();
      }
      return;
    }
  }

  block.setWarningText(null);
};

const updateSwitchCaseTyping = (
  block: SwitchBlock,
  event: Blockly.Events.Abstract,
): void => {
  if (
    event.type !== Blockly.Events.BLOCK_CHANGE &&
    event.type !== Blockly.Events.BLOCK_CREATE &&
    event.type !== Blockly.Events.BLOCK_MOVE &&
    event.type !== Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE &&
    event.type !== Blockly.Events.VAR_CREATE &&
    event.type !== Blockly.Events.VAR_RENAME &&
    event.type !== Blockly.Events.VAR_DELETE &&
    event.type !== "var_type_change"
  ) {
    return;
  }

  applySwitchCaseTyping(block);
};

const getSwitchTooltip = (block: SwitchBlock): string => {
  if (!block.casebreakCount_ && !block.defaultCount_) {
    return getBlocklyMsg("CONTROLS_SWITCH_TOOLTIP_1");
  }
  if (!block.casebreakCount_ && block.defaultCount_) {
    return getBlocklyMsg("CONTROLS_SWITCH_TOOLTIP_2");
  }
  if (block.casebreakCount_ && !block.defaultCount_) {
    return getBlocklyMsg("CONTROLS_SWITCH_TOOLTIP_3");
  }
  if (block.casebreakCount_ && block.defaultCount_) {
    return getBlocklyMsg("CONTROLS_SWITCH_TOOLTIP_4");
  }
  return "";
};

export function defineControlsSwitchBlocks(): void {
  Blockly.Blocks["controls_switch"] = {
    init: function(this: SwitchBlock) {
      this.setHelpUrl(getBlocklyMsg("CONTROLS_SWITCH_HELPURL"));
      this.setStyle("logic_blocks");
      this.appendDummyInput()
        .appendField(getBlocklyMsg("CONTROLS_SWITCH_VAR_TITLE"))
        .appendField(
          new Blockly.FieldVariable(Blockly.Field.SKIP_SETUP, undefined, null, undefined),
          "SWVAR",
        )
        .appendField(getBlocklyMsg("CONTROLS_SWITCH_VAR_TAIL"));
      const varField = this.getField("SWVAR") as Blockly.FieldVariable | null;
      if (varField) {
        configureTypedVariableField(varField);
      }
      (this as Blockly.Block & { contextMenuMsg_?: string }).contextMenuMsg_ =
        Blockly.Msg.VARIABLES_GET_CREATE_SET ?? "";
      (this as Blockly.Block & { contextMenuType_?: string }).contextMenuType_ =
        "variables_set";
      this.appendValueInput("CASE0")
        .setAlign(Blockly.inputs.Align.RIGHT)
        .appendField(getBlocklyMsg("CONTROLS_SWITCH_MSG_CASEBREAK"));
      this.appendStatementInput("DO0")
        .setAlign(Blockly.inputs.Align.RIGHT)
        .appendField(getBlocklyMsg("CONTROLS_SWITCH_MSG_DO"));
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setMutator(
        new Blockly.icons.MutatorIcon(
          ["controls_case_break", "controls_case_default"],
          this as unknown as Blockly.BlockSvg,
        ),
      );
      this.setTooltip(() => getSwitchTooltip(this));
      this.casebreakCount_ = 0;
      this.defaultCount_ = 0;
    },
    onchange: function(this: SwitchBlock, event: Blockly.Events.Abstract) {
      updateSwitchCaseTyping(this, event);
    },
    renameVar: function(this: Blockly.Block, oldName: string, newName: string) {
      if (Blockly.Names.equals(oldName, this.getFieldValue("SWVAR"))) {
        this.setFieldValue(newName, "SWVAR");
      }
    },
    mutationToDom: function(this: SwitchBlock): Element | null {
      if (!this.casebreakCount_ && !this.defaultCount_) {
        return null;
      }
      const container = document.createElement("mutation");
      if (this.casebreakCount_) {
        container.setAttribute("casebreak", String(this.casebreakCount_));
      }
      if (this.defaultCount_) {
        container.setAttribute("default", "1");
      }
      return container;
    },
    domToMutation: function(this: SwitchBlock, xmlElement: Element) {
      this.casebreakCount_ = Number(xmlElement.getAttribute("casebreak") || 0);
      this.defaultCount_ = Number(xmlElement.getAttribute("default") || 0);
      for (let i = 1; i <= (this.casebreakCount_ || 0); i += 1) {
        this.appendValueInput("CASE" + i)
          .setAlign(Blockly.inputs.Align.RIGHT)
          .appendField(getBlocklyMsg("CONTROLS_SWITCH_MSG_CASEBREAK"));
        this.appendStatementInput("DO" + i)
          .appendField(getBlocklyMsg("CONTROLS_SWITCH_MSG_DO"));
      }
      if (this.defaultCount_) {
        this.appendStatementInput("DEFAULT")
          .setAlign(Blockly.inputs.Align.RIGHT)
          .appendField(getBlocklyMsg("CONTROLS_SWITCH_MSG_DEFAULT"));
      }
    },
    decompose: function(this: SwitchBlock, workspace: Blockly.Workspace): Blockly.Block {
      const containerBlock = workspace.newBlock("controls_switch_var") as Blockly.BlockSvg;
      containerBlock.initSvg();
      let connection: Blockly.Connection | null =
        containerBlock.getInput("STACK")?.connection || null;
      for (let i = 1; i <= (this.casebreakCount_ || 0); i += 1) {
        const caseBlock = workspace.newBlock("controls_case_break") as Blockly.BlockSvg;
        caseBlock.initSvg();
        if (connection && caseBlock.previousConnection) {
          connection.connect(caseBlock.previousConnection);
        }
        connection = caseBlock.nextConnection;
      }
      if (this.defaultCount_) {
        const defaultBlock = workspace.newBlock("controls_case_default") as Blockly.BlockSvg;
        defaultBlock.initSvg();
        if (connection && defaultBlock.previousConnection) {
          connection.connect(defaultBlock.previousConnection);
        }
      }
      return containerBlock;
    },
    compose: function(this: SwitchBlock, containerBlock: Blockly.Block) {
      if (this.defaultCount_) {
        this.removeInput("DEFAULT");
      }
      this.defaultCount_ = 0;
      for (let i = this.casebreakCount_ || 0; i > 0; i -= 1) {
        this.removeInput("CASE" + i);
        this.removeInput("DO" + i);
      }
      this.casebreakCount_ = 0;
      let clauseBlock = containerBlock.getInputTargetBlock("STACK");
      while (clauseBlock) {
        switch (clauseBlock.type) {
          case "controls_case_break": {
            this.casebreakCount_ += 1;
            const caseInput = this.appendValueInput("CASE" + this.casebreakCount_)
              .appendField(getBlocklyMsg("CONTROLS_SWITCH_MSG_CASEBREAK"));
            const doInput = this.appendStatementInput("DO" + this.casebreakCount_);
            doInput.appendField(getBlocklyMsg("CONTROLS_SWITCH_MSG_DO"));
            const clause = clauseBlock as MutatorClauseBlock;
            if (clause.valueConnection_) {
              caseInput.connection?.connect(clause.valueConnection_);
            }
            if (clause.statementConnection_) {
              doInput.connection?.connect(clause.statementConnection_);
            }
            break;
          }
          case "controls_case_default": {
            this.defaultCount_ += 1;
            const defaultInput = this.appendStatementInput("DEFAULT");
            defaultInput.appendField(getBlocklyMsg("CONTROLS_SWITCH_MSG_DEFAULT"));
            const clause = clauseBlock as MutatorClauseBlock;
            if (clause.statementConnection_) {
              defaultInput.connection?.connect(clause.statementConnection_);
            }
            break;
          }
          default:
            throw new Error("Unknown block type.");
        }
        clauseBlock = clauseBlock.nextConnection?.targetBlock() || null;
      }
    },
    saveConnections: function(this: SwitchBlock, containerBlock: Blockly.Block) {
      let clauseBlock = containerBlock.getInputTargetBlock("STACK");
      let i = 1;
      while (clauseBlock) {
        switch (clauseBlock.type) {
          case "controls_case_break": {
            const inputCase = this.getInput("CASE" + i);
            const inputDo = this.getInput("DO" + i);
            const clause = clauseBlock as MutatorClauseBlock;
            clause.valueConnection_ = inputCase?.connection?.targetConnection || null;
            clause.statementConnection_ = inputDo?.connection?.targetConnection || null;
            i += 1;
            break;
          }
          case "controls_case_default": {
            const inputDo = this.getInput("DEFAULT");
            const clause = clauseBlock as MutatorClauseBlock;
            clause.statementConnection_ = inputDo?.connection?.targetConnection || null;
            break;
          }
          default:
            throw new Error("Unknown block type.");
        }
        clauseBlock = clauseBlock.nextConnection?.targetBlock() || null;
      }
      applySwitchCaseTyping(this);
    },
  };

  Blockly.Blocks["controls_switch_var"] = {
    init: function(this: Blockly.Block) {
      this.setStyle("logic_blocks");
      this.appendDummyInput()
        .appendField(getBlocklyMsg("CONTROLS_SWITCH_MSG_SWITCHVAR"));
      this.appendStatementInput("STACK");
      this.setTooltip(getBlocklyMsg("CONTROLS_SWITCH_VAR_TOOLTIP"));
      this.contextMenu = false;
    },
  };

  Blockly.Blocks["controls_case_break"] = {
    init: function(this: Blockly.Block) {
      this.setStyle("logic_blocks");
      this.appendDummyInput()
        .appendField(getBlocklyMsg("CONTROLS_SWITCH_MSG_CASEBREAK"));
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(getBlocklyMsg("CONTROLS_SWITCH_CASEBREAK_TOOLTIP"));
      this.contextMenu = false;
    },
  };

  Blockly.Blocks["controls_case_default"] = {
    init: function(this: Blockly.Block) {
      this.setStyle("logic_blocks");
      this.appendDummyInput()
        .appendField(getBlocklyMsg("CONTROLS_SWITCH_MSG_DEFAULT"));
      this.setPreviousStatement(true);
      this.setTooltip(getBlocklyMsg("CONTROLS_SWITCH_DEFAULT_TOOLTIP"));
      this.contextMenu = false;
    },
  };
}

export function defineBlocklyArduinoCompatBlocks(): void {
  if (!Blockly.Blocks["inout_angle_maths"]) {
    Blockly.Blocks["inout_angle_maths"] = {
      init: function(this: Blockly.Block) {
        this.setStyle("math_blocks");
        this.appendDummyInput()
          .appendField(getBlocklyMsgOr("MATH_ANGLE", "angle"))
          .appendField(new FieldAngle("90"), "ANGLE");
        this.setOutput(true, "Number");
        this.setTooltip(getBlocklyMsgOr("INOUT_ANGLE_MATHS_TOOLTIP", "angle °"));
      },
    };
  }

  if (!Blockly.Blocks["math_interval"]) {
    Blockly.Blocks["math_interval"] = {
      init: function(this: Blockly.Block) {
        const OPERATORS: Blockly.MenuOption[] = [
          ["<", "LT"],
          ["≤", "LTE"],
          [">", "GT"],
          ["≥", "GTE"],
        ];
        this.appendValueInput("inf").setCheck("Number");
        this.appendDummyInput()
          .appendField(new Blockly.FieldDropdown(OPERATORS), "comp_inf");
        this.appendValueInput("valeur").setCheck(null);
        this.appendDummyInput()
          .appendField(new Blockly.FieldDropdown(OPERATORS), "comp_sup");
        this.appendValueInput("sup").setCheck("Number");
        this.setOutput(true, "Boolean");
        this.setStyle("math_blocks");
        this.setTooltip(getBlocklyMsgOr("MATH_INTERVAL_TOOLTIP", "compare"));
        this.setHelpUrl("");
      },
    };
  }

  if (!Blockly.Blocks["text_char"]) {
    Blockly.Blocks["text_char"] = {
      init: function(this: Blockly.Block) {
        this.setStyle("text_blocks");
        this.appendDummyInput()
          .appendField('"')
          .appendField(
            new Blockly.FieldTextInput("", validateSingleChar),
            "TEXT",
          )
          .appendField('"');
        this.setOutput(true, "char");
        this.setTooltip(getBlocklyMsgOr("TEXT_CHAR_TOOLTIP", "character"));
      },
    };
  }
}

type VariableWithMutableType = Blockly.VariableModel & {
  setType?: (type: string) => void;
  type_?: string;
  __ucbManualType?: boolean;
  __ucbConst?: boolean;
};

const getVariableTypeLabel = (type: string): string =>
  getBlocklyMsgOr(`VAR_TYPE_${type.toUpperCase()}`, type);

const getVariableTypeDropdownOptions = (): Blockly.MenuOption[] =>
  getVariableTypeOptions().map((type) => [
    getVariableTypeLabel(type),
    type,
  ] as Blockly.MenuOption);

/**
 * Define the variables_get_dynamic block
 */
export function defineVariablesGetDynamicBlock(): void {
  Blockly.Blocks['variables_get_dynamic'] = {
    init: function(this: Blockly.Block) {
      // Use Field.SKIP_SETUP to prevent automatic creation of default 'item' variable
      // This is the same approach used by Blockly's built-in variable blocks
      this.appendDummyInput()
          .appendField(
            new Blockly.FieldVariable(Blockly.Field.SKIP_SETUP, undefined, null, ''),
            'VAR',
          );
      const varField = this.getField('VAR') as Blockly.FieldVariable | null;
      if (varField) {
        configureTypedVariableField(varField);
      }
      this.setOutput(true);
      this.setStyle("variable_dynamic_blocks");
      this.setTooltip(getBlocklyMsg('VARIABLES_GET_TOOLTIP'));
      this.setHelpUrl('');
    },
    /**
     * Called when the block changes (variable selection, etc.).
     * Updates the output connection type using setOutput() so the ConnectionChecker can verify it.
     * Note: setCheck() on output connections doesn't work - we must use setOutput(true, type).
     */
    onchange: function(this: Blockly.Block, event: Blockly.Events.Abstract) {
      if (shouldSkipVariableChange(this, event)) {
        return;
      }
      // Only process relevant events
      if (event.type !== Blockly.Events.BLOCK_CHANGE && 
          event.type !== Blockly.Events.BLOCK_CREATE &&
          event.type !== Blockly.Events.BLOCK_MOVE &&
          event.type !== Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE &&
          event.type !== Blockly.Events.VAR_CREATE &&
          event.type !== Blockly.Events.VAR_RENAME &&
          event.type !== Blockly.Events.VAR_DELETE) {
        return;
      }
      
      const variableId = this.getFieldValue('VAR');
      if (!variableId) {
        // No variable selected - block all typed connections
        // Use '__NO_TYPE__' to prevent connections to typed inputs (like Boolean)
        this.setOutput(true, '__NO_TYPE__');
        return;
      }
      
      try {
        const variable = this.workspace.getVariableMap().getVariableById(variableId);
        if (variable) {
          const varType = variable.getType();
          if (!varType) {
            // Variable has no type - block all typed connections
            // Use '__NO_TYPE__' to prevent connections to typed inputs (like Boolean)
            this.setOutput(true, '__NO_TYPE__');
          } else {
            // Map our internal types to Blockly types
            // Blockly uses 'Boolean' (capital B), we use 'bool'
            const blocklyType = varType === 'bool' ? 'Boolean' : varType;
            // setOutput(true, type) sets the check on the output connection
            // This is what the ConnectionChecker actually verifies
            this.setOutput(true, blocklyType);
          }
        } else {
          // Variable not found - block all typed connections
          this.setOutput(true, '__NO_TYPE__');
        }
      } catch (error) {
        debugLog('Error updating variable type check:', error);
        this.setOutput(true, '__NO_TYPE__');
      }
    }
  };
}

/**
 * Define the variables_set_dynamic block
 */
export function defineVariablesSetDynamicBlock(): void {
  Blockly.Blocks['variables_set_dynamic'] = {
    init: function(this: Blockly.Block) {
      // Use Field.SKIP_SETUP to prevent automatic creation of default 'item' variable
      // This is the same approach used by Blockly's built-in variable blocks
      this.appendValueInput('VALUE')
          .setCheck(null)
          .appendField(getBlocklyMsg('TYPED_VAR_SET_LABEL'))
          .appendField(
            new Blockly.FieldVariable(Blockly.Field.SKIP_SETUP, undefined, null, ''),
            'VAR',
          )
          .appendField(getBlocklyMsg('TYPED_VAR_TO_LABEL'));
      const varField = this.getField('VAR') as Blockly.FieldVariable | null;
      if (varField) {
        configureTypedVariableField(varField);
      }
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle("variable_dynamic_blocks");
      this.setTooltip(getBlocklyMsg('VARIABLES_SET_TOOLTIP'));
      this.setHelpUrl('');
    },
    /**
     * Called when the block changes (variable selection, value connection, etc.).
     * Validates that the assigned value type matches the variable type.
     * If incompatible, suggests changing the variable type or shows a warning.
     */
    onchange: function(this: Blockly.Block, event: Blockly.Events.Abstract) {
      if (shouldSkipVariableChange(this, event)) {
        return;
      }
      handleVariablesSetChange(this, event, 'variables_set_dynamic');
    }
  };
}

/**
 * Define the variables_set_type block
 */
export function defineVariablesSetTypeBlock(): void {
  Blockly.Blocks['variables_set_type'] = {
    init: function(this: Blockly.Block) {
      this.appendDummyInput()
          .appendField(getBlocklyMsg('TYPED_VAR_TYPE_SET_LABEL'))
          .appendField(
            new Blockly.FieldVariable(Blockly.Field.SKIP_SETUP, undefined, null, ''),
            'VAR',
          )
          .appendField(getBlocklyMsg('TYPED_VAR_TYPE_TO_LABEL'))
          .appendField(
            new Blockly.FieldDropdown(getVariableTypeDropdownOptions),
            'TYPE',
          );
      const varField = this.getField('VAR') as Blockly.FieldVariable | null;
      if (varField) {
        configureTypedVariableField(varField);
      }
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle("variable_dynamic_blocks");
      this.setTooltip(getBlocklyMsg('VARIABLES_SET_TOOLTIP'));
      this.setHelpUrl('');
    },
    onchange: function(this: Blockly.Block, event: Blockly.Events.Abstract) {
      if (shouldSkipVariableChange(this, event)) {
        return;
      }
      if (event.type !== Blockly.Events.BLOCK_CHANGE && 
          event.type !== Blockly.Events.BLOCK_CREATE &&
          event.type !== Blockly.Events.BLOCK_MOVE &&
          event.type !== Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE &&
          event.type !== Blockly.Events.VAR_RENAME &&
          event.type !== Blockly.Events.VAR_DELETE &&
          event.type !== Blockly.Events.VAR_CREATE) {
        return;
      }
      const variableId = this.getFieldValue('VAR');
      const typeField = this.getField('TYPE') as Blockly.FieldDropdown | null;
      if (!variableId || !typeField) {
        return;
      }

      const selectedType = typeField.getValue();
      if (!selectedType) {
        return;
      }

      if (
        event.type === Blockly.Events.BLOCK_CHANGE &&
        (event as Blockly.Events.BlockChange).element === "field" &&
        (event as Blockly.Events.BlockChange).name === "TYPE"
      ) {
        try {
          const variable = this.workspace.getVariableMap().getVariableById(variableId);
          if (variable) {
            const typedVariable = variable as VariableWithMutableType;
            if (typedVariable.__ucbConst) {
              this.setWarningText(getConstWarningText());
              const currentType = variable.getType();
              if (currentType && currentType !== selectedType) {
                typeField.setValue(currentType);
              }
              return;
            }
            if (variable.getType() !== selectedType) {
              setVariableType(variable, selectedType);
              typedVariable.__ucbManualType = true;
            }
          }
        } catch (error) {
          debugLog('Error setting variable type:', error);
        }
        return;
      }

      try {
        const variable = this.workspace.getVariableMap().getVariableById(variableId);
        if (!variable) {
          return;
        }
        const typedVariable = variable as VariableWithMutableType;
        if (typedVariable.__ucbConst) {
          this.setWarningText(getConstWarningText());
          return;
        }
        const varType = variable.getType();
        if (varType && varType !== selectedType) {
          typeField.setValue(varType);
        }
      } catch (error) {
        debugLog('Error syncing variable type:', error);
      }
    }
  };
}

export function defineVariablesConstBlock(): void {
  Blockly.Blocks["variables_const"] = {
    init: function(this: Blockly.Block) {
      this.appendValueInput("VAL_CONST")
        .appendField(getBlocklyMsgOr("VARIABLES_SET_CONST", "set const"))
        .appendField(
          new Blockly.FieldVariable(Blockly.Field.SKIP_SETUP, undefined, null, ''),
          "VAR",
        )
        .appendField(getBlocklyMsgOr("VARIABLES_SET_CONST_AT", "at"));
      const varField = this.getField("VAR") as Blockly.FieldVariable | null;
      if (varField) {
        configureTypedVariableField(varField);
      }
      this.setStyle("variable_dynamic_blocks");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip(
        getBlocklyMsgOr("VARIABLES_SET_CONST_TOOLTIP", "set constant"),
      );
      this.setHelpUrl(getBlocklyMsgOr("VARIABLES_SET_CONST_HELPURL", ""));
    },
    onchange: function(this: Blockly.Block, event: Blockly.Events.Abstract) {
      if (shouldSkipVariableChange(this, event)) {
        return;
      }
      if (
        event.type !== Blockly.Events.BLOCK_CHANGE &&
        event.type !== Blockly.Events.BLOCK_CREATE &&
        event.type !== Blockly.Events.BLOCK_MOVE &&
        event.type !== Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE &&
        event.type !== Blockly.Events.VAR_CREATE &&
        event.type !== Blockly.Events.VAR_RENAME &&
        event.type !== Blockly.Events.VAR_DELETE
      ) {
        return;
      }
      const variableId = this.getFieldValue("VAR");
      if (!variableId) {
        return;
      }
      const variable = this.workspace.getVariableMap().getVariableById(variableId);
      if (!variable) {
        return;
      }
      const typedVariable = variable as VariableWithMutableType;
      typedVariable.__ucbConst = true;
      const valueInput = this.getInput("VAL_CONST");
      if (valueInput?.connection) {
        // Allow any value to be connected so we can infer the type.
        valueInput.connection.setCheck(null);
      }
      const connectedType = inferConnectedValueType(
        this.getInputTargetBlock("VAL_CONST"),
      );
      if (connectedType) {
        setVariableType(variable, connectedType);
        if (valueInput?.connection) {
          valueInput.connection.setCheck(getBlocklyCompatibleChecks(connectedType));
        }
        this.setWarningText(null);
        return;
      }
      clearVariableType(variable);
      this.setWarningText(getUntypedWarningText());
    },
    contextMenuType_: "variables_get_dynamic",
  };
}

export function defineVariablesSetInitBlock(): void {
  Blockly.Blocks["variables_set_init"] = {
    init: function(this: Blockly.Block) {
      this.appendValueInput("VALUE")
        .appendField(getBlocklyMsgOr("VARIABLES_SET_INIT", "set"))
        .appendField(
          new Blockly.FieldVariable(Blockly.Field.SKIP_SETUP, undefined, null, ''),
          "VAR",
        )
        .appendField(getBlocklyMsgOr("VARIABLES_AS", "as"))
        .appendField(
          new Blockly.FieldDropdown(getVariableTypeDropdownOptions),
          "VARIABLE_SETTYPE_TYPE",
        )
        .appendField(getBlocklyMsgOr("_AT", "at"));
      const varField = this.getField("VAR") as Blockly.FieldVariable | null;
      if (varField) {
        configureTypedVariableField(varField);
      }
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle("variable_dynamic_blocks");
      this.setTooltip(
        getBlocklyMsgOr("VARIABLES_SET_INIT_TOOLTIP", "set and declare"),
      );
      this.setHelpUrl(getBlocklyMsgOr("VARIABLES_SET_INIT_HELPURL", ""));
    },
    onchange: function(this: Blockly.Block, event: Blockly.Events.Abstract) {
      if (shouldSkipVariableChange(this, event)) {
        return;
      }
      if (
        event.type !== Blockly.Events.BLOCK_CHANGE &&
        event.type !== Blockly.Events.BLOCK_CREATE &&
        event.type !== Blockly.Events.BLOCK_MOVE &&
        event.type !== Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE &&
        event.type !== Blockly.Events.VAR_CREATE &&
        event.type !== Blockly.Events.VAR_RENAME &&
        event.type !== Blockly.Events.VAR_DELETE
      ) {
        return;
      }
      const variableId = this.getFieldValue("VAR");
      const typeField = this.getField("VARIABLE_SETTYPE_TYPE") as Blockly.FieldDropdown | null;
      if (!variableId || !typeField) {
        return;
      }
      const selectedType = typeField.getValue() || "int";
      const variable = this.workspace.getVariableMap().getVariableById(variableId);
      if (!variable) {
        return;
      }
      const typedVariable = variable as VariableWithMutableType;
      if (typedVariable.__ucbConst) {
        this.setWarningText(getConstWarningText());
        return;
      }
      if (variable.getType() !== selectedType) {
        setVariableType(variable, selectedType);
      }
      const valueInput = this.getInput("VALUE");
      if (valueInput?.connection) {
        valueInput.connection.setCheck(getBlocklyCompatibleChecks(selectedType));
      }
    },
    contextMenuType_: "variables_get_dynamic",
  };
}

/**
 * Extend the standard variables_get block to support type checking
 */
function extendStandardVariablesGetBlock(): void {
  // Add getBlockType to the standard variables_get block
  if (Blockly.Blocks['variables_get']) {

    // Add onchange to update the output connection type
    const originalOnchange = Blockly.Blocks['variables_get'].onchange;
    Blockly.Blocks['variables_get'].onchange = function(this: Blockly.Block, event: Blockly.Events.Abstract) {
      // Call original onchange if it exists
      if (originalOnchange) {
        originalOnchange.call(this, event);
      }

      // Only process relevant events
      if (event.type !== Blockly.Events.BLOCK_CHANGE && 
          event.type !== Blockly.Events.BLOCK_CREATE &&
          event.type !== Blockly.Events.BLOCK_MOVE &&
          event.type !== Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE &&
          event.type !== Blockly.Events.VAR_CREATE &&
          event.type !== Blockly.Events.VAR_RENAME &&
          event.type !== Blockly.Events.VAR_DELETE) {
        return;
      }
      
      const variableId = this.getFieldValue('VAR');
      if (!variableId) {
        this.setOutput(true, '__NO_TYPE__');
        return;
      }
      
      try {
        const variable = this.workspace.getVariableMap().getVariableById(variableId);
        if (variable) {
          const varType = variable.getType();
          if (!varType) {
            this.setOutput(true, '__NO_TYPE__');
          } else {
            const blocklyType = varType === 'bool' ? 'Boolean' : varType;
            this.setOutput(true, blocklyType);
          }
        } else {
          this.setOutput(true, '__NO_TYPE__');
        }
      } catch (error) {
        debugLog('Error updating variable type check:', error);
        this.setOutput(true, '__NO_TYPE__');
      }
    };
  }
}

/**
 * Extend the standard variables_set block to support type checking
 */
function extendStandardVariablesSetBlock(): void {
  if (Blockly.Blocks['variables_set']) {
    const originalOnchange = Blockly.Blocks['variables_set'].onchange;
    Blockly.Blocks['variables_set'].onchange = function(this: Blockly.Block, event: Blockly.Events.Abstract) {
      // Call original onchange if it exists
      if (originalOnchange) {
        originalOnchange.call(this, event);
      }
      handleVariablesSetChange(this, event, 'variables_set');
    };
  }
}

/**
 * Define all typed variable blocks
 */
export function defineAllTypedVariableBlocks(): void {
  defineVariablesGetDynamicBlock();
  defineVariablesSetDynamicBlock();
  defineVariablesSetTypeBlock();
  defineVariablesConstBlock();
  defineVariablesSetInitBlock();
  defineControlsSwitchBlocks();
  defineBlocklyArduinoCompatBlocks();
  
  // Also extend the standard blocks to support type checking
  extendStandardVariablesGetBlock();
  extendStandardVariablesSetBlock();
  
  debugLog('Blocs de variables typées définis avec succès');
}
