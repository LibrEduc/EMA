/**
 * @packageDocumentation
 * @module Arduino.BlockTypes.Array
 * @description Block type mappings for S4e-style array blocks.
 * @remarks
 * Array blocks output Array or element types; statement blocks use null.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Block type mappings for Array category (s4e blocks).
 * Array_with has no fixed type: it is typed by its first connected input (__DYNAMIC__arrayFromInputs).
 */
export const ARRAY_BLOCK_TYPES = {
  Array_with: "null",
  Array_bitmap: "null",
  Array_bitmap_get: "Array",
  Array_list_literal: "__DYNAMIC__arrayFromInputs",
  Array_list_3: "__DYNAMIC__arrayFromInputs", // legacy alias
  Array_getIndex_in_list: "__DYNAMIC__arrayGetIndexElement",
  Array_modify: "null",
  Array_set: "null",
  Array_declare: "null",
  Array_create: "null",
  Array_fix: "null",
  Array_getIndex_in_array: "__DYNAMIC__arrayGetIndexElement",
} as const;
