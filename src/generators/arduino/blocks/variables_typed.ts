/**
 * @packageDocumentation
 * @module Arduino.Generators.VariablesTyped
 * @description Typed variable block generators for Arduino.
 * @remarks
 * Implements generator functions for typed variable blocks.
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

import * as Blockly from "blockly";
import { ArduinoGenerator, Order } from "../arduino_generator";
import { getCppTypeName } from "../block_types";
import { getArduinoType } from "../arduino_types";
import { inferArrayElementTypeFromBlock } from "../block_types_registry";
import {
  emitLocalDeclaration,
  isArrayValueBlock,
  localDeclarationTag,
  resolveLocalVariableScope,
  unwrapValueBlock,
} from "../variable_scope";

const getArrayElementCppType = (arrayBlock: Blockly.Block): string => {
  let elementType = inferArrayElementTypeFromBlock(arrayBlock);
  if (!elementType || elementType === "__NO_TYPE__") {
    elementType = "int";
  }
  const arduinoTypeKey = elementType === "bool" ? "boolean" : elementType;
  return getArduinoType(arduinoTypeKey)?.cppName ?? elementType;
};

/**
 * Generator for variables_set_dynamic block.
 * This block sets the value of a typed variable.
 * @param block - The block to generate code for.
 * @param generator - The Arduino generator instance.
 * @returns Generated Arduino code.
 */
/**
 * Generates Arduino code for variables_set_dynamic with typing.
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Generated code string.
 */
export const variables_set_dynamic = function (
  block: Blockly.Block,
  generator: ArduinoGenerator,
): string | [string, number] {
  const valueBlock = block.getInputTargetBlock("VALUE");
  const innerValueBlock = unwrapValueBlock(valueBlock);

  const varName = generator.getVariableName(block.getFieldValue("VAR"));

  if (!varName || varName === "variable") {
    console.warn("variables_set_dynamic: Invalid variable name");
    return "// Error: Invalid variable name\n";
  }

  if (isArrayValueBlock(innerValueBlock)) {
    const scope = resolveLocalVariableScope(block);
    const tag = localDeclarationTag(scope, varName);
    const listCode =
      generator.valueToCode(block, "VALUE", Order.ASSIGNMENT) || "{}";
    const cppType = getArrayElementCppType(innerValueBlock!);
    emitLocalDeclaration(
      generator,
      scope,
      tag,
      `${cppType} ${varName}[] = ${listCode};`,
    );
    return "";
  }

  if (valueBlock?.type === "variables_local") {
    const scope = resolveLocalVariableScope(block);
    const tag = localDeclarationTag(scope, varName);
    const innerType = inferValueBlockType(valueBlock);
    const typeName = getCppTypeName(innerType || "int");
    const value =
      generator.valueToCode(block, "VALUE", Order.ASSIGNMENT) || "0";
    emitLocalDeclaration(
      generator,
      scope,
      tag,
      `${typeName} ${varName} = ${value};`,
    );
    return "";
  }

  const value = generator.valueToCode(block, "VALUE", Order.ASSIGNMENT) || "0";
  return varName + " = " + value + ";\n";
};

/**
 * Generator for variables_local block.
 * This block returns the wrapped value unchanged.
 */
/**
 * Generates Arduino code for the local wrapper block.
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Generated code tuple.
 */
export const variables_local = function (
  block: Blockly.Block,
  generator: ArduinoGenerator,
): [string, number] {
  const target = block.getInputTargetBlock("VALUE");
  if (target) {
    const generated = generator.blockToCode(target);
    if (Array.isArray(generated)) {
      return generated;
    }
    if (typeof generated === "string") {
      return [generated, Order.ATOMIC];
    }
  }
  const value = generator.valueToCode(block, "VALUE", Order.NONE) || "0";
  return [value, Order.ATOMIC];
};

/**
 * Generator for variables_get_dynamic block.
 * This block gets the value of a typed variable.
 * @param block - The block to generate code for.
 * @param generator - The Arduino generator instance.
 * @returns Generated Arduino code.
 */
/**
 * Generates Arduino code for variables_get_dynamic.
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Generated code tuple.
 */
export const variables_get_dynamic = function (
  block: Blockly.Block,
  generator: ArduinoGenerator,
): string | [string, number] {
  // Typed variable getter - use standard variable name resolution
  const varName = generator.getVariableName(block.getFieldValue('VAR'));

  // Ensure we have a valid variable name
  if (!varName || varName === 'variable') {
    console.warn('variables_get_dynamic: Invalid variable name');
    return ['0', Order.ATOMIC];
  }

  return [varName, Order.ATOMIC];
};

