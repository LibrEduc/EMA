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
  math_round: "float",
  math_modulo: "int",
  math_random_int: "int",
  math_random_float: "float",
} as const;
