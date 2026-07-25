/**
 * @packageDocumentation
 * @module UcBlocklyCore
 * @description One-time registration of µcBlockly blocks and generators.
 */

import * as Blockly from "blockly";
import { defineAllTypedVariableBlocks } from "../categories/blockly";
import { applyLevelsToAllBlockDefinitions } from "../block_levels";
import { configureStandardBlocks } from "../generators/arduino/configure_standard_blocks";
import { applyBlockTypesFromRegistry } from "../generators/arduino/block_types_registry";
import type { UcBlocklyRegistrationOptions } from "./types";

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
}

/** @internal Test helper — allows re-running registration in unit tests. */
export function resetUcBlocklyKernelRegistrationForTests(): void {
  kernelRegistered = false;
  commentContextMenuRegistered = false;
}
