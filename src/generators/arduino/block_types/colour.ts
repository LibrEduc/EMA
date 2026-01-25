/**
 * @packageDocumentation
 * @module Arduino.BlockTypes.Colour
 * @description Block type mappings for colour blocks.
 * @remarks
 * Maps block IDs to static or dynamic types.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 * @version 1.0.0
 * @since 1.0.0
 */

export const COLOUR_BLOCK_TYPES = {
  colour_picker: "string",
  color_picker_custom: "string",
  color_picker_hsv: "string",
  colour_random: "string",
  colour_rgb: "string",
  colour_blend: "string",
} as const;
