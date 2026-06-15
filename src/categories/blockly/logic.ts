/**
 * @packageDocumentation
 * @module BlocklyCategories.Logic
 * @description Logic block definitions for the Blockly toolbox.
 * @remarks
 * Defines logic blocks and typing behaviors used in µcBlockly.
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
import { clearVariableType, setVariableType } from "../../generators/arduino/variable_utils";
import {
  configureTypedVariableField,
  getBlocklyMsg,
  getTypeMismatchWarningText,
  hasConnectedAssignmentForVariable,
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

/** Switch case labels accept int values; Number keeps Blockly math_number compatible. */
const SWITCH_CASE_CHECKS = ["Number", "int"];

const applyCaseInputChecks = (block: SwitchBlock): void => {
  const caseCount = block.casebreakCount_ || 0;
  for (let i = 0; i <= caseCount; i += 1) {
    const input = block.getInput(`CASE${i}`);
    if (input?.connection) {
      input.connection.setCheck(SWITCH_CASE_CHECKS);
    }
  }
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

const inferTypeFromCases = (caseConnections: CaseConnection[]): "int" | null => {
  if (caseConnections.length === 0) {
    return null;
  }
  const allInt = caseConnections.every((item) => item.connectedType === "int");
  return allInt ? "int" : null;
};

const applySwitchCaseTyping = (block: SwitchBlock): void => {
  applyCaseInputChecks(block);

  const variableId = block.getFieldValue("SWVAR");
  if (!variableId || !block.workspace) {
    block.setWarningText(null);
    return;
  }

  const variable = block.workspace.getVariableMap().getVariableById(variableId);
  if (!variable) {
    block.setWarningText(null);
    return;
  }

  const varType = variable.getType();
  const isNoType = !varType || varType === "__NO_TYPE__";
  const caseConnections = getCaseConnections(block);
  const typedVariable = variable as VariableWithMutableType;

  for (const caseItem of caseConnections) {
    if (caseItem.connectedType !== "int") {
      block.setWarningText(
        getTypeMismatchWarningText("int", caseItem.connectedType),
      );
      return;
    }
  }

  if (isNoType) {
    const inferredType = inferTypeFromCases(caseConnections);
    if (inferredType && !typedVariable.__ucbManualType) {
      setVariableType(variable, inferredType);
    }
    block.setWarningText(null);
    return;
  }

  if (
    caseConnections.length === 0 &&
    !typedVariable.__ucbManualType &&
    !hasConnectedAssignmentForVariable(block.workspace, variableId)
  ) {
    clearVariableType(variable);
    block.setWarningText(null);
    return;
  }

  if (varType !== "int" && caseConnections.length > 0) {
    block.setWarningText(getTypeMismatchWarningText("int", varType));
    return;
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
  if (!block.casebreakCount_) {
    return getBlocklyMsg("CONTROLS_SWITCH_TOOLTIP_4");
  }
  return getBlocklyMsg("CONTROLS_SWITCH_TOOLTIP_4");
};

/**
 * Registers the controls_switch block definitions and typing.
 */
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
        .setCheck(SWITCH_CASE_CHECKS)
        .appendField(getBlocklyMsg("CONTROLS_SWITCH_MSG_CASEBREAK"));
      this.appendStatementInput("DO0")
        .setAlign(Blockly.inputs.Align.RIGHT)
        .appendField(getBlocklyMsg("CONTROLS_SWITCH_MSG_DO"));
      this.appendStatementInput("DEFAULT")
        .setAlign(Blockly.inputs.Align.RIGHT)
        .appendField(getBlocklyMsg("CONTROLS_SWITCH_MSG_DEFAULT"));
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setMutator(
        new Blockly.icons.MutatorIcon(
          ["controls_case_break"],
          this as unknown as Blockly.BlockSvg,
        ),
      );
      this.setTooltip(() => getSwitchTooltip(this));
      this.casebreakCount_ = 0;
      this.defaultCount_ = 1;
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
      if (!this.casebreakCount_) {
        return null;
      }
      const container = document.createElement("mutation");
      container.setAttribute("casebreak", String(this.casebreakCount_));
      return container;
    },
    domToMutation: function (this: SwitchBlock, xmlElement: Element) {
      const defaultConnection =
        this.getInput("DEFAULT")?.connection?.targetConnection || null;
      if (this.getInput("DEFAULT")) {
        this.removeInput("DEFAULT");
      }
      this.casebreakCount_ = Number(xmlElement.getAttribute("casebreak") || 0);
      this.defaultCount_ = 1;
      for (let i = 1; i <= (this.casebreakCount_ || 0); i += 1) {
        this.appendValueInput("CASE" + i)
          .setAlign(Blockly.inputs.Align.RIGHT)
          .setCheck(SWITCH_CASE_CHECKS)
          .appendField(getBlocklyMsg("CONTROLS_SWITCH_MSG_CASEBREAK"));
        this.appendStatementInput("DO" + i)
          .appendField(getBlocklyMsg("CONTROLS_SWITCH_MSG_DO"));
      }
      const defaultInput = this.appendStatementInput("DEFAULT")
        .setAlign(Blockly.inputs.Align.RIGHT)
        .appendField(getBlocklyMsg("CONTROLS_SWITCH_MSG_DEFAULT"));
      if (defaultConnection) {
        defaultInput.connection?.connect(defaultConnection);
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
      return containerBlock;
    },
    compose: function (this: SwitchBlock, containerBlock: Blockly.Block) {
      const defaultConnection =
        this.getInput("DEFAULT")?.connection?.targetConnection || null;
      if (this.getInput("DEFAULT")) {
        this.removeInput("DEFAULT");
      }
      this.defaultCount_ = 1;
      for (let i = this.casebreakCount_ || 0; i > 0; i -= 1) {
        this.removeInput("CASE" + i);
        this.removeInput("DO" + i);
      }
      this.casebreakCount_ = 0;
      let clauseBlock = containerBlock.getInputTargetBlock("STACK");
      while (clauseBlock) {
        if (clauseBlock.type !== "controls_case_break") {
          throw new Error("Unknown block type.");
        }
        this.casebreakCount_ += 1;
        const caseInput = this.appendValueInput("CASE" + this.casebreakCount_)
          .setCheck(SWITCH_CASE_CHECKS)
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
        clauseBlock = clauseBlock.nextConnection?.targetBlock() || null;
      }
      const defaultInput = this.appendStatementInput("DEFAULT")
        .setAlign(Blockly.inputs.Align.RIGHT)
        .appendField(getBlocklyMsg("CONTROLS_SWITCH_MSG_DEFAULT"));
      if (defaultConnection) {
        defaultInput.connection?.connect(defaultConnection);
      }
    },
    saveConnections: function (this: SwitchBlock, containerBlock: Blockly.Block) {
      let clauseBlock = containerBlock.getInputTargetBlock("STACK");
      let i = 1;
      while (clauseBlock) {
        if (clauseBlock.type !== "controls_case_break") {
          throw new Error("Unknown block type.");
        }
        const inputCase = this.getInput("CASE" + i);
        const inputDo = this.getInput("DO" + i);
        const clause = clauseBlock as MutatorClauseBlock;
        clause.valueConnection_ = inputCase?.connection?.targetConnection || null;
        clause.statementConnection_ = inputDo?.connection?.targetConnection || null;
        i += 1;
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
