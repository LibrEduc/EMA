/**
 * @packageDocumentation
 * @module Arduino.BlockTypes.Colour
 * @description Block type mappings for colour blocks.
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

/**
 * Use "Colour" (not "string") so Blockly connection checks succeed.
 * colour_picker etc. use setCheck("Colour"); getBlockType must match.
 * Internal inference maps Colour → string (see normalizeBlocklyCheckToInternalType).
 * The Arduino generator still emits string literals.
 */
export const COLOUR_BLOCK_TYPES = {
  colour_picker: "Colour",
  color_picker_custom: "Colour",
  color_picker_hsv: "Colour",
  colour_random: "Colour",
  colour_rgb: "Colour",
  colour_blend: "Colour",
} as const;
