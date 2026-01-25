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
  size: number; // in bytes
  minValue: number;
  maxValue: number;
  defaultValue: string;
  description: string;
}

/**
 * Supported Arduino data types with their properties.
 */
export const ARDUINO_TYPES: Record<string, ArduinoType> = {
  'void': {
    name: 'void',
    cppName: 'void',
    size: 0,
    minValue: 0,
    maxValue: 0,
    defaultValue: '',
    description: 'No return value'
  },
  'boolean': {
    name: 'boolean',
    cppName: 'bool',
    size: 1,
    minValue: 0,
    maxValue: 1,
    defaultValue: 'false',
    description: 'Boolean value (true/false)'
  },
  'char': {
    name: 'char',
    cppName: 'char',
    size: 1,
    minValue: -128,
    maxValue: 127,
    defaultValue: '0',
    description: '8-bit signed character'
  },
  'unsigned char': {
    name: 'unsigned char',
    cppName: 'unsigned char',
    size: 1,
    minValue: 0,
    maxValue: 255,
    defaultValue: '0',
    description: '8-bit unsigned character'
  },
  'byte': {
    name: 'byte',
    cppName: 'uint8_t',
    size: 1,
    minValue: 0,
    maxValue: 255,
    defaultValue: '0',
    description: '8-bit unsigned number'
  },
  'int': {
    name: 'int',
    cppName: 'int',
    size: 2,
    minValue: -32768,
    maxValue: 32767,
    defaultValue: '0',
    description: '16-bit signed integer'
  },
  'unsigned int': {
    name: 'unsigned int',
    cppName: 'unsigned int',
    size: 2,
    minValue: 0,
    maxValue: 65535,
    defaultValue: '0',
    description: '16-bit unsigned integer'
  },
  'word': {
    name: 'word',
    cppName: 'uint16_t',
    size: 2,
    minValue: 0,
    maxValue: 65535,
    defaultValue: '0',
    description: '16-bit unsigned number'
  },
  'long': {
    name: 'long',
    cppName: 'long',
    size: 4,
    minValue: -2147483648,
    maxValue: 2147483647,
    defaultValue: '0L',
    description: '32-bit signed integer'
  },
  'unsigned long': {
    name: 'unsigned long',
    cppName: 'unsigned long',
    size: 4,
    minValue: 0,
    maxValue: 4294967295,
    defaultValue: '0UL',
    description: '32-bit unsigned integer'
  },
  'float': {
    name: 'float',
    cppName: 'float',
    size: 4,
    minValue: -3.4028235E+38,
    maxValue: 3.4028235E+38,
    defaultValue: '0.0',
    description: '32-bit floating point'
  },
  'double': {
    name: 'double',
    cppName: 'double',
    size: 4,
    minValue: -3.4028235E+38,
    maxValue: 3.4028235E+38,
    defaultValue: '0.0',
    description: '32-bit floating point (same as float on Arduino)'
  },
  'string': {
    name: 'string',
    cppName: 'String',
    size: 0, // Variable size
    minValue: 0,
    maxValue: 0,
    defaultValue: '""',
    description: 'String object'
  }
};

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
export function getArduinoType(typeName: string): ArduinoType | undefined {
  return ARDUINO_TYPES[typeName];
}

/**
 * Get all available Arduino type names.
 * @returns Array of type names.
 */
/**
 * Returns the list of available Arduino type names.
 */
export function getArduinoTypeNames(): string[] {
  return Object.keys(ARDUINO_TYPES);
}

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
export function isValueValidForType(typeName: string, value: number): boolean {
  const type = getArduinoType(typeName);
  if (!type) return false;

  if (type.name === 'void') return false;
  if (type.name === 'boolean') return value === 0 || value === 1;
  if (type.name === 'string') return true; // String validation would be more complex

  return value >= type.minValue && value <= type.maxValue;
}

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
export function getDefaultValueForType(typeName: string): string {
  const type = getArduinoType(typeName);
  return type ? type.defaultValue : '0';
}
