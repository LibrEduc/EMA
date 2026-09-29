/**
 * @packageDocumentation
 * @module Toolbox.Types
 * @description Toolbox TypeScript types and level-application helper.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { DEFAULT_BLOCK_LEVELS } from "./block_levels";

/** Default pedagogical levels for toolbox block entries. */
export { DEFAULT_BLOCK_LEVELS as DEFAULT_TOOLBOX_BLOCK_LEVELS } from "./block_levels";

/**
 * Block entry in a toolbox category (flat block with type).
 */
export type ToolboxBlockEntry = {
  kind: string;
  type: string;
  /** Pedagogical levels allowed (e.g. "1, 2, 3"). */
  levels?: string;
  fields?: { [key: string]: number | string };
  inputs?: {
    [key: string]: {
      shadow?: { type?: string; fields?: { [key: string]: number | string } };
      block?: { type: string };
    };
  };
};

/** Font Awesome icon config for a category (Blockly cssConfig). */
export type ToolboxCategoryCssConfig = {
  icon?: string;
  openicon?: string;
  closedicon?: string;
};

/** Helper: FA icon class for the toolbox. */
export const toolboxIcon = (faIcon: string): ToolboxCategoryCssConfig => ({
  icon: `customIcon fas ${faIcon}`,
});

export type ToolboxCategoryContentEntry =
  | ToolboxBlockEntry
  | {
      kind: string;
      name?: string;
      categorystyle?: string;
      custom?: string;
      cssConfig?: ToolboxCategoryCssConfig;
      contents?: ToolboxCategoryContentEntry[];
    };

/**
 * Top-level toolbox configuration.
 */
export type ToolboxConfiguration = {
  kind: string;
  contents: Array<{
    kind: string;
    name?: string;
    categorystyle?: string;
    custom?: string;
    cssConfig?: ToolboxCategoryCssConfig;
    contents?: ToolboxCategoryContentEntry[];
    blockxml?: string;
  }>;
};

/**
 * Add `levels` to every kind:"block" entry (recursive).
 * @param toolbox - Toolbox configuration.
 * @param levels - Levels string to apply.
 * @returns Cloned toolbox with levels set.
 */
export function applyToolboxBlockLevels(
  toolbox: ToolboxConfiguration,
  levels: string = DEFAULT_BLOCK_LEVELS,
): ToolboxConfiguration {
  const clone = JSON.parse(JSON.stringify(toolbox)) as ToolboxConfiguration;
  const walk = (items: ToolboxCategoryContentEntry[] | undefined): void => {
    if (!items) {
      return;
    }
    for (const item of items) {
      if (item.kind === "block" && "type" in item) {
        (item as ToolboxBlockEntry).levels = levels;
      }
      if ("contents" in item && Array.isArray(item.contents)) {
        walk(item.contents);
      }
    }
  };
  for (const category of clone.contents) {
    walk(category.contents);
  }
  return clone;
}