/**
 * Generates Arduino code for variables_cast: (type)(expression).
 */
export const variables_cast = function (
  block: Blockly.Block,
  generator: ArduinoGenerator,
): [string, number] {
  const value = generator.valueToCode(block, "VALUE", Order.NONE) || "0";
  const castType = getCppTypeName(block.getFieldValue("CAST_TYPE") || "int");
  return [`(${castType})(${value})`, Order.UNARY_NEGATION];
};

/**
 * Generator for variables_set_type block.
 * This block only changes the variable type in the workspace; no code is emitted.
 * @param _block - Blockly block instance (unused, for API consistency).
 * @param _generator - Arduino generator instance (unused, for API consistency).
 * @returns Empty string (no generated code).
 */
export const variables_set_type = function (
  _block: Blockly.Block,
  _generator: ArduinoGenerator,
): string {
  void _block;
  void _generator;
  return '';
};

const getDeclarationType = (
  block: Blockly.Block,
  fallback: string,
): string => {
  const variableId = block.getFieldValue("VAR");
  const variable = variableId
    ? block.workspace.getVariableMap().getVariableById(variableId)
    : null;
  const rawType =
    variable?.getType() && variable.getType() !== "__NO_TYPE__"
      ? variable.getType()
      : fallback;
  return getCppTypeName(rawType);
};

const normalizeValueType = (type: string | null | undefined): string | null => {
  if (!type || type === "__NO_TYPE__" || type === "null" || type === "undefined") {
    return null;
  }
  if (type === "Boolean") return "bool";
  if (type === "Number") return "int";
  if (type === "String") return "string";
  return type;
};

const inferValueBlockType = (valueBlock: Blockly.Block | null): string | null => {
  const inner = unwrapValueBlock(valueBlock);
  if (!inner) {
    return null;
  }
  const typed = inner as Blockly.Block & { getBlockType?: () => string | null };
  const rawType = typed.getBlockType ? typed.getBlockType() : null;
  const normalized = normalizeValueType(rawType);
  if (normalized) {
    return normalized;
  }
  const check = inner.outputConnection?.getCheck();
  const checkType = Array.isArray(check) ? check[0] : check;
  return normalizeValueType(checkType);
};

/**
 * Generates Arduino code for const variable declaration.
 * Always emits a declaration when the block has a variable name; type is inferred
 * from the connected block when present, otherwise from the variable model or default "int".
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Generated code string.
 */
export const variables_const = function (
  block: Blockly.Block,
  generator: ArduinoGenerator,
): string {
  const varName = generator.getVariableName(block.getFieldValue("VAR"));
  if (!varName) {
    return "";
  }
  const value =
    generator.valueToCode(block, "VAL_CONST", Order.ASSIGNMENT) || "0";
  const valueBlock = block.getInputTargetBlock("VAL_CONST");
  const inferredType = inferValueBlockType(valueBlock);
  const typeName = inferredType
    ? getDeclarationType(block, inferredType)
    : getDeclarationType(block, "int");
  const declaration = `const ${typeName} ${varName} = ${value};`;
  generator.addDefinition(`var_const_${varName}`, declaration);
  generator.addVariable(varName, declaration);
  return "";
};

/**
 * Generates Arduino code for typed variable initialization.
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Generated code string.
 */
export const variables_set_init = function (
  block: Blockly.Block,
  generator: ArduinoGenerator,
): string {
  const value =
    generator.valueToCode(block, "VALUE", Order.ASSIGNMENT) || "0";
  const varName = generator.getVariableName(block.getFieldValue("VAR"));
  const typeField = block.getFieldValue("VARIABLE_SETTYPE_TYPE") || "int";
  const typeName = getDeclarationType(block, typeField);
  const declaration = `${typeName} ${varName} = ${value};`;
  generator.addDefinition(`var_init_${varName}`, declaration);
  generator.addVariable(varName, declaration);
  return "";
};

/**
 * Generates Arduino code for variable definition blocks.
 * Emits a preprocessor macro: #define varName value (e.g. #define toto true).
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Generated code string.
 */
export const variables_define = function (
  block: Blockly.Block,
  generator: ArduinoGenerator,
): string {
  const varName = generator.getVariableName(block.getFieldValue("VAR"));
  if (!varName) {
    return "";
  }
  const value = generator.valueToCode(block, "VALUE", Order.ASSIGNMENT) || "0";
  const declaration = `#define ${varName} ${value}`;
  generator.addDefinition(`define_${varName}`, declaration);
  return "";
};

export const variable_define = variables_define;
