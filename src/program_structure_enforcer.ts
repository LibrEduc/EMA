/**
 * @packageDocumentation
 * @module ProgramStructureEnforcer
 * @description Disables stackable blocks that are not connected to an active block.
 * @remarks
 * - previousConnection: active only if connected to an active block.
 * - outputConnection alone (no previous): active only if plugged into an
 *   active block.
 * - Hats / containers (neither previous nor output): active at the root.
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
import { isBlockOnMainWorkspace } from "./categories/blockly/shared";
import {
  isWorkspaceDragging,
  queueWorkspaceEnforcement,
  scheduleDeferredWorkspaceTask,
} from "./core/workspace_event_utils";

/** Blockly identifier for the "not connected" reason. */
export const NOT_IN_PROGRAM_DISABLED_REASON = "ucb_not_in_program";

/** Debounce after block moves settle (ms). */
const PROGRAM_STRUCTURE_DEBOUNCE_MS = 80;

type WorkspaceListener = (e: Blockly.Events.Abstract) => void;

const INSTALLED = new WeakMap<Blockly.Workspace, WorkspaceListener>();

const isRelevantEvent = (e: Blockly.Events.Abstract): boolean =>
  e.type === Blockly.Events.BLOCK_MOVE ||
  e.type === Blockly.Events.BLOCK_CREATE ||
  e.type === Blockly.Events.BLOCK_DELETE ||
  e.type === Blockly.Events.FINISHED_LOADING;

/**
 * Evaluates whether a statement stack is active from its top block.
 * @remarks
 * getSurroundParent() ignores next-only stacks (e.g. start → if);
 * walk up via getTopStackBlock() first.
 */
function isStatementStackActive(block: Blockly.Block): boolean {
  const anchor = block.getTopStackBlock();
  if (anchor.previousConnection?.isConnected()) {
    const container = anchor.getSurroundParent();
    return container ? isInActiveProgram(container) : false;
  }
  if (!anchor.previousConnection) {
    return isInActiveProgram(anchor);
  }
  return false;
}

/**
 * Indique si le bloc doit rester actif sur le workspace.
 * @param block - Blockly block instance.
 * @returns True when the condition holds.
 */
export function isInActiveProgram(block: Blockly.Block): boolean {
  if (block.isShadow()) {
    return true;
  }
  if (!isBlockOnMainWorkspace(block)) {
    return true;
  }

  if (block.previousConnection) {
    if (!block.previousConnection.isConnected()) {
      return false;
    }
    return isStatementStackActive(block);
  }

  if (block.outputConnection) {
    if (!block.outputConnection.isConnected()) {
      return false;
    }
    const parent = block.getParent();
    if (!parent) {
      return false;
    }
    return isInActiveProgram(parent);
  }

  return true;
}

const applyProgramStructureState = (block: Blockly.Block): void => {
  if (!isBlockOnMainWorkspace(block) || block.isShadow()) {
    return;
  }
  const shouldDisable = !isInActiveProgram(block);
  if (
    shouldDisable === block.hasDisabledReason(NOT_IN_PROGRAM_DISABLED_REASON)
  ) {
    return;
  }
  block.setDisabledReason(shouldDisable, NOT_IN_PROGRAM_DISABLED_REASON);
};

const updateRootOrphanStacks = (workspace: Blockly.Workspace): void => {
  for (const top of workspace.getTopBlocks(false)) {
    if (top.previousConnection && !top.previousConnection.isConnected()) {
      for (const block of top.getDescendants(false)) {
        applyProgramStructureState(block);
      }
    }
  }
};

const updateProgramStructureForMove = (
  workspace: Blockly.Workspace,
  event: Blockly.Events.BlockMove,
): void => {
  if (!event.blockId) {
    updateProgramStructureDisabledState(workspace);
    return;
  }
  const block = workspace.getBlockById(event.blockId);
  if (!block) {
    updateProgramStructureDisabledState(workspace);
    return;
  }
  for (const descendant of block.getDescendants(false)) {
    applyProgramStructureState(descendant);
  }
  updateRootOrphanStacks(workspace);
};

