/**
 * @packageDocumentation
 * @module BlocklyCategories.Variables.CastLocal
 * @description Cast and procedure-local variable blocks.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import * as Blockly from "blockly";
import { getInternalTypeForArduinoType } from "../../generators/arduino/block_types";
import {
  getBlocklyCompatibleChecks,
  getBlocklyMsgOr,
  inferConnectedValueType,
  shouldSkipVariableChange,
} from "./shared";
import {
  applyCastOutputType,
  createArduinoScalarTypeField,
} from "./variables_types";

export const defineVariablesCastBlock = (): void => {
  Blockly.Blocks["variables_cast"] = {
    init: function (this: Blockly.Block) {
      this.appendValueInput("VALUE").setCheck(null);
      this.appendDummyInput("CAST_ROW")
        .appendField(getBlocklyMsgOr("VARIABLES_CAST_AS_TYPE", "de type"))
        .appendField(
          createArduinoScalarTypeField("CAST_TYPE"),
          "CAST_TYPE",
        );
      this.setInputsInline(true);
      this.setOutput(true, getBlocklyCompatibleChecks("int"));
      this.setStyle("variable_dynamic_blocks");
      this.setTooltip(
        getBlocklyMsgOr(
          "VARIABLES_CAST_TOOLTIP",
          "Cast the connected value (variable, number, etc.) to the selected Arduino type.",
        ),
      );
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
        event.type !== Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE
      ) {
        return;
      }
      applyCastOutputType(this);
    },
    getBlockType: function (this: Blockly.Block): string {
      return getInternalTypeForArduinoType(this.getFieldValue("CAST_TYPE") || "int");
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
        this.setOutput(true, getBlocklyCompatibleChecks(connectedType));
      } else {
        this.setOutput(true, null);
      }
      const parent = this.getParent();
      if (
        parent &&
        (parent.type === "variables_set_dynamic" || parent.type === "variables_set")
      ) {
        const parentOnchange = Blockly.Blocks[parent.type]?.onchange;
        if (typeof parentOnchange === "function") {
          parentOnchange.call(parent, event);
        }
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
