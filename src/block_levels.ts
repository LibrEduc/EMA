/**
 * @packageDocumentation
 * @module BlockLevels
 * @description Pedagogical levels (1, 2, 3) on Blockly block definitions.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Blockly from "blockly";

/** Default levels for all blocks (toolbox / workspace filtering). */
export const DEFAULT_BLOCK_LEVELS = "1, 2, 3";

export type BlockDefinitionWithLevels = {
  levels?: string;
  init?: (...args: never[]) => void;
  [key: string]: unknown;
};

/**
 * Applies levels to each Blockly.Blocks entry.
 * @param levels - The `levels` argument.
 * @returns Numeric result.
 */
export function applyLevelsToAllBlockDefinitions(
  levels: string = DEFAULT_BLOCK_LEVELS,
): number {
  let count = 0;
  for (const blockType of Object.keys(Blockly.Blocks)) {
    const def = Blockly.Blocks[blockType] as BlockDefinitionWithLevels | undefined;
    if (!def || typeof def !== "object") {
      continue;
    }
    def.levels = levels;
    count++;
  }
  return count;
}

/**
 * Retourne la chaîne levels d'un type de bloc, ou undefined.
 * @param blockType - The `blockType` argument.
 * @returns Result string.
 */
export function getBlockDefinitionLevels(blockType: string): string | undefined {
  const def = Blockly.Blocks[blockType] as BlockDefinitionWithLevels | undefined;
  return def?.levels;
}

/**
 * Parse levels CSV en liste de numéros.
 * @param levels - The `levels` argument.
 * @returns Numeric result.
 */
export function parseBlockLevels(levels: string | undefined): number[] {
  if (!levels?.trim()) {
    return [];
  }
  return levels
    .split(",")
    .map((part) => Number.parseInt(part.trim(), 10))
    .filter((n) => !Number.isNaN(n));
}
