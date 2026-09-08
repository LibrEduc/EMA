/**
 * @packageDocumentation
 * @module BlocklyCategories.Variables.Declare.SetInit
 * @description Typed variable initialization block (`variables_set_init`).
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
  isArduinoScalarType,
} from "../../generators/arduino/block_types";
import {
  LIST_VARIABLE_TYPE,
  setVariableType,
} from "../../generators/arduino/variable_utils";
import {
  configureScalarVariableField,
  getBlocklyCompatibleChecks,
  getBlocklyMsgOr,
  getConstWarningText,
  shouldSkipVariableChange,
  VariableWithMutableType,
} from "./shared";
import {
  createArduinoScalarTypeField,
  sanitizeArduinoTypeDropdown,
} from "./variables_types";

/** Registers the typed variable initialization block. */
export const defineVariablesSetInitBlock = (): void => {
  Blockly.Blocks["variables_set_init"] = {
    init: function (this: Blockly.Block) {
      this.appendValueInput("VALUE")
        .appendField(getBlocklyMsgOr("VARIABLES_SET_INIT", "set"))
        .appendField(
          new Blockly.FieldVariable(Blockly.Field.SKIP_SETUP, undefined, null, ""),
          "VAR",
        )
        .appendField(getBlocklyMsgOr("VARIABLES_AS", "as"))
        .appendField(
          createArduinoScalarTypeField("VARIABLE_SETTYPE_TYPE"),
          "VARIABLE_SETTYPE_TYPE",
        )
        .appendField(getBlocklyMsgOr("_AT", "at"));
      const varField = this.getField("VAR") as Blockly.FieldVariable | null;
      if (varField) {
        configureScalarVariableField(varField);
      }
      this.setInputsInline(false);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle("variable_dynamic_blocks");
      this.setTooltip(
        getBlocklyMsgOr("VARIABLES_SET_INIT_TOOLTIP", "set and declare"),
      );
      this.setHelpUrl(getBlocklyMsgOr("VARIABLES_SET_INIT_HELPURL", ""));
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
      if (
        event.type === Blockly.Events.BLOCK_CREATE &&
        (event as Blockly.Events.BlockCreate).blockId === this.id
      ) {
        sanitizeArduinoTypeDropdown(this, "VARIABLE_SETTYPE_TYPE");
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
      const varType = variable.getType();
      if (varType === LIST_VARIABLE_TYPE) {
        return;
      }
      if (typedVariable.__ucbConst) {
        this.setWarningText(getConstWarningText());
        const currentType = variable.getType();
        if (currentType && currentType !== selectedType && isArduinoScalarType(currentType)) {
          typeField.setValue(currentType);
        }
        const valueInput = this.getInput("VALUE");
        if (valueInput?.connection?.targetBlock()) {
          valueInput.connection.disconnect();
        }
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
};
