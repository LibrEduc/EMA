/**
 * @packageDocumentation
 * @module BlocklyCategories.Board.Pins
 * @description Pin/serial dropdown refresh for the selected board.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type * as Blockly from "blockly";
import { getBoardDropdownOptions } from "../../boards";
import {
  BLOCK_PIN_DROPDOWN,
  getSelectedBoardId,
} from "./board_shared";

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
