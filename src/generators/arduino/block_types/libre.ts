/**
 * @packageDocumentation
 * @module Arduino.BlockTypes.Libre
 * @description Block type mappings for « libre » (free) blocks.
 * @remarks
 * libre_in outputs Number → int; statement blocks have no output type.
 * @license GPL-3.0-or-later
 */

export const LIBRE_BLOCK_TYPES = {
  libre_in: "int",
} as const;
