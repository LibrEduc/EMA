/**
 * @packageDocumentation
 * @module Arduino.Types
 * @description Arduino data types and their properties.
 * @remarks
 * Defines Arduino data types, labels, and metadata.
 * @license GPL-3.0-or-later
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */
/**
 * @license
 * Copyright 2023 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
/**
 * Arduino data type definition interface.
 */
export interface ArduinoType {
    name: string;
    cppName: string;
    size: number;
    minValue: number;
    maxValue: number;
    defaultValue: string;
    description: string;
}
/**
 * Supported Arduino data types with their properties.
 */
export declare const ARDUINO_TYPES: Record<string, ArduinoType>;
/**
 * Get Arduino type information by name.
 * @param typeName - Name of the type.
 * @returns Arduino type information or undefined if not found.
 */
/**
 * Looks up an Arduino type definition by name.
 * @param typeName - Type name to resolve.
 * @returns Type definition or undefined.
 */
export declare function getArduinoType(typeName: string): ArduinoType | undefined;
/**
 * Get all available Arduino type names.
 * @returns Array of type names.
 */
/**
 * Returns the list of available Arduino type names.
 */
export declare function getArduinoTypeNames(): string[];
/**
 * Check if a value is valid for a given Arduino type.
 * @param typeName - Name of the type.
 * @param value - Value to check.
 * @returns True if value is valid for the type.
 */
/**
 * Checks whether a numeric value fits the given Arduino type.
 * @param typeName - Target Arduino type name.
 * @param value - Numeric value to validate.
 * @returns True when the value is within range.
 */
export declare function isValueValidForType(typeName: string, value: number): boolean;
/**
 * Get the default value for an Arduino type.
 * @param typeName - Name of the type.
 * @returns Default value as string.
 */
/**
 * Returns a default literal for a given Arduino type.
 * @param typeName - Target Arduino type name.
 * @returns Default literal string.
 */
export declare function getDefaultValueForType(typeName: string): string;
//# sourceMappingURL=arduino_types.d.ts.map