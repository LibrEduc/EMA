/**
 * @packageDocumentation
 * @module BlocklyCategories.Variables.Declare.Const
 * @description Const variable declaration block (`variables_const`).
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
} from "../../generators/arduino/variable_utils";
import {
  configureScalarVariableField,
  getBlocklyMsgOr,
  getConstWarningText,
  getUntypedWarningText,
  inferConnectedValueType,
  shouldSkipVariableChange,
  VariableWithMutableType,
} from "./shared";

/** Registers the const declaration block. */
export const defineVariablesConstBlock = (): void => {
  Blockly.Blocks["variables_const"] = {
    init: function (this: Blockly.Block) {
      this.appendValueInput("VAL_CONST")
        .setCheck(null)
        .appendField(getBlocklyMsgOr("VARIABLES_SET_CONST", "set const"))
        .appendField(
          new Blockly.FieldVariable(Blockly.Field.SKIP_SETUP, undefined, null, ""),
          "VAR",
        )
        .appendField(getBlocklyMsgOr("VARIABLES_SET_CONST_AT", "at"));
      const varField = this.getField("VAR") as Blockly.FieldVariable | null;
      if (varField) {
        configureScalarVariableField(varField);
      }
      this.setStyle("variable_dynamic_blocks");
      this.setTooltip(
        getBlocklyMsgOr("VARIABLES_SET_CONST_TOOLTIP", "set constant"),
      );
      this.setHelpUrl(getBlocklyMsgOr("VARIABLES_SET_CONST_HELPURL", ""));
    },
    onchange: function (this: Blockly.Block, event: Blockly.Events.Abstract) {
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
      const constOwner = typedVariable.__ucbConstBlockId;
      const valueInput = this.getInput("VAL_CONST");
      const targetBlock = valueInput?.connection?.targetBlock() || null;
      const isShadow = Boolean(targetBlock?.isShadow?.());
      const hasRealValue = Boolean(targetBlock && !isShadow);
      // Only disconnect when ANOTHER block owns this const variable.
      // Removed: (constOwner === this.id && alreadyInitialized && hasRealValue) - it was
      // disconnecting on every event after first connection, preventing any value from staying.
      if (typedVariable.__ucbConst && constOwner && constOwner !== this.id) {
        this.setWarningText(getConstWarningText());
        if (valueInput?.connection?.targetBlock()) {
          valueInput.connection.disconnect();
        }
        return;
      }
      typedVariable.__ucbConst = true;
      if (!typedVariable.__ucbConstBlockId) {
        typedVariable.__ucbConstBlockId = this.id;
      }
      if (valueInput?.connection) {
        valueInput.connection.setCheck(null);
      }
      const connectedType = hasRealValue
        ? inferConnectedValueType(targetBlock)
        : null;
      if (connectedType) {
        setVariableType(variable, connectedType);
        (this as Blockly.Block & { __ucbConstInitialized?: boolean })
          .__ucbConstInitialized = true;
        this.setWarningText(null);
        return;
      }
      (this as Blockly.Block & { __ucbConstInitialized?: boolean })
        .__ucbConstInitialized = false;
      if (!hasRealValue) {
        this.setWarningText(null);
      }
      clearVariableType(variable);
      this.setWarningText(getUntypedWarningText());
    },
    contextMenuType_: "variables_get_dynamic",
  };
};
