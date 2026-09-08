/**
 * @packageDocumentation
 * @module Arduino.Generator.Validate
 * @description Lightweight validation helpers for generated Arduino sketches.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/** Result of a soft validation pass over generator bags. */
export type GeneratedCodeValidation = {
  isValid: boolean;
  warnings: string[];
  errors: string[];
};

const BUILT_IN_VARS = ["HIGH", "LOW", "INPUT", "OUTPUT", "INPUT_PULLUP"] as const;

const BUILT_IN_FUNCS = [
  "pinMode",
  "digitalWrite",
  "digitalRead",
  "analogRead",
  "analogWrite",
  "delay",
  "millis",
  "Serial.begin",
  "Serial.print",
  "Serial.println",
] as const;

/**
 * @param varName - Variable name to check.
 * @returns True when the name is a built-in Arduino constant/mode.
 */
export function isBuiltInArduinoVariable(varName: string): boolean {
  return (BUILT_IN_VARS as readonly string[]).includes(varName);
}

/**
 * @param funcName - Function name to check.
 * @returns True when the name is a common built-in Arduino API.
 */
export function isBuiltInArduinoFunction(funcName: string): boolean {
  return (BUILT_IN_FUNCS as readonly string[]).includes(funcName);
}

/**
 * Soft-checks used symbols against generator bags and pin warnings.
 * @param usedVariables - Variable names considered used.
 * @param declaredVariables - Map of declared variable tags.
 * @param calledFunctions - Function names considered called.
 * @param definedFunctionNames - Names present in functionNames_.
 * @param pinWarnings - Warnings from pin usage validation.
 * @returns Validation result.
 */
export function validateGeneratedArduinoCode(
  usedVariables: string[],
  declaredVariables: Record<string, string>,
  calledFunctions: string[],
  definedFunctionNames: string[],
  pinWarnings: string[],
): GeneratedCodeValidation {
  const warnings: string[] = [];
  const errors: string[] = [];

  for (const varName of usedVariables) {
    if (
      declaredVariables[varName] === undefined &&
      !isBuiltInArduinoVariable(varName)
    ) {
      warnings.push(`Variable '${varName}' is used but not declared`);
    }
  }

  for (const funcName of calledFunctions) {
    if (
      !definedFunctionNames.includes(funcName) &&
      !isBuiltInArduinoFunction(funcName)
    ) {
      warnings.push(`Function '${funcName}' is called but not defined`);
    }
  }

  warnings.push(...pinWarnings);

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
  };
}

/**
 * Builds the Arduino source for a user procedure definition.
 * @param functionName - Name of the function.
 * @param parameters - Parameter declarations (already typed strings).
 * @param returnType - Return type.
 * @param body - Function body code.
 * @returns Complete function source.
 */
export function formatUserFunctionDefinition(
  functionName: string,
  parameters: string[],
  returnType: string,
  body: string,
): string {
  const paramList = parameters.length > 0 ? parameters.join(", ") : "";
  return `${returnType} ${functionName}(${paramList}) {\n${body}\n}`;
}
