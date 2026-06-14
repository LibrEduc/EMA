/**
 * @packageDocumentation
 * @module Arduino.BlockTypes
 * @description Type compatibility and dropdown options for typed blocks.
 * @remarks
 * Defines type compatibility rules for block connections.
 * Block type definitions live in `block_types/` (one file per category); the index aggregates them.
 *
 * To add a new block type:
 * 1. Choose the category file in block_types/ (or create one)
 * 2. Add `"block_name": "int"` (static) or `"__DYNAMIC__function_name"` (dynamic)
 * 3. If dynamic, add the function to DYNAMIC_TYPE_FUNCTIONS in block_types_registry.ts
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
/**
 * Registry version 2026-01-11
 */
export declare const BLOCK_TYPES_VERSION = "1.0.0";
/**
 * Type compatibility - Defines which types can be implicitly converted.
 *
 * Example:
 * - 'float' can receive 'int' (implicit promotion)
 * - 'int' cannot receive 'float' (loss of precision)
 *
 * Format: `target_type: [compatible_types]`
 * Compatible types always include the type itself.
 */
export declare const TYPE_COMPATIBILITY: Record<string, string[]>;
export declare const VARIABLE_TYPE_OPTIONS: string[];
/**
 * Returns the list of variable types available in dropdowns.
 */
export declare function getVariableTypeOptions(): string[];
/**
 * Returns compatible types for a target type.
 * @param targetType - Target type to match.
 * @returns List of compatible types (includes the target type).
 */
export declare function getCompatibleTypes(targetType: string | null | undefined): string[];
/**
 * Checks if a source type can connect to a target type.
 * @param sourceType - Source type from a connected block.
 * @param targetType - Target expected type.
 * @returns True when compatible.
 */
export declare function isTypeCompatible(sourceType: string | null | undefined, targetType: string | null | undefined): boolean;
/**
 * Block type registry.
 * Based on information extracted from BlocklyArduino in src/types/
 */
//# sourceMappingURL=block_types.d.ts.map