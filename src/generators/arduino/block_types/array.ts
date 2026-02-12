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
 * Block type mappings for Array category (s4e blocks).
 */
export const ARRAY_BLOCK_TYPES = {
  Array_with: "array",
  Array_list_3: "array", // legacy alias
  Array_getIndex_in_list: "null", // dynamic: element type
  Array_modify: "null",
  Array_declare: "null",
  Array_create: "null",
  Array_fix: "null",
  Array_getIndex_in_array: "null", // dynamic: element type
} as const;
