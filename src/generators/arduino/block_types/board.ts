/**
 * @packageDocumentation
 * @module Arduino.BlockTypes.Board
 * @description Block type mappings for board (s4e) blocks.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export const BOARD_BLOCK_TYPES = {
  board_base_inout_digital_read: "bool",
  board_base_inout_digital_read_pin: "bool",
  board_base_inout_digital_read_grid: "bool",
  board_base_inout_highlow: "bool",
  board_base_inout_analog_read: "int",
  board_base_inout_map: "int",
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
