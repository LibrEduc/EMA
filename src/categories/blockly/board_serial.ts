/**
 * @packageDocumentation
 * @module BlocklyCategories.Board.Serial
 * @description Serial port blocks.
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
import {
  BOARD_STYLE,
  getBlocklyMsgOr,
  getSerialBaudDropdown,
} from "./board_shared";

export function defineBoardSerialBlocks(): void {
  Blockly.Blocks["board_serial_begin"] = {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField(getBlocklyMsgOr("SERIAL_INIT", "Serial begin baud"))
        .appendField(new Blockly.FieldDropdown(() => getSerialBaudDropdown()), "BAUD");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip(getBlocklyMsgOr("SERIAL_PRINT_TOOLTIP", "Send text or a value to the serial port."));
      this.setStyle(BOARD_STYLE);
    },
  };

  Blockly.Blocks["board_serial_print"] = {
    init(this: Blockly.Block) {
      this.appendValueInput("TEXT")
        .appendField(getBlocklyMsgOr("SERIAL_PRINT_CONTENT", "Serial print"));
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip(getBlocklyMsgOr("SERIAL_PRINT_TOOLTIP", "Send text or a value to the serial port."));
      this.setStyle(BOARD_STYLE);
    },
  };

  Blockly.Blocks["board_serial_println"] = {
    init(this: Blockly.Block) {
      this.appendValueInput("TEXT")
        .appendField(getBlocklyMsgOr("SERIAL_PRINTLN_CONTENT", "Serial println"));
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip(getBlocklyMsgOr("SERIAL_PRINT_TOOLTIP", "Send text or a value to the serial port."));
      this.setStyle(BOARD_STYLE);
    },
  };

  const serialPrintFormatOptions: [string, string][] = [
    [getBlocklyMsgOr("SERIAL_PRINT_FORDECIMAL", "decimal (DEC)"), "DEC"],
    [getBlocklyMsgOr("SERIAL_PRINT_FORHEXA", "hexadecimal (HEX)"), "HEX"],
    [getBlocklyMsgOr("SERIAL_PRINT_FORBIN", "binary (BIN)"), "BIN"],
    [getBlocklyMsgOr("SERIAL_PRINT_FOROCT", "octal (OCT)"), "OCT"],
  ];
  Blockly.Blocks["board_serial_printfor"] = {
    init(this: Blockly.Block) {
      this.appendValueInput("CONTENT")
        .setCheck("Number")
        .appendField(getBlocklyMsgOr("SERIAL_PRINT_FORMAT", "Serial print format"))
        .appendField(new Blockly.FieldDropdown(serialPrintFormatOptions), "TYPE");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip(getBlocklyMsgOr("SERIAL_PRINT_TOOLTIP", "Send text or a value to the serial port."));
      this.setStyle(BOARD_STYLE);
    },
  };

  Blockly.Blocks["board_serial_read"] = {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField(getBlocklyMsgOr("SERIAL_READ", "Serial read"));
      this.setOutput(true, "int");
      this.setTooltip(getBlocklyMsgOr("SERIAL_PRINT_TOOLTIP", "Send text or a value to the serial port."));
      this.setStyle(BOARD_STYLE);
    },
  };

  Blockly.Blocks["board_serial_available"] = {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField(getBlocklyMsgOr("SERIAL_AVAILABLE", "Serial bytes available"));
      this.setOutput(true, "int");
      this.setTooltip(getBlocklyMsgOr("SERIAL_PRINT_TOOLTIP", "Send text or a value to the serial port."));
      this.setStyle(BOARD_STYLE);
    },
  };

  Blockly.Blocks["board_serial_write"] = {
    init(this: Blockly.Block) {
      this.appendValueInput("DATA")
        .appendField(getBlocklyMsgOr("SERIAL_WRITE_CONTENT", "Serial write"));
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip(getBlocklyMsgOr("SERIAL_WRITE_TOOLTIP", "Send binary data to the serial port."));
      this.setStyle(BOARD_STYLE);
    },
  };

  Blockly.Blocks["board_serial_flush"] = {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField(getBlocklyMsgOr("SERIAL_FLUSH", "Serial flush"));
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip(getBlocklyMsgOr("SERIAL_PRINT_TOOLTIP", "Send text or a value to the serial port."));
      this.setStyle(BOARD_STYLE);
    },
  };

  Blockly.Blocks["board_serial_peek"] = {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField(getBlocklyMsgOr("SERIAL_PEEK", "Serial peek"));
      this.setOutput(true, "int");
      this.setTooltip(getBlocklyMsgOr("SERIAL_PRINT_TOOLTIP", "Send text or a value to the serial port."));
      this.setStyle(BOARD_STYLE);
    },
  };

  Blockly.Blocks["board_serial_readString"] = {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField(getBlocklyMsgOr("SERIAL_READSTRING", "Serial read string"));
      this.setOutput(true, "String");
      this.setTooltip(getBlocklyMsgOr("SERIAL_PRINT_TOOLTIP", "Send text or a value to the serial port."));
      this.setStyle(BOARD_STYLE);
    },
  };

  Blockly.Blocks["board_serial_readStringUntil"] = {
    init(this: Blockly.Block) {
      this.appendValueInput("TERMINATOR")
        .setCheck("String")
        .appendField(getBlocklyMsgOr("SERIAL_READSTRINGUNTIL_CONTENT", "Serial read string until"));
      this.setInputsInline(true);
      this.setOutput(true, "String");
      this.setTooltip(getBlocklyMsgOr("SERIAL_READSTRINGUNTIL_TOOLTIP", "Read characters until the terminator character."));
      this.setStyle(BOARD_STYLE);
    },
  };

  Blockly.Blocks["board_serial_parseInt"] = {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField(getBlocklyMsgOr("SERIAL_PARSEINT", "Serial parse integer"));
      this.setOutput(true, "int");
      this.setTooltip(getBlocklyMsgOr("SERIAL_PRINT_TOOLTIP", "Send text or a value to the serial port."));
      this.setStyle(BOARD_STYLE);
    },
  };

  Blockly.Blocks["board_serial_parseFloat"] = {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField(getBlocklyMsgOr("SERIAL_PARSEFLOAT", "Serial parse float"));
      this.setOutput(true, "float");
      this.setTooltip(getBlocklyMsgOr("SERIAL_PRINT_TOOLTIP", "Send text or a value to the serial port."));
      this.setStyle(BOARD_STYLE);
    },
  };
}
