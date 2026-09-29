/**
 * @packageDocumentation
 * @module Arduino.BlockTypes
 * @description Type compatibility and dropdown options for typed blocks.
 * @remarks
 * Defines type compatibility rules for block connections.
 * Block type definitions live in `block_types/` (one file per category); the index aggregates them.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { LIST_VARIABLE_TYPE } from "./variable_utils";

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
] as const;

export type ArduinoTypeKey = (typeof ARDUINO_TYPE_KEYS)[number];

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
};

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
};

/**
 * Blockly.Msg key for a type dropdown label (e.g. `byte` → `VAR_CAST_TYPE_BYTE`).
 * @param typeKey - The `typeKey` argument.
 * @returns Result string.
 */
export function getArduinoTypeLabelKey(typeKey: string): string {
  return `VAR_CAST_TYPE_${typeKey.toUpperCase()}`;
}

/**
 * Internal µcBlockly type for connection checking.
 * @param typeKey - The `typeKey` argument.
 * @returns Result string.
 */
export function getInternalTypeForArduinoType(typeKey: string): string {
  if (typeKey === LIST_VARIABLE_TYPE) {
    return LIST_VARIABLE_TYPE;
  }
  return ARDUINO_TYPE_TO_INTERNAL[typeKey as ArduinoTypeKey] ?? typeKey;
}

/**
 * Maps Blockly output/check types to internal µcBlockly types. Colour blocks use Blockly check `Colour` but variables and arrays use `string`.
 * @param type - Type identifier.
 * @returns Result string.
 */
export function normalizeBlocklyCheckToInternalType(
  type: string | null | undefined,
): string | null {
  if (!type || type === "__NO_TYPE__" || type === "null" || type === "undefined") {
    return null;
  }
  if (type === "Boolean") {
    return "bool";
  }
  if (type === "Number") {
    return "int";
  }
  if (type === "String") {
    return "string";
  }
  if (type === "Colour" || type === "color" || type === "colour") {
    return "string";
  }
  return type;
}

/**
 * C++ type name emitted in generated Arduino code.
 * @param typeKey - The `typeKey` argument.
 * @returns Result string.
 */
export function getCppTypeName(typeKey: string): string {
  return ARDUINO_TYPE_TO_CPP[typeKey as ArduinoTypeKey] ?? typeKey;
}

/**
 * Vérifie qu'une valeur connectée en mode « contains » correspond au type du menu Array_declare.
 * @param sourceInternalType - The `sourceInternalType` argument.
 * @param arduinoTypeField - The `arduinoTypeField` argument.
 * @returns True when the condition holds.
 */
export function isDeclareContainsTypeCompatible(
  sourceInternalType: string,
  arduinoTypeField: string,
): boolean {
  const expected = getInternalTypeForArduinoType(arduinoTypeField);
  return isArrayElementTypeCompatible(sourceInternalType, expected);
}

/**
 * Compatibilité stricte pour les entrées des blocs liste (sans char ↔ string).
 * @param sourceInternalType - The `sourceInternalType` argument.
 * @param expectedInternalType - The `expectedInternalType` argument.
 * @returns True when the condition holds.
 */
export function isArrayElementTypeCompatible(
  sourceInternalType: string,
  expectedInternalType: string,
): boolean {
  if (sourceInternalType === expectedInternalType) {
    return true;
  }
  if (expectedInternalType === "float" && sourceInternalType === "int") {
    return true;
  }
  if (expectedInternalType === "long" && sourceInternalType === "int") {
    return true;
  }
  return false;
}

/**
 * Returns the ordered list of Arduino types for Blockly dropdown menus.
 * @returns Result string.
 */
export function getVariableTypeOptions(): string[] {
  return [...ARDUINO_TYPE_KEYS];
}

/**
 * True when the type can appear in Arduino scalar type dropdowns (excludes `list`).
 * @param type - Type identifier.
 * @returns Operation result.
 */
export function isArduinoScalarType(type: string | null | undefined): type is ArduinoTypeKey {
  return Boolean(type) && (ARDUINO_TYPE_KEYS as readonly string[]).includes(type as string);
}

/**
 * Returns an Arduino scalar type for Blockly UI / generators, or null (= {@link __NO_TYPE__}). Blockly-only types such as `list` are not Arduino types.
 * @param type - Type identifier.
 * @returns Result string.
 */
export function resolveArduinoScalarVariableType(
  type: string | null | undefined,
): string | null {
  if (!type || type === "__NO_TYPE__" || type === LIST_VARIABLE_TYPE) {
    return null;
  }
  return isArduinoScalarType(type) ? type : null;
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
 * Based on the centralized `block_types/` modules.
 */
