/**
 * @packageDocumentation
 * @module BlocklyCategories.Variables.Declare
 * @description Declaration / typing / const / init variable blocks.
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
  getInternalTypeForArduinoType,
  isArduinoScalarType,
} from "../../generators/arduino/block_types";
import {
  clearVariableType,
  LIST_VARIABLE_TYPE,
  setVariableType,
  VARIABLES_DEFINE_BLOCK_TYPE,
  VARIABLES_DEFINE_LEGACY_BLOCK_TYPE,
} from "../../generators/arduino/variable_utils";
import {
  configureScalarVariableField,
  getBlocklyCompatibleChecks,
  getBlocklyMsg,
  getBlocklyMsgOr,
  getConstWarningText,
  getUntypedWarningText,
  handleVariablesSetChange,
  inferConnectedValueType,
  setVariableTypeAndMarkManual,
  shouldSkipVariableChange,
  VariableWithMutableType,
} from "./shared";
import {
  createArduinoScalarTypeField,
  getArduinoTypeDropdownOptions,
  sanitizeArduinoTypeDropdown,
} from "./variables_types";

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

/**
 * Registers the const declaration block.
 */

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

/**
 * Registers the typed variable initialization block.
 */
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

/**
 * Registers the variable definition block used by s4e compatibility.
 */

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

/**
 * Extend the standard variables_get block to support type checking
 */
/**
 * Extends the standard variables_get block with typed behavior.
 */
