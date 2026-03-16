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

/**
 * @license
 * Copyright (C) 2023-2024 ASTUCE (Sébastien Canet microcompany)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { LOGIC_BLOCK_TYPES } from "./logic";
import { ARRAY_BLOCK_TYPES } from "./array";
import { MATH_BLOCK_TYPES } from "./math";
import { PROCEDURES_BLOCK_TYPES } from "./procedures";
import { TEXT_BLOCK_TYPES } from "./text";
import { VARIABLES_BLOCK_TYPES } from "./variables";
import { LOOPS_BLOCK_TYPES } from "./loops";
import { COLOUR_BLOCK_TYPES } from "./colour";
import { LIBRE_BLOCK_TYPES } from "./libre";
import { BOARD_BLOCK_TYPES } from "./board";

export const BLOCK_TYPES = {
  ...LOGIC_BLOCK_TYPES,
  ...ARRAY_BLOCK_TYPES,
  ...MATH_BLOCK_TYPES,
  ...LOOPS_BLOCK_TYPES,
  ...COLOUR_BLOCK_TYPES,
  ...LIBRE_BLOCK_TYPES,
  ...BOARD_BLOCK_TYPES,
  ...PROCEDURES_BLOCK_TYPES,
  ...TEXT_BLOCK_TYPES,
  ...VARIABLES_BLOCK_TYPES,
} as const;
