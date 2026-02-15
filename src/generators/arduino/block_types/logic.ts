/**
 * @packageDocumentation
 * @module Arduino.BlockTypes.Logic
 * @description Block type mappings for logic blocks.
 * @remarks
 * Maps block IDs to static or dynamic types.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 * @version 1.0.0
 * @since 1.0.0
 */

export const LOGIC_BLOCK_TYPES = {
  logic_compare: "bool",
  logic_operation: "bool",
  logic_negate: "bool",
  logic_boolean: "bool",
  logic_null: "null",
  logic_ternary: "__DYNAMIC__ternary",
} as const;
