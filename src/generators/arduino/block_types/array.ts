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
