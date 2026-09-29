/**
 * @packageDocumentation
 * @module Arduino.BlockTypes.Variables
 * @description Block type mappings for variable blocks.
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

export const VARIABLES_BLOCK_TYPES = {
  variables_get_dynamic: "__DYNAMIC__variableLookup",
  variables_get: "__DYNAMIC__variableLookup",
  variables_cast: "__DYNAMIC__castType",
  variables_const: "null",
  variables_set_init: "null",
  variables_set_type: "null",
  variables_set_dynamic: "null",
  variables_local: "__DYNAMIC__localWrapper",
  variables_define: "null",
  // Legacy block type for workspaces saved with singular `variable_define`.
  variable_define: "null",
} as const;
