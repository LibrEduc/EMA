/**
 * @packageDocumentation
 * @module Arduino.BlockTypes.Math
 * @description Block type mappings for math blocks.
 * @remarks
 * Maps block IDs to static or dynamic types.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export const MATH_BLOCK_TYPES = {
  math_number: "__DYNAMIC__identifyNumber",
  math_percent: "float",
  inout_angle_maths: "int",
  math_arithmetic: "int",
  math_interval: "bool",
  math_single: "float",
  math_trig: "float",
  math_constant: "float",
  math_number_property: "bool",
  math_round: "__DYNAMIC__mathRoundType",
  math_modulo: "int",
  math_random_int: "int",
  math_random_float: "float",
  math_on_list: "__DYNAMIC__mathOnListType",
  math_constrain: "int",
  math_atan2: "float",
} as const;
