/**
 * @packageDocumentation
 * @module BlocklyCategories.Variables.Declare.Define
 * @description Variable definition block for s4e compatibility (`variables_define`).
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Blockly from "blockly";
import {
  clearVariableType,
  setVariableType,
  VARIABLES_DEFINE_BLOCK_TYPE,
  VARIABLES_DEFINE_LEGACY_BLOCK_TYPE,
} from "../../generators/arduino/variable_utils";
import {
  configureScalarVariableField,
  getBlocklyCompatibleChecks,
  getBlocklyMsgOr,
  getUntypedWarningText,
  inferConnectedValueType,
  shouldSkipVariableChange,
  VariableWithMutableType,
} from "./shared";

/** Registers the variable definition block used by s4e compatibility. */
export const defineVariablesDefineBlock = (): void => {
  const initDefineBlock = function (this: Blockly.Block) {
    this.appendValueInput("VALUE")
      .appendField(getBlocklyMsgOr("VARIABLES_DEFINE", "define variable"))
      .appendField(
        new Blockly.FieldVariable(Blockly.Field.SKIP_SETUP, undefined, null, ""),
        "VAR",
      )
      .appendField(getBlocklyMsgOr("VARIABLES_AS", "as"));
    const varField = this.getField("VAR") as Blockly.FieldVariable | null;
    if (varField) {
      configureScalarVariableField(varField);
    }
    this.setStyle("variable_dynamic_blocks");
    this.setTooltip(getBlocklyMsgOr("ARDUINO_BASE_DEFINE_CONST_TOOLTIP", ""));
    this.setHelpUrl(getBlocklyMsgOr("ARDUINO_BASE_DEFINE_CONST_HELPURL", ""));
  };

  const onchangeDefine = function (this: Blockly.Block, event: Blockly.Events.Abstract): void {
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
    if (!variableId || !this.workspace) {
      return;
    }
    const variable = this.workspace.getVariableMap().getVariableById(variableId);
    if (!variable) {
      return;
    }
    const valueInput = this.getInput("VALUE");
    const targetBlock = valueInput?.connection?.targetBlock() || null;
    const isShadow = Boolean(targetBlock?.isShadow?.());
    const hasRealValue = Boolean(targetBlock && !isShadow);
    if (!hasRealValue) {
      clearVariableType(variable);
      if (valueInput?.connection) {
        valueInput.connection.setCheck(null);
      }
      this.setWarningText(getUntypedWarningText());
      return;
    }
    const connectedType = inferConnectedValueType(targetBlock);
    if (connectedType) {
      setVariableType(variable, connectedType);
      const typedVariable = variable as VariableWithMutableType;
      typedVariable.__ucbManualType = false;
      if (valueInput?.connection) {
        valueInput.connection.setCheck(getBlocklyCompatibleChecks(connectedType));
      }
      this.setWarningText(null);
    } else {
      clearVariableType(variable);
      if (valueInput?.connection) {
        valueInput.connection.setCheck(null);
      }
      this.setWarningText(getUntypedWarningText());
    }
  };

  const defineBlockDef = {
    init: initDefineBlock,
    onchange: onchangeDefine,
  };

  Blockly.Blocks[VARIABLES_DEFINE_BLOCK_TYPE] = defineBlockDef;
  // Alias legacy : anciens XML de workspace utilisent le singulier « variable_define ».
  Blockly.Blocks[VARIABLES_DEFINE_LEGACY_BLOCK_TYPE] = defineBlockDef;
};
