/**
 * @packageDocumentation
 * @module Arduino.BlockTypes.Variables
 * @description Block type mappings for variable blocks.
 * @remarks
 * Maps block IDs to static or dynamic types.
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
  /** @deprecated Alias legacy — voir `variables_define`. */
  variable_define: "null",
} as const;
