/**
 * @packageDocumentation
 * @module BlocklyCategories.Variables.Access
 * @description Dynamic and standard get/set variable blocks with typing.
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
import { getInternalTypeForArduinoType } from "../../generators/arduino/block_types";
import {
  configureScalarVariableField,
  getBlocklyCompatibleChecks,
  getBlocklyMsg,
  getBlocklyMsgOr,
  handleVariablesSetChange,
  resolveVariableTypeForBlock,
  shouldSkipVariableChange,
} from "./shared";

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
        configureScalarVariableField(varField);
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
      if (shouldSkipVariableChange(this, event)) {
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
        const varType = resolveVariableTypeForBlock(this, variableId);
        if (!varType) {
          this.setOutput(true, "__NO_TYPE__");
        } else {
          const checks = getBlocklyCompatibleChecks(
            getInternalTypeForArduinoType(varType),
          );
          this.setOutput(true, checks);
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
        configureScalarVariableField(varField);
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
 * Value block: cast a connected expression, e.g. (byte)(toto) when a get block is plugged in.
 */

export const extendStandardVariablesGetBlock = (): void => {
  // Add getBlockType to the standard variables_get block
  if (Blockly.Blocks["variables_get"]) {
    type VariablesGetDef = Blockly.Block & {
      init?: (this: Blockly.Block) => void;
      __ucbScalarVarConfigured?: boolean;
    };
    const variablesGetDef = Blockly.Blocks["variables_get"] as VariablesGetDef;
    if (!variablesGetDef.__ucbScalarVarConfigured) {
      const originalInit = variablesGetDef.init;
      variablesGetDef.init = function (this: Blockly.Block) {
        if (originalInit) {
          originalInit.call(this);
        }
        const varField = this.getField("VAR") as Blockly.FieldVariable | null;
        if (varField) {
          configureScalarVariableField(varField);
        }
      };
      variablesGetDef.__ucbScalarVarConfigured = true;
    }
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
        const varType = resolveVariableTypeForBlock(this, variableId);
        if (!varType) {
          this.setOutput(true, "__NO_TYPE__");
        } else {
          const checks = getBlocklyCompatibleChecks(
            getInternalTypeForArduinoType(varType),
          );
          this.setOutput(true, checks);
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
    type VariablesSetDef = Blockly.Block & {
      init?: (this: Blockly.Block) => void;
      __ucbScalarVarConfigured?: boolean;
    };
    const variablesSetDef = Blockly.Blocks["variables_set"] as VariablesSetDef;
    if (!variablesSetDef.__ucbScalarVarConfigured) {
      const originalInit = variablesSetDef.init;
      variablesSetDef.init = function (this: Blockly.Block) {
        if (originalInit) {
          originalInit.call(this);
        }
        const varField = this.getField("VAR") as Blockly.FieldVariable | null;
        if (varField) {
          configureScalarVariableField(varField);
        }
      };
      variablesSetDef.__ucbScalarVarConfigured = true;
    }
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
