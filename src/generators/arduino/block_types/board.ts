/**
 * @packageDocumentation
 * @module Arduino.BlockTypes.Board
 * @description Block type mappings for board (s4e) blocks.
 * @license GPL-3.0-or-later
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

export const BOARD_BLOCK_TYPES = {
  board_base_inout_digital_read: "bool",
  board_base_inout_highlow: "bool",
  board_base_inout_analog_read: "int",
  board_base_inout_map: "int",
  board_base_inout_angle: "int",
  board_base_time_millis: "int",
  board_base_inout_pulsein: "int",
  board_base_inout_pulsein_timeout: "int",
  board_conversion_toint: "int",
  board_conversion_tofloat: "float",
  board_conversion_tochar: "int",
  board_conversion_tobyte: "int",
  board_conversion_toString: "string",
  board_conversion_constrain: "int",
  board_serial_read: "int",
  board_serial_available: "int",
  board_serial_peek: "int",
  board_serial_readString: "string",
  board_serial_readStringUntil: "string",
  board_serial_parseInt: "int",
  board_serial_parseFloat: "float",
} as const;
