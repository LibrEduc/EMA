/**
 * @packageDocumentation
 * @module WorkspaceEventUtils
 * @description Reporte le travail coûteux pendant les gestes Blockly (drag, etc.).
 *
 * Utilisé par les « enforcers » (structure programme, types stricts) pour ne pas
 * parcourir tous les blocs à chaque frame de drag.
 *
 * @remarks
 * - {@link shouldDeferWorkspaceEnforcement} — vrai pendant un geste en cours
 * - {@link scheduleDeferredWorkspaceTask} — debounce + attente fin de drag
 * - {@link queueWorkspaceEnforcement} — planifie toujours un passage post-geste
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Blockly from "blockly";

/**
 * True while the main workspace is dragging blocks or comments.
 * @param workspace - Blockly workspace.
 * @returns True when the condition holds.
 */
export const isWorkspaceDragging = (workspace: Blockly.Workspace): boolean => {
  const wsSvg = workspace as Blockly.WorkspaceSvg;
  return Boolean(wsSvg.isDragging?.());
};

/**
 * Whether enforcers should wait until the gesture settles before *running*. Covers drag moves that fire before {@link Blockly.WorkspaceSvg.isDragging} flips back to false. Callers must still {@link scheduleDeferredWorkspaceTask} when this returns true for gesture-related events — otherwise a flyout drop never revalidates until the next unrelated clip.
 * @param workspace - Blockly workspace.
 * @param event - Blockly workspace event.
 * @returns True when the condition holds.
 */
export const shouldDeferWorkspaceEnforcement = (
  workspace: Blockly.Workspace,
  event: Blockly.Events.Abstract,
): boolean => {
  if (event.isUiEvent && event.type !== Blockly.Events.BLOCK_DRAG) {
    return true;
  }
  if (isWorkspaceDragging(workspace)) {
    return true;
  }
  if (event.type === Blockly.Events.BLOCK_DRAG) {
    return true;
  }
  if (event.type === Blockly.Events.BLOCK_MOVE) {
    const move = event as Blockly.Events.BlockMove;
    if (move.reason?.includes("drag")) {
      return true;
    }
  }
  return false;
};

/**
 * True when this event should queue a post-settle enforcement pass. Includes mid-drag / drag-end signals that {@link shouldDeferWorkspaceEnforcement} would otherwise cause callers to ignore entirely.
 * @param workspace - Blockly workspace.
 * @param event - Blockly workspace event.
 * @param isRelevant - Predicate selecting relevant events.
 */
export const shouldQueueWorkspaceEnforcement = (
  workspace: Blockly.Workspace,
  event: Blockly.Events.Abstract,
  isRelevant: (e: Blockly.Events.Abstract) => boolean,
): boolean => {
  if (event.isUiEvent && event.type !== Blockly.Events.BLOCK_DRAG) {
    return false;
  }
  if (isRelevant(event)) {
    return true;
  }
  // Flyout drop often ends with drag UI / drag-tagged moves only.
  if (event.type === Blockly.Events.BLOCK_DRAG) {
    return true;
  }
  if (event.type === Blockly.Events.BLOCK_MOVE) {
    const move = event as Blockly.Events.BlockMove;
    if (move.reason?.includes("drag")) {
      return true;
    }
  }
  return isWorkspaceDragging(workspace) && isRelevant(event);
};

const deferredTimers = new WeakMap<Blockly.Workspace, number>();

/**
 * Debounces workspace maintenance; reschedules if a drag is still active.
 * @param workspace - Blockly workspace.
 * @param callback - Callback invoked when ready.
 */
export const scheduleDeferredWorkspaceTask = (
  workspace: Blockly.Workspace,
  callback: () => void,
  delayMs: number,
): void => {
  const existing = deferredTimers.get(workspace);
  if (existing !== undefined) {
    window.clearTimeout(existing);
  }
  deferredTimers.set(
    workspace,
    window.setTimeout(() => {
      deferredTimers.delete(workspace);
      if (isWorkspaceDragging(workspace)) {
        scheduleDeferredWorkspaceTask(workspace, callback, delayMs);
        return;
      }
      callback();
    }, delayMs),
  );
};

/**
 * Queues enforcement after the current gesture settles. Never drops a relevant update solely because a drag is in progress.
 * @param workspace - Blockly workspace.
 * @param event - Blockly workspace event.
 * @param isRelevant - Predicate selecting relevant events.
 */
export const queueWorkspaceEnforcement = (
  workspace: Blockly.Workspace,
  event: Blockly.Events.Abstract,
  isRelevant: (e: Blockly.Events.Abstract) => boolean,
  callback: () => void,
  delayMs: number,
): void => {
  if (!shouldQueueWorkspaceEnforcement(workspace, event, isRelevant)) {
    return;
  }
  scheduleDeferredWorkspaceTask(workspace, callback, delayMs);
};
