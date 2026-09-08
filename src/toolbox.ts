/**
 * @packageDocumentation
 * @module Toolbox
 * @description Toolbox configuration and helpers for µcBlockly (facade).
 * @remarks
 * Split: `toolbox_types`, `toolbox_data`, `toolbox_filters`.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export {
  applyToolboxBlockLevels,
  DEFAULT_TOOLBOX_BLOCK_LEVELS,
  type ToolboxBlockEntry,
  type ToolboxCategoryContentEntry,
  type ToolboxCategoryCssConfig,
  type ToolboxConfiguration,
} from "./toolbox_types";

export { basic_toolbox } from "./toolbox_data";

export {
  CAT_BOARD_NAME,
  getToolboxForCurrentBoard,
  getToolboxWithoutBoardCategory,
  getToolboxWithoutSearch,
} from "./toolbox_filters";

export {
  block,
  buildToolbox,
  category,
  numberShadow,
  search,
  sep,
  textShadow,
} from "./toolbox/builder";
