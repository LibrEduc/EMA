/**
 * @packageDocumentation
 * @module BlocklyCategories.Logic
 * @description Logic block definitions (facade).
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export { defineControlsIfExtraBlocks } from "./logic_if_extras";
export { defineControlsSwitchBlock } from "./logic_switch";

import { defineControlsIfExtraBlocks } from "./logic_if_extras";
import { defineControlsSwitchBlock } from "./logic_switch";

/**
 * Registers switch + if helper blocks (name kept for existing callers).
 */
export const defineControlsSwitchBlocks = (): void => {
  defineControlsIfExtraBlocks();
  defineControlsSwitchBlock();
};
