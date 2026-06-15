/**
 * @packageDocumentation
 * @module Arduino.BlockTypes
 * @description Type compatibility and dropdown options for typed blocks.
 * @remarks
 * Defines type compatibility rules for block connections.
 * Block type definitions live in `block_types/` (one file per category); the index aggregates them.
 *
 * See `docs/TYPES_ET_COMPATIBILITES.md` for the full compatibility matrix, cast types
 * (`variables_cast`), and Blockly bridge rules.
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
export const BLOCK_TYPES_VERSION = '1.0.0';

/**
 * Type compatibility - Defines which types can be implicitly converted.
 *
 * Format: `target_type: [compatible_source_types]`
 * A connection is allowed when the source type is listed for the target type.
 * The target type is always included in its own list.
 *
 * @remarks
 * Blockly-specific aliases (`Number`, `Boolean`, `String`, …) are handled in
 * `block_types_registry.checkTypeCompatibility`. Cast menu types (`byte`, `uint`, …)
 * map to internal types via {@link ARDUINO_TYPE_TO_INTERNAL} — see `docs/TYPES_ET_COMPATIBILITES.md`.
 * Dropdown labels and values: {@link ARDUINO_TYPE_KEYS}, {@link getVariableTypeOptions}.
 */
export const TYPE_COMPATIBILITY: Record<string, string[]> = {
  // Numeric types
  'int': ['int'], // int accepts only int (no loss of precision)
  'float': ['float', 'int'], // float accepts float and int (implicit promotion)

  // Boolean types
  'bool': ['bool'], // bool accepts only bool

  // Text types
  'string': ['string', 'char'], // string accepts string and char
  'char': ['char'], // char accepts only char

  // Extended integer types (cast block / Arduino)
  'long': ['long', 'int'],

  // Special types
  'null': ['null'], // null accepts only null
  // No 'array' type: lists are typed by their entries (string, int, etc.)
};

/** Arduino type keys for all type dropdowns (variables, cast, procedures, lists). @see docs/TYPES_ET_COMPATIBILITES.md */
export const ARDUINO_TYPE_KEYS = [
  'char',
  'string',
  'bool',
  'byte',
  'int',
  'uint',
  'vint',
  'long',
  'ulong',
  'float',
  'char_array',
] as const;

/** @deprecated Use {@link ARDUINO_TYPE_KEYS} */
export const VARIABLE_CAST_TYPE_KEYS = ARDUINO_TYPE_KEYS;

export type ArduinoTypeKey = (typeof ARDUINO_TYPE_KEYS)[number];

/** @deprecated Use {@link ArduinoTypeKey} */
export type VariableCastTypeKey = ArduinoTypeKey;

/** Maps dropdown type key → internal µcBlockly type for connections. */
export const ARDUINO_TYPE_TO_INTERNAL: Record<ArduinoTypeKey, string> = {
  char: 'char',
  string: 'string',
  bool: 'bool',
  byte: 'int',
  int: 'int',
  uint: 'int',
  vint: 'int',
  long: 'long',
  ulong: 'int',
  float: 'float',
  char_array: 'string',
};

/** @deprecated Use {@link ARDUINO_TYPE_TO_INTERNAL} */
export const CAST_TYPE_TO_INTERNAL = ARDUINO_TYPE_TO_INTERNAL;

/** Maps dropdown type key → C++ type name in generated code. */
export const ARDUINO_TYPE_TO_CPP: Record<ArduinoTypeKey, string> = {
  char: 'char',
  string: 'String',
  bool: 'bool',
  byte: 'byte',
  int: 'int',
  uint: 'unsigned int',
  vint: 'volatile int',
  long: 'long',
  ulong: 'unsigned long',
  float: 'float',
  char_array: 'char*',
};

/** Blockly.Msg key for a type dropdown label (e.g. `byte` → `VAR_CAST_TYPE_BYTE`). */
export function getArduinoTypeLabelKey(typeKey: string): string {
  return `VAR_CAST_TYPE_${typeKey.toUpperCase()}`;
}

/**
 * Internal µcBlockly type for connection checking.
 */
export function getInternalTypeForArduinoType(typeKey: string): string {
  return ARDUINO_TYPE_TO_INTERNAL[typeKey as ArduinoTypeKey] ?? typeKey;
}

/** @deprecated Use {@link getInternalTypeForArduinoType} */
export const getInternalTypeForCast = getInternalTypeForArduinoType;

/**
 * C++ type name emitted in generated Arduino code.
 */
export function getCppTypeName(typeKey: string): string {
  return ARDUINO_TYPE_TO_CPP[typeKey as ArduinoTypeKey] ?? typeKey;
}

/**
 * Returns the ordered list of Arduino types for Blockly dropdown menus.
 */
export function getVariableTypeOptions(): string[] {
  return [...ARDUINO_TYPE_KEYS];
}

/**
 * Returns compatible types for a target type.
 * @param targetType - Target type to match.
 * @returns List of compatible types (includes the target type).
 */
export function getCompatibleTypes(targetType: string | null | undefined): string[] {
  if (!targetType) {
    return []; // No type, no compatibility
  }

  return TYPE_COMPATIBILITY[targetType] || [targetType];
}

/**
 * Checks if a source type can connect to a target type.
 * @param sourceType - Source type from a connected block.
 * @param targetType - Target expected type.
 * @returns True when compatible.
 */
export function isTypeCompatible(sourceType: string | null | undefined, targetType: string | null | undefined): boolean {
  if (!sourceType || !targetType) {
    return false;
  }

  if (sourceType === targetType) {
    return true;
  }

  const compatibleTypes = getCompatibleTypes(targetType);
  return compatibleTypes.includes(sourceType);
}

/**
 * Block type registry.
 * Based on information extracted from BlocklyArduino in src/types/
 */
