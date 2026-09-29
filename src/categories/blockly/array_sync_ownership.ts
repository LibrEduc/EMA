/**
 * @packageDocumentation
 * @module BlocklyCategories.Array.Sync.Ownership
 * @description List declaration ownership and variable sync for array blocks.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import * as Blockly from "blockly";
import {
  getArrayListUntypedWarningText,
  getDuplicateListDeclarationWarningText,
  syncListVariableFromField,
} from "./shared";
import {
  hasArrayListConnectedElements,
  inferArrayElementTypeFromBlock,
} from "../../generators/arduino/block_types_registry";
import {
  claimVariableDeclaration,
  getOrCreateKindedVariable,
  isListDeclareBlockType,
  LIST_DEFAULT_VARIABLE_NAME,
  LIST_VARIABLE_TYPE,
  releaseVariableDeclaration,
} from "../../generators/arduino/variable_utils";

export const ARRAY_DEFAULT_VAR_NAME = LIST_DEFAULT_VARIABLE_NAME;

export function bindArrayWithDefaultVariable(block: Blockly.Block): void {
  const workspace = block.workspace;
  if (!workspace) {
    return;
  }
  const variableModel = getOrCreateKindedVariable(
    workspace,
    ARRAY_DEFAULT_VAR_NAME,
    LIST_VARIABLE_TYPE,
  );
  if (variableModel?.getId()) {
    block.setFieldValue(variableModel.getId(), "VAR");
    syncListVariableFromField(block, "VAR");
  }
}

/**
 * Claims / releases list declaration ownership (same pattern as variables_const).
 * @param block - Blockly block instance.
 * @returns True when the condition holds.
 */
export const syncListDeclarationOwnership = (block: Blockly.Block): boolean => {
  if (!block.workspace || block.isInFlyout || !isListDeclareBlockType(block.type)) {
    return false;
  }
  const variableId = block.getFieldValue("VAR");
  if (!variableId) {
    return false;
  }
  const variable = block.workspace.getVariableMap().getVariableById(variableId);
  if (!variable) {
    return false;
  }
  const claim = claimVariableDeclaration(variable, block.id);
  if (claim === "owned_by_other") {
    block.setWarningText(getDuplicateListDeclarationWarningText());
    return true;
  }
  return false;
};

/**
 * Affiche un avertissement si ce bloc n'est pas le propriétaire de la déclaration.
 * @param block - Blockly block instance.
 * @returns True when the condition holds.
 */
export const syncListDeclarationUniqueness = (block: Blockly.Block): boolean => {
  return syncListDeclarationOwnership(block);
};

export function syncArrayListUntypedWarning(block: Blockly.Block): void {
  if (syncListDeclarationUniqueness(block)) {
    return;
  }
  const inferred = inferArrayElementTypeFromBlock(block);
  const incomplete =
    !hasArrayListConnectedElements(block) ||
    !inferred ||
    inferred === "__NO_TYPE__";
  block.setWarningText(incomplete ? getArrayListUntypedWarningText() : null);
}

/**
 * Applique warning ownership (+ non typé pour Array_with).
 * @param block - Blockly block instance.
 */
export const applyListDeclarationBlockWarning = (block: Blockly.Block): void => {
  if (syncListDeclarationOwnership(block)) {
    return;
  }
  if (block.type === "Array_with") {
    syncArrayListUntypedWarning(block);
    return;
  }
  if (isListDeclareBlockType(block.type)) {
    block.setWarningText(null);
  }
};

/**
 * Revalide l'ownership des déclarations de listes sur tout le workspace.
 * @param workspace - Blockly workspace.
 */
export const revalidateListDeclarationUniqueness = (
  workspace: Blockly.Workspace,
): void => {
  for (const block of workspace.getAllBlocks(false)) {
    if (!isListDeclareBlockType(block.type)) {
      continue;
    }
    applyListDeclarationBlockWarning(block);
  }
};

/** Synchronise le type Blockly `list` et l'ownership de déclaration. */
export function handleArrayListVariableSync(
  block: Blockly.Block,
  event: Blockly.Events.Abstract,
): void {
  if (event.isUiEvent) {
    return;
  }
  const workspace = block.workspace as Blockly.WorkspaceSvg | null;
  if (workspace?.isDragging?.()) {
    return;
  }
  if (
    event.type === Blockly.Events.BLOCK_DELETE &&
    isListDeclareBlockType(block.type)
  ) {
    // Block may already be disposed; release via event ids when possible.
    return;
  }
  if (
    event.type === Blockly.Events.BLOCK_CREATE &&
    (event as Blockly.Events.BlockCreate).blockId === block.id
  ) {
    if (isListDeclareBlockType(block.type) && event.recordUndo) {
      bindArrayWithDefaultVariable(block);
    } else {
      syncListVariableFromField(block, "VAR");
    }
    if (workspace) {
      revalidateListDeclarationUniqueness(workspace);
    }
    return;
  }
  if (
    event.type === Blockly.Events.BLOCK_CHANGE &&
    (event as Blockly.Events.BlockChange).element === "field" &&
    (event as Blockly.Events.BlockChange).name === "VAR"
  ) {
    const change = event as Blockly.Events.BlockChange;
    if (isListDeclareBlockType(block.type) && change.oldValue) {
      const previous = workspace
        ?.getVariableMap()
        .getVariableById(String(change.oldValue));
      releaseVariableDeclaration(previous, block.id);
    }
    syncListVariableFromField(block, "VAR");
    if (workspace) {
      revalidateListDeclarationUniqueness(workspace);
    }
    return;
  }
  if (
    event.type === Blockly.Events.BLOCK_DELETE ||
    event.type === Blockly.Events.BLOCK_CREATE
  ) {
    if (workspace) {
      revalidateListDeclarationUniqueness(workspace);
    }
  }
}
