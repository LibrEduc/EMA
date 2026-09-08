/**
 * @packageDocumentation
 * @module UcBlocklyCore
 * @description One-time registration of µcBlockly blocks and generators.
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
import {
  applyBlockDebugMetadata,
  installBlockDebugContextMenu,
} from "../block_debug_context_menu";
import { defineAllTypedVariableBlocks } from "../categories/blockly";
import { applyLevelsToAllBlockDefinitions } from "../block_levels";
import { configureStandardBlocks } from "../generators/arduino/configure_standard_blocks";
import { applyBlockTypesFromRegistry } from "../generators/arduino/block_types_registry";
import { registerUcBlocklyInstances } from "../instances";
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
 * Registers block definitions, types, and standard-block configuration. Safe to call multiple times (subsequent calls are no-ops).
 * @param options - Configuration options.
 */
export function registerUcBlocklyKernel(
  options: UcBlocklyRegistrationOptions = {},
): void {
  if (kernelRegistered) {
    return;
  }
  kernelRegistered = true;

  installLiveBlocksBoundingBoxPatch();
  registerUcBlocklyInstances();

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

/**
 * Reset Uc Blockly Kernel Registration For Tests.
 */
export function resetUcBlocklyKernelRegistrationForTests(): void {
  kernelRegistered = false;
  commentContextMenuRegistered = false;
}
