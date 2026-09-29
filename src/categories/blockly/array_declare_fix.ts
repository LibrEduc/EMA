/**
 * @packageDocumentation
 * @module BlocklyCategories.Array.DeclareFix
 * @description Blockly definition for the Array_fix (set element) block.
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
import {
  configureListVariableField,
  getArrayIndexBlocklyChecks,
  getBlocklyMsgOr,
} from "./shared";
import { LIST_VARIABLE_TYPE } from "../../generators/arduino/variable_utils";
import {
  ARRAY_DEFAULT_VAR_NAME,
  handleArrayFixOnChange,
  syncArrayIndexInputChecks,
  syncArrayListAssignValueInputCheck,
} from "./array_sync";

/**
 * Registers the Array_fix block (assign value to a declared array element).
 */
export function defineArrayFixBlock(): void {
  Blockly.Blocks["Array_fix"] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput()
        .appendField(getBlocklyMsgOr("ARRAY_FIX", "set element"))
        .appendField(
          new Blockly.FieldVariable(
            ARRAY_DEFAULT_VAR_NAME,
            undefined,
            null,
            LIST_VARIABLE_TYPE,
          ),
          "VAR",
        )
        .appendField(getBlocklyMsgOr("ARRAY_dim", "dimensions"))
        .appendField(
          new Blockly.FieldDropdown(
            [
              ["1", "1"],
              ["2", "2"],
              ["3", "3"],
              ["4", "4"],
              ["5", "5"],
            ],
            function (this: Blockly.FieldDropdown, option: string) {
              const block = this.getSourceBlock() as Blockly.Block & {
                updateShape_?: (opt: string) => void;
              };
              block?.updateShape_?.(option);
              return option;
            },
          ),
          "dim",
        );
      this.appendValueInput("value")
        .setCheck(null)
        .setAlign(Blockly.inputs.Align.RIGHT)
        .appendField(getBlocklyMsgOr("_AT", "to"));
      this.appendValueInput("D0")
        .setCheck(getArrayIndexBlocklyChecks())
        .setAlign(Blockly.inputs.Align.RIGHT)
        .appendField(getBlocklyMsgOr("ARRAY_index", "index"));
      this.setInputsInline(false);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle("list_blocks");
      this.setTooltip(getBlocklyMsgOr("ARRAY_GETINDEX_TOOLTIP3", "Set array element"));
      this.setHelpUrl(getBlocklyMsgOr("HELPURL", ""));
      const varField = this.getField("VAR") as Blockly.FieldVariable | null;
      if (varField) {
        configureListVariableField(varField);
      }
    },
    onchange: function (this: Blockly.Block, event: Blockly.Events.Abstract) {
      handleArrayFixOnChange(this, event);
    },
    updateShape_: function (this: Blockly.Block, option: string) {
      for (let i = 1; i < 7; i++) {
        if (this.getInput("D" + i)) this.removeInput("D" + i);
      }
      switch (option) {
        case "2":
          this.appendValueInput("D1");
          break;
        case "3":
          this.appendValueInput("D1");
          this.appendValueInput("D2");
          break;
        case "4":
          this.appendValueInput("D1");
          this.appendValueInput("D2");
          this.appendValueInput("D3");
          break;
        case "5":
          this.appendValueInput("D1");
          this.appendValueInput("D2");
          this.appendValueInput("D3");
          this.appendValueInput("D4");
          break;
      }
      syncArrayIndexInputChecks(this);
      syncArrayListAssignValueInputCheck(this);
    },
    mutationToDom: function (this: Blockly.Block) {
      const container = document.createElement("mutation");
      container.setAttribute("dim", this.getFieldValue("dim"));
      return container;
    },
    domToMutation: function (
      this: Blockly.Block & { updateShape_?: (opt: string) => void },
      xmlElement: Element,
    ) {
      this.updateShape_?.(xmlElement.getAttribute("dim") ?? "1");
    },
  };
}
