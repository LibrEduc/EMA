import * as Blockly from "blockly";
import { checkTypeCompatibility, getCompatibleTypesForCheck } from "../../generators/arduino/block_types_registry";
import { setVariableType } from "../../generators/arduino/variable_utils";
import {
  configureTypedVariableField,
  getBlocklyMsg,
  getTypeMismatchWarningText,
  inferConnectedValueType,
  VariableWithMutableType,
} from "./shared";

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

export const defineControlsSwitchBlocks = (): void => {
  if (!Blockly.Blocks["controls_if_if"]) {
    Blockly.Blocks["controls_if_if"] = {
      init: function (this: Blockly.Block) {
        this.appendDummyInput()
          .appendField(getBlocklyMsg("CONTROLS_IF_IF_TITLE_IF"));
        this.setNextStatement(true);
        this.setStyle("logic_blocks");
        this.setTooltip(getBlocklyMsg("CONTROLS_IF_IF_TOOLTIP"));
        this.contextMenu = false;
      },
    };
  }
  if (!Blockly.Blocks["controls_if_elseif"]) {
    Blockly.Blocks["controls_if_elseif"] = {
      init: function (this: Blockly.Block) {
        this.appendDummyInput()
          .appendField(getBlocklyMsg("CONTROLS_IF_ELSEIF_TITLE_ELSEIF"));
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setStyle("logic_blocks");
        this.setTooltip(getBlocklyMsg("CONTROLS_IF_ELSEIF_TOOLTIP"));
        this.contextMenu = false;
      },
    };
  }
  if (!Blockly.Blocks["controls_if_else"]) {
    Blockly.Blocks["controls_if_else"] = {
      init: function (this: Blockly.Block) {
        this.appendDummyInput()
          .appendField(getBlocklyMsg("CONTROLS_IF_ELSE_TITLE_ELSE"));
        this.setPreviousStatement(true);
        this.setStyle("logic_blocks");
        this.setTooltip(getBlocklyMsg("CONTROLS_IF_ELSE_TOOLTIP"));
        this.contextMenu = false;
      },
    };
  }
  Blockly.Blocks["controls_ifelse"] = {
    init: function (this: Blockly.Block) {
      const baseIf = Blockly.Blocks["controls_if"] as
        | { init?: (this: Blockly.Block) => void }
        | undefined;
      baseIf?.init?.call(this);
      const mutation = Blockly.utils.xml.createElement("mutation");
      mutation.setAttribute("else", "1");
      this.domToMutation?.(mutation);
    },
  };

  Blockly.Blocks["controls_switch"] = {
    init: function (this: SwitchBlock) {
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
    onchange: function (this: SwitchBlock, event: Blockly.Events.Abstract) {
      updateSwitchCaseTyping(this, event);
    },
    renameVar: function (this: Blockly.Block, oldName: string, newName: string) {
      if (Blockly.Names.equals(oldName, this.getFieldValue("SWVAR"))) {
        this.setFieldValue(newName, "SWVAR");
      }
    },
    mutationToDom: function (this: SwitchBlock): Element | null {
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
    domToMutation: function (this: SwitchBlock, xmlElement: Element) {
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
    decompose: function (this: SwitchBlock, workspace: Blockly.Workspace): Blockly.Block {
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
    compose: function (this: SwitchBlock, containerBlock: Blockly.Block) {
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
    saveConnections: function (this: SwitchBlock, containerBlock: Blockly.Block) {
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
    init: function (this: Blockly.Block) {
      this.setStyle("logic_blocks");
      this.appendDummyInput()
        .appendField(getBlocklyMsg("CONTROLS_SWITCH_MSG_SWITCHVAR"));
      this.appendStatementInput("STACK");
      this.setTooltip(getBlocklyMsg("CONTROLS_SWITCH_VAR_TOOLTIP"));
      this.contextMenu = false;
    },
  };

  Blockly.Blocks["controls_case_break"] = {
    init: function (this: Blockly.Block) {
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
    init: function (this: Blockly.Block) {
      this.setStyle("logic_blocks");
      this.appendDummyInput()
        .appendField(getBlocklyMsg("CONTROLS_SWITCH_MSG_DEFAULT"));
      this.setPreviousStatement(true);
      this.setTooltip(getBlocklyMsg("CONTROLS_SWITCH_DEFAULT_TOOLTIP"));
      this.contextMenu = false;
    },
  };
};
