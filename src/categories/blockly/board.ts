/**
 * @packageDocumentation
 * @module BlocklyCategories.Board
 * @description Board (s4e) block definitions – setup, loop, digital/analog I/O, delay, tone.
 * @remarks
 * Blocks from exemples/s4e/S4E/categories/board (board_base.blocks / board_base.arduino).
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
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
import * as FieldDependentDropdownNS from "@blockly/field-dependent-dropdown";
import * as FieldGridDropdownNS from "@blockly/field-grid-dropdown";
import { namedExportFromCjsPlugin } from "../../utils/blockly_plugin_export";
import { AccessibleFieldSlider } from "./field_slider_accessible";
import {
  DEFAULT_BOARD_ID,
  getBoardDigitalPinOptionMapping,
  getBoardDropdownOptions,
  getBoardProfileDropdownOptions,
} from "../../boards";
import { getBlocklyMsgOr, getBlocklyCompatibleChecks, handleBoardIntInputBlockChange } from "./shared";

const FieldDependentDropdown = namedExportFromCjsPlugin<
  typeof import("@blockly/field-dependent-dropdown").FieldDependentDropdown
>(FieldDependentDropdownNS, "FieldDependentDropdown");
const FieldGridDropdown = namedExportFromCjsPlugin<
  typeof import("@blockly/field-grid-dropdown").FieldGridDropdown
>(FieldGridDropdownNS, "FieldGridDropdown");

const BOARD_STYLE = "board_blocks";
/** Conteneur « Define » Blockly@rduino (bordure accentuée via colourSecondary). */
const BOARD_DEFINE_STYLE = "board_define_blocks";

const boardIntInputOnchange = function (
  this: Blockly.Block,
  event: Blockly.Events.Abstract,
): void {
  handleBoardIntInputBlockChange(this, event);
};

const FALLBACK_BOARD_FOR_DROPDOWNS = "arduino_uno";

function getSelectedBoardId(): string {
  const menu = document.getElementById("boardMenu") as HTMLSelectElement | null;
  const value = menu?.value?.trim();
  if (!value || value === DEFAULT_BOARD_ID) return FALLBACK_BOARD_FOR_DROPDOWNS;
  return value;
}

function getPinDropdown(
  key: "dropdownDigital" | "dropdownPWM" | "dropdownAnalog",
): [string, string][] {
  const opts = getBoardDropdownOptions(getSelectedBoardId());
  if (key === "dropdownDigital") return opts.digital;
  if (key === "dropdownPWM") return opts.pwm;
  return opts.analog;
}

function getSerialBaudDropdown(): [string, string][] {
  return getBoardDropdownOptions(getSelectedBoardId()).serial;
}

let boardBlocksRegistered = false;

function getHighLowDropdown(): [string, string][] {
  return [
    [getBlocklyMsgOr("FIELDDROPDOWN_HIGH", "HIGH"), "HIGH"],
    [getBlocklyMsgOr("FIELDDROPDOWN_LOW", "LOW"), "LOW"],
  ];
}

/** Block types that have a PIN dropdown and which option key they use. */
const BLOCK_PIN_DROPDOWN: Record<string, "digital" | "pwm" | "analog"> = {
  board_base_inout_digital_write: "digital",
  board_base_inout_digital_read: "digital",
  board_base_inout_digital_read_grid: "digital",
  board_base_inout_analog_write: "pwm",
  board_base_inout_analog_write_slider: "pwm",
  board_base_inout_analog_read: "analog",
  board_base_inout_tone: "digital",
  board_base_inout_notone: "digital",
  board_base_inout_pulsein: "digital",
  board_base_inout_pulsein_timeout: "digital",
  board_base_inout_pin_mode: "digital",
};

/**
 * Enregistre des dropdowns PIN pour des blocs d’extension (chargement runtime). Appelé par le loader d’extensions ; pris en compte par `refreshBoardPinDropdowns`.
 * @param mapping - `mapping` value.
 */
export function registerExtensionPinDropdowns(
  mapping: Record<string, "digital" | "pwm" | "analog">,
): void {
  Object.assign(BLOCK_PIN_DROPDOWN, mapping);
}

/**
 * Registers board (s4e) blocks: setup, loop, digital/analog I/O, delay, map, tone.
 */
export const defineBoardBlocks = (): void => {
  if (boardBlocksRegistered) return;
  boardBlocksRegistered = true;

  const highLow = getHighLowDropdown();

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

  // Conversion (Blockly-at-rduino CAT_ARDUINO_CONVERSION)
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

  // Serial communication – same keys as s4e (SERIAL_*)
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
};

/** FieldDropdown-like with optional internal menu generator (Blockly internal API). */
interface FieldDropdownLike {
  setOptions?(menu: unknown): void;
  getValue(): string;
  setValue(value: string): void;
  menuGenerator_?: () => [string, string][] | [string, string][];
}

/**
 * Updates all pin and serial dropdowns in the workspace to match the currently selected board. Call this when the board menu selection changes. Uses setOptions when available; otherwise updates the menu generator so the dropdown shows the new list.
 * @param workspace - Blockly workspace.
 */
export function refreshBoardPinDropdowns(workspace: Blockly.Workspace): void {
  const opts = getBoardDropdownOptions(getSelectedBoardId());
  const blocks = workspace.getAllBlocks(false);
  for (const block of blocks) {
    const type = block.type;
    const pinKey = BLOCK_PIN_DROPDOWN[type];
    if (pinKey) {
      const options = pinKey === "digital" ? opts.digital : pinKey === "pwm" ? opts.pwm : opts.analog;
      const field = block.getField("PIN") as FieldDropdownLike | null;
      if (field) {
        if (typeof field.setOptions === "function") {
          field.setOptions(options);
        } else if (field.menuGenerator_ !== undefined) {
          field.menuGenerator_ = () => options;
        }
        const cur = field.getValue();
        const validValue = options.length > 0 && options.some((p) => p[1] === cur) ? cur : options[0]?.[1];
        if (validValue !== undefined) {
          block.setFieldValue(validValue, "PIN");
        }
      }
    }
    if (type === "board_serial_begin") {
      const field = block.getField("BAUD") as FieldDropdownLike | null;
      if (field) {
        if (typeof field.setOptions === "function") {
          field.setOptions(opts.serial);
        } else if (field.menuGenerator_ !== undefined) {
          field.menuGenerator_ = () => opts.serial;
        }
        const cur = field.getValue();
        const validValue =
          opts.serial.length > 0 && opts.serial.some((p) => p[1] === cur) ? cur : opts.serial[0]?.[1];
        if (validValue !== undefined) {
          block.setFieldValue(validValue, "BAUD");
        }
      }
    }
  }
}
