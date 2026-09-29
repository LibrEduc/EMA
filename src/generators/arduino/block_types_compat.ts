/**
 * @packageDocumentation
 * @module Arduino.BlockTypesCompat
 * @description Type compatibility helpers for Blockly connection checks.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { getCompatibleTypes, isTypeCompatible } from "./block_types";

/**
 * Returns Blockly check types compatible with a given µcBlockly type.
 * @param type - Normalized type string.
 * @returns Array of checks or null when unavailable.
 */
export function getCompatibleTypesForCheck(type: string | null | undefined): string[] | null {
  if (!type) {
    return null; // No type restriction
  }

  const compatibleTypes = getCompatibleTypes(type);

  // If only one type (itself), return it as a string for Blockly
  // If multiple types, return as array
  if (compatibleTypes.length === 1) {
    return [compatibleTypes[0]];
  }

  return compatibleTypes;
}

/**
 * Checks whether two types are compatible for connection.
 * @param sourceType - Source type from the connected block.
 * @param targetType - Target expected type.
 * @returns True when compatible.
 */
export function checkTypeCompatibility(
  sourceType: string | null | undefined,
  targetType: string | null | undefined,
): boolean {
  if (!sourceType || !targetType) {
    return false;
  }

  if (
    (sourceType === "Boolean" || sourceType === "bool") &&
    (targetType === "Boolean" || targetType === "bool")
  ) {
    return true;
  }

  if (
    (sourceType === "String" || sourceType === "string") &&
    (targetType === "String" || targetType === "string")
  ) {
    return true;
  }
  // Colour blocks: allow Colour to connect to Colour or String
  if (
    (sourceType === "Colour" || sourceType === "color" || sourceType === "colour") &&
    (targetType === "Colour" || targetType === "color" || targetType === "colour" ||
     targetType === "String" || targetType === "string")
  ) {
    return true;
  }
  if (
    (sourceType === "String" || sourceType === "string") &&
    (targetType === "Colour" || targetType === "color" || targetType === "colour")
  ) {
    return true;
  }
  if (
    sourceType === "char" &&
    (targetType === "String" || targetType === "string")
  ) {
    return true;
  }

  if (
    (sourceType === "Number" || sourceType === "number") &&
    (targetType === "int" || targetType === "float" || targetType === "long")
  ) {
    return true;
  }

  if (
    (sourceType === "int" || sourceType === "float" || sourceType === "long") &&
    (targetType === "Number" || targetType === "number")
  ) {
    return true;
  }

  if (
    (sourceType === "Array" || sourceType === "array") &&
    (targetType === "Array" || targetType === "array")
  ) {
    return true;
  }

  return isTypeCompatible(sourceType, targetType);
}
