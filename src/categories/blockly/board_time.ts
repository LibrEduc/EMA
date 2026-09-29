/**
 * @packageDocumentation
 * @module BlocklyCategories.Board.Time
 * @description Delay and millis blocks.
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

export function defineBoardTimeBlocks(): void {
  Blockly.Blocks["board_base_time_delay"] = {
    init(this: Blockly.Block) {
      this.appendValueInput("DELAY_TIME")
        .appendField(getBlocklyMsgOr("ARDUINO_BASE_DELAY_DELAY_TIME", "delay (ms)"))
        .setCheck("Number");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip(getBlocklyMsgOr("ARDUINO_BASE_DELAY_TOOLTIP", "Pause in milliseconds."));
      this.setStyle(BOARD_STYLE);
    },
  };

  Blockly.Blocks["board_base_time_millis"] = {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField(getBlocklyMsgOr("ARDUINO_BASE_MILLIS", "millis (ms since start)"));
      this.setOutput(true, "Number");
      this.setTooltip(getBlocklyMsgOr("ARDUINO_BASE_MILLIS_TOOLTIP", "Returns the number of milliseconds since the board started."));
      this.setStyle(BOARD_STYLE);
    },
  };

  Blockly.Blocks["board_base_time_delay_sec"] = {
    init(this: Blockly.Block) {
      this.appendValueInput("DELAY_TIME")
        .appendField(getBlocklyMsgOr("ARDUINO_BASE_DELAY_SEC", "delay (seconds)"))
        .setCheck("Number");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip(getBlocklyMsgOr("ARDUINO_BASE_DELAY_SEC_TOOLTIP", "Pause in seconds."));
      this.setStyle(BOARD_STYLE);
    },
  };
}
