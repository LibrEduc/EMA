/**
 * @packageDocumentation
 * @module UcBlocklyCore
 * @description One-time registration of µcBlockly blocks and generators.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Blockly from "blockly";
import {
  applyBlockDebugMetadata,
  installBlockDebugContextMenu,
} from "../block_debug_context_menu";
import { defineAllTypedVariableBlocks } from "../categories/blockly";
import { applyLevelsToAllBlockDefinitions } from "../block_levels";
import { configureStandardBlocks } from "../generators/arduino/configure_standard_blocks";
import { applyBlockTypesFromRegistry } from "../generators/arduino/block_types_registry";
import type { UcBlocklyRegistrationOptions } from "./types";
import { installLiveBlocksBoundingBoxPatch } from "./live_content_metrics";

let kernelRegistered = false;
let commentContextMenuRegistered = false;

function ensureCommentContextMenuRegistered(): void {
  if (commentContextMenuRegistered) {
    return;
  }
  commentContextMenuRegistered = true;
  Blockly.ContextMenuItems.registerCommentOptions();
}

/**
 * Registers block definitions, types, and standard-block configuration.
 * Safe to call multiple times (subsequent calls are no-ops).
 */
export function registerUcBlocklyKernel(
  options: UcBlocklyRegistrationOptions = {},
): void {
  if (kernelRegistered) {
    return;
  }
  kernelRegistered = true;

  installLiveBlocksBoundingBoxPatch();

  const typedVariables = options.typedVariables ?? true;
  const blockTypesRegistry = options.blockTypesRegistry ?? true;
  const configureStandard = options.configureStandardBlocks ?? true;
  const blockLevels = options.blockLevels ?? true;

  if (typedVariables) {
    defineAllTypedVariableBlocks();
  }
  if (blockTypesRegistry) {
    applyBlockTypesFromRegistry();
  }
  if (configureStandard) {
    configureStandardBlocks();
  }
  if (blockLevels) {
    applyLevelsToAllBlockDefinitions();
  }
  ensureCommentContextMenuRegistered();
  // Hosts (BlocklyDuino, etc.) must get debug context menu without loading index.ts.
  installBlockDebugContextMenu();
  applyBlockDebugMetadata();
}

/** @internal Test helper — allows re-running registration in unit tests. */
export function resetUcBlocklyKernelRegistrationForTests(): void {
  kernelRegistered = false;
  commentContextMenuRegistered = false;
}
