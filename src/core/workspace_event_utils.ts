/**
 * @packageDocumentation
 * @module WorkspaceEventUtils
 * @description Reporte le travail coûteux pendant les gestes Blockly (drag, etc.).
 *
 * Utilisé par les « enforcers » (structure programme, types stricts) pour ne pas
 * parcourir tous les blocs à chaque frame de drag.
 *
 * @remarks
 * - {@link shouldDeferWorkspaceEnforcement} — filtre les événements à ignorer
 * - {@link scheduleDeferredWorkspaceTask} — debounce + attente fin de drag
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Blockly from "blockly";

/** True while the main workspace is dragging blocks or comments. */
export const isWorkspaceDragging = (workspace: Blockly.Workspace): boolean => {
  const wsSvg = workspace as Blockly.WorkspaceSvg;
  return Boolean(wsSvg.isDragging?.());
};

/**
 * Whether enforcers / revalidation should wait until the gesture settles.
 * Covers drag moves that fire before {@link Blockly.WorkspaceSvg.isDragging}
 * flips back to false.
 */
export const shouldDeferWorkspaceEnforcement = (
  workspace: Blockly.Workspace,
  event: Blockly.Events.Abstract,
): boolean => {
  if (event.isUiEvent) {
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

const deferredTimers = new WeakMap<Blockly.Workspace, number>();

/**
 * Debounces workspace maintenance; reschedules if a drag is still active.
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
