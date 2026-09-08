/**
 * @packageDocumentation
 * @module Arduino.Generators.Array
 * @description Arduino code generators for S4e-style array blocks.
 * @remarks
 * Ported from s4e array.arduino - generates C/Arduino code for arrays.
 * Split: array_helpers, array_list, array_declare, array_bitmap.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export {
  Array_list_literal,
  Array_list_3,
  Array_with,
  Array_getIndex_in_list,
  Array_modify,
  Array_set,
} from "./array_list";

export {
  Array_declare,
  Array_create,
  Array_fix,
  Array_getIndex_in_array,
} from "./array_declare";

export { Array_bitmap, Array_bitmap_get } from "./array_bitmap";
