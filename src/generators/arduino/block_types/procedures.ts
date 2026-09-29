/**
 * @packageDocumentation
 * @module Arduino.BlockTypes.Procedures
 * @description Block type mappings for procedure blocks.
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

export const PROCEDURES_BLOCK_TYPES = {
  procedures_callreturn: "__DYNAMIC__procedureReturn",
} as const;
