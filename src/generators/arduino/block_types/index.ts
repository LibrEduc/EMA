import { LOGIC_BLOCK_TYPES } from "./logic";
import { MATH_BLOCK_TYPES } from "./math";
import { PROCEDURES_BLOCK_TYPES } from "./procedures";
import { TEXT_BLOCK_TYPES } from "./text";
import { VARIABLES_BLOCK_TYPES } from "./variables";
import { LOOPS_BLOCK_TYPES } from "./loops";

export const BLOCK_TYPES = {
  ...LOGIC_BLOCK_TYPES,
  ...MATH_BLOCK_TYPES,
  ...LOOPS_BLOCK_TYPES,
  ...PROCEDURES_BLOCK_TYPES,
  ...TEXT_BLOCK_TYPES,
  ...VARIABLES_BLOCK_TYPES,
} as const;
