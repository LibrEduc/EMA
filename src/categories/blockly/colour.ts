/**
 * @packageDocumentation
 * @module BlocklyCategories.Colour
 * @description Colour block definitions and custom color fields.
 * @remarks
 * Defines colour blocks and color picker integrations.
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
import { FieldColour } from "@blockly/field-colour";
import { FieldColorPicker } from "./field_colour_picker";
import { LocalizedFieldColourHsvSliders } from "./field_colour_hsv_sliders";
import { getBlocklyMsg, getBlocklyMsgOr } from "./shared";

const COLOUR_CHECKER_ICON =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 12 12' preserveAspectRatio='xMidYMid meet'>"
  + "<rect x='0' y='0' width='4' height='4' fill='%23ff4d4d'/>"
  + "<rect x='4' y='0' width='4' height='4' fill='%234da6ff'/>"
  + "<rect x='8' y='0' width='4' height='4' fill='%234dff4d'/>"
  + "<rect x='0' y='4' width='4' height='4' fill='%23ffd24d'/>"
  + "<rect x='4' y='4' width='4' height='4' fill='%23b266ff'/>"
  + "<rect x='8' y='4' width='4' height='4' fill='%23ff4dc4'/>"
  + "<rect x='0' y='8' width='4' height='4' fill='%234dffff'/>"
  + "<rect x='4' y='8' width='4' height='4' fill='%23ff944d'/>"
  + "<rect x='8' y='8' width='4' height='4' fill='%23cccccc'/>"
  + "</svg>";
const COLOUR_WHEEL_ICON =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'>"
  + "<path d='M8 8 L8 1 A7 7 0 0 1 12.95 3.05 Z' fill='%23ff0000'/>"
  + "<path d='M8 8 L12.95 3.05 A7 7 0 0 1 15 8 Z' fill='%23ffa500'/>"
  + "<path d='M8 8 L15 8 A7 7 0 0 1 12.95 12.95 Z' fill='%23ffff00'/>"
  + "<path d='M8 8 L12.95 12.95 A7 7 0 0 1 8 15 Z' fill='%2300ff00'/>"
  + "<path d='M8 8 L8 15 A7 7 0 0 1 3.05 12.95 Z' fill='%2300ffff'/>"
  + "<path d='M8 8 L3.05 12.95 A7 7 0 0 1 1 8 Z' fill='%230000ff'/>"
  + "<path d='M8 8 L1 8 A7 7 0 0 1 3.05 3.05 Z' fill='%238000ff'/>"
  + "<path d='M8 8 L3.05 3.05 A7 7 0 0 1 8 1 Z' fill='%23ff00ff'/>"
  + "<circle cx='8' cy='8' r='7' fill='none' stroke='%23000' stroke-width='0.5'/>"
  + "</svg>";
const HSV_SLIDER_ICON =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='16' viewBox='0 0 32 20' preserveAspectRatio='xMidYMid meet'>"
  + "<rect x='2' y='8' width='28' height='6' rx='3' fill='%23d0d0d0'/>"
  + "<circle cx='18' cy='11' r='4' fill='%23ff0000' stroke='%23000' stroke-width='0.8'/>"
  + "</svg>";

/**
 * Registers colour blocks and custom color picker fields.
 */
