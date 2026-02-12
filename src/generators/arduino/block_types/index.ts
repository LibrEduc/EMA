/**
 * @packageDocumentation
 * @module Arduino.BlockTypes.Index
 * @description Aggregates block type maps by category.
 * @remarks
 * Exports the combined block type registry entries.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 * @version 1.0.0
 * @since 1.0.0
 */

import { LOGIC_BLOCK_TYPES } from "./logic";
import { ARRAY_BLOCK_TYPES } from "./array";
import { MATH_BLOCK_TYPES } from "./math";
import { PROCEDURES_BLOCK_TYPES } from "./procedures";
import { TEXT_BLOCK_TYPES } from "./text";
import { VARIABLES_BLOCK_TYPES } from "./variables";
import { LOOPS_BLOCK_TYPES } from "./loops";
import { COLOUR_BLOCK_TYPES } from "./colour";

export const BLOCK_TYPES = {
  ...LOGIC_BLOCK_TYPES,
  ...ARRAY_BLOCK_TYPES,
  ...MATH_BLOCK_TYPES,
  ...LOOPS_BLOCK_TYPES,
  ...COLOUR_BLOCK_TYPES,
  ...PROCEDURES_BLOCK_TYPES,
  ...TEXT_BLOCK_TYPES,
  ...VARIABLES_BLOCK_TYPES,
} as const;
