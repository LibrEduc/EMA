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

/**
 * @license
 * Copyright (C) 2023-2024 ASTUCE (Sébastien Canet microcompany)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
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
