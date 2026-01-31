/**
 * @packageDocumentation
 * @module BlocklyCategories.Variables
 * @description Variable block definitions for the Blockly toolbox.
 * @remarks
 * Defines typed variable blocks and validation helpers.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 * @version 1.0.0
 * @since 1.0.0
 */

import * as Blockly from "blockly";
import { debugLog } from "../../generators/arduino/debug";
import { getVariableTypeOptions } from "../../generators/arduino/block_types";
import { clearVariableType, setVariableType } from "../../generators/arduino/variable_utils";
import {
  configureTypedVariableField,
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

/**
 * Returns the display label for a variable type (e.g. VAR_TYPE_INT → "int").
 */
export const getVariableTypeLabel = (type: string): string =>
  getBlocklyMsgOr(`VAR_TYPE_${type.toUpperCase()}`, type);

/**
 * Returns Blockly menu options for the variable type dropdown.
 */
export const getVariableTypeDropdownOptions = (): Blockly.MenuOption[] =>
  getVariableTypeOptions().map((type) => [
    getVariableTypeLabel(type),
    type,
  ] as Blockly.MenuOption);

/**
 * Define the variables_get_dynamic block
 */
/**
 * Registers the dynamic variables_get block with typing support.
 */
export const defineVariablesGetDynamicBlock = (): void => {
  Blockly.Blocks["variables_get_dynamic"] = {
    init: function (this: Blockly.Block) {
      // Use Field.SKIP_SETUP to prevent automatic creation of default 'item' variable
      // This is the same approach used by Blockly's built-in variable blocks
      this.appendDummyInput()
        .appendField(
          new Blockly.FieldVariable(Blockly.Field.SKIP_SETUP, undefined, null, ""),
          "VAR",
        );
      const varField = this.getField("VAR") as Blockly.FieldVariable | null;
      if (varField) {
        configureTypedVariableField(varField);
      }
      this.setOutput(true);
      this.setStyle("variable_dynamic_blocks");
      this.setTooltip(getBlocklyMsg("VARIABLES_GET_TOOLTIP"));
      this.setHelpUrl("");
    },
    /**
     * Called when the block changes (variable selection, etc.).
     * Updates the output connection type using setOutput() so the ConnectionChecker can verify it.
     * Note: setCheck() on output connections doesn't work - we must use setOutput(true, type).
     */
    onchange: function (this: Blockly.Block, event: Blockly.Events.Abstract) {
      if (shouldSkipVariableChange(this, event)) {
        return;
      }
      // Only process relevant events
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
        // No variable selected - block all typed connections
        // Use '__NO_TYPE__' to prevent connections to typed inputs (like Boolean)
        this.setOutput(true, "__NO_TYPE__");
        return;
      }

      try {
        const variable = this.workspace.getVariableMap().getVariableById(variableId);
        if (variable) {
          const varType = variable.getType();
          if (!varType) {
            // Variable has no type - block all typed connections
            // Use '__NO_TYPE__' to prevent connections to typed inputs (like Boolean)
            this.setOutput(true, "__NO_TYPE__");
          } else {
            // Map our internal types to Blockly types
            // Blockly uses 'Boolean' (capital B), we use 'bool'
            const blocklyType = varType === "bool" ? "Boolean" : varType;
            // setOutput(true, type) sets the check on the output connection
            // This is what the ConnectionChecker actually verifies
            this.setOutput(true, blocklyType);
          }
        } else {
          // Variable not found - block all typed connections
          this.setOutput(true, "__NO_TYPE__");
        }
      } catch (error) {
        debugLog("Error updating variable type check:", error);
        this.setOutput(true, "__NO_TYPE__");
      }
    },
  };
};

/**
 * Define the variables_set_dynamic block
 */
/**
 * Registers the dynamic variables_set block with typing support.
 */
export const defineVariablesSetDynamicBlock = (): void => {
  Blockly.Blocks["variables_set_dynamic"] = {
    init: function (this: Blockly.Block) {
      // Use Field.SKIP_SETUP to prevent automatic creation of default 'item' variable
      // This is the same approach used by Blockly's built-in variable blocks
      this.appendValueInput("VALUE")
        .setCheck(null)
        .appendField(getBlocklyMsg("TYPED_VAR_SET_LABEL"))
        .appendField(
          new Blockly.FieldVariable(Blockly.Field.SKIP_SETUP, undefined, null, ""),
          "VAR",
        )
        .appendField(getBlocklyMsg("TYPED_VAR_TO_LABEL"));
      const varField = this.getField("VAR") as Blockly.FieldVariable | null;
      if (varField) {
        configureTypedVariableField(varField);
      }
      this.setInputsInline(false);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle("variable_dynamic_blocks");
      this.setTooltip(getBlocklyMsg("VARIABLES_SET_TOOLTIP"));
      this.setHelpUrl("");
    },
    /**
     * Called when the block changes (variable selection, value connection, etc.).
     * Validates that the assigned value type matches the variable type.
     * If incompatible, suggests changing the variable type or shows a warning.
     */
    onchange: function (this: Blockly.Block, event: Blockly.Events.Abstract) {
      if (shouldSkipVariableChange(this, event)) {
        return;
      }
      handleVariablesSetChange(this, event, "variables_set_dynamic");
    },
  };
};

