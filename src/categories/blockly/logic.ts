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
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
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
import { createPlusField } from "@blockly/block-plus-minus/src/field_plus";
import { createMinusField } from "@blockly/block-plus-minus/src/field_minus";
import { clearVariableType, setVariableType } from "../../generators/arduino/variable_utils";
import {
  configureScalarVariableField,
  getBlocklyMsg,
  getTypeMismatchWarningText,
  hasConnectedAssignmentForVariable,
  inferConnectedValueType,
  VariableWithMutableType,
} from "./shared";

type SwitchBlock = Blockly.Block & {
  casebreakCount_?: number;
  defaultCount_?: number;
  updateShape_?: (targetCount: number) => void;
  addCase_?: () => void;
  removeCase_?: (caseIndex?: number) => void;
  plus?: () => void;
  minus?: (caseIndex?: number) => void;
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

const appendSwitchCaseInputs = (
  block: SwitchBlock,
  caseIndex: number,
  withMinus: boolean,
): void => {
  const caseInput = block
    .appendValueInput("CASE" + caseIndex)
    .setAlign(Blockly.inputs.Align.RIGHT)
    .setCheck(SWITCH_CASE_CHECKS)
    .appendField(getBlocklyMsg("CONTROLS_SWITCH_MSG_CASEBREAK"));
  if (withMinus) {
    caseInput.appendField(createMinusField(caseIndex), "MINUS" + caseIndex);
  }
  block
    .appendStatementInput("DO" + caseIndex)
    .setAlign(Blockly.inputs.Align.RIGHT)
    .appendField(getBlocklyMsg("CONTROLS_SWITCH_MSG_DO"));
};

const controlsSwitchPlusMinusMutator = {
  mutationToDom: function (this: SwitchBlock): Element | null {
    if (!this.casebreakCount_) {
      return null;
    }
    const container = Blockly.utils.xml.createElement("mutation");
    container.setAttribute("casebreak", String(this.casebreakCount_));
    return container;
  },
  domToMutation: function (this: SwitchBlock, xmlElement: Element) {
    const targetCount = Number(xmlElement.getAttribute("casebreak") || 0);
    this.updateShape_?.(targetCount);
  },
  saveExtraState: function (this: SwitchBlock) {
    if (!this.casebreakCount_) {
      return null;
    }
    return { casebreakCount: this.casebreakCount_ };
  },
  loadExtraState: function (this: SwitchBlock, state: { casebreakCount?: number }) {
    this.updateShape_?.(state.casebreakCount ?? 0);
  },
  updateShape_: function (this: SwitchBlock, targetCount: number) {
    while ((this.casebreakCount_ || 0) < targetCount) {
      this.addCase_?.();
    }
    while ((this.casebreakCount_ || 0) > targetCount) {
      this.removeCase_?.();
    }
    applySwitchCaseTyping(this);
  },
  plus: function (this: SwitchBlock) {
    this.addCase_?.();
    applySwitchCaseTyping(this);
  },
  minus: function (this: SwitchBlock, caseIndex?: number) {
    if (!this.casebreakCount_) {
      return;
    }
    this.removeCase_?.(caseIndex);
    applySwitchCaseTyping(this);
  },
  addCase_: function (this: SwitchBlock) {
    this.casebreakCount_ = (this.casebreakCount_ || 0) + 1;
    appendSwitchCaseInputs(this, this.casebreakCount_, true);
    if (this.getInput("DEFAULT")) {
      this.moveInputBefore("DEFAULT", null);
    }
  },
  removeCase_: function (this: SwitchBlock, caseIndex?: number) {
    const count = this.casebreakCount_ || 0;
    if (count <= 0) {
      return;
    }
    const removeIndex = caseIndex ?? count;
    if (removeIndex <= 0 || removeIndex > count) {
      return;
    }
    if (caseIndex !== undefined && caseIndex !== count) {
      const caseInputIndex = this.inputList.findIndex(
        (input) => input.name === "CASE" + caseIndex,
      );
      if (caseInputIndex >= 0) {
        const caseConnection = this.inputList[caseInputIndex].connection;
        if (caseConnection?.isConnected()) {
          caseConnection.disconnect();
        }
        const doConnection = this.inputList[caseInputIndex + 1]?.connection;
        if (doConnection?.isConnected()) {
          doConnection.disconnect();
        }
        const bump = (this as Blockly.Block & { bumpNeighbours?: () => void }).bumpNeighbours;
        bump?.call(this);
        for (let n = caseInputIndex + 2; n < this.inputList.length; n += 1) {
          const input = this.inputList[n];
          if (!input || input.name === "DEFAULT") {
            break;
          }
          const targetConnection = input.connection?.targetConnection;
          if (targetConnection && this.inputList[n - 2]?.connection) {
            this.inputList[n - 2].connection!.connect(targetConnection);
          }
        }
      }
    }
    this.removeInput("CASE" + count);
    this.removeInput("DO" + count);
    this.casebreakCount_ = count - 1;
  },
};

const registerControlsSwitchPlusMinusMutator = (): void => {
  const mutatorName = "controls_switch_plus_minus_mutator";
  if (Blockly.Extensions.isRegistered(mutatorName)) {
    return;
  }
  Blockly.Extensions.registerMutator(
    mutatorName,
    controlsSwitchPlusMinusMutator,
    function (this: SwitchBlock) {
      this.getInput("CASE0")?.insertFieldAt(0, createPlusField(), "PLUS");
    },
  );
};

/**
 * Registers the controls_switch block definitions and typing.
 */
export const defineControlsSwitchBlocks = (): void => {
  registerControlsSwitchPlusMinusMutator();

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
        configureScalarVariableField(varField);
      }
      (this as Blockly.Block & { contextMenuMsg_?: string }).contextMenuMsg_ =
        Blockly.Msg.VARIABLES_GET_CREATE_SET ?? "";
      (this as Blockly.Block & { contextMenuType_?: string }).contextMenuType_ =
        "variables_set";
      appendSwitchCaseInputs(this, 0, false);
      this.appendStatementInput("DEFAULT")
        .setAlign(Blockly.inputs.Align.RIGHT)
        .appendField(getBlocklyMsg("CONTROLS_SWITCH_MSG_DEFAULT"));
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(() => getSwitchTooltip(this));
      this.casebreakCount_ = 0;
      this.defaultCount_ = 1;
      Blockly.Extensions.apply("controls_switch_plus_minus_mutator", this, true);
    },
    onchange: function (this: SwitchBlock, event: Blockly.Events.Abstract) {
      updateSwitchCaseTyping(this, event);
    },
    renameVar: function (this: Blockly.Block, oldName: string, newName: string) {
      if (Blockly.Names.equals(oldName, this.getFieldValue("SWVAR"))) {
        this.setFieldValue(newName, "SWVAR");
      }
    },
  };
};