export const defineColourBlocks = (): void => {
  if (!Blockly.Blocks["colour_picker"]) {
    Blockly.Blocks["colour_picker"] = {
      init: function(this: Blockly.Block) {
        this.appendDummyInput()
          .appendField(new Blockly.FieldImage(COLOUR_CHECKER_ICON, 16, 16, "palette"))
          .appendField(new FieldColour("#ff0000") as unknown as Blockly.Field, "COLOUR");
        this.setOutput(true, "Colour");
        this.setStyle("colour_blocks");
        this.setTooltip(getBlocklyMsgOr("COLOUR_PICKER_TOOLTIP", ""));
        this.setHelpUrl(getBlocklyMsgOr("COLOUR_PICKER_HELPURL", ""));
      },
    };
  }

  if (!Blockly.Blocks["color_picker_custom"]) {
    Blockly.Blocks["color_picker_custom"] = {
      init: function(this: Blockly.Block) {
        this.appendDummyInput()
          .appendField(new Blockly.FieldImage(COLOUR_WHEEL_ICON, 16, 16, "wheel"))
          .appendField(new FieldColorPicker("#ff00ff") as unknown as Blockly.Field, "COLOR");
        this.setOutput(true, "Colour");
        this.setStyle("colour_blocks");
        this.setTooltip(getBlocklyMsgOr("COLOUR_PICKER_TOOLTIP", ""));
        this.setHelpUrl(getBlocklyMsgOr("COLOUR_PICKER_HELPURL", ""));
      },
    };
  }

  if (!Blockly.Blocks["color_picker_hsv"]) {
    Blockly.Blocks["color_picker_hsv"] = {
      init: function () {
        this.appendDummyInput()
          .appendField(new Blockly.FieldImage(HSV_SLIDER_ICON, 32, 16, "hsv"))
          .appendField(new LocalizedFieldColourHsvSliders('#ff0000'), 'COLOUR');
        this.setOutput(true, 'Colour');
        this.setStyle('colour_blocks');
        this.setTooltip(getBlocklyMsgOr("COLOUR_PICKER_TOOLTIP", ""));
        this.setHelpUrl(getBlocklyMsgOr("COLOUR_PICKER_HELPURL", ""));
      },
    };
  }

  if (!Blockly.Blocks["colour_random"]) {
    Blockly.Blocks["colour_random"] = {
      init: function(this: Blockly.Block) {
        this.appendDummyInput()
          .appendField(getBlocklyMsg("COLOUR_RANDOM_TITLE"));
        this.setOutput(true, "Colour");
        this.setStyle("colour_blocks");
        this.setTooltip(getBlocklyMsgOr("COLOUR_RANDOM_TOOLTIP", ""));
        this.setHelpUrl(getBlocklyMsgOr("COLOUR_RANDOM_HELPURL", ""));
      },
    };
  }

  if (!Blockly.Blocks["colour_rgb"]) {
    Blockly.Blocks["colour_rgb"] = {
      init: function(this: Blockly.Block) {
        this.appendDummyInput()
          .appendField(getBlocklyMsg("COLOUR_RGB_TITLE"))
          .appendField(getBlocklyMsg("COLOUR_RGB_RED"))
          .appendField(new Blockly.FieldNumber(100, 0, 255, 1), "RED")
          .appendField(getBlocklyMsg("COLOUR_RGB_GREEN"))
          .appendField(new Blockly.FieldNumber(50, 0, 255, 1), "GREEN")
          .appendField(getBlocklyMsg("COLOUR_RGB_BLUE"))
          .appendField(new Blockly.FieldNumber(0, 0, 255, 1), "BLUE");
        this.setInputsInline(true);
        this.setOutput(true, "Colour");
        this.setStyle("colour_blocks");
        this.setTooltip(getBlocklyMsgOr("COLOUR_RGB_TOOLTIP", ""));
        this.setHelpUrl(getBlocklyMsgOr("COLOUR_RGB_HELPURL", ""));
      },
    };
  }

  if (!Blockly.Blocks["colour_blend"]) {
    Blockly.Blocks["colour_blend"] = {
      init: function(this: Blockly.Block) {
        this.appendValueInput("COLOUR1")
          .setCheck("Colour")
          .setAlign(Blockly.inputs.Align.RIGHT)
          .appendField(getBlocklyMsg("COLOUR_BLEND_TITLE"))
          .appendField(getBlocklyMsg("COLOUR_BLEND_COLOUR1"));
        this.appendValueInput("COLOUR2")
          .setCheck("Colour")
          .setAlign(Blockly.inputs.Align.RIGHT)
          .appendField(getBlocklyMsg("COLOUR_BLEND_COLOUR2"));
        this.appendValueInput("RATIO")
          .setCheck("Number")
          .setAlign(Blockly.inputs.Align.RIGHT)
          .appendField(getBlocklyMsg("COLOUR_BLEND_RATIO"));
        this.setOutput(true, "Colour");
        this.setStyle("colour_blocks");
        this.setTooltip(getBlocklyMsgOr("COLOUR_BLEND_TOOLTIP", ""));
        this.setHelpUrl(getBlocklyMsgOr("COLOUR_BLEND_HELPURL", ""));
      },
    };
  }
};