/**
 * Define the variables_local block
 */
/**
 * Registers the "local" wrapper block for scoped variables.
 */
export const defineVariablesLocalBlock = (): void => {
  Blockly.Blocks["variables_local"] = {
    init: function (this: Blockly.Block) {
      this.appendValueInput("VALUE")
        .appendField(getBlocklyMsgOr("VARIABLES_LOCAL", "local"));
      this.setOutput(true, null);
      this.setTooltip(getBlocklyMsgOr("VARIABLES_LOCAL_TOOLTIP", ""));
      this.setHelpUrl("");
      this.setStyle("variable_dynamic_blocks");
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
      const connectedType = inferConnectedValueType(
        this.getInputTargetBlock("VALUE"),
      );
      if (connectedType) {
        this.setOutput(true, connectedType);
      } else {
        this.setOutput(true, null);
      }
    },
    getBlockType: function (this: Blockly.Block): string | null {
      const connectedType = inferConnectedValueType(
        this.getInputTargetBlock("VALUE"),
      );
      return connectedType || null;
    },
  };
};

/**
 * Define the variables_set_type block
 */
/**
 * Registers the block that forces a variable type.
 */
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
          new Blockly.FieldDropdown(getVariableTypeDropdownOptions),
          "TYPE",
        );
      const varField = this.getField("VAR") as Blockly.FieldVariable | null;
      if (varField) {
        configureTypedVariableField(varField);
      }
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
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
              if (currentType && currentType !== selectedType) {
                typeField.setValue(currentType);
              }
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
        const isNoType = !varType || varType === "__NO_TYPE__";
        if (isNoType && selectedType) {
          setVariableTypeAndMarkManual(variable, selectedType);
          return;
        }
        if (varType && varType !== selectedType) {
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
      const alreadyInitialized = Boolean(
        (this as Blockly.Block & { __ucbConstInitialized?: boolean })
          .__ucbConstInitialized,
      );
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
          new Blockly.FieldDropdown(getVariableTypeDropdownOptions),
          "VARIABLE_SETTYPE_TYPE",
        )
        .appendField(getBlocklyMsgOr("_AT", "at"));
      const varField = this.getField("VAR") as Blockly.FieldVariable | null;
      if (varField) {
        configureTypedVariableField(varField);
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
        const currentType = variable.getType();
        if (currentType && currentType !== selectedType) {
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
      configureTypedVariableField(varField);
    }
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
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

  Blockly.Blocks["variables_define"] = defineBlockDef;

  Blockly.Blocks["variable_define"] = defineBlockDef;
};

/**
 * Extend the standard variables_get block to support type checking
 */
/**
 * Extends the standard variables_get block with typed behavior.
 */
export const extendStandardVariablesGetBlock = (): void => {
  // Add getBlockType to the standard variables_get block
  if (Blockly.Blocks["variables_get"]) {
    // Add onchange to update the output connection type
    const originalOnchange = Blockly.Blocks["variables_get"].onchange;
    Blockly.Blocks["variables_get"].onchange = function (
      this: Blockly.Block,
      event: Blockly.Events.Abstract,
    ) {
      // Call original onchange if it exists
      if (originalOnchange) {
        originalOnchange.call(this, event);
      }

      // Only process relevant events
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
        this.setOutput(true, "__NO_TYPE__");
        return;
      }

      try {
        const variable = this.workspace.getVariableMap().getVariableById(variableId);
        if (variable) {
          const varType = variable.getType();
          if (!varType) {
            this.setOutput(true, "__NO_TYPE__");
          } else {
            const blocklyType = varType === "bool" ? "Boolean" : varType;
            this.setOutput(true, blocklyType);
          }
        } else {
          this.setOutput(true, "__NO_TYPE__");
        }
      } catch (error) {
        debugLog("Error updating variable type check:", error);
        this.setOutput(true, "__NO_TYPE__");
      }
    };
  }
};

/**
 * Extend the standard variables_set block to support type checking
 */
/**
 * Extends the standard variables_set block with typed behavior.
 */
export const extendStandardVariablesSetBlock = (): void => {
  if (Blockly.Blocks["variables_set"]) {
    const originalOnchange = Blockly.Blocks["variables_set"].onchange;
    Blockly.Blocks["variables_set"].onchange = function (
      this: Blockly.Block,
      event: Blockly.Events.Abstract,
    ) {
      // Call original onchange if it exists
      if (originalOnchange) {
        originalOnchange.call(this, event);
      }
      handleVariablesSetChange(this, event, "variables_set");
    };
  }
};
