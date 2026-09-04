/**
 * @packageDocumentation
 * @module BlocklyCategories.I18n
 * @description Blockly.Msg helpers and typed-variable warning strings.
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Blockly from "blockly";

/**
 * Retrieves a Blockly message by key.
 * @param key - Message key to look up.
 * @returns The localized message or the key if missing.
 */
export const getBlocklyMsg = (key: string): string => {
  const msg = (Blockly.Msg as Record<string, string> | undefined)?.[key];
  return msg || key;
};

/**
 * Retrieves a Blockly message or returns a fallback.
 * @param key - Message key to look up.
 * @param fallback - Fallback text when the key is missing.
 * @returns The localized message or the fallback value.
 */
export const getBlocklyMsgOr = (key: string, fallback: string): string => {
  const msg = getBlocklyMsg(key);
  return msg === key ? fallback : msg;
};

/**
 * Normalizes a string to a single character.
 * @param value - Input string value.
 * @returns First character or empty string for falsy input.
 */
export const validateSingleChar = (value: string): string => {
  if (!value) {
    return "";
  }
  return value.charAt(0);
};

/** Returns the warning text for untyped variables. */
export const getUntypedWarningText = (): string =>
  getBlocklyMsg("TYPED_VAR_UNTYPED_WARNING");

/** Warning when a list block has no connected element values yet. */
export const getArrayListUntypedWarningText = (): string =>
  getBlocklyMsgOr(
    "ARRAY_LIST_UNTYPED_WARNING",
    "Untyped list. Connect values to determine the type.",
  );

/**
 * Warning when several list declaration blocks share the same variable.
 * Same conflict idea as VARIABLES_CONST_WARNING for const ownership.
 */
export const getDuplicateListDeclarationWarningText = (): string =>
  getBlocklyMsgOr(
    "ARRAY_LIST_DUPLICATE_WARNING",
    "This list is already defined. Rename the variable or remove the extra declaration.",
  );

/**
 * Builds the warning text for type mismatches.
 * @param varType - Variable's declared type.
 * @param connectedType - Type inferred from the connected block.
 * @returns Localized mismatch warning message.
 */
export const getTypeMismatchWarningText = (
  varType: string,
  connectedType: string,
): string =>
  getBlocklyMsg("TYPED_VAR_TYPE_MISMATCH")
    .replace("%1", varType)
    .replace("%2", connectedType);

/** Returns the warning text for const assignments. */
export const getConstWarningText = (): string =>
  getBlocklyMsgOr("VARIABLES_CONST_WARNING", "const: cannot assign");
