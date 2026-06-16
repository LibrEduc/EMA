/**
 * @packageDocumentation
 * @module ProgramStructureEnforcer
 * @description Désactive les blocs empilables non raccordés à un bloc actif.
 * @remarks
 * - previousConnection : actif seulement s'il est connecté à un bloc actif.
 * - outputConnection seul (sans previous) : actif seulement s'il est branché
 *   dans un bloc actif.
 * - Chapeaux / conteneurs (ni previous ni output) : actifs à la racine.
 * @license GPL-3.0-or-later
 */

/**
 * @license
 * Copyright (C) 2023-2024 ASTUCE (Sébastien Canet microcompany)
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Blockly from "blockly";
import { isBlockOnMainWorkspace } from "./categories/blockly/shared";

/** Identifiant Blockly pour le motif « non raccordé ». */
export const NOT_IN_PROGRAM_DISABLED_REASON = "ucb_not_in_program";

type WorkspaceListener = (e: Blockly.Events.Abstract) => void;

const INSTALLED = new WeakMap<Blockly.Workspace, WorkspaceListener>();

const isRelevantEvent = (e: Blockly.Events.Abstract): boolean =>
  e.type === Blockly.Events.BLOCK_MOVE ||
  e.type === Blockly.Events.BLOCK_CREATE ||
  e.type === Blockly.Events.BLOCK_DELETE ||
  e.type === Blockly.Events.FINISHED_LOADING;

/**
 * Évalue l'activité d'une pile d'instructions à partir de son sommet.
 * @remarks
 * getSurroundParent() ignore les empilements next-only (ex. début → si) ;
 * on remonte d'abord via getTopStackBlock().
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

/**
 * Met à jour l'état actif/inactif de tous les blocs du workspace principal.
 */
export function updateProgramStructureDisabledState(
  workspace: Blockly.Workspace,
): void {
  const wsSvg = workspace as Blockly.WorkspaceSvg;
  if (wsSvg.isDragging?.()) {
    return;
  }

  for (const block of workspace.getAllBlocks(false)) {
    if (!isBlockOnMainWorkspace(block)) {
      continue;
    }
    const active = isInActiveProgram(block);
    block.setDisabledReason(!active, NOT_IN_PROGRAM_DISABLED_REASON);
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
    return;
  }
  workspace.removeChangeListener(listener);
  INSTALLED.delete(workspace);
  for (const block of workspace.getAllBlocks(false)) {
    if (isBlockOnMainWorkspace(block)) {
      block.setDisabledReason(false, NOT_IN_PROGRAM_DISABLED_REASON);
    }
  }
}

/**
 * Installe l'enforceur : blocs non raccordés (previous ou output seul) → inactifs.
 */
export function installProgramStructureEnforcer(
  workspace: Blockly.Workspace,
): void {
  uninstallProgramStructureEnforcer(workspace);

  let timer: number | null = null;

  const scheduleUpdate = (): void => {
    if (timer !== null) {
      window.clearTimeout(timer);
    }
    timer = window.setTimeout(() => {
      timer = null;
      updateProgramStructureDisabledState(workspace);
    }, 0);
  };

  const listener: WorkspaceListener = (e) => {
    const wsSvg = workspace as Blockly.WorkspaceSvg;
    if (e.isUiEvent || wsSvg.isDragging?.()) {
      return;
    }
    if (!isRelevantEvent(e)) {
      return;
    }
    scheduleUpdate();
  };

  workspace.addChangeListener(listener);
  INSTALLED.set(workspace, listener);
  scheduleUpdate();
}
