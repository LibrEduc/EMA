/**
 * @packageDocumentation
 * @module BlocklyCategories.Variables.Declare.SetType
 * @description Typed variable assignment block (`variables_set_type`).
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
import { debugLog } from "../../generators/arduino/debug";
import {
  isArduinoScalarType,
} from "../../generators/arduino/block_types";
import {
  LIST_VARIABLE_TYPE,
} from "../../generators/arduino/variable_utils";
import {
  configureScalarVariableField,
  getBlocklyMsg,
  getConstWarningText,
  setVariableTypeAndMarkManual,
  shouldSkipVariableChange,
  VariableWithMutableType,
} from "./shared";
import {
  createArduinoScalarTypeField,
  sanitizeArduinoTypeDropdown,
} from "./variables_types";

/** Registers the typed variable type setter block. */
export const defineVariablesSetTypeBlock = (): void => {
  Blockly.Blocks["variables_set_type"] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput()
        .appendField(getBlocklyMsg("TYPED_VAR_TYPE_SET_LABEL"))
        .appendField(
          new Blockly.FieldVariable(Blockly.Field.SKIP_SETUP, undefined, null, ""),
          "VAR",
        )
        .appendField(getBlocklyMsg("TYPED_VAR_TYPE_TO_LABEL"))
        .appendField(
          createArduinoScalarTypeField("TYPE"),
          "TYPE",
        );
      const varField = this.getField("VAR") as Blockly.FieldVariable | null;
      if (varField) {
        configureScalarVariableField(varField);
      }
      this.setInputsInline(true);
      this.setStyle("variable_dynamic_blocks");
      this.setTooltip(getBlocklyMsg("VARIABLES_SET_TOOLTIP"));
      this.setHelpUrl("");
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
        event.type !== Blockly.Events.VAR_RENAME &&
        event.type !== Blockly.Events.VAR_DELETE &&
        event.type !== Blockly.Events.VAR_CREATE
      ) {
        return;
      }
      if (
        event.type === Blockly.Events.BLOCK_CREATE &&
        (event as Blockly.Events.BlockCreate).blockId === this.id
      ) {
        sanitizeArduinoTypeDropdown(this, "TYPE");
      }
      const variableId = this.getFieldValue("VAR");
      const typeField = this.getField("TYPE") as Blockly.FieldDropdown | null;
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
              if (
                currentType &&
                currentType !== selectedType &&
                isArduinoScalarType(currentType)
              ) {
                typeField.setValue(currentType);
              }
              return;
            }
            if (variable.getType() === LIST_VARIABLE_TYPE) {
              return;
            }
            if (variable.getType() !== selectedType) {
              setVariableTypeAndMarkManual(variable, selectedType);
            }
          }
        } catch (error) {
          debugLog("Error setting variable type:", error);
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
        if (varType === LIST_VARIABLE_TYPE) {
          return;
        }
        const isNoType = !varType || varType === "__NO_TYPE__";
        if (isNoType && selectedType) {
          setVariableTypeAndMarkManual(variable, selectedType);
          return;
        }
        if (varType && varType !== selectedType && isArduinoScalarType(varType)) {
          typeField.setValue(varType);
        }
      } catch (error) {
        debugLog("Error syncing variable type:", error);
      }
    },
  };
};
