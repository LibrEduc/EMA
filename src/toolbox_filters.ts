/**
 * @packageDocumentation
 * @module Toolbox.Filters
 * @description Toolbox clones filtered by board / search category.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { ToolboxConfiguration } from "./toolbox_types";

export const CAT_BOARD_NAME = "CAT_BOARD";

type ToolboxCategoryNode = {
  kind?: string;
  name?: string;
  categorystyle?: string;
  contents?: ToolboxCategoryNode[];
};

/**
 * Deep clone without the search category (needs workspaceSearch plugin).
 * @param toolbox - Toolbox configuration.
 * @returns Filtered clone.
 */
export function getToolboxWithoutSearch(
  toolbox: ToolboxConfiguration,
): ToolboxConfiguration {
  const clone = JSON.parse(JSON.stringify(toolbox)) as ToolboxConfiguration;
  if (Array.isArray(clone.contents)) {
    clone.contents = clone.contents.filter((c) => c.kind !== "search");
  }
  return clone;
}

/**
 * Deep clone with the board category emptied (kept for « no board » label).
 * @param toolbox - Toolbox configuration.
 * @returns Filtered clone.
 */
export function getToolboxWithoutBoardCategory(
  toolbox: ToolboxConfiguration,
): ToolboxConfiguration {
  const clone = JSON.parse(JSON.stringify(toolbox)) as ToolboxConfiguration;
  if (Array.isArray(clone.contents)) {
    for (const c of clone.contents as ToolboxCategoryNode[]) {
      if (c.name === CAT_BOARD_NAME || c.categorystyle === "board_category") {
        c.contents = [];
      }
    }
  }
  return clone;
}

/**
 * Toolbox for the current board selection (empties board category if none).
 * @param toolbox - Toolbox configuration.
 * @returns Filtered or full clone.
 */
export function getToolboxForCurrentBoard(
  toolbox: ToolboxConfiguration,
): ToolboxConfiguration {
  const menu = document.getElementById("boardMenu") as HTMLSelectElement | null;
  const value = menu?.value?.trim();
  if (!value || value === "none") {
    return getToolboxWithoutBoardCategory(toolbox);
  }
  return JSON.parse(JSON.stringify(toolbox)) as ToolboxConfiguration;
}
