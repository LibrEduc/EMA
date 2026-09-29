/**
 * @packageDocumentation
 * @module BlocklyCategories.Array.ListDefs
 * @description Block definitions for list literal, with, get, modify, and set.
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
  getBlocklyMsgOr,
} from "./shared";
import { LIST_VARIABLE_TYPE } from "../../generators/arduino/variable_utils";
import {
  ARRAY_DEFAULT_VAR_NAME,
  arrayListLiteralTypeFromInputsOnChange,
  arrayWithDeclareTypeFromInputsOnChange,
  bindArrayWithDefaultVariable,
  handleArrayGetIndexOnChange,
  handleArrayListVariableSync,
  handleArrayModifyOnChange,
} from "./array_sync";
import {
  ARRAY_LIST_LITERAL_LABEL,
  ARRAY_WITH_CONTAINING_LABEL,
  type ArrayWithMutatorBlock,
  registerArrayListMutator,
} from "./array_mutators";

/**
 * Registers Array_with, list literal, getIndex_in_list, modify, and set.
 */
export function defineArrayListBlocks(): void {
  registerArrayListMutator("array_with_plus_minus_mutator", ARRAY_WITH_CONTAINING_LABEL);
  registerArrayListMutator("array_list_literal_mutator", ARRAY_LIST_LITERAL_LABEL);

  Blockly.Blocks["Array_with"] = {
    init: function (this: ArrayWithMutatorBlock) {
      this.appendDummyInput("HEADER")
        .appendField(getBlocklyMsgOr("ARRAY_CREATE", "define"))
        .appendField(
          new Blockly.FieldVariable(
            ARRAY_DEFAULT_VAR_NAME,
            undefined,
            null,
            LIST_VARIABLE_TYPE,
          ),
          "VAR",
        )
        .appendField(getBlocklyMsgOr("ARRAY_WITH_AS_LIST", "as a list"));
      const varField = this.getField("VAR") as Blockly.FieldVariable | null;
      if (varField) {
        configureListVariableField(varField);
      }
      bindArrayWithDefaultVariable(this);
      this.setInputsInline(false);
      this.setOutput(false);
      this.setPreviousStatement(false);
      this.setNextStatement(false);
      this.setStyle("list_blocks");
      this.setTooltip(getBlocklyMsgOr("ARRAY_WITH_TOOLTIP", ""));
      this.setHelpUrl(getBlocklyMsgOr("ARRAY_WITH_HELPURL", ""));
      this.appendDummyInput("EMPTY");
      Blockly.Extensions.apply("array_with_plus_minus_mutator", this, true);
    },
  };

  Blockly.defineBlocksWithJsonArray([
    {
      type: "Array_list_literal",
      message0: "%1",
      args0: [
        {
          type: "input_dummy",
          name: "EMPTY",
        },
      ],
      output: "Array",
      style: "list_blocks",
      tooltip: "%{BKY_ARRAY_WITH_TOOLTIP}",
      helpUrl: "%{BKY_ARRAY_WITH_HELPURL}",
      mutator: "array_list_literal_mutator",
    },
  ]);

  (Blockly.Blocks["Array_with"] as Blockly.Block & { onchange?: (e: Blockly.Events.Abstract) => void }).onchange =
    arrayWithDeclareTypeFromInputsOnChange;
  (Blockly.Blocks["Array_list_literal"] as Blockly.Block & { onchange?: (e: Blockly.Events.Abstract) => void }).onchange =
    arrayListLiteralTypeFromInputsOnChange;

  Blockly.Blocks["Array_list_3"] = Blockly.Blocks["Array_list_literal"];

  // Array_getIndex_in_list - element at index of a list variable (1D)
  Blockly.Blocks["Array_getIndex_in_list"] = {
    init: function (this: Blockly.Block) {
      this.appendValueInput("AT")
        .setCheck("Number")
        .appendField(getBlocklyMsgOr("ARRAY_GETINDEX_AT", "element at"));
      this.appendDummyInput()
        .appendField(getBlocklyMsgOr("ARRAY_GETINDEX_ITEM", "in list"))
        .appendField(
          new Blockly.FieldVariable(
            ARRAY_DEFAULT_VAR_NAME,
            undefined,
            null,
            LIST_VARIABLE_TYPE,
          ),
          "VAR",
        );
      const varField = this.getField("VAR") as Blockly.FieldVariable | null;
      if (varField) {
        configureListVariableField(varField);
      }
      this.setInputsInline(true);
      this.setOutput(true);
      this.setStyle("list_blocks");
      this.setTooltip(getBlocklyMsgOr("ARRAY_GETINDEX_TOOLTIP", "Get element at index"));
      this.setHelpUrl(getBlocklyMsgOr("ARRAY_GETINDEX_HELPURL", ""));
    },
    onchange: function (this: Blockly.Block, event: Blockly.Events.Abstract) {
      handleArrayGetIndexOnChange(this, event);
    },
  };

  // Array_modify - assign value to list[index]
  Blockly.Blocks["Array_modify"] = {
    init: function (this: Blockly.Block) {
      this.appendValueInput("indice")
        .setCheck("Number")
        .appendField(getBlocklyMsgOr("ARRAY_MODIFY_INDICE", "element at index"));
      this.appendDummyInput()
        .appendField(getBlocklyMsgOr("ARRAY_MODIFY_NAME", "in array"))
        .appendField(
          new Blockly.FieldVariable(
            ARRAY_DEFAULT_VAR_NAME,
            undefined,
            null,
            LIST_VARIABLE_TYPE,
          ),
          "VAR",
        );
      this.appendValueInput("value")
        .setCheck(null)
        .setAlign(Blockly.inputs.Align.RIGHT)
        .appendField(getBlocklyMsgOr("ARRAY_MODIFY_VALUE", "value"));
      const varField = this.getField("VAR") as Blockly.FieldVariable | null;
      if (varField) {
        configureListVariableField(varField);
      }
      this.setInputsInline(false);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle("list_blocks");
      this.setTooltip(getBlocklyMsgOr("ARRAY_MODIFY_TOOLTIP", "Assign value to array element"));
      this.setHelpUrl(getBlocklyMsgOr("ARRAY_MODIFY_HELPURL", ""));
    },
    onchange: function (this: Blockly.Block, event: Blockly.Events.Abstract) {
      handleArrayModifyOnChange(this, event);
    },
  };

  // Array_set - like variables_set: set [list] to [value] (whole list)
  Blockly.Blocks["Array_set"] = {
    init: function (this: Blockly.Block) {
      this.appendValueInput("VALUE")
        .setCheck(null)
        .appendField(getBlocklyMsgOr("ARRAY_SET", "set"))
        .appendField(
          new Blockly.FieldVariable(
            ARRAY_DEFAULT_VAR_NAME,
            undefined,
            null,
            LIST_VARIABLE_TYPE,
          ),
          "VAR",
        )
        .appendField(getBlocklyMsgOr("ARRAY_SET_TO", "to"));
      const varField = this.getField("VAR") as Blockly.FieldVariable | null;
      if (varField) {
        configureListVariableField(varField);
      }
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle("list_blocks");
      this.setTooltip(
        getBlocklyMsgOr(
          "ARRAY_SET_TOOLTIP",
          "Assign a whole list (e.g. from a bitmap or list literal).",
        ),
      );
      this.setHelpUrl(getBlocklyMsgOr("ARRAY_SET_HELPURL", ""));
    },
    onchange: function (this: Blockly.Block, event: Blockly.Events.Abstract) {
      handleArrayListVariableSync(this, event);
    },
  };
}
