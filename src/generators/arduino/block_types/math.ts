/**
 * @packageDocumentation
 * @module Arduino.BlockTypes.Math
 * @description Block type mappings for math blocks.
 * @remarks
 * Maps block IDs to static or dynamic types.
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
