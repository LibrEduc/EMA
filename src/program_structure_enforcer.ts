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
import { isBlockOnMainWorkspace } from "./categories/blockly/shared";
import {
  isWorkspaceDragging,
  scheduleDeferredWorkspaceTask,
  shouldDeferWorkspaceEnforcement,
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
    if (shouldDeferWorkspaceEnforcement(workspace, e)) {
      return;
    }
    if (!isRelevantEvent(e)) {
      return;
    }
    scheduleDeferredWorkspaceTask(
      workspace,
      () => runUpdate(e),
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
