/**
 * @packageDocumentation
 * @module BlockLevels
 * @description Niveaux pédagogiques (1, 2, 3) sur les définitions de blocs Blockly.
 * @license GPL-3.0-or-later
 */

/**
 * @license
 * Copyright (C) 2023-2024 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Blockly from "blockly";

/** Niveaux par défaut pour tous les blocs (filtrage toolbox / workspace). */
export const DEFAULT_BLOCK_LEVELS = "1, 2, 3";

export type BlockDefinitionWithLevels = {
  levels?: string;
  init?: (...args: never[]) => void;
  [key: string]: unknown;
};

/**
 * Applique levels sur chaque entrée de Blockly.Blocks.
 * @param levels - Chaîne CSV (ex. "1, 2, 3").
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
 */
export function getBlockDefinitionLevels(blockType: string): string | undefined {
  const def = Blockly.Blocks[blockType] as BlockDefinitionWithLevels | undefined;
  return def?.levels;
}

/**
 * Parse levels CSV en liste de numéros.
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
