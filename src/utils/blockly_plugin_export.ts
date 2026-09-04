/**
 * @packageDocumentation
 * @module Utils.BlocklyPluginExport
 * @description Resolve named exports from Blockly sample plugins (CJS under Node/tsx).
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Webpack often exposes `{ Name }`; Node ESM/tsx nests it under `default`.
 */
export function namedExportFromCjsPlugin<T>(
  mod: unknown,
  exportName: string,
): T {
  const record = mod as Record<string, unknown> | null;
  if (record && typeof record[exportName] === "function") {
    return record[exportName] as T;
  }
  const nested = record?.default as Record<string, unknown> | undefined;
  if (nested && typeof nested[exportName] === "function") {
    return nested[exportName] as T;
  }
  throw new Error(`Blockly plugin export missing: ${exportName}`);
}
