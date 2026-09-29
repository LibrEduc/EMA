/**
 * @packageDocumentation
 * @module BlocklyCategories.Board.Io
 * @description Digital/analog I/O, tone, map, pulseIn, pinMode.
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
  AccessibleFieldSlider,
  BOARD_STYLE,
  FieldDependentDropdown,
  FieldGridDropdown,
  boardIntInputOnchange,
  getBlocklyCompatibleChecks,
  getBlocklyMsgOr,
  getBoardDigitalPinOptionMapping,
  getBoardProfileDropdownOptions,
  getPinDropdown,
  getSelectedBoardId,
} from "./board_shared";

export function defineBoardIoBlocks(highLow: [string, string][]): void {
  Blockly.Blocks["board_base_inout_buildin_led"] = {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField(getBlocklyMsgOr("ARDUINO_INOUT_BUILDIN_LED_INPUT", "built-in LED"))
        .appendField(new Blockly.FieldDropdown(highLow), "STAT");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip(getBlocklyMsgOr("ARDUINO_INOUT_BUILDIN_LED_TOOLTIP", "Turn the built-in LED (pin 13) on or off."));
      this.setStyle(BOARD_STYLE);
    },
  };

  Blockly.Blocks["board_base_inout_digital_write"] = {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField(getBlocklyMsgOr("ARDUINO_INOUT_DIGITAL_WRITE_INPUT1", "digital write pin"))
        .appendField(new Blockly.FieldDropdown(() => getPinDropdown("dropdownDigital")), "PIN")
        .appendField(getBlocklyMsgOr("ARDUINO_INOUT_DIGITAL_WRITE_INPUT2", "state"))
        .appendField(new Blockly.FieldDropdown(highLow), "STAT");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip(getBlocklyMsgOr("ARDUINO_INOUT_DIGITAL_WRITE_TOOLTIP", "Write HIGH or LOW to a digital pin."));
      this.setStyle(BOARD_STYLE);
    },
  };

  Blockly.Blocks["board_base_inout_digital_read"] = {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField(getBlocklyMsgOr("ARDUINO_INOUT_DIGITAL_READ_INPUT", "digital read pin"))
        .appendField(new Blockly.FieldDropdown(() => getPinDropdown("dropdownDigital")), "PIN");
      this.setOutput(true, "Boolean");
      this.setTooltip(getBlocklyMsgOr("ARDUINO_INOUT_DIGITAL_READ_TOOLTIP", "Read the state (HIGH/LOW) of a digital pin."));
      this.setStyle(BOARD_STYLE);
    },
  };

  Blockly.Blocks["board_base_inout_digital_read_pin"] = {
    init(this: Blockly.Block) {
      this.appendValueInput("PIN")
        .appendField(getBlocklyMsgOr("ARDUINO_INOUT_DIGITAL_READ_INPUT", "digital read pin"))
        .setCheck(getBlocklyCompatibleChecks("int"));
      this.setInputsInline(true);
      this.setOutput(true, "Boolean");
      this.setTooltip(
        getBlocklyMsgOr(
          "ARDUINO_INOUT_DIGITAL_READ_PIN_TOOLTIP",
          "Read the state (HIGH/LOW) of a digital pin; connect an integer pin number.",
        ),
      );
      this.setStyle(BOARD_STYLE);
    },
    onchange: boardIntInputOnchange,
  };

  Blockly.Blocks["board_base_inout_digital_read_grid"] = {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField(getBlocklyMsgOr("ARDUINO_INOUT_DIGITAL_READ_INPUT", "digital read pin"))
        .appendField(
          new FieldGridDropdown(() => getPinDropdown("dropdownDigital"), undefined, {
            columns: 4,
          }),
          "PIN",
        );
      this.setOutput(true, "Boolean");
      this.setTooltip(
        getBlocklyMsgOr(
          "ARDUINO_INOUT_DIGITAL_READ_GRID_TOOLTIP",
          "Read the state (HIGH/LOW) of a digital pin; choose the pin from a grid.",
        ),
      );
      this.setStyle(BOARD_STYLE);
    },
  };

  Blockly.Blocks["board_base_inout_digital_read_board"] = {
    init(this: Blockly.Block) {
      const boardFieldName = "BOARD";
      const boardOptions = getBoardProfileDropdownOptions();
      const pinMapping = getBoardDigitalPinOptionMapping();
      const defaultPinOptions: [string, string][] = [["0", "0"]];

      this.appendDummyInput()
        .appendField(getBlocklyMsgOr("ARDUINO_INOUT_DIGITAL_READ_INPUT", "digital read pin"))
        .appendField(getBlocklyMsgOr("ARDUINO_INOUT_DIGITAL_READ_BOARD_LABEL", "board"))
        .appendField(new Blockly.FieldDropdown(boardOptions), boardFieldName)
        .appendField(getBlocklyMsgOr("ARDUINO_INOUT_DIGITAL_READ_PIN_LABEL", "pin"))
        .appendField(
          new FieldDependentDropdown(boardFieldName, pinMapping, defaultPinOptions),
          "PIN",
        );
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip(
        getBlocklyMsgOr(
          "ARDUINO_INOUT_DIGITAL_READ_BOARD_TOOLTIP",
          "Read a digital pin; choose the board then the pin (pin list depends on the board).",
        ),
      );
      this.setStyle(BOARD_STYLE);
      this.setFieldValue(getSelectedBoardId(), boardFieldName);
    },
  };

  Blockly.Blocks["board_base_inout_highlow"] = {
    init(this: Blockly.Block) {
      this.appendDummyInput().appendField(new Blockly.FieldDropdown(highLow), "BOOL");
      this.setOutput(true, "Boolean");
      this.setTooltip(getBlocklyMsgOr("LOGIC_BOOLEAN_TOOLTIP", "HIGH or LOW value."));
      this.setStyle(BOARD_STYLE);
    },
  };

  Blockly.Blocks["board_base_inout_analog_write"] = {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField(getBlocklyMsgOr("ARDUINO_INOUT_ANALOG_WRITE_INPUT1", "PWM pin"))
        .appendField(new Blockly.FieldDropdown(() => getPinDropdown("dropdownPWM")), "PIN");
      this.appendValueInput("PWM")
        .appendField(getBlocklyMsgOr("ARDUINO_INOUT_ANALOG_WRITE_INPUT2", "value"))
        .setCheck(getBlocklyCompatibleChecks("int"));
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip(getBlocklyMsgOr("ARDUINO_INOUT_ANALOG_WRITE_TOOLTIP", "Write a PWM value (0-255) to a pin."));
      this.setStyle(BOARD_STYLE);
    },
    onchange: boardIntInputOnchange,
  };

  Blockly.Blocks["board_base_inout_analog_write_slider"] = {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField(getBlocklyMsgOr("ARDUINO_INOUT_ANALOG_WRITE_INPUT1", "PWM pin"))
        .appendField(new Blockly.FieldDropdown(() => getPinDropdown("dropdownPWM")), "PIN");
      this.appendDummyInput()
        .setAlign(Blockly.inputs.Align.RIGHT)
        .appendField(getBlocklyMsgOr("ARDUINO_INOUT_ANALOG_WRITE_INPUT2", "value"))
        .appendField(new AccessibleFieldSlider(127, 0, 255, 1), "PWM");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip(getBlocklyMsgOr("ARDUINO_INOUT_ANALOG_WRITE_TOOLTIP", "Write a PWM value (0-255) to a pin."));
      this.setStyle(BOARD_STYLE);
    },
  };

  Blockly.Blocks["board_base_inout_analog_read"] = {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField(getBlocklyMsgOr("ARDUINO_INOUT_ANALOG_READ_INPUT", "analog read pin"))
        .appendField(new Blockly.FieldDropdown(() => getPinDropdown("dropdownAnalog")), "PIN");
      this.setOutput(true, "int");
      this.setTooltip(getBlocklyMsgOr("ARDUINO_INOUT_ANALOG_READ_TOOLTIP", "Read the analog value (0-1023) from a pin."));
      this.setStyle(BOARD_STYLE);
    },
  };

  Blockly.Blocks["board_base_inout_pulsein"] = {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField(getBlocklyMsgOr("ARDUINO_PULSEIN", "pulseIn pin"))
        .appendField(new Blockly.FieldDropdown(() => getPinDropdown("dropdownDigital")), "PIN")
        .appendField(getBlocklyMsgOr("ARDUINO_INOUT_STAT", "state"))
        .appendField(new Blockly.FieldDropdown(highLow), "STAT");
      this.setOutput(true, "Number");
      this.setTooltip(getBlocklyMsgOr("ARDUINO_PULSEIN_TOOLTIP", "Reads a pulse (HIGH or LOW) on a pin; returns length in microseconds."));
      this.setStyle(BOARD_STYLE);
    },
  };

  Blockly.Blocks["board_base_inout_pulsein_timeout"] = {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField(getBlocklyMsgOr("ARDUINO_PULSEIN", "pulseIn pin"))
        .appendField(new Blockly.FieldDropdown(() => getPinDropdown("dropdownDigital")), "PIN")
        .appendField(getBlocklyMsgOr("ARDUINO_INOUT_STAT", "state"))
        .appendField(new Blockly.FieldDropdown(highLow), "STAT");
      this.appendValueInput("TIMEOUT")
        .appendField(getBlocklyMsgOr("ARDUINO_PULSEIN_TIMEOUT", "timeout (µs)"))
        .setCheck("Number");
      this.setInputsInline(true);
      this.setOutput(true, "Number");
      this.setTooltip(getBlocklyMsgOr("ARDUINO_PULSEIN_TOOLTIP", "Reads a pulse (HIGH or LOW) on a pin; returns length in microseconds or 0 if timeout."));
      this.setStyle(BOARD_STYLE);
    },
  };

  const pinModeOptions: [string, string][] = [
    [getBlocklyMsgOr("ARDUINO_PINMODE_INPUT", "INPUT"), "INPUT"],
    [getBlocklyMsgOr("ARDUINO_PINMODE_OUTPUT", "OUTPUT"), "OUTPUT"],
    [getBlocklyMsgOr("ARDUINO_PINMODE_INPUT_PULLUP", "INPUT_PULLUP"), "INPUT_PULLUP"],
  ];
  Blockly.Blocks["board_base_inout_pin_mode"] = {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField(getBlocklyMsgOr("ARDUINO_PINMODE", "pin mode"))
        .appendField(new Blockly.FieldDropdown(() => getPinDropdown("dropdownDigital")), "PIN")
        .appendField(new Blockly.FieldDropdown(pinModeOptions), "MODE");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip(getBlocklyMsgOr("ARDUINO_PINMODE_TOOLTIP", "Configure a pin as INPUT, OUTPUT, or INPUT_PULLUP."));
      this.setStyle(BOARD_STYLE);
    },
  };

  Blockly.Blocks["board_base_inout_map"] = {
    init(this: Blockly.Block) {
      this.appendValueInput("NUM")
        .appendField(getBlocklyMsgOr("ARDUINO_BASE_MAP1", "map [ value , 0 , 1024 , 0 , "))
        .setCheck(getBlocklyCompatibleChecks("int"));
      this.appendValueInput("DMAX")
        .appendField(getBlocklyMsgOr("ARDUINO_BASE_MAP2", "max ]"))
        .setCheck(getBlocklyCompatibleChecks("int"));
      this.setInputsInline(true);
      this.setOutput(true);
      this.setTooltip(getBlocklyMsgOr("ARDUINO_BASE_MAP_TOOLTIP", "Map a value from one range to another (e.g. 0-1023 to 0-180)."));
      this.setStyle(BOARD_STYLE);
    },
    onchange: boardIntInputOnchange,
  };

  Blockly.Blocks["board_base_inout_tone"] = {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField(getBlocklyMsgOr("ARDUINO_TONE_INPUT1", "tone pin"))
        .appendField(new Blockly.FieldDropdown(() => getPinDropdown("dropdownDigital")), "PIN");
      this.appendValueInput("NUM")
        .setAlign(Blockly.inputs.Align.RIGHT)
        .appendField(getBlocklyMsgOr("ARDUINO_TONE_INPUT2", "frequency (Hz)"))
        .setCheck(getBlocklyCompatibleChecks("int"));
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip(getBlocklyMsgOr("ARDUINO_TONE_TOOLTIP", "Play a tone at the given frequency on the pin."));
      this.setStyle(BOARD_STYLE);
    },
    onchange: boardIntInputOnchange,
  };

  Blockly.Blocks["board_base_inout_notone"] = {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField(getBlocklyMsgOr("ARDUINO_NOTONE_INPUT", "stop tone pin"))
        .appendField(new Blockly.FieldDropdown(() => getPinDropdown("dropdownDigital")), "PIN");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip(getBlocklyMsgOr("ARDUINO_NOTONE_TOOLTIP", "Stop the tone on the pin."));
      this.setStyle(BOARD_STYLE);
    },
  };

}
