/**
 * @packageDocumentation
 * @module Arduino.BlockTypes.Variables
 * @description Block type mappings for variable blocks.
 * @remarks
 * Maps block IDs to static or dynamic types.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 * @version 1.0.0
 * @since 1.0.0
 */

export const VARIABLES_BLOCK_TYPES = {
  variables_get_dynamic: "__DYNAMIC__variableLookup",
  variables_get: "__DYNAMIC__variableLookup",
  variables_const: "null",
  variables_set_init: "null",
  variables_set_type: "null",
} as const;
