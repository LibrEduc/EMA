/**
 * @packageDocumentation
 * @module WorkspaceFile
 * @description Default save/load file extension for µcBlockly workspaces.
 * @remarks
 * Content is always Blockly JSON serialization (`application/json`).
 * The product extension `.µcb` identifies µcBlockly projects; `.json` remains
 * accepted on load for interoperability with plain Blockly exports.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/** Default file extension for µcBlockly workspace saves (JSON content). */
export const UCBLOCKLY_WORKSPACE_FILE_EXT = ".µcb";

/** MIME type of workspace save files (Blockly JSON). */
export const UCBLOCKLY_WORKSPACE_FILE_MIME = "application/json";

/**
 * `accept` attribute for file inputs: product extension + legacy `.json`.
 */
export const UCBLOCKLY_WORKSPACE_FILE_ACCEPT =
  ".µcb,.json,application/json";

/** Builds a dated default download name, e.g. `workspace_2026-08-20.µcb`. */
export function defaultUcBlocklyWorkspaceFilename(
  date = new Date(),
): string {
  return `workspace_${date.toISOString().slice(0, 10)}${UCBLOCKLY_WORKSPACE_FILE_EXT}`;
}
