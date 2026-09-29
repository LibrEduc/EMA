/**
 * @packageDocumentation
 * @module BlocklyCategories.Board.Shared
 * @description Shared helpers and styles for board blocks.
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

export const FieldDependentDropdown = namedExportFromCjsPlugin<
  typeof import("@blockly/field-dependent-dropdown").FieldDependentDropdown
>(FieldDependentDropdownNS, "FieldDependentDropdown");
export const FieldGridDropdown = namedExportFromCjsPlugin<
  typeof import("@blockly/field-grid-dropdown").FieldGridDropdown
>(FieldGridDropdownNS, "FieldGridDropdown");

export const BOARD_STYLE = "board_blocks";
/** Conteneur « Define » Blockly@rduino (bordure accentuée via colourSecondary). */
export const BOARD_DEFINE_STYLE = "board_define_blocks";

export const boardIntInputOnchange = function (
  this: Blockly.Block,
  event: Blockly.Events.Abstract,
): void {
  handleBoardIntInputBlockChange(this, event);
};

const FALLBACK_BOARD_FOR_DROPDOWNS = "arduino_uno";

export function getSelectedBoardId(): string {
  const menu = document.getElementById("boardMenu") as HTMLSelectElement | null;
  const value = menu?.value?.trim();
  if (!value || value === DEFAULT_BOARD_ID) return FALLBACK_BOARD_FOR_DROPDOWNS;
  return value;
}

export function getPinDropdown(
  key: "dropdownDigital" | "dropdownPWM" | "dropdownAnalog",
): [string, string][] {
  const opts = getBoardDropdownOptions(getSelectedBoardId());
  if (key === "dropdownDigital") return opts.digital;
  if (key === "dropdownPWM") return opts.pwm;
  return opts.analog;
}

export function getSerialBaudDropdown(): [string, string][] {
  return getBoardDropdownOptions(getSelectedBoardId()).serial;
}

export function getHighLowDropdown(): [string, string][] {
  return [
    [getBlocklyMsgOr("FIELDDROPDOWN_HIGH", "HIGH"), "HIGH"],
    [getBlocklyMsgOr("FIELDDROPDOWN_LOW", "LOW"), "LOW"],
  ];
}

/** Block types that have a PIN dropdown and which option key they use. */
export const BLOCK_PIN_DROPDOWN: Record<string, "digital" | "pwm" | "analog"> = {
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
 * Register PIN dropdowns for extension blocks (runtime packs).
 * @param mapping - Block type → pin kind.
 */
export function registerExtensionPinDropdowns(
  mapping: Record<string, "digital" | "pwm" | "analog">,
): void {
  Object.assign(BLOCK_PIN_DROPDOWN, mapping);
}

export { getBlocklyMsgOr, getBlocklyCompatibleChecks };
export { AccessibleFieldSlider };
export {
  getBoardDigitalPinOptionMapping,
  getBoardProfileDropdownOptions,
};
