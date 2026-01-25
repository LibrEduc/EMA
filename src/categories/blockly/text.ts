/**
 * @packageDocumentation
 * @module BlocklyCategories.Text
 * @description Text block definitions for the Blockly toolbox.
 * @remarks
 * Defines text blocks and field configurations used by µcBlockly.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 * @version 1.0.0
 * @since 1.0.0
 */

import * as Blockly from "blockly";
import { FieldDate } from "@blockly/field-date";
import { FieldMultilineInput } from "@blockly/field-multilineinput";
import { getBlocklyMsgOr, validateSingleChar } from "./shared";

/**
 * Registers text compatibility blocks for µcBlockly.
 */
export const defineTextCompatBlocks = (): void => {
  if (!Blockly.Blocks["text_no_quote"]) {
    Blockly.Blocks["text_no_quote"] = {
      init: function (this: Blockly.Block) {
        this.setStyle("text_blocks");
        this.appendDummyInput()
          .appendField(new Blockly.FieldTextInput(""), "TEXT");
        this.setOutput(true, "String");
        this.setTooltip(getBlocklyMsgOr("TEXT_TEXT_TOOLTIP", ""));
        this.setHelpUrl(getBlocklyMsgOr("TEXT_TEXT_HELPURL", ""));
      },
    };
  }

  if (!Blockly.Blocks["text_multiline"]) {
    Blockly.Blocks["text_multiline"] = {
      init: function (this: Blockly.Block) {
        this.setStyle("text_blocks");
        this.appendDummyInput()
          .appendField(new FieldMultilineInput(""), "TEXT");
        this.setOutput(true, "String");
        this.setTooltip(getBlocklyMsgOr("TEXT_TEXT_TOOLTIP", ""));
        this.setHelpUrl(getBlocklyMsgOr("TEXT_TEXT_HELPURL", ""));
      },
    };
  }

  if (!Blockly.Blocks["text_date"]) {
    Blockly.Blocks["text_date"] = {
      init: function (this: Blockly.Block) {
        this.setStyle("text_blocks");
        this.appendDummyInput()
          .appendField(getBlocklyMsgOr("TEXT_DATE_LABEL", "date:"))
          .appendField(new FieldDate("2021-07-01") as unknown as Blockly.Field, "DATE");
        this.setOutput(true, "String");
        this.setTooltip(getBlocklyMsgOr("TEXT_DATE_TOOLTIP", ""));
        this.setHelpUrl(getBlocklyMsgOr("TEXT_DATE_HELPURL", ""));
      },
    };
  }

  if (!Blockly.Blocks["text_char"]) {
    Blockly.Blocks["text_char"] = {
      init: function (this: Blockly.Block) {
        this.setStyle("text_blocks");
        this.appendDummyInput()
          .appendField('"')
          .appendField(
            new Blockly.FieldTextInput("", validateSingleChar),
            "TEXT",
          )
          .appendField('"');
        this.setOutput(true, "char");
        this.setTooltip(getBlocklyMsgOr("TEXT_CHAR_TOOLTIP", "character"));
      },
    };
  }
};
