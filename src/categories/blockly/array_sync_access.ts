/**
 * @packageDocumentation
 * @module BlocklyCategories.Array.Sync.Access
 * @description Index access, assign checks, and onchange handlers for array blocks.
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
  getArrayIndexBlocklyChecks,
  getBlocklyCompatibleChecks,
  getDeclareElementBlocklyChecks,
  handleVariablesSetChange,
} from "./shared";
import { inferArrayGetIndexElementType } from "../../generators/arduino/block_types_registry";
import { handleArrayListVariableSync } from "./array_sync_ownership";

/** Met à jour la sortie des blocs d'accès index et propage le typage vers le parent set. */
export function arrayGetIndexOutputSyncOnChange(
  this: Blockly.Block,
  event: Blockly.Events.Abstract,
): void {
  if (event.isUiEvent) {
    return;
  }
  const workspace = this.workspace as Blockly.WorkspaceSvg | null;
  if (workspace?.isDragging?.()) {
    return;
  }
  if (
    event.type !== Blockly.Events.BLOCK_CHANGE &&
    event.type !== Blockly.Events.BLOCK_MOVE &&
    event.type !== Blockly.Events.BLOCK_CREATE &&
    event.type !== Blockly.Events.BLOCK_DELETE
  ) {
    return;
  }
  const elementType = inferArrayGetIndexElementType(this);
  const checks =
    elementType && elementType !== "__NO_TYPE__"
      ? getBlocklyCompatibleChecks(elementType)
      : null;
  this.setOutput(true, checks);
  const parent = this.outputConnection?.targetBlock?.() ?? null;
  if (
    parent &&
    (parent.type === "variables_set_dynamic" || parent.type === "variables_set")
  ) {
    handleVariablesSetChange(parent, event, parent.type);
  }
}

/** Revalide les blocs getIndex / modify qui référencent une variable liste. */
export function revalidateGetIndexBlocksForVariable(
  workspace: Blockly.Workspace,
  variableId: string,
  event: Blockly.Events.Abstract,
): void {
  for (const block of workspace.getAllBlocks(false)) {
    if (block.getFieldValue("VAR") !== variableId) {
      continue;
    }
    if (
      block.type === "Array_getIndex_in_list" ||
      block.type === "Array_getIndex_in_array"
    ) {
      arrayGetIndexOutputSyncOnChange.call(block, event);
    } else if (
      block.type === "Array_modify" ||
      block.type === "Array_fix"
    ) {
      syncArrayListAssignValueInputCheck(block);
      syncArrayIndexInputChecks(block);
    }
  }
}

/** Restreint les entrées D* aux entiers (index 0-based). */
export function syncArrayIndexInputChecks(block: Blockly.Block): void {
  const dim = parseInt(block.getFieldValue("dim") || "1", 10);
  const checks = getArrayIndexBlocklyChecks();
  for (let i = 0; i < dim; i++) {
    const inp = block.getInput("D" + i);
    if (inp?.connection) {
      inp.connection.setCheck(checks);
    }
  }
}

/** Restreint l'entrée « value » au type élément du tableau sélectionné. */
export function syncArrayListAssignValueInputCheck(block: Blockly.Block): void {
  const elementType = inferArrayGetIndexElementType(block);
  const checks =
    elementType && elementType !== "__NO_TYPE__"
      ? getDeclareElementBlocklyChecks(elementType)
      : null;
  const valueInput = block.getInput("value");
  if (valueInput?.connection) {
    valueInput.connection.setCheck(checks);
  }
}

export function arrayListAssignAndIndexSyncOnChange(
  this: Blockly.Block,
  event: Blockly.Events.Abstract,
): void {
  if (event.isUiEvent) {
    return;
  }
  const workspace = this.workspace as Blockly.WorkspaceSvg | null;
  if (workspace?.isDragging?.()) {
    return;
  }
  if (
    event.type !== Blockly.Events.BLOCK_CHANGE &&
    event.type !== Blockly.Events.BLOCK_MOVE &&
    event.type !== Blockly.Events.BLOCK_CREATE &&
    event.type !== Blockly.Events.BLOCK_DELETE
  ) {
    return;
  }
  syncArrayIndexInputChecks(this);
  if (this.type === "Array_fix" || this.type === "Array_modify") {
    syncArrayListAssignValueInputCheck(this);
  }
}

export function handleArrayModifyOnChange(
  block: Blockly.Block,
  event: Blockly.Events.Abstract,
): void {
  handleArrayListVariableSync(block, event);
  arrayListAssignAndIndexSyncOnChange.call(block, event);
}

export function handleArrayGetIndexOnChange(
  block: Blockly.Block,
  event: Blockly.Events.Abstract,
): void {
  handleArrayListVariableSync(block, event);
  arrayGetIndexOutputSyncOnChange.call(block, event);
  if (block.type === "Array_getIndex_in_array") {
    arrayListAssignAndIndexSyncOnChange.call(block, event);
  }
}

export function handleArrayFixOnChange(
  block: Blockly.Block,
  event: Blockly.Events.Abstract,
): void {
  handleArrayListVariableSync(block, event);
  arrayListAssignAndIndexSyncOnChange.call(block, event);
}
