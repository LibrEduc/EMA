/**
 * @packageDocumentation
 * @module BlocklyCategories.Text
 * @description Text block definitions for the Blockly toolbox.
 * @remarks
 * Defines text blocks and field configurations used by µcBlockly.
 * Three literal styles for Arduino C: double quotes, single quotes (char), raw,
 * plus multiline quoted text.
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
import * as FieldDateNS from "@blockly/field-date";
import * as FieldMultilineInputNS from "@blockly/field-multilineinput";
import { namedExportFromCjsPlugin } from "../../utils/blockly_plugin_export";
import { getBlocklyMsgOr, validateSingleChar } from "./shared";

const FieldDate = namedExportFromCjsPlugin<
  typeof import("@blockly/field-date").FieldDate
>(FieldDateNS, "FieldDate");
const FieldMultilineInput = namedExportFromCjsPlugin<
  typeof import("@blockly/field-multilineinput").FieldMultilineInput
>(FieldMultilineInputNS, "FieldMultilineInput");

const TEXT_MULTILINE_DEFAULT = "µc\nblockly";

/**
 * Registers text literal blocks for µcBlockly (Arduino C: "", '', raw).
 */
export const defineTextCompatBlocks = (): void => {
  Blockly.Blocks["text"] = {
    init: function (this: Blockly.Block) {
      this.setStyle("text_blocks");
      this.appendDummyInput()
        .appendField('"')
        .appendField(new Blockly.FieldTextInput(""), "TEXT")
        .appendField('"');
      this.setOutput(true, "String");
      this.setTooltip(getBlocklyMsgOr("TEXT_TEXT_TOOLTIP", ""));
      this.setHelpUrl(getBlocklyMsgOr("TEXT_TEXT_HELPURL", ""));
    },
  };

  Blockly.Blocks["text_char"] = {
    init: function (this: Blockly.Block) {
      this.setStyle("text_blocks");
      this.appendDummyInput()
        .appendField("'")
        .appendField(
          new Blockly.FieldTextInput("", validateSingleChar),
          "TEXT",
        )
        .appendField("'");
      this.setOutput(true, "char");
      this.setTooltip(getBlocklyMsgOr("TEXT_CHAR_TOOLTIP", "character"));
    },
  };

  Blockly.Blocks["text_no_quote"] = {
    init: function (this: Blockly.Block) {
      this.setStyle("text_blocks");
      this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput(""), "TEXT");
      this.setOutput(true, "String");
      this.setTooltip(getBlocklyMsgOr("TEXT_NO_QUOTE_TOOLTIP", ""));
      this.setHelpUrl(getBlocklyMsgOr("TEXT_NO_QUOTE_HELPURL", ""));
    },
  };

  Blockly.Blocks["text_multiline"] = {
    init: function (this: Blockly.Block) {
      this.setStyle("text_blocks");
      this.appendDummyInput()
        .appendField(
          new FieldMultilineInput(TEXT_MULTILINE_DEFAULT),
          "TEXT",
        );
      this.setOutput(true, "String");
      this.setTooltip(
        getBlocklyMsgOr(
          "TEXT_MULTILINE_TOOLTIP",
          "Multiline text (newline preserved in the Arduino string).",
        ),
      );
      this.setHelpUrl(getBlocklyMsgOr("TEXT_TEXT_HELPURL", ""));
    },
  };

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
};
