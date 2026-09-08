/**
 * @packageDocumentation
 * @module Arduino.Generator.Debug
 * @description Debug snapshot helpers for ArduinoGenerator state.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { PinUsageMap } from "./arduino_generator_pins";

/** Serializable view of ArduinoGenerator bags for debugging. */
export type ArduinoGeneratorDebugState = {
  includes: Record<string, string>;
  defines: Record<string, string>;
  preamble: Record<string, string>;
  variables: Record<string, string>;
  codeFunctions: Record<string, string>;
  userFunctions: Record<string, string>;
  functionNames: Record<string, unknown>;
  setups: Record<string, string>;
  loop: Record<string, string>;
  pins: Record<string, unknown>;
  variableTypes: Record<string, string>;
  localVariables: Record<string, Record<string, string>>;
  registeredGenerators: string[];
};

/** Mutable bags reset together during init / debug reset. */
export type ArduinoGeneratorBags = {
  includes: Record<string, string>;
  defines: Record<string, string>;
  preamble: Record<string, string>;
  variables: Record<string, string>;
  variableTypes: Record<string, string>;
  localVariables: Record<string, Record<string, string>>;
  codeFunctions: Record<string, string>;
  userFunctions: Record<string, string>;
  functionNames: Record<string, unknown>;
  setups: Record<string, string>;
  loop: Record<string, string>;
  pins: PinUsageMap;
  arrayDeclarations: string[];
};

/**
 * Creates empty generator bags (same shape as ArduinoGenerator.init reset).
 * @returns Fresh empty bags.
 */
export function createEmptyArduinoGeneratorBags(): ArduinoGeneratorBags {
  return {
    includes: Object.create(null),
    defines: Object.create(null),
    preamble: Object.create(null),
    variables: Object.create(null),
    variableTypes: Object.create(null),
    localVariables: Object.create(null),
    codeFunctions: Object.create(null),
    userFunctions: Object.create(null),
    functionNames: Object.create(null),
    setups: Object.create(null),
    loop: Object.create(null),
    pins: Object.create(null),
    arrayDeclarations: [],
  };
}

/**
 * Builds a debug snapshot from current generator bags.
 * @param bags - Current bag references.
 * @param registeredGenerators - Keys of forBlock.
 * @returns Snapshot object.
 */
export function buildArduinoGeneratorDebugState(
  bags: {
    includes: Record<string, string>;
    defines: Record<string, string>;
    preamble: Record<string, string>;
    variables: Record<string, string>;
    codeFunctions: Record<string, string>;
    userFunctions: Record<string, string>;
    functionNames: Record<string, unknown>;
    setups: Record<string, string>;
    loop: Record<string, string>;
    pins: Record<string, unknown>;
    variableTypes: Record<string, string>;
    localVariables: Record<string, Record<string, string>>;
  },
  registeredGenerators: string[],
): ArduinoGeneratorDebugState {
  return {
    includes: bags.includes,
    defines: bags.defines,
    preamble: bags.preamble,
    variables: bags.variables,
    codeFunctions: bags.codeFunctions,
    userFunctions: bags.userFunctions,
    functionNames: bags.functionNames,
    setups: bags.setups,
    loop: bags.loop,
    pins: bags.pins,
    variableTypes: bags.variableTypes,
    localVariables: bags.localVariables,
    registeredGenerators,
  };
}
