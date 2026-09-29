/**
 * @packageDocumentation
 * @module Arduino.BlockTypes.Logic
 * @description Block type mappings for logic blocks.
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

export const LOGIC_BLOCK_TYPES = {
  logic_compare: "bool",
  logic_operation: "bool",
  logic_negate: "bool",
  logic_boolean: "bool",
  logic_null: "null",
  logic_ternary: "__DYNAMIC__ternary",
} as const;
