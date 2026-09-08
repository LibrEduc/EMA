/**
 * @packageDocumentation
 * @module BlocklyCategories.Checks
 * @description Blockly setCheck / setOutput helpers for µcBlockly types.
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { getCompatibleTypesForCheck } from "../../generators/arduino/block_types_registry";
import {
  getInternalTypeForArduinoType,
  normalizeBlocklyCheckToInternalType,
} from "../../generators/arduino/block_types";

/**
 * Converts a variable type into Blockly connection checks.
 * @param type - Variable or inferred type.
 * @param strict - When true, int does not accept Number (so float blocks are rejected); for list "define" downward type checking.
 * @returns Array of compatible checks or null when not applicable.
 * @remarks
 * Built on {@link getCompatibleTypesForCheck} from `block_types_registry`.
 * See `docs/TYPES_ET_COMPATIBILITES.md` for the mapping table (bool→Boolean, int→Number, etc.).
 */
export const getBlocklyCompatibleChecks = (
  type: string | null | undefined,
  strict?: boolean,
): string[] | null => {
  const compatibleTypes = getCompatibleTypesForCheck(type);
  if (!compatibleTypes) {
    return null;
  }
  const checks = new Set(compatibleTypes);
  if (checks.has("bool")) {
    checks.add("Boolean");
  }
  if (!strict) {
    if (checks.has("int") || checks.has("float") || checks.has("long")) {
      checks.add("Number");
    }
  } else {
    if (checks.has("float")) {
      checks.add("Number");
    }
  }
  if (checks.has("string")) {
    checks.add("String");
    checks.add("Colour");
  }
  if (checks.has("array")) {
    checks.add("Array");
  }
  return Array.from(checks);
};

/**
 * Checks Blockly pour les entrées des blocs Array_with / Array_declare / Array_create.
 * Pas de compatibilité char ↔ string.
 */
function buildArrayElementBlocklyChecks(
  internalType: string,
  options?: { includeArray?: boolean },
): string[] {
  const normalized =
    normalizeBlocklyCheckToInternalType(internalType) ?? internalType;
  let checks: string[];
  if (normalized === "char") {
    checks = ["char"];
  } else if (normalized === "string") {
    checks = ["string", "String", "Colour"];
  } else {
    const base = getBlocklyCompatibleChecks(normalized, true) ?? [normalized];
    checks = base.filter((check) => check !== "char");
    if (
      (normalized === "int" || normalized === "float" || normalized === "long") &&
      !checks.includes("Number")
    ) {
      checks.push("Number");
    }
  }
  if (options?.includeArray && !checks.includes("Array")) {
    checks.push("Array");
  }
  return checks;
}

/**
 * Checks Blockly pour l'entrée contenu d'Array_declare (size ou contains). Le filtrage sémantique int/float/etc. est complété par StrictConnectionChecker.
 * @param choix - The `choix` argument.
 * @param arduinoTypeField - The `arduinoTypeField` argument.
 * @returns Result string.
 */
export const getDeclareContenuBlocklyChecks = (
  choix: string,
  arduinoTypeField: string,
): string[] => {
  if (choix === "c1") {
    return ["int", "Number"];
  }
  const internal = getInternalTypeForArduinoType(arduinoTypeField);
  return buildArrayElementBlocklyChecks(internal, { includeArray: true });
};

/**
 * Checks Blockly pour les éléments d'un littéral de liste ou de Array_with.
 * @param internalType - The `internalType` argument.
 * @returns Result string.
 */
export const getDeclareElementBlocklyChecks = (
  internalType: string,
): string[] => {
  return buildArrayElementBlocklyChecks(internalType);
};

/**
 * Checks Blockly pour les entrées d'index de tableau (entiers uniquement).
 * @returns Result string.
 */
export const getArrayIndexBlocklyChecks = (): string[] => ["int", "Number"];
