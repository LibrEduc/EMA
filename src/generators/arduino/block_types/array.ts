/**
 * @packageDocumentation
 * @module Arduino.BlockTypes.Array
 * @description Block type mappings for S4e-style array blocks.
 * @remarks
 * Array blocks output Array or element types; statement blocks use null.
 * @license GPL-3.0-or-later
 * @author scanet\@libreduc.cc (Sébastien Canet)
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

/**
 * Block type mappings for Array category (s4e blocks).
 * Array_with has no fixed type: it is typed by its first connected input (__DYNAMIC__arrayFromInputs).
 */
export const ARRAY_BLOCK_TYPES = {
  Array_with: "__DYNAMIC__arrayFromInputs",
  Array_list_3: "__DYNAMIC__arrayFromInputs", // legacy alias
  Array_getIndex_in_list: "null", // dynamic: element type
  Array_modify: "null",
  Array_declare: "null",
  Array_create: "null",
  Array_fix: "null",
  Array_getIndex_in_array: "null", // dynamic: element type
} as const;
