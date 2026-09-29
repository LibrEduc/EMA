/**
 * @packageDocumentation
 * @module BlocklyCategories.Board
 * @description Board block definitions (facade).
 * @remarks
 * Split: board_shared, board_structure, board_io, board_time, board_conversion, board_serial, board_pins.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { getHighLowDropdown } from "./board_shared";
import { defineBoardStructureBlocks } from "./board_structure";
import { defineBoardIoBlocks } from "./board_io";
import { defineBoardTimeBlocks } from "./board_time";
import { defineBoardConversionBlocks } from "./board_conversion";
import { defineBoardSerialBlocks } from "./board_serial";

export {
  registerExtensionPinDropdowns,
} from "./board_shared";
export { refreshBoardPinDropdowns } from "./board_pins";

let boardBlocksRegistered = false;

/**
 * Registers board (s4e) blocks: setup, loop, digital/analog I/O, delay, map, tone, serial.
 */
export const defineBoardBlocks = (): void => {
  if (boardBlocksRegistered) return;
  boardBlocksRegistered = true;
  const highLow = getHighLowDropdown();
  defineBoardStructureBlocks();
  defineBoardIoBlocks(highLow);
  defineBoardTimeBlocks();
  defineBoardConversionBlocks();
  defineBoardSerialBlocks();
};
