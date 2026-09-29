/**
 * @packageDocumentation
 * @module Arduino.Generators.Board
 * @description Arduino code generators for board (s4e) blocks.
 * @remarks
 * Matches exemples/s4e/S4E/categories/board/board_base.arduino.
 * Split: board_structure, board_io, board_time, board_serial, board_conversion.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export {
  board_base_setup,
  board_base_setup_loop,
  board_base_loop,
  comment,
  include_library,
  define,
} from "./board_structure";

export {
  board_base_inout_buildin_led,
  board_base_inout_digital_write,
  board_base_inout_digital_read,
  board_base_inout_digital_read_pin,
  board_base_inout_digital_read_grid,
  board_base_inout_digital_read_board,
  board_base_inout_highlow,
  board_base_inout_analog_write,
  board_base_inout_analog_write_slider,
  board_base_inout_analog_read,
  board_base_inout_pulsein,
  board_base_inout_pulsein_timeout,
  board_base_inout_pin_mode,
  board_base_inout_map,
  board_base_inout_tone,
  board_base_inout_notone,
} from "./board_io";

export {
  board_base_time_delay,
  board_base_time_millis,
  board_base_time_delay_sec,
} from "./board_time";

export {
  board_serial_begin,
  board_serial_print,
  board_serial_println,
  board_serial_printfor,
  board_serial_flush,
  board_serial_read,
  board_serial_available,
  board_serial_write,
  board_serial_peek,
  board_serial_readString,
  board_serial_readStringUntil,
  board_serial_parseInt,
  board_serial_parseFloat,
} from "./board_serial";

export {
  board_conversion_toint,
  board_conversion_tofloat,
  board_conversion_tochar,
  board_conversion_tobyte,
  board_conversion_toString,
  board_conversion_constrain,
} from "./board_conversion";