const updateProgramStructureForCreate = (
  workspace: Blockly.Workspace,
  event: Blockly.Events.BlockCreate,
): void => {
  if (!event.blockId) {
    updateProgramStructureDisabledState(workspace);
    return;
  }
  const block = workspace.getBlockById(event.blockId);
  if (!block) {
    updateProgramStructureDisabledState(workspace);
    return;
  }
  for (const descendant of block.getDescendants(false)) {
    applyProgramStructureState(descendant);
  }
  updateRootOrphanStacks(workspace);
};

/**
 * Met à jour l'état actif/inactif de tous les blocs du workspace principal.
 * @param workspace - Blockly workspace.
 */
export function updateProgramStructureDisabledState(
  workspace: Blockly.Workspace,
): void {
  if (isWorkspaceDragging(workspace)) {
    return;
  }

  const recordUndo = Blockly.Events.isEnabled();
  if (recordUndo) {
    Blockly.Events.disable();
  }
  try {
    for (const block of workspace.getAllBlocks(false)) {
      applyProgramStructureState(block);
    }
  } finally {
    if (recordUndo) {
      Blockly.Events.enable();
    }
  }
}

/**
 * Retire la raison « hors programme » sans désinstaller l’écouteur.
 * @param workspace - Blockly workspace.
 */
export function clearProgramStructureDisabledState(
  workspace: Blockly.Workspace,
): void {
  const recordUndo = Blockly.Events.isEnabled();
  if (recordUndo) {
    Blockly.Events.disable();
  }
  try {
    for (const block of workspace.getAllBlocks(false)) {
      if (!isBlockOnMainWorkspace(block)) {
        continue;
      }
      if (!block.hasDisabledReason(NOT_IN_PROGRAM_DISABLED_REASON)) {
        continue;
      }
      block.setDisabledReason(false, NOT_IN_PROGRAM_DISABLED_REASON);
    }
  } finally {
    if (recordUndo) {
      Blockly.Events.enable();
    }
  }
}

/**
 * Réapplique ou efface l’état après un load (remount, autosave, fichier).
 * @param workspace - Blockly workspace.
 * @param enabled - Whether the feature is enabled.
 */
export function syncProgramStructureAfterLoad(
  workspace: Blockly.Workspace,
  enabled: boolean,
): void {
  if (enabled) {
    updateProgramStructureDisabledState(workspace);
  } else {
    clearProgramStructureDisabledState(workspace);
  }
}

/**
 * Désinstalle l'enforceur de structure de programme.
 * @param workspace - Blockly workspace.
 */
export function uninstallProgramStructureEnforcer(
  workspace: Blockly.Workspace,
): void {
  const listener = INSTALLED.get(workspace);
  if (!listener) {
    clearProgramStructureDisabledState(workspace);
    return;
  }
  workspace.removeChangeListener(listener);
  INSTALLED.delete(workspace);
  clearProgramStructureDisabledState(workspace);
}

/**
 * Installe l'enforceur : blocs non raccordés (previous ou output seul) → inactifs.
 * @param workspace - Blockly workspace.
 */
export function installProgramStructureEnforcer(
  workspace: Blockly.Workspace,
): void {
  uninstallProgramStructureEnforcer(workspace);

  const runUpdate = (event?: Blockly.Events.Abstract): void => {
    if (isWorkspaceDragging(workspace)) {
      return;
    }
    if (!event || event.type === Blockly.Events.FINISHED_LOADING) {
      updateProgramStructureDisabledState(workspace);
      return;
    }
    if (event.type === Blockly.Events.BLOCK_MOVE) {
      updateProgramStructureForMove(
        workspace,
        event as Blockly.Events.BlockMove,
      );
      return;
    }
    if (event.type === Blockly.Events.BLOCK_CREATE) {
      updateProgramStructureForCreate(
        workspace,
        event as Blockly.Events.BlockCreate,
      );
      return;
    }
    if (event.type === Blockly.Events.BLOCK_DELETE) {
      updateRootOrphanStacks(workspace);
      return;
    }
    updateProgramStructureDisabledState(workspace);
  };

  const listener: WorkspaceListener = (e) => {
    queueWorkspaceEnforcement(
      workspace,
      e,
      isRelevantEvent,
      () => runUpdate(),
      PROGRAM_STRUCTURE_DEBOUNCE_MS,
    );
  };

  workspace.addChangeListener(listener);
  INSTALLED.set(workspace, listener);
  scheduleDeferredWorkspaceTask(
    workspace,
    () => runUpdate(),
    PROGRAM_STRUCTURE_DEBOUNCE_MS,
  );
}
