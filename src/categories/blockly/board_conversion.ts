/**
 * @packageDocumentation
 * @module BlocklyCategories.Board.Conversion
 * @description Type conversion and constrain blocks.
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
  BOARD_STYLE,
  getBlocklyMsgOr,
} from "./board_shared";

export function defineBoardConversionBlocks(): void {
  Blockly.Blocks["board_conversion_toint"] = {
    init(this: Blockly.Block) {
      this.appendValueInput("VALUE").appendField(getBlocklyMsgOr("CONVERSION_TOINT", "to int")).setCheck(null);
      this.setInputsInline(true);
      this.setOutput(true, "int");
      this.setTooltip(getBlocklyMsgOr("CONVERSION_TOINT_TOOLTIP", "Convert value to integer."));
      this.setStyle(BOARD_STYLE);
    },
  };
  Blockly.Blocks["board_conversion_tofloat"] = {
    init(this: Blockly.Block) {
      this.appendValueInput("VALUE").appendField(getBlocklyMsgOr("CONVERSION_TOFLOAT", "to float")).setCheck(null);
      this.setInputsInline(true);
      this.setOutput(true, "float");
      this.setTooltip(getBlocklyMsgOr("CONVERSION_TOFLOAT_TOOLTIP", "Convert value to float."));
      this.setStyle(BOARD_STYLE);
    },
  };
  Blockly.Blocks["board_conversion_tochar"] = {
    init(this: Blockly.Block) {
      this.appendValueInput("VALUE").appendField(getBlocklyMsgOr("CONVERSION_TOCHAR", "to char")).setCheck(null);
      this.setInputsInline(true);
      this.setOutput(true, "int");
      this.setTooltip(getBlocklyMsgOr("CONVERSION_TOCHAR_TOOLTIP", "Convert value to char (ASCII)."));
      this.setStyle(BOARD_STYLE);
    },
  };
  Blockly.Blocks["board_conversion_tobyte"] = {
    init(this: Blockly.Block) {
      this.appendValueInput("VALUE").appendField(getBlocklyMsgOr("CONVERSION_TOBYTE", "to byte")).setCheck(null);
      this.setInputsInline(true);
      this.setOutput(true, "int");
      this.setTooltip(getBlocklyMsgOr("CONVERSION_TOBYTE_TOOLTIP", "Convert value to byte (0-255)."));
      this.setStyle(BOARD_STYLE);
    },
  };
  Blockly.Blocks["board_conversion_toString"] = {
    init(this: Blockly.Block) {
      this.appendValueInput("VALUE").appendField(getBlocklyMsgOr("CONVERSION_TOSTRING", "to String")).setCheck(null);
      this.setInputsInline(true);
      this.setOutput(true, "String");
      this.setTooltip(getBlocklyMsgOr("CONVERSION_TOSTRING_TOOLTIP", "Convert value to String."));
      this.setStyle(BOARD_STYLE);
    },
  };
  Blockly.Blocks["board_conversion_constrain"] = {
    init(this: Blockly.Block) {
      this.appendValueInput("VALUE").appendField(getBlocklyMsgOr("CONVERSION_CONSTRAIN", "constrain")).setCheck("Number");
      this.appendValueInput("LOW").appendField(getBlocklyMsgOr("CONVERSION_CONSTRAIN_LOW", "min")).setCheck("Number");
      this.appendValueInput("HIGH").appendField(getBlocklyMsgOr("CONVERSION_CONSTRAIN_HIGH", "max")).setCheck("Number");
      this.setInputsInline(true);
      this.setOutput(true, "Number");
      this.setTooltip(getBlocklyMsgOr("CONVERSION_CONSTRAIN_TOOLTIP", "Constrain a number between min and max."));
      this.setStyle(BOARD_STYLE);
    },
  };

}
