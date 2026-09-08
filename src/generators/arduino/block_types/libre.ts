/**
 * @packageDocumentation
 * @module Arduino.BlockTypes.Libre
 * @description Block type mappings for « libre » (free) blocks.
 * @remarks
 * libre_in outputs Number → int; statement blocks have no output type.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export const LIBRE_BLOCK_TYPES = {
  libre_in: "int",
} as const;
