/**
 * @packageDocumentation Arduino data types and their properties
 * @author scanet\@libreduc.cc (Sébastien Canet)
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
export declare function getArduinoType(typeName: string): ArduinoType | undefined;
/**
 * Get all available Arduino type names.
 * @returns Array of type names.
 */
export declare function getArduinoTypeNames(): string[];
/**
 * Check if a value is valid for a given Arduino type.
 * @param typeName - Name of the type.
 * @param value - Value to check.
 * @returns True if value is valid for the type.
 */
export declare function isValueValidForType(typeName: string, value: number): boolean;
/**
 * Get the default value for an Arduino type.
 * @param typeName - Name of the type.
 * @returns Default value as string.
 */
export declare function getDefaultValueForType(typeName: string): string;
//# sourceMappingURL=arduino_types.d.ts.map