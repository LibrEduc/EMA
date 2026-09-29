/**
 * @packageDocumentation
 * @module BlocklyCategories.Board.Structure
 * @description Setup/loop/comment/include/define blocks.
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
  BOARD_DEFINE_STYLE,
  BOARD_STYLE,
  getBlocklyMsgOr,
} from "./board_shared";

export function defineBoardStructureBlocks(): void {
  Blockly.Blocks["board_base_setup"] = {
    init(this: Blockly.Block) {
      this.appendDummyInput().appendField(getBlocklyMsgOr("ARDUINO_BASE_SETUP", "initialization"));
      this.appendStatementInput("SETUP").setCheck(null);
      this.setInputsInline(false);
      this.setTooltip(getBlocklyMsgOr("ARDUINO_BASE_SETUP_TOOLTIP", "The setup() function is called when a sketch starts. Use it to initialize variables, pin modes, etc. It runs once after each powerup or reset of the Arduino board."));
      this.setHelpUrl("https://www.arduino.cc/reference/en/language/structure/sketch/setup/");
      this.setStyle(BOARD_STYLE);
    },
  };

  Blockly.Blocks["board_base_setup_loop"] = {
    init(this: Blockly.Block) {
      this.appendDummyInput().appendField(
        getBlocklyMsgOr("ARDUINO_BASE_SETUP_LOOP_SETUP", "initialization (setup)"),
      );
      this.appendStatementInput("SETUP").setCheck(null);
      this.appendDummyInput().appendField(
        getBlocklyMsgOr("ARDUINO_BASE_SETUP_LOOP_LOOP", "repeat indefinitely (loop)"),
      );
      this.appendStatementInput("LOOP").setCheck(null);
      this.setInputsInline(false);
      this.setTooltip(
        getBlocklyMsgOr(
          "ARDUINO_BASE_SETUP_LOOP_TOOLTIP",
          "Arduino program structure: run the setup section once at startup, then repeat the loop section indefinitely.",
        ),
      );
      this.setHelpUrl("https://www.arduino.cc/reference/en/language/structure/sketch/setup/");
      this.setStyle(BOARD_STYLE);
    },
  };

  Blockly.Blocks["board_base_loop"] = {
    init(this: Blockly.Block) {
      this.appendDummyInput().appendField(getBlocklyMsgOr("ARDUINO_BASE_LOOP", "infinite loop"));
      this.appendStatementInput("LOOP").setCheck(null);
      this.setInputsInline(false);
      this.setTooltip(getBlocklyMsgOr("ARDUINO_BASE_LOOP_TOOLTIP", "The loop() function runs continuously and repeats the instructions it contains."));
      this.setHelpUrl("https://www.arduino.cc/reference/en/language/structure/sketch/loop/");
      this.setStyle(BOARD_STYLE);
    },
  };

  // Legacy Blockly@rduino — commentaire, include et zone « define » (avant setup/loop)
  Blockly.Blocks["comment"] = {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField(getBlocklyMsgOr("LIBRE_COMMENT_LABEL", "comment"))
        .appendField(new Blockly.FieldTextInput(""), "TEXT");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle(BOARD_STYLE);
      this.setTooltip(
        getBlocklyMsgOr(
          "LIBRE_COMMENT_TOOLTIP",
          "Inserts a comment line in the generated code.",
        ),
      );
    },
  };

  Blockly.Blocks["include_library"] = {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField(
          getBlocklyMsgOr("ARDUINO_BASE_INCLUDE_LIBRARY_LABEL", "include librarie"),
        )
        .appendField(new Blockly.FieldTextInput(""), "FILE")
        .appendField(".h");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle(BOARD_STYLE);
      this.setTooltip(
        getBlocklyMsgOr(
          "ARDUINO_BASE_INCLUDE_LIBRARY_TOOLTIP",
          "Adds #include <library.h> at the top of the sketch.",
        ),
      );
    },
  };

  Blockly.Blocks["define"] = {
    init(this: Blockly.Block) {
      this.appendDummyInput().appendField(
        getBlocklyMsgOr("ARDUINO_BASE_DEFINE_LABEL", "Define"),
      );
      this.appendStatementInput("DEFINE").setCheck(null);
      this.setInputsInline(false);
      this.setTooltip(
        getBlocklyMsgOr(
          "ARDUINO_BASE_DEFINE_TOOLTIP",
          "Place blocks here to emit code in the global section (before setup and loop).",
        ),
      );
      this.setStyle(BOARD_DEFINE_STYLE);
    },
  };
}
